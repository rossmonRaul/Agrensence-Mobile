import React, { useState } from 'react';
import { View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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

export const RegistrarFincaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();


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

    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {

        if (!formulario.nombre && !formulario.ubicacion && !formulario.idEmpresa) {
            alert('Por favor rellene el formulario');
            return
        }
        if (!formulario.nombre) {
            alert('Ingrese un nombre');
            return
        }

        if (!formulario.ubicacion) {
            alert('Ingrese una ubicacion');
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
            Alert.alert('¡Se creo la finca correctamente!', '', [
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}

            >
                <ImageBackground
                    source={require('../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListEstate.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Crea una Finca</Text>
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
                                        <Text style={styles.buttonText}> Guardar Finca</Text>
                                    </View>
                                </TouchableOpacity>
                            </>

                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
}