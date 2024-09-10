import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from './admin-modificar-empresa.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ModificarEmpresa } from '../../../servicios/ServicioEmpresa';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { CambiarEstadoEmpresa } from '../../../servicios/ServicioEmpresa';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import ConfirmAlert from '../../../components/CustomAlert/ConfirmAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }

interface RouteParams {
    idEmpresa: string;
    nombre: string;
    estado: string;
}


export const AdminModificarEmpresaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
   //const { userData } = useAuth();
    const route = useRoute();
    const { idEmpresa, nombre, estado } = route.params as RouteParams;
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idEmpresa: idEmpresa,
        empresa: nombre
    });

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [isAlertVisibleEstado, setAlertVisibleEstado] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
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
                navigation.navigate(ScreenProps.CompanyList.screenName as never);
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

      const showConfirmAlert = async () => {
        setAlertVisibleEstado(true);
      };

    const handleChangeAccess = async () => {
        Keyboard.dismiss();
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idEmpresa: formulario.idEmpresa,
        };

        try {
            const responseInsert = await CambiarEstadoEmpresa(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se actualizó el estado de la empresa correctamente!');
              //navigation.navigate(ScreenProps.CompanyList.screenName as never);
            } else {
                showErrorAlert('¡Oops! Parece que algo salió mal');
            }
          } catch (error) {
                showErrorAlert('¡Oops! Algo salió mal.');
          } finally {
            // setLoading(false);
            setAlertVisibleEstado(false);
          }

        //  Se muestra una alerta con opción de aceptar o cancelar
        // Alert.alert(
        //     'Confirmar cambio de estado',
        //     '¿Estás seguro de que deseas cambiar el estado de la empresa?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se inserta el identificacion en la base de datos
        //                 const responseInsert = await CambiarEstadoEmpresa(formData);
        //                 // Se ejecuta el cambio de estado
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se actualizó el estado de la empresa correctamente!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.CompanyList.screenName
        //                                     );
        //                                 },
        //                             },
        //                         ]
        //                     );
        //                 } else {
        //                     alert('¡Oops! Parece que algo salió mal');
        //                 }
        //             },
        //         },
        //     ],
        //     { cancelable: false }
        // );
    };
    //  Se defina una función para manejar el registro del identificacion
    const handleModifyCompany = async () => {
        Keyboard.dismiss();
        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.empresa) {
            showInfoAlert('Ingrese una empresa');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idEmpresa: formulario.idEmpresa,
            nombre: formulario.empresa,
        };

        //  Se realiza la modificación de empresa
        const responseInsert = await ModificarEmpresa(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se modificó la empresa correctamente!');
            // Alert.alert(
            //     '¡Se modificó la empresa correctamente!',
            //     '',
            //     [
            //         {
            //             text: 'OK',
            //             onPress: () => {
            //                 navigation.navigate(
            //                     ScreenProps.CompanyList.screenName as never
            //                 );
            //             },
            //         },
            //     ]
            // );
        } else {
            showErrorAlert('¡Oops! Parece que algo salió mal');
        }

    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.CompanyList.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Modificar empresa</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de empresa"
                        value={formulario.empresa}
                        onChangeText={(text) => updateFormulario('empresa', text)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => { handleModifyCompany() }}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}>Guardar cambios</Text>
                        </View>

                        
                    </TouchableOpacity>

                    {estado === 'Activo'
                        ? <TouchableOpacity
                            style={styles.buttonDelete}
                            onPress={() => {
                                showConfirmAlert();
                            }}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                <Text style={styles.buttonText}> Inhabilitar acceso</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                showConfirmAlert();
                            }}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                <Text style={styles.buttonText}>Habilitar acceso</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    
            </View>
                </View>

                
                
                
            <BottomNavBar />
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate('CompanyList' as never) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas cambiar el estado de la empresa?"
                buttons={[
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => setAlertVisibleEstado(false),
                },
                {
                text: 'Aceptar',
                onPress: handleChangeAccess,
                 },
                ]}
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