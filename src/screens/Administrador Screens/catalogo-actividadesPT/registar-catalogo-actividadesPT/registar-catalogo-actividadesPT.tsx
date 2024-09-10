import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ImageBackground, Keyboard } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { InsertarActividadPreparacionTerreno } from '../../../../servicios/ServicioCatalogoActividadPT';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';

interface Button {
    text: string;
    onPress: () => void;
  }
export const InsertarCatalogoActividadPTScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();
    const [formulario, setFormulario] = useState({
        nombre: '',
        usuarioCreacionModificacion: userData.identificacion,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };
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
                navigation.navigate(ScreenProps.ListCatalogoActividades.screenName as never);
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
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

    const validateForm = () => {
        let isValid = true;
        Keyboard.dismiss()
        if (!formulario.nombre) {
            showInfoAlert('Ingrese el nombre de la actividad');
            isValid = false;
            return;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (validateForm()) {
            const responseInsert = await InsertarActividadPreparacionTerreno(formulario);

            if (responseInsert.indicador === 1) {
                showSuccessAlert('¡Se creó la actividad correctamente!')
                // Alert.alert('¡Se creó la actividad correctamente!', '', [
                //     {
                //         text: 'OK',
                //         onPress: () => {
                //             navigation.navigate(ScreenProps.ListCatalogoActividades.screenName as never);
                //         },
                //     },
                // ]);
            } else {
                showErrorAlert('!Oops! Parece que algo salió mal');
            }
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
                ></ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListCatalogoActividades.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Registrar actividad</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la Actividad"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Guardar actividad</Text>
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListCatalogoActividades.screenName as never) : undefined}
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

export default InsertarCatalogoActividadPTScreen;
