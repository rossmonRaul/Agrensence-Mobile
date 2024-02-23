import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-modificar-empresa.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ModificarEmpresa } from '../../../servicios/ServicioEmpresa';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { CambiarEstadoEmpresa } from '../../../servicios/ServicioEmpresa';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface RouteParams {
    idEmpresa: string;
    nombre: string;
}


export const AdminModificarEmpresaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idEmpresa, nombre } = route.params as RouteParams;
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idEmpresa: idEmpresa,
        empresa: nombre
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
            idEmpresa: formulario.idEmpresa,
        };
        //  Se inserta el identificacion en la base de datos
        const responseInsert = await CambiarEstadoEmpresa(formData);

        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado de la empresa?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado de la empresa correctamente!',
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
    //  Se defina una función para manejar el registro del identificacion
    const handleModifyCompany = async () => {
        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.empresa) {
            alert('Ingrese una empresa');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idEmpresa: formulario.idEmpresa,
            nombre: formulario.empresa,
        };

        //  Se realiza la modificación de empresa
        const responseInsert = await ModificarEmpresa(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert(
                '¡Se modificó la empresa correctamente!',
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
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Modificar empresa</Text>
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
                        onPress={async () => { handleModifyCompany() }}
                    >
                        <Text style={styles.buttonText}>Modificar empresa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonDelete}
                        onPress={() => {
                            handleChangeAccess();
                        }}
                    >
                        <Text style={styles.buttonText}>Cambiar estado de empresa</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNavBar />
        </View>
    );
}