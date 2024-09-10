import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { InsertarSensores, ObtenerEstadoSensores, ObtenerMedicionesSensor, InsertarMedicionAutorizadaSensor } from '../../../../servicios/ServiciosSensor';
import { ObtenerRegistroPuntoMedicion } from '../../../../servicios/ServicioPuntoMedicion';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }


export const InsertarSensoresScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();
    const [inputs, setInputs] = useState(['']);

    const [estadoSensor, setEstadoSensor] = useState(null);
    const [puntoMedicion, setPuntoMedicion] = useState(null);
    const [estadosSensor, setEstadosSensor] = useState([]);
    const [puntosMedicion, setPuntosMedicion] = useState([]);
    const [medicionesSensor, setMedicionesSensor] = useState([]);
    const handleInputsChange = (index, newValue) => {
        const newInputs = [...inputs];

        const isDuplicate = newInputs.slice(0, index).some((input) => input === newValue);

        if (!isDuplicate) {
            newInputs[index] = newValue;
            setInputs(newInputs);
        } else {
            showInfoAlert('Este valor ya ha sido seleccionado anteriormente.')
        }
    };

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });



 const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.AdminSensors.screenName as never);
              },
            },
          ],
        });
        setAlertVisible(true);
      };
    
      const showErrorAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
               
              },
            },
          ],
        });
        setAlertVisible(true);
      };

      const showInfoAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
             
              },
            },
          ],
        });
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

    const handleAddInput = () => {
        // Verificar si el último elemento del array no está vacío
        const lastInput = inputs[inputs.length - 1];
        if (typeof lastInput === 'string' && lastInput.trim() !== '') {
            // Agregar un nuevo elemento al array
            setInputs([...inputs, '']);
        } else {
            // Si el último elemento está vacío, muestra una alerta o realiza alguna acción
            showInfoAlert('Por favor, seleccione un valor antes de agregar otro campo.');
        }
    };

    const handleRemoveInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

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
        Keyboard.dismiss()

        if (!formulario.nombre) {
            showInfoAlert('El nombre es requerido.');
            return;
        } else if (formulario.nombre.length > 50) {
            showInfoAlert('El nombre no puede exceder los 50 caracteres.');
            return;
        } else if (/^\s/.test(formulario.nombre)) {
            showInfoAlert('El nombre no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.modelo) {
            showInfoAlert('El modelo es requerido.');
            return;
        } else if (formulario.modelo.length > 150) {
            showInfoAlert('El modelo no puede exceder los 150 caracteres.');
            return;
        } else if (/^\s/.test(formulario.modelo)) {
            showInfoAlert('El modelo no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.identificadorSensor) {
            showInfoAlert('El identificador de sensor es requerido.');
            return;
        } else if (formulario.identificadorSensor.length > 100) {
            showInfoAlert('El identificador de sensor no puede exceder los 100 caracteres.');
            return;
        } else if (/^\s/.test(formulario.identificadorSensor)) {
            showInfoAlert('El identificador de sensor no puede comenzar con espacios en blanco.');
            return;
        }



        return isValid;
    };


    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {

        Keyboard.dismiss()
        if (!formulario.nombre) {
            showInfoAlert('El nombre es requerido.');
            return;
        } else if (formulario.nombre.length > 50) {
            showInfoAlert('El nombre no puede exceder los 50 caracteres.');
            return;
        } else if (/^\s/.test(formulario.nombre)) {
            showInfoAlert('El nombre no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.modelo) {
            showInfoAlert('El modelo es requerido.');
            return;
        } else if (formulario.modelo.length > 150) {
            showInfoAlert('El modelo no puede exceder los 150 caracteres.');
            return;
        } else if (/^\s/.test(formulario.modelo)) {
            showInfoAlert('El modelo no puede comenzar con espacios en blanco.');
            return;
        }

        if (!formulario.identificadorSensor) {
            showInfoAlert('El identificador de sensor es requerido.');
            return;
        } else if (formulario.identificadorSensor.length > 100) {
            showInfoAlert('El identificador de sensor no puede exceder los 100 caracteres.');
            return;
        } else if (/^\s/.test(formulario.identificadorSensor)) {
            showInfoAlert('El identificador de sensor no puede comenzar con espacios en blanco.');
            return;
        }
        if (formulario.idEstado.trim() === '') {
            showInfoAlert('El estado de sensor es requerido.');
            return
        }
        if (formulario.idPuntoMedicion.trim() === '') {
            showInfoAlert('El punto de medición es requerido.');
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
        const inputsData = inputs.join(';');
        const isDuplicate = inputs.some((input, index) => inputs.indexOf(input) !== index);
        if (isDuplicate) {
            showInfoAlert('Los valores no pueden estar duplicados.');
            return;
        }
        try {
            const resultado = await InsertarSensores(formData);
            if (resultado.indicador === 1) {
                const medicionAutorizada = {
                    idSensor: parseInt(resultado.mensaje),
                    medicionAutorizadaSensor: inputsData
                }
                const resultadoMediciones = await InsertarMedicionAutorizadaSensor(medicionAutorizada);
                //  Se muestra una alerta de éxito o error según la respuesta obtenida
                if (resultadoMediciones.indicador === 1) {
                    showSuccessAlert('¡Se registro sensores correctamente!')

                    // Alert.alert('¡Se registro sensores correctamente!', '', [
                    //     {
                    //         text: 'OK',
                    //         onPress: () => {
                    //             navigation.navigate(ScreenProps.AdminSensors.screenName as never);
                    //         },
                    //     },
                    // ]);
                } else {
                    showErrorAlert('!Oops! Parece que algo salió mal')
                }
            }

        } catch (error) {
            console.log(error);
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
                                     <Text style={styles.formText} >Estado de sensor</Text>
                                    <DropdownComponent
                                        placeholder="Estado de sensor"
                                        data={estadosSensor.map((estado: any) => ({ label: estado.estado, value: String(estado.idEstado) }))}
                                        value={estadoSensor}
                                        iconName='microchip'
                                        onChange={handleEstadoSensor}
                                    />
                                    <Text style={styles.formText} >Punto de medición</Text>
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
                                                                showInfoAlert('Por favor, seleccione un valor que no sea repetido.');
                                                            }
                                                        }}
                                                    />
                                                </View>
                                                {index !== 0 && (
                                                    <TouchableOpacity onPress={() => handleRemoveInput(index)} style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'red', borderRadius: 12 }}>
                                                        <Text style={{ color: 'red', fontSize: 24 }}>X</Text>
                                                    </TouchableOpacity>
                                                )}
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
                                            handleRegister();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Guardar sensor</Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView >
            <BottomNavBar />
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.AdminSensors.screenName as never) : undefined}
                />
                {isAlertVisibleAuth  && (
                <CustomAlertAuth
                isVisible={isAlertVisibleAuth }
                onClose={hideAlertAuth }
                message={alertPropsAuth .message}
                iconType={alertPropsAuth .iconType}
                buttons={alertPropsAuth .buttons}
                navigateTo={alertPropsAuth .iconType === 'success' ? () => {} : undefined}
                />
                )}
        </View >
    );
}