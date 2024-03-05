import React, { useState } from 'react';
import { View,ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './admin-registrar-usuario.styles';
import { useNavigation } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { isEmail } from 'validator'

import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';
import { EmpresaInterface } from '../../../interfaces/empresaInterfaces';
import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { GuardarUsuarioPorSuperUsuario } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { validatePassword } from '../../../utils/validationPasswordUtil';
import { useAuth } from '../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'

export const AdminRegistrarUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [empresa, setEmpresa] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: '',
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        empresa: ''
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


    // Función para validar la primera parte formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.identificacion && !formulario.nombre && !formulario.correo && !formulario.contrasena && !formulario.confirmarContrasena) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (isValid && !formulario.identificacion) {
            alert('Ingrese una identificacion');
            isValid = false;
            return
        }
        if (isValid && !formulario.nombre) {
            alert('Ingrese un nombre completo');
            isValid = false;
            return
        }
        if (isValid && (!formulario.correo || !isEmail(formulario.correo))) {
            alert('Ingrese un correo electrónico válido');
            isValid = false;
            return
        }
        if (isValid && !formulario.contrasena) {
            alert('Ingrese una contraseña');
            isValid = false;
            return
        }
        if (isValid && !validatePassword(formulario.contrasena)) {
            isValid = false;
        }

        if (isValid && formulario.contrasena !== formulario.confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            isValid = false;
            return
        }

        return isValid
    }

    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {

        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.empresa) {
            alert('Ingrese una empresa');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            nombre: formulario.nombre,
            correo: formulario.correo,
            contrasena: formulario.contrasena,
            idEmpresa: formulario.empresa,
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await GuardarUsuarioPorSuperUsuario(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 0) {
            Alert.alert('¡Se creo el usuario correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.Menu.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
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
                    <Text style={styles.createAccountText} >Crea una cuenta</Text>
                </View>

                <View style={styles.formContainer}>
                    {!isSecondFormVisible ? (
                        <>
                            <Text style={styles.formText} >Identificación</Text>
                            <TextInput
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
                            <Text style={styles.formText} >Correo electrónico</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="correo@ejemplo.com"
                                value={formulario.correo}
                                // Se puede utilizar el para el correo .toLowerCase()
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
                                placeholder="Empresa"
                                data={empresaData}
                                iconName="building-o"
                                value={empresa}
                                onChange={(item) => (setEmpresa(item.value as never), updateFormulario('empresa', item.value))}
                            />
                            {empresa && <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}>Guardar registro</Text>
                                </View>
                            </TouchableOpacity>}
                        </>
                    )}
                </View>
                </ScrollView>
            </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
}