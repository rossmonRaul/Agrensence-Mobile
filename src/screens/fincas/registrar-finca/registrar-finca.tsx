import React, { useState } from 'react';
import { View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation } from '@react-navigation/native';
import { isEmail } from 'validator'
import { GuardarUsuarioPorSuperUsuario } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { validatePassword } from '../../../utils/validationPasswordUtil';
import { useAuth } from '../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { CrearFinca } from '../../../servicios/ServicioFinca';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';

interface Button {
    text: string;
    onPress: () => void;
  }

export const RegistrarFincaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
   // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        nombre: '',
        ubicacion: '',
        idEmpresa: userData.idEmpresa,
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };
    const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.ListEstate.screenName as never);
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
    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {
        Keyboard.dismiss()
        if (!formulario.nombre && !formulario.ubicacion && !formulario.idEmpresa) {
            showInfoAlert('Por favor rellene el formulario');
            return
        }
        if (!formulario.nombre) {
            showInfoAlert('Ingrese un nombre');
            return
        }

        if (!formulario.ubicacion) {
            showInfoAlert('Ingrese una ubicacion');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            nombre: formulario.nombre,
            ubicacion: formulario.ubicacion,
            idEmpresa: formulario.idEmpresa,
        };

        //  Se ejecuta el servicio de crear la finca y devulve los datos de confirmacion
        const responseInsert = await CrearFinca(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se creo la finca correctamente!');
            // Alert.alert('¡Se creo la finca correctamente!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.ListEstate.screenName as never);
            //         },
            //     },
            // ]);
        } else {
            showErrorAlert('!Oops! Parece que algo salió mal')
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}

            >
                <ImageBackground
                    source={require('../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListEstate.screenName} color={'#ffff'} parametro={'1'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Crea una finca</Text>
                        </View>

                        <View style={styles.formContainer}>

                            <>
                                <Text style={styles.formText} >Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre de la Finca"
                                    value={formulario.nombre}
                                    onChangeText={(text) => updateFormulario('nombre', text)}
                                />
                                <Text style={styles.formText} >Ubicación</Text>
                                <TextInput
                                    style={styles.inputSinMargin}
                                    placeholder="Ubicación de la Finca"
                                    value={formulario.ubicacion}
                                    onChangeText={(text) => updateFormulario('ubicacion', text)}
                                />
                                <Text style={styles.additionalInfo}>Puede llevar cantón o distrito</Text>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleRegister();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Guardar finca</Text>
                                    </View>
                                </TouchableOpacity>
                            </>

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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListEstate.screenName as never) : undefined}
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
}