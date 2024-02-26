import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-registrar-empresa.styles';
import { useNavigation } from '@react-navigation/native';
import { InsertarEmpresa } from '../../../servicios/ServicioEmpresa';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'

export const AdminRegistrarEmpresaScreen: React.FC = () => {
    const navigation = useNavigation();
    const { userData } = useAuth();
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        empresa: ''
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };


    // Se defina una función para manejar el registro del identificacion
    const handleRegistrarCompany = async () => {

        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.empresa) {
            alert('Ingrese una empresa');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            nombre: formulario.empresa,
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await InsertarEmpresa(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se creo la empresa correctamente!', '', [
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
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />

            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Crear empresa</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Nombre empresa</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de empresa"
                        value={formulario.empresa}
                        onChangeText={(text) => updateFormulario('empresa', text)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => { handleRegistrarCompany() }}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}>Guardar registro</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNavBar />

        </View>
    );
}