import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'
import { CambiarEstadoMedicionSensor, ModificarMedicionesSensor } from '../../../servicios/ServiciosSensor';
interface RouteParams {
    idMedicion: string;
    
    estado: string;
}


export const AdminModificarMedicionSensorScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idMedicion,  estado } = route.params as RouteParams;
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idMedicion: idMedicion,
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMedicion: formulario.idMedicion,
            usuarioCreacionModificacion: userData.identificacion
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado de la medicion?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoMedicionSensor(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado de la medicion correctamente!',
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
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
            <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                <View>
                    <Text style={styles.createAccountText} >Modificar medicion de sensor</Text>
                </View>
                <View style={styles.formContainer}>
                    

                    {estado === 'Activo'
                        ? <TouchableOpacity
                            style={styles.buttonDelete}
                            onPress={() => {
                                handleChangeAccess();
                            }}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                <Text style={styles.buttonText}> Inhabilitar</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                handleChangeAccess();
                            }}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                <Text style={styles.buttonText}>Habilitar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
                </ScrollView>
            </View>


            </KeyboardAvoidingView>
            
            <BottomNavBar />
        </View>
    );
}