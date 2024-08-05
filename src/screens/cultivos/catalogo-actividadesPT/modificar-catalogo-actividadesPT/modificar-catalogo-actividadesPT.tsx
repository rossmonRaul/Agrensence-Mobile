import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { ModificarActividadPreparacionTerreno, CambiarEstadoActividadPrepTerreno, ObtenerDatosPreparacionTerrenoActividad } from '../../../../servicios/ServicioCatalogoActividadPT';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
    idActividad: string;
    nombre: string;
    estado: string;
}

export const ModificarCatalogoActividadPTScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idActividad, nombre, estado } = route.params as RouteParams;

    const [formulario, setFormulario] = useState({
        idActividad: idActividad,
        nombre: nombre,
        usuarioCreacionModificacion: userData.identificacion,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleRegister = async () => {
        if (!formulario.nombre) {
            alert('Ingrese el nombre de la actividad');
            return;
        }

        // Verifica si el nombre ya existe en la base de datos
        const actividades = await ObtenerDatosPreparacionTerrenoActividad();
        const actividadDuplicada = actividades.find(act => act.nombre.toLowerCase() === formulario.nombre.toLowerCase());

        if (actividadDuplicada && actividadDuplicada.idActividad !== formulario.idActividad) {
            Alert.alert('Nombre duplicado', 'Ya existe una actividad con este nombre. Por favor, elija un nombre diferente.');
            return;
        }

        const formData = {
            idActividad: formulario.idActividad,
            nombre: formulario.nombre,
            usuarioCreacionModificacion: formulario.usuarioCreacionModificacion,
        };

        const responseInsert = await ModificarActividadPreparacionTerreno(formData);

        if (responseInsert.indicador === 1) {
            Alert.alert('¡Exito en modificar!', 'Actividad Actualizada', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListCatalogoActividades.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal');
        }
    };

    const handleChangeAccess = async () => {
        const formData = {
            idActividad: idActividad,
            nombre: nombre,
            usuarioCreacionModificacion: userData.identificacion,
        };

        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar la actividad?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const responseInsert = await CambiarEstadoActividadPrepTerreno(formData);
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se elimino la actividad correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(ScreenProps.ListCatalogoActividades.screenName);
                                        },
                                    },
                                ]
                            );
                        } else {
                            alert('¡Oops! Parece que algo salió mal al eliminar el registro.');
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
                ></ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListCatalogoActividades.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Modificar Actividad</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText}>Nombre de la Actividad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la Actividad"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                            />

                            <TouchableOpacity
                                style={[styles.button, { width: '100%' }]}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Guardar</Text>
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
                                    style={styles.buttonActive}
                                    onPress={() => {
                                        handleChangeAccess();
                                    }}
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

export default ModificarCatalogoActividadPTScreen;
