import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ModificarMedidasCultivos, CambiarEstadoMedidasCultivos } from '../../../servicios/ServicioCultivos';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'
interface RouteParams {
    idMedidasCultivos: string;
    medida : string;
    estado: string;
}

export const ModificarMedidasCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idMedidasCultivos, medida, estado } = route.params as RouteParams;

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idMedidasCultivos: idMedidasCultivos,
        medida: medida,
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
            idMedidasCultivo: formulario.idMedidasCultivos,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado de la medida de cultivo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se ejecuta el servicio para cambiar el estado de la finca
                        const responseInsert = await CambiarEstadoMedidasCultivos(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado de la medida de cultivo correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.CropMeasurementsList.screenName
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
        if (!formulario.medida) {
            alert('Ingrese una medida de cultivo');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMedidasCultivo: formulario.idMedidasCultivos,
            medida: formulario.medida,
            usuarioCreacionModificacion :userData.identificacion
        };

        //  Se realiza la modificación de finca
        const responseInsert = await ModificarMedidasCultivos(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert(
                '¡Se modificó la medida de cultivo!',
                '',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(
                                ScreenProps.CropMeasurementsList.screenName as never
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
            <BackButtonComponent screenName={ScreenProps.CropMeasurementsList.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Modificar Medida de Cultivo</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Medida de Cultivo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Medida de cultivo"
                        value={formulario.medida}
                        onChangeText={(text) => updateFormulario('medida', text)}
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
                            <Ionicons name="trash" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}> Eliminar</Text>
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
                                <Text style={styles.buttonText}>Habilitar Medida de Cultivo</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

            </View>
            <BottomNavBar />
        </View>
    );
}