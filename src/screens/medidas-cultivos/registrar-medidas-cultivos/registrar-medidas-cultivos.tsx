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
import {  InsertarMedidasCultivos } from '../../../servicios/ServicioCultivos';

export const RegistrarMedidasCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();


    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        medida: '',
        usuarioCreacionModificacion: '',

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

        if (!formulario.medida) {
            alert('Por favor rellene el formulario');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            medida: formulario.medida,
            usuarioCreacionModificacion :userData.identificacion
        };

        //  Se ejecuta el servicio de crear la finca y devulve los datos de confirmacion
        const responseInsert = await InsertarMedidasCultivos(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se creo la medida de cultivo correctamente!', '', [
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
                <BackButtonComponent screenName={ScreenProps.CropMeasurementsList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Crea una Medida de Cultivo</Text>
                        </View>

                        <View style={styles.formContainer}>

                            <>
                                <Text style={styles.formText} >Medida de Cultivo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Medida de cultivo"
                                    value={formulario.medida}
                                    onChangeText={(text) => updateFormulario('medida', text)}
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleRegister();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Guardar Medida Cultivo</Text>
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