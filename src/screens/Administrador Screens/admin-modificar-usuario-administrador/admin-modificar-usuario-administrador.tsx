import React, { useState } from 'react';
import { View,KeyboardAvoidingView,Platform,ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
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
    const { userData } = useAuth();
    const { identificacion,nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela } = route.params as RouteParams;
    const [isFormVisible, setFormVisible] = useState(false);

    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [empresa, setEmpresa] = useState(null);

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



    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de empresas, fincas y parcelas*/
    useFetchDropdownData(obtenerEmpresasProps);


    //  Función para validar la primera parte formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (isValid && !formulario.identificacion) {
            alert('Ingrese una identificacion');
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
            alert('Las contraseñas no coinciden');
            isValid = false;
            return
        }

        return isValid
    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
        };
        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar el cambio de acceso de usuario',
            '¿Estás seguro de que deseas cambiar el acceso este usuario?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se realiza la desactivación de usuario
                        const responseInsert = await CambiarEstadoUsuario(formData);

                        //  Se muestra una alerta de éxito o error según la respuesta obtenida
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se desactivó el usuario correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.Menu.screenName
                                            );
                                        },
                                    },
                                ]
                            );
                        } else {
                            alert('¡Oops! Parece que algo salió mal');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };
    //  Se define una función para manejar la modificacion de usuario
    const handleModifyUser = async () => {
        if (formulario.contrasena != formulario.confirmarContrasena) {
            alert('Las contraseñas no coinciden.')
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
        if (responseInsert.indicador === 1) {
            Alert.alert(
                '¡Se actualizó el usuario correctamente!',
                '',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(
                                ScreenProps.Menu.screenName
                            );
                        },
                    },
                ]
            );
        } else {
            alert('¡Oops! Parece que algo salió mal');
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
            
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />

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
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}> Siguiente</Text>
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
                                {userData.idRol === 1 &&
                                    <DropdownComponent
                                        placeholder="Empresa"
                                        data={empresaData}
                                        iconName="building-o"
                                        value={formulario.idEmpresa}
                                        onChange={(item) => (setEmpresa(item.value as never), updateFormulario('empresa', item.value))}
                                    />
                                }

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
                {estado === 'Activo' ? (
                    <TouchableOpacity
                        style={styles.buttonDelete}
                        onPress={() => {
                            handleChangeAccess();
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
                            handleChangeAccess();
                        }}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}> Habilitar acceso</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>    
            </View>
            <BottomNavBar />
            </KeyboardAvoidingView>
        </View>
    );
}