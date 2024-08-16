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
import { ModificarSensor, CambiarEstadoSensor, ObtenerMedicionesSensor, ObtenerEstadoSensores, EliminarMedicionesAutorizadasSensor, ModificarMedicionAutorizadaSensor } from '../../../../servicios/ServiciosSensor';
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
    idMediciones: number[][],
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
        estado,
        idMediciones
    } = route.params as RouteParams;

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [estadoSensor, setEstadoSensor] = useState('');
    const [puntoMedicion, setPuntoMedicion] = useState('');
    const [estadosSensor, setEstadosSensor] = useState([]);
    const [puntosMedicion, setPuntosMedicion] = useState([]);

    const initialValues = idMediciones.map((array: any) => array[1].toString());
    const [inputs, setInputs] = useState<string[]>(initialValues);
    const [medicionesSensor, setMedicionesSensor] = useState([]);
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


    const validateFirstForm = () => {
        let isValid = true;



        if (!formulario.nombre) {
            alert('El nombre es requerido.');
            return;
        } else if (formulario.nombre.length > 50) {
            alert('El nombre no puede exceder los 50 caracteres.');
            return;
        } else if (/^\s/.test(formulario.nombre)) {
            alert('El nombre no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.modelo) {
            alert('El modelo es requerido.');
            return;
        } else if (formulario.modelo.length > 150) {
            alert('El modelo no puede exceder los 150 caracteres.');
            return;
        } else if (/^\s/.test(formulario.modelo)) {
            alert('El modelo no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.identificadorSensor) {
            alert('El identificador de sensor es requerido.');
            return;
        } else if (formulario.identificadorSensor.length > 100) {
            alert('El identificador de sensor no puede exceder los 100 caracteres.');
            return;
        } else if (/^\s/.test(formulario.identificadorSensor)) {
            alert('El identificador de sensor no puede comenzar con espacios en blanco.');
            return;
        }


        return isValid;
    };
    const handleInputsChange = (index, newValue) => {
        const newInputs = [...inputs];

        const isDuplicate = newInputs.slice(0, index).some((input) => input === newValue);

        if (!isDuplicate) {
            newInputs[index] = newValue;
            setInputs(newInputs);
        } else {
            Alert.alert('Este valor ya ha sido seleccionado anteriormente.')
        }
    };

    const handleAddInput = () => {
        // Verificar si el último elemento del array no está vacío
        const lastInput = inputs[inputs.length - 1];
        if (typeof lastInput === 'string' && lastInput.trim() !== '') {
            // Agregar un nuevo elemento al array
            setInputs([...inputs, '']);
        } else {
            // Si el último elemento está vacío, muestra una alerta o realiza alguna acción
            Alert.alert('Por favor, seleccione un valor antes de agregar otro campo.');
        }
    };

    const handleRemoveInput = async (index: number) => {
        // Verificar si hay más de un elemento en el array
        if (inputs.length === 1) {
            // Mostrar alerta al usuario
            Alert.alert('Debe haber al menos un registro de medición autorizada.',);
            return; // Detener la eliminación
        }

        // Obtener el idMedicionAutorizadaSensor
        const obtenerPrimerValor = () => {
            for (let i = 0; i < idMediciones.length; i++) {
                if (idMediciones[i][1] === parseInt(inputs[index])) {
                    return idMediciones[i][0];
                }
            }
            return null;
        };
        const dataIdMedicionAutorizadaSensor = {
            idMedicionAutorizadaSensor: obtenerPrimerValor()
        };

        // Mostrar la alerta al usuario
        const result = await Alert.alert(
            '¿Estás seguro?',
            'Si eliminas este dato, se eliminará del registro.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Sí, eliminarlo',
                    onPress: async () => {
                        try {
                            const responseEliminar = await EliminarMedicionesAutorizadasSensor(dataIdMedicionAutorizadaSensor);

                            if (responseEliminar.indicador === 1) {
                                // Actualizar los inputs eliminando el elemento
                                const newInputs = [...inputs];
                                newInputs.splice(index, 1);
                                setInputs(newInputs);

                                // Mostrar mensaje de confirmación
                                Alert.alert(
                                    'Eliminado!',
                                    'El dato ha sido eliminado del registro.',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => { }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            } else {
                                Alert.alert(
                                    'Error al actualizar el registro.',
                                    responseEliminar.mensaje,
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => { }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };
    // Se defina una función para manejar el modificar cuando le da al boton de guardar
    const handleModify = async () => {




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
        const resultado = await ModificarSensor(formData);

        const inputsData = inputs.join(';');
        if (resultado.indicador === 1) {
            const medicionAutorizada = {
                idSensor: formData.idSensor,
                medicionAutorizadaSensor: inputsData
            }
            const resultadoMediciones = await ModificarMedicionAutorizadaSensor(medicionAutorizada);
            if (resultadoMediciones.indicador === 1) {
                Alert.alert('¡Se actualizo sensores correctamente!', '', [
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
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            try {
                setMedicionesSensor(await ObtenerMedicionesSensor())
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
                            {!isSecondFormVisible ? (
                                <>
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
                                        onPress={async () => {
                                            const isValid = validateFirstForm();

                                            if (isValid) {
                                                setSecondFormVisible(true);
                                            }

                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyleRight} />
                                            </View>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <ScrollView style={{ maxHeight: 400, marginBottom: 50 }}>
                                        {inputs.map((input, index) => (
                                            <View key={index} style={{ flexDirection: 'row', marginBottom: 20 }}>
                                                <View style={[styles.dropDownContainer, { flex: 1, marginRight: 10 }]}>
                                                    <DropdownComponent
                                                        placeholder="Seleccione..."
                                                        height={50}
                                                        data={medicionesSensor.map((medicionSensor: any) => ({ label: (medicionSensor.nombre + '  (' + medicionSensor.nomenclatura + ')'), value: String(medicionSensor.idMedicion) }))}
                                                        iconName=''
                                                        value={input}
                                                        onChange={(newValue) => {
                                                            const newInputs = [...inputs];
                                                            const isDuplicate = newInputs.slice(0, index).some((input) => input === newValue.value);
                                                            if (!isDuplicate) {
                                                                handleInputsChange(index, newValue.value);
                                                            } else {
                                                                Alert.alert('Por favor, seleccione un valor que no sea repetido.');
                                                            }
                                                        }}
                                                    />
                                                </View>
                                                <TouchableOpacity onPress={() => handleRemoveInput(index)} style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'red', borderRadius: 12 }}>
                                                    <Text style={{ color: 'red', fontSize: 24 }}>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                            <TouchableOpacity style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'green', borderRadius: 12 }} onPress={handleAddInput}>
                                                <Text style={{ color: 'green', fontSize: 24 }}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={() => {
                                            setSecondFormVisible(false);
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                            <Text style={styles.buttonTextBack}> Atrás</Text>
                                        </View>
                                    </TouchableOpacity>
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
                                </>
                            )}


                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
}