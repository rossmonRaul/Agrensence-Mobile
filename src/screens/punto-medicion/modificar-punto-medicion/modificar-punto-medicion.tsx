import React, { useEffect, useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ModificarRegistroPuntoMedicion, CambiarEstadoRegistroPuntoMedicion } from '../../../servicios/ServicioPuntoMedicion';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import ConfirmAlert from '../../../components/CustomAlert/ConfirmAlert';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }

interface RouteParams {
    idPuntoMedicion: string
    idFinca: string;
    idParcela: string;
    codigo: string;
    altitud: number;
    latitud: string;
    longitud: string;
    estado: string;
}
export const ModificarPuntoMedicionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();
    const route = useRoute();
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const { idPuntoMedicion, idFinca, idParcela, codigo, altitud, latitud,longitud, estado } = route.params as RouteParams;

    const [fincas, setFincas] = useState<{ idFinca: number; nombre?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);


    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        codigo: codigo,
        altitud: altitud,
        latitud: latitud,
        longitud: longitud,
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [isAlertVisibleEstado, setAlertVisibleEstado] = useState(false);
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
                navigation.navigate(ScreenProps.ListMeasurementPoint.screenName);
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

      const showConfirmAlert = async () => {
        setAlertVisibleEstado(true);
      };
    //funcion para validar que todo este completo en la primera parte del formulario
    const validateFirstForm = () => {
        let isValid = true;
        Keyboard.dismiss()
        if (!formulario.codigo) {
            showInfoAlert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            showInfoAlert('Ingrese la Finca');
            isValid = false;
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null||formulario.idParcela === '') {
            showInfoAlert('Ingrese la Parcela');
            isValid = false;
            return
        }
        if (!formulario.codigo) {
            showInfoAlert('Ingrese un codigo');
            isValid = false;
            return
        }


        return isValid
    }
    // Se define una función para manejar el registro del manejo de fertilizantes
    const handleRegister = async () => {
        Keyboard.dismiss()
        if (!formulario.longitud && !formulario.altitud && !formulario.latitud) {
            showInfoAlert('Por favor rellene el formulario');
            return
        }

        if (!formulario.longitud) {
            showInfoAlert('Ingrese la longitud');
            return
        }
        if (!formulario.altitud) {
            showInfoAlert('Ingrese una altitud');
            
            return
        }
        if (!formulario.latitud ) {
            showInfoAlert('Ingrese una latitud');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idPuntoMedicion: idPuntoMedicion,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            codigo: formulario.codigo,
            altitud: formulario.altitud,
            latitud: formulario.latitud,
            longitud: formulario.longitud,
            usuarioCreacionModificacion: userData.identificacion,
        };

        //  Se ejecuta el servicio de isertar el manejo de fertilizante
        const responseInsert = await ModificarRegistroPuntoMedicion(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Exito en modificar!')
            // Alert.alert('¡Exito en modificar!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.ListMeasurementPoint.screenName as never);
            //         },
            //     },
            // ]);
        } else {
            showErrorAlert('!Oops! Parece que algo salió mal')
        }
    };
    
    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };
            try {
                let idEmpresa=userData.idEmpresa
                if(idEmpresa){
                const fincasResponse = await ObtenerFincas(idEmpresa);
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasFiltradas);
                const parcelasResponse = await ObtenerParcelas(idEmpresa);
                const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                setParcelas(parcelasFiltradas);

                const cargaInicialParcelas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();


    }, []);

    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // el fertilizante ya tiene una finca asignada
        const fincaInicial = fincas.find(finca => finca.idFinca === parseInt(idFinca));
        
        // Establecer el nombre de la finca inicial como selectedFinca
        setSelectedFinca(fincaInicial?.nombre || null);

        //obtener las parcelas de la finca que trae el fertilizantes
        const ObtenerParcelasIniciales = async () => {
            try {

                const parcelasFiltradas = parcelas.filter(item => item.idFinca === parseInt(idFinca));

                setParcelasFiltradas(parcelasFiltradas)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        ObtenerParcelasIniciales();

    }, [idFinca, fincas]);
    // esto es para cargar el nombre de la parcela con id Parcela que ya viene con el fertilizante
    useEffect(() => {
        // Buscar la parcela correspondiente
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));

        // Establecer el nombre de la parcela inicial como selectedFinca
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

    //se obtienen las parcelas con la finca
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
    //funcion para la accion de dropdown
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        //se acctualiza el id parcela para que seleccione otra vez la parcela
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela')
        //se obtienen las parcelas de la finca
        obtenerParcelasPorFinca(fincaId);
    };
    //funcion para desactivar o activar el manejo de fertilizantes
    const handleChangeAccess = async () => {
        Keyboard.dismiss()

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idPuntoMedicion: idPuntoMedicion,
        };

        try {
            const responseInsert = await CambiarEstadoRegistroPuntoMedicion(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se actualizó el estado del punto de medición correctamente!');
              //navigation.navigate(ScreenProps.CompanyList.screenName as never);
            } else {
                showErrorAlert('¡Oops! Parece que algo salió mal');
            }
          } catch (error) {
                showErrorAlert('¡Oops! Algo salió mal.');
          } finally {
            // setLoading(false);
            setAlertVisibleEstado(false);
          }


        // //  Se muestra una alerta con opción de aceptar o cancelar
        // Alert.alert(
        //     'Confirmar cambio de estado',
        //     '¿Estás seguro de que deseas cambiar el estado del punto de medición?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se ejecuta el servicio para cambiar el estado del manejo del fertilizante
        //                 const responseInsert = await CambiarEstadoRegistroPuntoMedicion(formData);
        //                 //Se valida si los datos recibidos de la api son correctos
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se actualizó el estado del punto de medición correctamente!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.ListMeasurementPoint.screenName
        //                                     );
        //                                 },
        //                             },
        //                         ]
        //                     );
        //                 } else {
        //                     alert('¡Oops! Parece que algo salió mal');
        //                 }
        //             },
        //         },
        //     ],
        //     { cancelable: false }
        // );
    };
    //funcion que se encarga de poder formatear la fecha
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };
    //se formatea la fecha para que tenga el formato para enviarle los datos a la base de datos
    const formatDate = () => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        return `${year}-${month}-${day}`;
    };
    //funcion para controlar el mostreo del datetime picker
    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    }
    //la accion del date time picker para guardar la fecha
    const onChange = ({ type }, selectedDate) => {
        if (type === "set" && selectedDate instanceof Date) {
            const formattedDate = formatSpanishDate(selectedDate);
            setDate(selectedDate);
            updateFormulario('fecha', formattedDate);
            if (Platform.OS === "android") {
                toggleDatePicker();
            }
        } else {
            toggleDatePicker();
        }
    };

    //accion del datetime picker para poder manejar en el caso del sistema se IOS
    const confirmIOSDate = () => {
        toggleDatePicker();
        updateFormulario('fecha', formatSpanishDate(date));

    }


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
                <BackButtonComponent screenName={ScreenProps.ListMeasurementPoint.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar punto de medición</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText} >Finca</Text>
                                    {/* Dropdown para Fincas */}
                                    <DropdownComponent
                                        placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                                        value={selectedFinca}
                                        iconName="tree"
                                        onChange={(selectedItem) => {
                                            // Manejar el cambio en la selección de la finca
                                            handleFincaChange(selectedItem);

                                            // Actualizar el formulario con la selección de la finca
                                            updateFormulario('idFinca', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Parcela</Text>
                                    {/* Dropdown para Parcelas */}
                                    <DropdownComponent
                                        placeholder={selectedParcela ? selectedParcela : "Seleccionar Parcela"}
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        value={selectedParcela}
                                        iconName="pagelines"
                                        onChange={(selectedItem) => {
                                            // Manejar el cambio en la selección de la parcela
                                            setSelectedParcela(selectedItem.value);

                                            // Actualizar el formulario con la selección de la parcela
                                            updateFormulario('idParcela', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText}>Código</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="código "
                                        value={formulario.codigo}
                                        onChangeText={(text) => updateFormulario('codigo', text)}
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
                                    <Text style={styles.formText} >Elevación(m s. n. m.) </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="elevación "
                                        value={formulario.altitud.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('altitud', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Latitud</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="latitud"
                                        value={formulario.latitud}
                                        onChangeText={(text) => updateFormulario('latitud', text)}
                                    />
                                    <Text style={styles.formText} >Longitud</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="longitud"
                                        value={formulario.longitud}
                                        onChangeText={(text) => updateFormulario('longitud', text)}
                                    />

                                    
                                    {/* <View style={styles.buttonContainer}> */}
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
                                                <Text style={styles.buttonText}> Guardar cambios</Text>
                                            </View>
                                        </TouchableOpacity>
                                    {/* </View> */}

                                    {estado === 'Activo'
                                        ? <TouchableOpacity
                                            style={styles.buttonDelete}
                                            onPress={() => {
                                                showConfirmAlert();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Desactivar</Text>
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            style={styles.buttonActive}
                                            onPress={() => {
                                                showConfirmAlert();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Activar</Text>
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
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListMeasurementPoint.screenName) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas cambiar el estado del punto de medición?"
                buttons={[
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => setAlertVisibleEstado(false),
                },
                {
                text: 'Aceptar',
                onPress: handleChangeAccess,
                 },
                ]}
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
        </View>
    );
}
