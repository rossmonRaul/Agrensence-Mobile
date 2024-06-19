import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Button, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { FontAwesome } from '@expo/vector-icons';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ActualizarSaludDeLaPlanta, CambiarEstadoSaludDeLaPlanta, DesactivarDocumentoSaludDeLaPlanta, InsertarDocumentacionSaludDeLaPlanta, ObtenerDocumentacionSaludDeLaPlanta } from '../../../../servicios/ServicioSaludDeLaPlanta';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as base64js from 'base64-js';


//datos desde la lista para mostrarlos en los input
interface RouteParams {
    idSaludDeLaPlanta: string;
    idFinca: string;
    idParcela: string;
    fecha: string;
    cultivo: string;
    idColorHojas: string;
    idTamanoFormaHoja: string;
    idEstadoTallo: string;
    idEstadoRaiz: string;
    estado: string;
}
export const ModificarSaludPlantaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();


    const [isFirstFormVisible, setFirstFormVisible] = useState(true);
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [isThirdFormVisible, setThirdFormVisible] = useState(false);

    const route = useRoute();
    const { idSaludDeLaPlanta,idFinca, idParcela, fecha, cultivo,
        idColorHojas, idTamanoFormaHoja, idEstadoTallo,
        idEstadoRaiz,  estado } = route.params as RouteParams;

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [addFiles, setAddFiles] = useState<any[]>([]);
    const [deleteFiles, setDeleteFiles] = useState<{ idDocumento?: number }[]>([]);

    const [formattedDate, setFormattedDate] = useState('');
    const [loading, setLoading] = useState(false);
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idSaludDeLaPlanta: idSaludDeLaPlanta,
        idFinca: idFinca,
        idParcela: idParcela,
        fecha: fecha,
        cultivo: cultivo,
        idColorHojas: idColorHojas,
        idTamanoFormaHoja: idTamanoFormaHoja,
        idEstadoTallo: idEstadoTallo,
        idEstadoRaiz: idEstadoRaiz,
    });


    const [formDataDocument] = useState({
        idSaludDeLaPlanta: '',
        Documento: '',
        NombreDocumento: '',
        usuarioCreacionModificacion: ''

    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    //funcion para desactivar o activar el estado
    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idSaludDeLaPlanta: idSaludDeLaPlanta,
        };

        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar el registro de salud de la planta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se ejecuta el servicio para cambiar el estado 
                        const responseInsert = await CambiarEstadoSaludDeLaPlanta(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se elimino el registro de salud de la planta correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.PlantHealthList.screenName
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

                setLoading(true); // Establecer loading a true antes de empezar
                setFirstFormVisible(false)
                setSecondFormVisible(false)
                setThirdFormVisible(false)
                // Obtener documentos en formato base64
                const documentos = await ObtenerDocumentacionSaludDeLaPlanta({ idSaludDeLaPlanta });

                const archivos: { base64: string; idDocumento: number; name: string; }[] = [];

                // Convertir cada documento base64 a archivo
                for (const doc of documentos) {
                    // Crear un objeto que incluya el archivo, su ID asociado, nombre y URI
                    archivos.push({
                        base64: doc.documento,
                        idDocumento: doc.idDocumento,
                        name: doc.nombreDocumento
                    });
                }

                setSelectedFiles(archivos);

                setFormattedDate(formatDateToISO(fecha))

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Establecer loading a false cuando termina
                setFirstFormVisible(true)
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

    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.idFinca && !formulario.fecha
            && !formulario.idParcela && !formulario.cultivo) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            isValid = false;
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            isValid = false;
            return
        }
        if (!formulario.fecha) {
            alert('Ingrese la Fecha');
            isValid = false;
            return
        }
        if (!formulario.cultivo) {
            alert('Ingrese un cultivo');
            isValid = false;
            return
        }
        return isValid
    }

    const validateSecondForm = () => {
        let isValid = true;

        if (!formulario.idColorHojas && !formulario.idTamanoFormaHoja
            && !formulario.idEstadoTallo && !formulario.idEstadoRaiz) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }

        if (!formulario.idColorHojas) {
            alert('Seleccione un color de hojas');
            isValid = false;
            return
        }
        if (!formulario.idTamanoFormaHoja) {
            alert('Seleccione un tamaño y forma de la hoja');
            isValid = false;
            return
        }
        if (!formulario.idEstadoTallo) {
            alert('Seleccione un estado del tallo');
            isValid = false;
            return
        }
        if (!formulario.idEstadoRaiz) {
            alert('Seleccione un estado de la raíz');
            isValid = false;
            return
        }
        return isValid
    }

    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // el fertilizante ya tiene una finca asignada
        const fincaInicial = fincas.find(finca => finca.idFinca === parseInt(idFinca));

        // Establecer el nombre de la finca inicial como selectedFinca
        setSelectedFinca(fincaInicial?.nombreFinca || null);

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
    // esto es para cargar el nombre de la parcela con id Parcela
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

    const handleRegister = async () => {
        if (selectedFiles.length<1) {
            alert('Se debe insertar minimo una imagen');
            return;
        }
        try {
            setLoading(true)
            setThirdFormVisible(false)
            //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
            const formData = {
                idSaludDeLaPlanta: idSaludDeLaPlanta,
                idFinca: formulario.idFinca,
                idParcela: formulario.idParcela,
                fecha: formattedDate,
                cultivo: formulario.cultivo,
                idcolorHojas: formulario.idColorHojas,
                idTamanoFormaHoja: formulario.idTamanoFormaHoja,
                idEstadoTallo: formulario.idEstadoTallo,
                idEstadoRaiz: formulario.idEstadoRaiz,
                usuarioCreacionModificacion: userData.identificacion,
            };

            //  Se ejecuta el servicio de modificar
            const responseInsert = await ActualizarSaludDeLaPlanta(formData);
            let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

            //  Se muestra una alerta de éxito o error según la respuesta obtenida
            if (responseInsert.indicador === 1) {

                formDataDocument.idSaludDeLaPlanta = idSaludDeLaPlanta
                formDataDocument.usuarioCreacionModificacion = userData.identificacion
                for (const file of addFiles) {
                    try {

                        formDataDocument.NombreDocumento = file.name;
                        formDataDocument.Documento = file.base64;

                        const resultadoDocumento = await InsertarDocumentacionSaludDeLaPlanta(formDataDocument);

                        if (resultadoDocumento.indicador !== 1) {
                            errorEnviandoArchivos = true; // Marcar que hubo un error
                        }
                    } catch (error) {
                        console.error('Error al leer el archivo:', error);
                    }
                }


                for (let documento of deleteFiles) {

                    const resultadoDocumento = await DesactivarDocumentoSaludDeLaPlanta({ idDocumento: documento.idDocumento })

                    if (resultadoDocumento.indicador !== 1) {
                        errorEnviandoArchivos = true; // Marcar que hubo un error
                    }

                }

                if (errorEnviandoArchivos) {
                    alert('Error al insertar uno o varios documentos');
                } else {
                    Alert.alert('Se Modifico correctamente', '', [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate(ScreenProps.PlantHealthList.screenName as never);
                            },
                        },
                    ]);
                }
            } else {
                alert(responseInsert.mensaje)
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false)
            setThirdFormVisible(true)
        }

    };


    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    }
    //se captura el evento de datetimepicker
    const onChange = ({ type }, selectedDate) => {
        if (type === "set" && selectedDate instanceof Date) {
            const formattedDate = formatSpanishDate(selectedDate);
            setDate(selectedDate);
            updateFormulario('fecha', formattedDate);

            // Formatea la fecha seleccionada
            const formatted = formatDate(selectedDate);
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
        updateFormulario('fecha', formatSpanishDate(date));
        // Formatea la fecha seleccionada
        const formatted = formatDate(date);
        // Actualiza la variable de estado con la fecha formateada
        setFormattedDate(formatted);
        setDate(date)
    }

    const handleDocumentSelection = async () => {
        try {
            const docRes = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'video/*'] // Permite seleccionar archivos de imagen o video'
            });

            const assets = docRes.assets;
            if (!assets) return;

            const acceptedFiles = assets.map(file => ({
                name: file.name,
                uri: file.uri,
                type: file.mimeType || 'application/octet-stream', // Establecer un valor predeterminado si mimeType es undefined
                size: file.size || 0, // Establecer un valor predeterminado si size es undefined
            }));

            // Validar que no se exceda el límite de 5 archivos
            if (selectedFiles.length + acceptedFiles.length > 3) {
                alert('No se puede ingresar más de 3 archivos');
                return;
            }

            // Validar cada archivo para verificar el tamaño
            const validFiles = acceptedFiles.filter(file => {
                // Verificar tamaño (mayor de 5 MB)
                if (file.size > 5 * 1024 * 1024) { // 5 MB en bytes
                    alert(`El archivo es mayor de 5 MB`);
                    return false;
                }
                return true;
            });

            // Convertir los archivos seleccionados a base64
            const base64Files = await Promise.all(validFiles.map(async (file) => {
                const response = await fetch(file.uri);
                const blob = await response.blob();

                // Usar FileReader para leer el blob
                const reader = new FileReader();

                return new Promise<{ base64: string; name: string; }>((resolve, reject) => {
                    reader.onloadend = () => {
                        // Asegúrate de que reader.result sea de tipo `string`
                        if (typeof reader.result === 'string') {
                            resolve({
                                base64: reader.result,
                                name: file.name
                            });
                        } else {
                            reject(new Error('Error al convertir el archivo a base64'));
                        }
                    };
                    reader.onerror = reject;

                    // Iniciar la lectura del blob
                    reader.readAsDataURL(blob);
                });
            }));

            // Actualiza el estado con los archivos convertidos a base64
            setSelectedFiles([...selectedFiles, ...base64Files]);
            setAddFiles([...addFiles, ...base64Files]);

        } catch (error) {
            console.error('Error al manejar la selección de documentos:', error);
        }
    };



    const handleRemoveFile = (indexToRemove: number, idDocumentoToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(newFiles);

        // Obtener el nombre del archivo correspondiente en files
        const fileNameToDelete = selectedFiles[indexToRemove].name;

        // Buscar el archivo correspondiente en addFiles y eliminarlo
        const addNewFiles = addFiles.filter(file => file.name !== fileNameToDelete);

        setAddFiles(addNewFiles);

        // Usa idDocumentoToRemove según sea necesario
        if (idDocumentoToRemove !== undefined) {

            setDeleteFiles(prevDeleteFiles => [...prevDeleteFiles, { idDocumento: idDocumentoToRemove }]);
        }

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
                <BackButtonComponent screenName={ScreenProps.PlantHealthList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar salud de la planta</Text>
                        </View>
                        {loading && (
                            <View style={styles.loadingContainer}>

                                <View style={styles.activityIndicatorContainer}>
                                    <ActivityIndicator size="large" color="green" />
                                </View>

                            </View>
                        )}

                        <View style={styles.formContainer}>
                            {isFirstFormVisible && (
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

                                    <Text style={styles.formText}>Fecha</Text>


                                    {!showPicker && (
                                        <Pressable
                                            onPress={toggleDatePicker}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder="00/00/00"
                                                value={formulario.fecha}
                                                onChangeText={(text) => updateFormulario('fecha', text)}
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

                                    <Text style={styles.formText} >Cultivo</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cultivo"
                                        value={formulario.cultivo}
                                        onChangeText={(text) => updateFormulario('cultivo', text)}
                                    />

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
                                            const isValid = validateFirstForm();

                                            if (isValid) {
                                                setSecondFormVisible(true);
                                                setFirstFormVisible(false)
                                            }

                                        }}
                                    >
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {isSecondFormVisible && (

                                <>

                                <Text style={styles.formText} >Color de las Hojas</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Verde saludable", value: "1" },
                                            { label: "Amarillento (clorosis)", value: "2" },
                                            { label: "Marrón o quemado", value: "3" },
                                            { label: "Manchas (indicativas de enfermedades o plagas) ", value: "4" },
                                        ]}
                                        value={formulario.idColorHojas.toString()}
                                        iconName="leaf"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('idColorHojas', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText} >Tamaño y Forma de las Hojas</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Tamaño adecuado según la especie", value: "1" },
                                            { label: "Deformaciones o irregularidades", value: "2" },
                                        ]}
                                        value={formulario.idTamanoFormaHoja.toString()}
                                        iconName="envira"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('idTamanoFormaHoja', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText} >Estado del Tallo</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Fuerza y firmeza", value: "1" },
                                            { label: "Presencia de hongos o enfermedades", value: "2" },
                                            { label: "Lesiones o daños físicos", value: "3" },
                                        ]}
                                        value={formulario.idEstadoTallo.toString()}
                                        iconName="tree"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('idEstadoTallo', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText} >Estado de las Raíces</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Salud (blancas y firmes)", value: "1" },
                                            { label: "Daños o pudrición", value: "2" },
                                            { label: "Plagas o enfermedades", value: "3" },
                                        ]}
                                        value={formulario.idEstadoRaiz.toString()}
                                        iconName="pagelines"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('idEstadoRaiz', selectedItem.value);
                                        }}
                                    />
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => {
                                                setSecondFormVisible(false);
                                                setFirstFormVisible(true)
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                                <Text style={styles.buttonTextBack}> Atrás</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, { width: 150 }]}
                                            onPress={() => {
                                                const isValid = validateSecondForm();

                                                if (isValid) {
                                                    setThirdFormVisible(true);
                                                    setSecondFormVisible(false)
                                                }

                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Text style={styles.buttonText}>Siguiente </Text>
                                                <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyle} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                            {isThirdFormVisible && (

                                <>

                                    <Text style={styles.formText} >Documentos</Text>

                                    {/* Área de suelta de archivos */}
                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: 'lightgray', marginTop: 10 }]}
                                        onPress={handleDocumentSelection}
                                    >
                                        <Text style={styles.buttonTextBack}>Seleccionar Archivos</Text>
                                    </TouchableOpacity>
                                    {/* Mostrar archivos seleccionados */}
                                    <View style={styles.fileList}>
                                        {selectedFiles.map((file, index) => (
                                            <View key={index} style={styles.fileItem}>

                                                <Text style={styles.fileName}>
                                                    {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
                                                </Text>

                                                <Button title="X" onPress={() => handleRemoveFile(index, file.idDocumento)} />
                                            </View>

                                        ))}
                                    </View>

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => {
                                                setSecondFormVisible(true);
                                                setThirdFormVisible(false)
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                                <Text style={styles.buttonTextBack}> Atrás</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, { width: 150 }]}
                                            onPress={() => {
                                                handleRegister();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Guardar</Text>
                                            </View>
                                        </TouchableOpacity>

                                    </View>

                                    <TouchableOpacity
                                        style={styles.buttonDelete}
                                        onPress={() => {
                                            handleChangeAccess();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="trash-bin" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}> Eliminar</Text>
                                        </View>
                                    </TouchableOpacity>


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