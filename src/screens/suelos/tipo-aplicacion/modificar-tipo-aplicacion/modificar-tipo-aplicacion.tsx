import React, { useState, useEffect } from 'react';
import { Button, Pressable, View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';

import { ActualizarTipoAplicacion, CambiarEstadoTipoAplicacion } from '../../../../servicios/ServicioTipoAplicacion';

import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

interface RouteParams {
    idTipoAplicacion: number;
    nombre: string;
    estado: number;
}

export const ModificarTipoAplicacionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const { idTipoAplicacion, nombre, estado } = route.params as RouteParams;

    //console.log('Route Params:', { idTipoAplicacion, nombre, estado });

    const [formulario, setFormulario] = useState({
        idTipoAplicacion: idTipoAplicacion,
        nombre: nombre,
        estado: estado,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleRegister = async () => {
        const formData = {
            idTipoAplicacion: idTipoAplicacion,
            nombre: formulario.nombre,
            usuarioAuditoria: userData.identificacion,
        };

        const responseInsert = await ActualizarTipoAplicacion(formData);

        if (responseInsert.indicador === 1) {
            Alert.alert('¡Éxito en modificar!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.MenuFloor.screenName as never);
                    },
                },
            ]);
        } else {
            alert('¡Oops! Parece que algo salió mal');
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            const formData = { identificacion: userData.identificacion };
            try {
                await ObtenerUsuariosAsignadosPorIdentificacion(formData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

    const handleChangeAccess = async () => {
        const formData = {
            idTipoAplicacion: idTipoAplicacion,
        };

        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado del tipo de aplicación?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const responseInsert = await CambiarEstadoTipoAplicacion(formData);
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado del tipo de aplicación correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(ScreenProps.MenuFloor.screenName);
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
                    source={require('../../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                />
                <BackButtonComponent screenName={ScreenProps.MenuFloor.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Modificar especificaciones</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { width: 371 }]}
                                    onPress={handleRegister}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Guardar</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {formulario.estado === 1
                                ? <TouchableOpacity
                                    style={styles.buttonDelete}
                                    onPress={handleChangeAccess}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Desactivar</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    style={styles.buttonActive}
                                    onPress={handleChangeAccess}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Activar</Text>
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
};
