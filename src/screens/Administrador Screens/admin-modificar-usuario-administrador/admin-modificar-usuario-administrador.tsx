import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-modificar-usuario-administrador.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';

import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';

import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { ActualizarUsuarioAdministrador, CambiarEstadoUsuario } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { validatePassword } from '../../../utils/validationPasswordUtil';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmpresaInterface } from '../../../interfaces/empresaInterfaces';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';

interface RouteParams {
    identificacion: string;
    idEmpresa: string;
    idRol: number;
    idFinca: number;
    idParcela: number;
}



export const AdminModificarUsuarioAdmnistradorScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const { userData } = useAuth();
    const { identificacion, idEmpresa, idRol, idFinca, idParcela } = route.params as RouteParams;
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
            alert('Ingrese un nombre de identificacion');
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

    const handleDeleteUser = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
        };
        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar desactivación de usuario',
            '¿Estás seguro de que deseas desactivar este usuario?',
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
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            contrasena: formulario.contrasena,
            idEmpresa: formulario.idEmpresa,
        };


        //  Se realiza la modificación del usuario
        const responseInsert = await ActualizarUsuarioAdministrador(formData);

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
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />

            <View style={styles.lowerContainer}>
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
                                <Text style={styles.buttonText}>Modificar contraseña</Text>
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

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={async () => {
                                        const isValid = validateFirstForm();

                                        if (isValid) {
                                            setSecondFormVisible(true);
                                        }

                                    }}
                                >
                                    <Text style={styles.buttonText}>Siguiente</Text>
                                </TouchableOpacity>


                            </>
                        ) : (
                            <>
                                <DropdownComponent
                                    placeholder="EmpresaInterface"
                                    data={empresaData}
                                    iconName="building-o"
                                    value={formulario.idEmpresa}
                                    onChange={(item) => (setEmpresa(item.value as never), updateFormulario('empresa', item.value))}
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleModifyUser();
                                    }}
                                >
                                    <Text style={styles.buttonText}>Enviar</Text>
                                </TouchableOpacity>
                            </>

                        )}</>)}
                </View>
                <TouchableOpacity
                    style={styles.buttonDelete}
                    onPress={() => {
                        handleDeleteUser();
                    }}
                >
                    <Text style={styles.buttonText}>Cambiar estado de acceso</Text>
                </TouchableOpacity>

            </View>
            <BottomNavBar />

        </View>
    );
}