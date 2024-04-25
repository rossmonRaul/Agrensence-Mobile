import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { ModificarSensor, CambiarEstadoSensor, ObtenerEstadoSensores } from '../../../../servicios/ServiciosSensor';
import { ObtenerRegistroPuntoMedicion } from '../../../../servicios/ServicioPuntoMedicion';
interface RouteParams {
    idSensor: string,
    identificadorSensor: string,
    nombre: string,
    modelo: string,
    idEstado: string,
    idPuntoMedicion: string,
    codigoPuntoMedicion: string,
    estadosensor: string,
    estado: string,
}

export const ModificarSensoresScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const { idSensor,
        identificadorSensor,
        nombre,
        modelo,
        idEstado,
        idPuntoMedicion,
        codigoPuntoMedicion,
        estadosensor,
        estado
    } = route.params as RouteParams;

    const [estadoSensor, setEstadoSensor] = useState('');
    const [puntoMedicion, setPuntoMedicion] = useState('');
    const [estadosSensor, setEstadosSensor] = useState([]);
    const [puntosMedicion, setPuntosMedicion] = useState([]);

    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idSensor: idSensor,
        identificacionUsuario: userData.identificacion,
        identificadorSensor: identificadorSensor || '',
        nombre: nombre || '',
        modelo: modelo || '',
        idEstado: idEstado || '',
        idPuntoMedicion: idPuntoMedicion || '',
        estado: estado || '',
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    // Se defina una función para manejar el modificar cuando le da al boton de guardar
    const handleModify = async () => {


        if (formulario.nombre.trim() === '') {
            alert('El nombre es requerido.');
            return
        }
        if (formulario.modelo.trim() === '') {
            alert('El modelo es requerido.');
            return
        }
        if (formulario.identificadorSensor.trim() === '') {
            alert('El identificador de sensor es requerido.');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idSensor: idSensor,
            identificacionUsuario: userData.identificacion,
            identificadorSensor: formulario.identificadorSensor,
            nombre: formulario.nombre,
            modelo: formulario.modelo,
            idEstado: formulario.idEstado,
            idPuntoMedicion: formulario.idPuntoMedicion,
        };
        //  Se ejecuta el servicio de modificar el registro sensor
        const responseInsert = await ModificarSensor(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico el registro sensor!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.AdminSensors.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };

            try {
                setEstadosSensor(await ObtenerEstadoSensores())
                setPuntosMedicion(await ObtenerRegistroPuntoMedicion({ idEmpresa: userData.idEmpresa }))
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

    useEffect(() => {
        setPuntoMedicion(idPuntoMedicion)
        setEstadoSensor(idEstado)
    }, [puntosMedicion, estadosSensor]);

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idSensor: idSensor,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado del registro sensor?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const responseInsert = await CambiarEstadoSensor(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado del registro sensor!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.AdminSensors.screenName
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

    const handleEstadoSensor = (itemValue: any) => {
        setEstadoSensor(itemValue.value);
        updateFormulario('idEstado', itemValue.value)
    }


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}

            >
                <ImageBackground
                    source={require('../../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListSensors.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Registro sensores</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText} >Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                                maxLength={50}
                            />
                            <Text style={styles.formText} >Modelo</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Modelo"
                                value={formulario.modelo}
                                onChangeText={(text) => updateFormulario('modelo', text)}
                                maxLength={50}
                            />
                            <Text style={styles.formText} >Identificador de sensor (EUI)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Identificador de sensor"
                                value={formulario.identificadorSensor}
                                onChangeText={(text) => updateFormulario('identificadorSensor', text)}
                                maxLength={50}
                            />
                            <DropdownComponent
                                placeholder={estadoSensor ? estadosensor : "Seleccionar estado de sensor"}
                                data={estadosSensor.map((estado: any) => ({ label: estado.estado, value: String(estado.idEstado) }))}
                                value={estadoSensor}
                                iconName='microchip'
                                onChange={handleEstadoSensor}
                            />

                            <DropdownComponent
                                placeholder={puntoMedicion ? codigoPuntoMedicion : "Seleccionar punto de medición"}
                                data={puntosMedicion.map((puntoMedicion: any) => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                iconName='map-marker'
                                value={puntoMedicion}
                                onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}

                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleModify();
                                }}
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
                                        <Text style={styles.buttonText}>Desactivar</Text>
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
                                        <Text style={styles.buttonText}>Activar</Text>
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