import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, PanResponder, Keyboard } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { CambiarEstadoManejoResiduos, ModificarManejoResiduos } from '../../../../servicios/ServicioResiduos';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import ConfirmAlert from '../../../../components/CustomAlert/ConfirmAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';

interface Button {
    text: string;
    onPress: () => void;
  }
interface RouteParams {
    idManejoResiduos: number
    idFinca: string;
    idParcela: string;
    residuo: string;
    fechaGeneracion: string;
    fechaManejo: string;
    cantidad: number;
    accionManejo: string;
    destinoFinal: string;
    estado: string;
}
export const ModificarResiduosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
   // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())

    const [showPickerManejo, setShowPickerManejo] = useState(false);
    const [dateManejo, setDateManejo] = useState(new Date())

    const [formattedDate, setFormattedDate] = useState('');
    const [formattedDateManejo, setFormattedDateManejo] = useState('');

    const route = useRoute();
    const { idManejoResiduos, idFinca, idParcela, residuo, fechaGeneracion,
        fechaManejo, cantidad, accionManejo, destinoFinal, estado } = route.params as RouteParams;

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        residuo: residuo,
        fechaGeneracion: fechaGeneracion,
        fechaManejo: fechaManejo,
        cantidad: cantidad,
        accionManejo: accionManejo,
        destinofinal: destinoFinal,
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
                navigation.navigate(ScreenProps.ResidueList.screenName as never);
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
	Keyboard.dismiss();
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
	Keyboard.dismiss();
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

      const showConfirmAlert = async () => {
        setAlertVisibleEstado(true);
      };

    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.residuo && !formulario.fechaGeneracion &&
            !formulario.fechaManejo && !formulario.cantidad && !formulario.accionManejo) {
            showInfoAlert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.residuo) {
            showInfoAlert('Ingrese un Residuo');
            isValid = false;
            return
        }
        if (!formulario.fechaGeneracion) {
            showInfoAlert('Ingrese la Fecha de Generacion');
            isValid = false;
            return
        }
        if (!formulario.fechaManejo) {
            showInfoAlert('Ingrese la Fecha del Manejo');
            isValid = false;
            return
        }
        if (!formulario.accionManejo) {
            showInfoAlert('Ingrese el Accion');
            isValid = false;
            return
        }

        return isValid
    }


    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {

        if (!formulario.destinofinal) {
            showInfoAlert('Ingrese el destino');
            return
        }

        if (!formulario.idFinca || formulario.idFinca === null) {
            showInfoAlert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            showInfoAlert('Ingrese la Parcela');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idManejoResiduos: idManejoResiduos,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            residuo: formulario.residuo,
            fechaGeneracion: formattedDate,
            fechaManejo: formattedDateManejo,
            cantidad: formulario.cantidad,
            accionManejo: formulario.accionManejo,
            destinofinal: formulario.destinofinal,
            usuarioModificacion: userData.identificacion
        };

        //  Se ejecuta el servicio de insertar residuo
        const responseInsert = await ModificarManejoResiduos(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Registro modificado exitosamente!')
            // Alert.alert(responseInsert.mensaje, '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.ResidueList.screenName as never);
            //         },
            //     },
            // ]);
        } else {
            showErrorAlert(responseInsert.mensaje)
        }
    };
    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };
            try {
                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

                const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idFinca)))
                    .map(idFinca => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                        const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                        return { idFinca, nombreFinca };
                    });

                setFincas(fincasUnicas);

                const parcelasUnicas = datosInicialesObtenidos.map(item => ({
                    idFinca: item.idFinca,
                    idParcela: item.idParcela,
                    nombre: item.nombreParcela,
                }));

                setParcelas(parcelasUnicas)

                setFormattedDate(formatDateToISO(fechaGeneracion))
                setFormattedDateManejo(formatDateToISO(fechaManejo))

                const cargaInicialParcelas = parcelasUnicas.filter((parcela: any) => fincasUnicas.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();


    }, []);

    const formatDateToISO = (fecha) => {
        // Divide la fecha en día, mes y año
        const [day, month, year] = fecha.split('/');

        // Asegura que el día y el mes tengan dos dígitos
        const dayFormatted = day.padStart(2, '0');
        const monthFormatted = month.padStart(2, '0');

        // Retorna la fecha en formato 'yyyy-mm-dd'
        return `${year}-${monthFormatted}-${dayFormatted}`;
    };

    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // el residuo ya tiene una finca asignada
        const fincaInicial = fincas.find(finca => finca.idFinca === parseInt(idFinca));

        // Establecer el nombre de la finca inicial como selectedFinca
        setSelectedFinca(fincaInicial?.nombreFinca || null);

        //obtener las parcelas de la finca que trae el residuo
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
    // esto es para cargar el nombre de la parcela con id Parcela que ya viene con el residuo
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

    //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    // Función para formatear la fecha 
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${year}-${month}-${day}`;
    };

    const formatDateManejo = () => { // Aquí se crea un objeto Date a partir de la cadena dateString
        const day = dateManejo.getDate().toString().padStart(2, '0');
        const month = (dateManejo.getMonth() + 1).toString().padStart(2, '0');
        const year = dateManejo.getFullYear().toString();

        return `${year}-${month}-${day}`;
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    }
    //se captura el evento de datetimepicker
    const onChange = ({ type }, selectedDate) => {
        if (type === "set" && selectedDate instanceof Date) {
            const formattedDate = formatSpanishDate(selectedDate);
            setDate(selectedDate);
            updateFormulario('fechaGeneracion', formattedDate);

            // Formatea la fecha seleccionada
            const formatted = formatDate(date);
            // Actualiza la variable de estado con la fecha formateada
            setFormattedDate(formatted);
            if (Platform.OS === "android") {
                toggleDatePicker();
            }
        } else {
            toggleDatePicker();
        }
    };

    //en el caso de ser ios poder capturar la fecha
    const confirmIOSDate = () => {
        toggleDatePicker();
        updateFormulario('fechaGeneracion', formatSpanishDate(date));
        // Formatea la fecha seleccionada
        const formatted = formatDate(date);
        // Actualiza la variable de estado con la fecha formateada
        setFormattedDate(formatted);
        setDate(date)
    }

    const toggleDatePickerManejo = () => {
        setShowPickerManejo(!showPickerManejo);
    }
    //se captura el evento de datetimepicker
    const onChangeManejo = ({ type }, selectedDate) => {
        if (type === "set" && selectedDate instanceof Date) {
            const formattedDate = formatSpanishDate(selectedDate);
            setDateManejo(selectedDate);
            updateFormulario('fechaManejo', formattedDate);
            // Formatea la fecha seleccionada
            const formatted = formatDate(dateManejo);
            // Actualiza la variable de estado con la fecha formateada
            setFormattedDateManejo(formatted);
            if (Platform.OS === "android") {
                toggleDatePickerManejo();
            }
        } else {
            toggleDatePickerManejo();
        }
    };

    //en el caso de ser ios poder capturar la fecha
    const confirmIOSDateManejo = () => {
        toggleDatePickerManejo();

        updateFormulario('fechaManejo', formatSpanishDate(dateManejo));
        // Formatea la fecha seleccionada
        const formatted = formatDate(dateManejo);
        // Actualiza la variable de estado con la fecha formateada
        setFormattedDateManejo(formatted);
        setDateManejo(dateManejo)
    }

    //funcion para desactivar o activar el manejo de residuo
    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idManejoResiduos: idManejoResiduos,
        };
        try {
            const responseInsert = await CambiarEstadoManejoResiduos(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se actualizó el estado del manejo del residuo correctamente!');
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


        //  Se muestra una alerta con opción de aceptar o cancelar
        // Alert.alert(
        //     'Confirmar cambio de estado',
        //     '¿Estás seguro de que deseas cambiar el estado del manejo del residuo?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se ejecuta el servicio para cambiar el estado del manejo del residuo
        //                 const responseInsert = await CambiarEstadoManejoResiduos(formData);
        //                 //Se valida si los datos recibidos de la api son correctos
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se actualizó el estado del manejo del residuo correctamente!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.ResidueList.screenName
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
                <BackButtonComponent screenName={ScreenProps.ResidueList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Manejo de residuos</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible && (
                                <>

                                    <Text style={styles.formText} >Residuo</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione una categoría"
                                        data={[
                                            { label: "Orgánicos", value: "Organicos" },
                                            { label: "Inorgánicos", value: "Inorganicos" },
                                            { label: "Peligroso", value: "Peligroso" },
                                            { label: "Construcción", value: "Construccion" },
                                            { label: "Electrónicos", value: "Electronicos" },
                                            { label: "Forestales", value: "Forestales" }
                                        ]}
                                        value={formulario.residuo}
                                        iconName="recycle"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('residuo', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText}>Fecha generación</Text>


                                    {!showPicker && (
                                        <Pressable
                                            onPress={toggleDatePicker}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder="00/00/00"
                                                value={formulario.fechaGeneracion}
                                                onChangeText={(text) => updateFormulario('fechaGeneracion', text)}
                                                editable={false}
                                                onPressIn={toggleDatePicker}
                                            />
                                        </Pressable>

                                    )}

                                    {showPicker && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={date}
                                            onChange={onChange}
                                            style={styles.dateTimePicker}
                                            maximumDate={new Date()}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPicker && Platform.OS === 'ios' && (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-around"
                                            }}
                                        >
                                            <TouchableOpacity style={[
                                                styles.buttonPicker,
                                                styles.pickerButton,
                                                { backgroundColor: "#11182711" },
                                            ]}
                                                onPress={toggleDatePicker}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Cancelar</Text>

                                            </TouchableOpacity>
                                            <TouchableOpacity style={[
                                                styles.buttonPicker,
                                                styles.pickerButton,
                                                { backgroundColor: "#11182711" },
                                            ]}
                                                onPress={confirmIOSDate}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}
                                    <Text style={styles.formText}>Fecha manejo</Text>


                                    {!showPickerManejo && (
                                        <Pressable
                                            onPress={toggleDatePickerManejo}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder="00/00/00"
                                                value={formulario.fechaManejo}
                                                onChangeText={(text) => updateFormulario('fechaManejo', text)}
                                                editable={false}
                                                onPressIn={toggleDatePickerManejo}
                                            />
                                        </Pressable>

                                    )}

                                    {showPickerManejo && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateManejo}
                                            onChange={onChangeManejo}
                                            style={styles.dateTimePicker}
                                            maximumDate={new Date()}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPickerManejo && Platform.OS === 'ios' && (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-around"
                                            }}
                                        >
                                            <TouchableOpacity style={[
                                                styles.buttonPicker,
                                                styles.pickerButton,
                                                { backgroundColor: "#11182711" },
                                            ]}
                                                onPress={toggleDatePickerManejo}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Cancelar</Text>

                                            </TouchableOpacity>
                                            <TouchableOpacity style={[
                                                styles.buttonPicker,
                                                styles.pickerButton,
                                                { backgroundColor: "#11182711" },
                                            ]}
                                                onPress={confirmIOSDateManejo}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}
                                    <Text style={styles.formText} >Cantidad (kg)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cantidad"
                                        value={formulario.cantidad.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('cantidad', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Accion de manejo</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Accion de Manejo"
                                        value={formulario.accionManejo}
                                        onChangeText={(text) => updateFormulario('accionManejo', text)}
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
                            )}

                            {isSecondFormVisible && (

                                <>

                                    <Text style={styles.formText} >Finca</Text>
                                    {/* Dropdown para Fincas */}
                                    <DropdownComponent
                                        placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
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

                                    <Text style={styles.formText} >Destino final</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Destino Final"
                                        value={formulario.destinofinal}
                                        onChangeText={(text) => updateFormulario('destinofinal', text)}
                                    />

                                    
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
                                    
                                    {estado === 'Activo'
                                        ? <TouchableOpacity
                                            style={styles.buttonDelete}
                                            onPress={() => {
                                                handleChangeAccess();
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
                                                handleChangeAccess();
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ResidueList.screenName as never) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas cambiar el estado del manejo del residuo?"
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

