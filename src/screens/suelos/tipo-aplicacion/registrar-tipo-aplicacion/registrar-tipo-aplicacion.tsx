import React, { useState, useEffect } from 'react';
import { Pressable, View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { InsertarManejoFertilizantes } from '../../../../servicios/ServicioFertilizantes';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { FontAwesome } from '@expo/vector-icons';
import { InsertarTipoAplicacion } from '../../../../servicios/ServicioTipoAplicacion';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }
export const RegistrarTipoAplicacionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();

    const [nombreTipoAplicacion, setNombreTipoAplicacion] = useState('');
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });



 const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.ListApplicationType.screenName as never);
              },
            },
          ],
        });
        setAlertVisible(true);
      };
    
      const showErrorAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
               
              },
            },
          ],
        });
	Keyboard.dismiss()
        setAlertVisible(true);
      };

      const showInfoAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
             
              },
            },
          ],
        });
	Keyboard.dismiss()
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };
    const handleRegister = async () => {
        if (!nombreTipoAplicacion.trim()) {
            showInfoAlert('Por favor, ingrese el nombre del tipo de aplicación.');
            return;
        }

        const formData = {
            nombre: nombreTipoAplicacion.trim(),
            usuarioAuditoria: userData.identificacion,
        };

        try {
            const responseInsert = await InsertarTipoAplicacion(formData);

            if (responseInsert.indicador === 1) {
                showSuccessAlert('¡Tipo de aplicación creado correctamente!')
                // Alert.alert('¡Tipo de aplicación creado correctamente!', '', [
                //     {
                //         text: 'OK',
                //         onPress: () => {
                //             navigation.navigate(ScreenProps.ListApplicationType.screenName as never);
                //         },
                //     },
                // ]);
            } else {
                showErrorAlert('¡Oops! Parece que algo salió mal.');
            }
        } catch (error) {
            console.error('Error registrando tipo de aplicación:', error);
            showErrorAlert('Hubo un error al registrar el tipo de aplicación. Por favor, intente de nuevo.');
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ImageBackground
                    source={require('../../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListApplicationType.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Registrar tipo de aplicación</Text>
                        </View>
                        <View style={styles.formContainer}>
                            <Text style={styles.formText}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del Tipo de Aplicación"
                                value={nombreTipoAplicacion}
                                onChangeText={(text) => setNombreTipoAplicacion(text)}
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleRegister}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Guardar tipo de aplicación</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListApplicationType.screenName as never) : undefined}
                />
                {isAlertVisibleAuth  && (
                <CustomAlertAuth
                isVisible={isAlertVisibleAuth }
                onClose={hideAlertAuth }
                message={alertPropsAuth .message}
                iconType={alertPropsAuth .iconType}
                buttons={alertPropsAuth .buttons}
                navigateTo={alertPropsAuth .iconType === 'success' ? () => {} : undefined}
                />
                )}
        </View>
    );
};