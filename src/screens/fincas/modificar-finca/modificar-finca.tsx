import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ModificarFinca, CambiarEstadoFinca } from '../../../servicios/ServicioFinca';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'
interface RouteParams {
    idFinca: string;
    nombre: string;
    ubicacion: string;
    estado: string;
}

export const ModificarFincaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idFinca, nombre, ubicacion, estado } = route.params as RouteParams;

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        nombre: nombre,
        ubicacion: ubicacion,
        estado: estado
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
            idFinca: formulario.idFinca,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado de la finca?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se ejecuta el servicio para cambiar el estado de la finca
                        const responseInsert = await CambiarEstadoFinca(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado de la finca correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.ListEstate.screenName
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
    //  Se defina una función para manejar el registro de la finca
    const handleModifyEstate = async () => {
        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.nombre) {
            alert('Ingrese un nombre');
            return;
        }
        if (!formulario.ubicacion) {
            alert('Ingrese una ubicación');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            nombre: formulario.nombre,
            ubicacion: formulario.ubicacion
        };

        //  Se realiza la modificación de finca
        const responseInsert = await ModificarFinca(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert(
                '¡Se modificó la finca correctamente!',
                '',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(
                                ScreenProps.Menu.screenName as never
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
            <BackButtonComponent screenName={ScreenProps.ListEstate.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Modificar finca</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Nombre finca</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de finca"
                        value={formulario.nombre}
                        onChangeText={(text) => updateFormulario('nombre', text)}
                    />
                    <Text style={styles.formText} >Ubicación</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ubicación de la finca"
                        value={formulario.ubicacion}
                        onChangeText={(text) => updateFormulario('ubicacion', text)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => { handleModifyEstate() }}
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
                                handleChangeAccess();
                            }}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                <Text style={styles.buttonText}> Inhabilitar finca</Text>
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
                                <Text style={styles.buttonText}>Habilitar finca</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

            </View>
            <BottomNavBar />
        </View>
    );
}