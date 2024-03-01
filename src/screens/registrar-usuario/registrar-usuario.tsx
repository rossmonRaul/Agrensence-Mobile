import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './registrar-usuario.styles';
import { useNavigation } from '@react-navigation/native';
import { isEmail } from 'validator'
import { GuardarUsuario } from '../../servicios/ServicioUsuario';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../constants';
import { validatePassword } from '../../utils/validationPasswordUtil';
export const RegistrarUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: '',
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: ''
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };




    // Función para validar y registar al usuario 
    const handleRegister = async () => {
        let isValid = true;

        if (!formulario.identificacion && !formulario.nombre && !formulario.correo && !formulario.contrasena && !formulario.confirmarContrasena) {
            alert('Por favor rellene el formulario');
            isValid = false;
        }
        if (isValid && !formulario.identificacion) {
            alert('Ingrese un nombre de identificacion');
            isValid = false;
        }
        if (isValid && !formulario.nombre) {
            alert('Ingrese un nombre de nombre');
            isValid = false;
        }
        if (isValid && (!formulario.correo || !isEmail(formulario.correo))) {
            alert('Ingrese un correo electrónico válido');
            isValid = false;
        }
        if (isValid && !formulario.contrasena) {
            alert('Ingrese una contraseña');
            isValid = false;
        }
        if (isValid && !validatePassword(formulario.contrasena)) {
            isValid = false;
        }
        if (isValid && formulario.contrasena !== formulario.confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            isValid = false;
        }
        if (isValid) {
            //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
            const formData = {
                identificacion: formulario.identificacion,
                nombre: formulario.nombre,
                correo: formulario.correo,
                contrasena: formulario.contrasena
            };
            
            //  Se inserta el identificacion en la base de datos
            const responseInsert = await GuardarUsuario(formData);
            
            // Se muestra una alerta de éxito o error según la respuesta obtenida
            if (responseInsert.indicador === 0) {
                Alert.alert('¡Gracias por unirte a nuestra app!', '', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(ScreenProps.Login.screenName);
                        },
                    },
                ]);
            } else {
                alert('!Oops! Parece que algo salió mal')
            }
        }
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>

            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Crea una cuenta</Text>
                </View>

                <View style={styles.formContainer}>
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
                        onPress={() => { handleRegister() }}
                    >
                        <Text style={styles.buttonText}>Crear cuenta</Text>
                    </TouchableOpacity>


                    <View style={styles.loginButtonContainer} >

                        <TouchableOpacity onPress={() => { navigation.navigate(ScreenProps.Login.screenName) }}>
                            <Text style={styles.loginButtonText} >Iniciar sesión</Text>
                        </TouchableOpacity>


                    </View>
                </View>

            </View>
        </View>
    );
}