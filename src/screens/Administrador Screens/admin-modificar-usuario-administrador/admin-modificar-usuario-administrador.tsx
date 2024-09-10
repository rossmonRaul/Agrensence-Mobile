import React, { useEffect, useState } from 'react';
import { View,KeyboardAvoidingView,Platform,ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from './admin-modificar-usuario-administrador.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';

import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';

import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { ActualizarUsuarioAdministrador, CambiarEstadoUsuario, ActualizarDatosUsuario } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { validatePassword } from '../../../utils/validationPasswordUtil';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmpresaInterface } from '../../../interfaces/empresaInterfaces';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import ConfirmAlert from '../../../components/CustomAlert/ConfirmAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }


interface RouteParams {
    identificacion: string;
    nombre: string;
    correo: string;
    idEmpresa: string;
    idRol: number;
    idFinca: number;
    estado: string;
    idParcela: number;
}



export const AdminModificarUsuarioAdmnistradorScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    //const { userData } = useAuth();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    const { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela} = route.params as RouteParams;
    const [isFormVisible, setFormVisible] = useState(false);

    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [nombreEmpresa, setNombreEmpresa] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: identificacion || '',
        nombre: nombre || '',
        correo: correo || '',
        contrasena: '',
        confirmarContrasena: '',
        idEmpresa: idEmpresa || empresa || '',
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

    /*  Estan son las Props para obtener datos de empresas, 
        fincas y parcelas mediante el hook useFetchDropdownData */
    const obtenerEmpresasProps: UseFetchDropdownDataProps<EmpresaInterface> = {
        fetchDataFunction: ObtenerEmpresas,
        setDataFunction: setEmpresaData,
        labelKey: 'nombre',
        valueKey: 'idEmpresa',
        idKey: 'idEmpresa',
    };

    const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.AdminUserList.screenName, {
                    datoValidacion: 1,
                });
              },
            },
          ],
        });
        setAlertVisible(true);
      };

      const showSuccessAlertTipo2 = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.AdminModifyAdminUser.screenName, { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela });
                setFormVisible(false);
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

    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de empresas, fincas y parcelas*/
    useFetchDropdownData(obtenerEmpresasProps);

    useEffect(() => {
        if (idEmpresa) {
            const obtenerNombreEmpresa = async () => {
                try {
                    const empresas = await ObtenerEmpresas();
                    const empresaSeleccionada = empresas.find(empresa=> empresa.idEmpresa === idEmpresa);
                    if (empresaSeleccionada) {
                        setNombreEmpresa(empresaSeleccionada.nombre);
                    }
                } catch (error) {
                    console.error('Error obteniendo la empresa:', error);
                }
            };

            obtenerNombreEmpresa();
        }
    }, [idEmpresa]);
    //  Función para validar la primera parte formulario
    const validateFirstForm = () => {
        let isValid = true;
        Keyboard.dismiss()

        if (isValid && !formulario.identificacion) {
            showInfoAlert('Ingrese una identificacion');
            isValid = false;
            return
        }
        if (isValid && formulario.contrasena.trim() !== '') {
            //  Esta validacion solo aplica si la contraseña no es un espacio en blanco
            if (!validatePassword(formulario.contrasena)) {
                isValid = false;
            }
        }
        if (isValid && formulario.contrasena !== formulario.confirmarContrasena) {
            showInfoAlert('Las contraseñas no coinciden');
            isValid = false;
            return
        }

        return isValid
    }

    const handleChangeAccess = async () => {
        Keyboard.dismiss()
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
        };

        try {
            const responseInsert = await CambiarEstadoUsuario(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se cambio el estado del usuario correctamente!');
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
        //     'Confirmar el cambio de acceso de usuario',
        //     '¿Estás seguro de que deseas cambiar el acceso este usuario?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                  Se realiza la desactivación de usuario
        //                 const responseInsert = await CambiarEstadoUsuario(formData);

        //                  Se muestra una alerta de éxito o error según la respuesta obtenida
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se desactivó el usuario correctamente!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(ScreenProps.AdminUserList.screenName, {
        //                                         datoValidacion: 1,
        //                                     });
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
    //  Se define una función para manejar la modificacion de usuario
    const handleModifyUser = async () => {
        Keyboard.dismiss()
        if (formulario.contrasena != formulario.confirmarContrasena) {
            showInfoAlert('Las contraseñas no coinciden.')
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        let formData = {
        };

        if (userData.idRol === 1) {
            formData = {
                identificacion: formulario.identificacion,
                nombre: formulario.nombre,
                correo: formulario.correo,
                contrasena: formulario.contrasena,
                idEmpresa: formulario.idEmpresa,
            };
        }
        if (userData.idRol === 2) {
            formData = {
                identificacion: formulario.identificacion,
                nombre: formulario.nombre,
                correo: formulario.correo,
                contrasena: formulario.contrasena
            };
        }

        //  Se realiza la modificación del usuario
        let responseInsert;

        if (userData.idRol === 1) responseInsert = await ActualizarUsuarioAdministrador(formData);
        if (userData.idRol === 2) responseInsert = await ActualizarDatosUsuario(formData)
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1 && userData.idRol === 1) {
            showSuccessAlert('¡Se actualizó el usuario correctamente!')
        } else if (responseInsert.indicador === 1 && userData.idRol === 2) {
            showSuccessAlertTipo2('¡Se actualizó el usuario correctamente!')
        }else {
            showErrorAlert('¡Oops! Parece que algo salió mal');
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height' }
                style={{ flex: 1 }}

                >
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            
            <BackButtonComponent screenName={ScreenProps.AdminUserList.screenName} color={'#ffff'} parametro={'1'} />

            <View style={styles.lowerContainer}>
            <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                <View>
                    <Text style={styles.createAccountText} >Modificar cuenta</Text>
                </View>

                <View style={styles.formContainer}>
                    {!isFormVisible ? (
                        <>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    setFormVisible(true);
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Modificar cuenta</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (<>
                        {!isSecondFormVisible ? (
                            <>
                                <Text style={styles.formText} >Identificación</Text>
                                <TextInput
                                    editable={false}
                                    style={styles.input}
                                    placeholder="Identificación"
                                    value={formulario.identificacion}
                                    onChangeText={(text) => updateFormulario('identificacion', text)}
                                />
                                <Text style={styles.formText} >Nombre</Text>
                                <TextInput
                                    
                                    style={styles.input}
                                    placeholder="Nombre Completo"
                                    value={formulario.nombre}
                                    onChangeText={(text) => updateFormulario('nombre', text)}
                                />
                                <Text style={styles.formText} >Correo</Text>
                                <TextInput
                                    
                                    style={styles.input}
                                    placeholder="Correo"
                                    value={formulario.correo}
                                    onChangeText={(text) => updateFormulario('correo', text)}
                                />
                                <Text style={styles.formText} >Contraseña</Text>
                                <TextInput style={styles.input}
                                    secureTextEntry={true}
                                    value={formulario.contrasena}
                                    placeholder="Contraseña"
                                    onChangeText={(text) => updateFormulario('contrasena', text)}
                                />
                                <Text style={styles.formText} >Confirmar contraseña</Text>
                                <TextInput style={styles.input}
                                    secureTextEntry={true}
                                    value={formulario.confirmarContrasena}
                                    placeholder="Confirmar contraseña"
                                    onChangeText={(text) => updateFormulario('confirmarContrasena', text)}
                                />

                                {userData.idRol === 1 ?
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
                                            const isValid = validateFirstForm();

                                            if (isValid) {
                                                setSecondFormVisible(true);
                                            }

                                        }}
                                    >

                                        <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyleRight} />
                                            </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => {
                                            handleModifyUser();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}> Guardar cambios</Text>
                                        </View>
                                    </TouchableOpacity>
                                }


                            </>
                        ) : (
                            <>
                            <Text style={styles.formText} >Empresa</Text>
                                {userData.idRol === 1 &&
                                
                                    <DropdownComponent
                                        placeholder={nombreEmpresa ? nombreEmpresa:"Empresa"}
                                        data={empresaData}
                                        iconName="building-o"
                                        value={formulario.idEmpresa}
                                        onChange={(item) => (setEmpresa(item.value as never), updateFormulario('empresa', item.value))}
                                    />
                                }
                                <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => {
                                                setSecondFormVisible(false);
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                                <Text style={styles.buttonTextBack}> Atrás</Text>
                                            </View>
                                        </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleModifyUser();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Guardar cambios</Text>
                                    </View>
                                </TouchableOpacity>
                            </>

                        )}</>)}
                </View>
                <View style={styles.containerViewButtons}>
                {estado === 'Activo' ? (
                    <TouchableOpacity
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
                ) : (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            showConfirmAlert();
                        }}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}> Habilitar acceso</Text>
                        </View>
                    </TouchableOpacity>
                )}
                </View>
            </ScrollView>    
            </View>
            <BottomNavBar />
            </KeyboardAvoidingView>
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () =>  navigation.navigate(ScreenProps.AdminUserList.screenName, {
                    datoValidacion: 1,
                }) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas cambiar el acceso este usuario?"
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