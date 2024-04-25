import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { InsertarSensores, ObtenerEstadoSensores } from '../../../../servicios/ServiciosSensor';
import { ObtenerRegistroPuntoMedicion } from '../../../../servicios/ServicioPuntoMedicion';
export const InsertarSensoresScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [estadoSensor, setEstadoSensor] = useState(null);
    const [puntoMedicion, setPuntoMedicion] = useState(null);
    const [estadosSensor, setEstadosSensor] = useState([]);
    const [puntosMedicion, setPuntosMedicion] = useState([]);


    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacionUsuario: userData.identificacion,
        idSensor: '',
        identificadorSensor: '',
        nombre: '',
        modelo: '',
        idEstado: '',
        idPuntoMedicion: '',
        estado: ''
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const validateFirstForm = () => {
        let isValid = true;





        return isValid;
    };


    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {


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
        if (formulario.idEstado.trim() === '') {
            alert('El estado de sensor es requerido.');
            return
        }
        if (formulario.idPuntoMedicion.trim() === '') {
            alert('El punto de medición es requerido.');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacionUsuario: userData.identificacion,
            identificadorSensor: formulario.identificadorSensor,
            nombre: formulario.nombre,
            modelo: formulario.modelo,
            idEstado: formulario.idEstado,
            idPuntoMedicion: formulario.idPuntoMedicion,
        };
        //  Se ejecuta el servicio de insertar sensores
        const responseInsert = await InsertarSensores(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se registro sensores correctamente!', '', [
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
            try {
                setEstadosSensor(await ObtenerEstadoSensores())
                setPuntosMedicion(await ObtenerRegistroPuntoMedicion({ idEmpresa: userData.idEmpresa }))
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);




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
                                placeholder="Estado de sensor"
                                data={estadosSensor.map((estado: any) => ({ label: estado.estado, value: String(estado.idEstado) }))}
                                value={estadoSensor}
                                iconName='microchip'
                                onChange={handleEstadoSensor}
                            />

                            <DropdownComponent
                                placeholder="Punto de medición"
                                data={puntosMedicion.map((puntoMedicion: any) => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                iconName='map-marker'
                                value={puntoMedicion}
                                onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}
                            />



                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}>Guardar cambios</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
}