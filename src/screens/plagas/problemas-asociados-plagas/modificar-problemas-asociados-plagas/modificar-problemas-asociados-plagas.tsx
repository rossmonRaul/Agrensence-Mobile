import React, { useState, useEffect } from 'react';
import { View,Button, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
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
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';;
import { ModificarRegistroSeguimientoPlagasYEnfermedades, CambiarEstadoRegistroSeguimientoPlagasYEnfermedades } from '../../../../servicios/ServicioPlagas&Enfermedades';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DesactivarDocumentoProblemasDePlagas, InsertarDocumentacionProblemasDePlagas, ObtenerDocumentacionProblemasDePlagas } from '../../../../servicios/ServicioPlagas&Enfermedades';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as base64js from 'base64-js';


interface RouteParams {
    idRegistroSeguimientoPlagasYEnfermedades: string;
    idFinca: string;
    idParcela: string;
    fecha: string;
    cultivo: string;
    plagaEnfermedad: string;
    incidencia: string;
    metodologiaEstimacion: string;
    problema: string;
    accionTomada: string;
    valor: string;
    estado: string;
}

export const ModificarProblemasAsociadosPlagasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const { idRegistroSeguimientoPlagasYEnfermedades,
        idFinca,
        idParcela,
        fecha,
        cultivo,
        plagaEnfermedad,
        incidencia,
        metodologiaEstimacion,
        problema,
        accionTomada,
        valor,
        estado
    } = route.params as RouteParams;

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [addFiles, setAddFiles] = useState<any[]>([]);
    const [deleteFiles, setDeleteFiles] = useState<{ idDocumento?: number }[]>([]);
 
    const [loading, setLoading] = useState(false);
    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    const [showFecha, setShowFecha] = useState(false);
    const [dateFecha, setDateFecha] = useState(new Date())
    const [isFirstFormVisible, setFirstFormVisible] = useState(true);
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const [isThirdFormVisible, setThirdFormVisible] = useState(false);
    const [value, setValue] = useState('');
 

      
        
    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades,
        idFinca: idFinca || '',
        idParcela: idParcela || '',
        identificacionUsuario: userData.identificacion,
        fecha: fecha || '',
        cultivo: cultivo || '',
        problema: problema || '',
        plagaEnfermedad: plagaEnfermedad || '',
        incidencia: incidencia || '',
        metodologiaEstimacion: metodologiaEstimacion || '',
        accionTomada: accionTomada || '',
        valor: valor,
    });
    const [formDataDocument] = useState({
        idRegistroSeguimientoPlagasYEnfermedades: '',
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
    

   
    const handleTextChange = (text) => {
        // Elimina caracteres no numéricos excepto puntos
        let numericText = text.replace(/[^0-9.]/g, '');
    
        // Verifica la cantidad de puntos en el texto
        const pointCount = (numericText.match(/\./g) || []).length;
    
        // Si hay más de un punto, no actualiza el estado
        if (pointCount > 1) {
          return;
        }
    
        // Si el texto está vacío, simplemente actualiza el valor como una cadena vacía
        if (numericText === '') {
          setFormulario(prevState => ({ ...prevState, valor: '' }));
          return;
        }
    
        // Convierte el texto a número
        let numericValue = parseFloat(numericText);
    
        // Verifica si el valor convertido es un número válido
        if (isNaN(numericValue)) {
          setFormulario(prevState => ({ ...prevState, valor: '' }));
          return;
        }
    
        // Limita el rango entre 0 y 100
        numericValue = Math.max(0, Math.min(100, numericValue));
    
        // Actualiza el formulario con el valor procesado
        setFormulario(prevState => ({ ...prevState, valor: numericValue.toString() }));
      };
    const handleModify = async () => {
        if (selectedFiles.length<1) {
            alert('Se debe insertar minimo una imagen');
            return;
        }
        try {
            setLoading(true)
            setThirdFormVisible(false)

        if (formulario.metodologiaEstimacion.trim() === '') {
            alert('El campo Metodología de estimación es requerido.');
            return;
        }

        if (formulario.accionTomada.trim() === '') {
            alert('El campo Acción tomada es requerido.');
            return;
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            usuarioCreacionModificacion: userData.identificacion,
            fecha: formatFecha(formulario.fecha),
            cultivo: formulario.cultivo,
            problema: formulario.problema,
            plagaEnfermedad: formulario.plagaEnfermedad,
            incidencia: formulario.incidencia,
            metodologiaEstimacion: formulario.metodologiaEstimacion,
            accionTomada: formulario.accionTomada,
            valor: formulario.valor,
        };
        //  Se ejecuta el servicio de modificar el registro problemas asociados a plagas y enfermedades
        const responseInsert = await ModificarRegistroSeguimientoPlagasYEnfermedades(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {

            formDataDocument.idRegistroSeguimientoPlagasYEnfermedades = idRegistroSeguimientoPlagasYEnfermedades
            formDataDocument.usuarioCreacionModificacion = userData.identificacion
            for (const file of addFiles) {
                try {

                    formDataDocument.NombreDocumento = file.name;
                    formDataDocument.Documento = file.base64;

                    const resultadoDocumento = await InsertarDocumentacionProblemasDePlagas(formDataDocument);
                    
                    if (resultadoDocumento.indicador !== 1) {
                        errorEnviandoArchivos = true; // Marcar que hubo un error
                    }
                } catch (error) {
                    console.error('Error al leer el archivo:', error);
                }
            }


            for (let documento of deleteFiles) {

                const resultadoDocumento = await DesactivarDocumentoProblemasDePlagas({ idDocumento: documento.idDocumento })

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
                            navigation.navigate(ScreenProps.ListPestsDiseases.screenName as never);
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

                const cargaInicialParcelas = parcelasUnicas.filter((parcela: any) => fincasUnicas.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);

                setLoading(true); // Establecer loading a true antes de empezar
                setFirstFormVisible(false)
                setSecondFormVisible(false)
                setThirdFormVisible(false)
                // Obtener documentos en formato base64
                const documentos = await ObtenerDocumentacionProblemasDePlagas({ idRegistroSeguimientoPlagasYEnfermedades });

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



    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // problemas asociados a plagas y enfermedades tiene una finca asignada
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
    }, [idFinca, finca, fincas]);
    useEffect(() => {
        // Buscar la parcela correspondiente
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));

        // Establecer el nombre de la parcela inicial como selectedFinca
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

    const validateFirstForm = () => {
      
        let isValid = true;

        if (formulario.fecha.trim() === '') {
            isValid = false;
            alert('La fecha es requerida.');
            return isValid;
        }

        if (formulario.cultivo.trim() === '') {
            isValid = false;
            alert('El campo Cultivo es requerido.');
            return isValid;
        }

        if (formulario.problema.trim() === '') {
            isValid = false;
            alert('El campo Problema es requerido.');
            return isValid;
        }

        if (formulario.plagaEnfermedad.trim() === '') {
            isValid = false;
            alert('El campo Plaga/Enfermedad es requerido.');
            return isValid;
        }

        if (formulario.incidencia.trim() === '') {
            isValid = false;
            alert('El campo Incidencia es requerido.');
            return isValid;
        }


        return isValid;
    };



    const validateSecondForm = () => {
        let isValid = true;

        if (formulario.metodologiaEstimacion.trim() === '') {
            alert('El campo Metodología de estimación es requerido.');
            return;
        }

        if (formulario.accionTomada.trim() === '') {
            alert('El campo Acción tomada es requerido.');
            return;
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            return;
        }
        return isValid
    }
    //funcion para desactivar o activar el estado
    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades,
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
                        const responseInsert = await CambiarEstadoRegistroSeguimientoPlagasYEnfermedades(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se eliminó el registro de problemas asociados a plagas y enfermedades!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.ListPestsDiseases.screenName
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



    const handleValueEmpresa = (idEmpresa: number) => {
        setEmpresa(idEmpresa);
        let fincaSort = fincaDataOriginal.filter(item => item.id === userData.idEmpresa.toString());
        setFinca(null);
        setParcela(null);
    }
    useEffect(() => {
        if (!handleEmpresaCalled && fincaDataOriginal.length > 0) {
            handleValueEmpresa(userData.idEmpresa);
            setHandleEmpresaCalled(true);
        }
    }, [userData.idEmpresa, fincaDataOriginal, handleEmpresaCalled]);

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        //se acctualiza el id parcela para que seleccione otra vez la parcela
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela')
        //se obtienen las parcelas de la finca
        obtenerParcelasPorFinca(fincaId);
    };
    const obtenerFincaProps: UseFetchDropdownDataProps<FincaInterface> = {
        fetchDataFunction: () => ObtenerFincas(userData.idEmpresa),
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    };

    const obtenerParcelaProps: UseFetchDropdownDataProps<ParcelaInterface> = {
        fetchDataFunction: () => ObtenerParcelas(userData.idEmpresa),
        setDataFunction: setParcelaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idParcela',
        idKey: 'idFinca',
    };
    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de fincas y parcelas*/
    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date(); // Selecciona la fecha actual si no hay ninguna seleccionada
        switch (picker) {
            case 'fecha':
                setShowFecha(Platform.OS === 'ios');
                setDateFecha(currentDate);
                break;
            default:
                break;
        }

        if (event.type === 'set') {
            const formattedDate = formatSpanishDate(currentDate);
            updateFormulario(picker === 'fecha' ? 'fecha' : '', formattedDate);
        }
    };
    const confirmIOSDate = (picker) => {
        switch (picker) {
            case 'fecha':
                setShowFecha(false);
                updateFormulario('fecha', formatSpanishDate(dateFecha));
                break;
            default:
                break;
        }
    };
    const toggleDatePicker = (picker) => {
        switch (picker) {
            case "fecha":
                setShowFecha(!showFecha);
                break;
            default:
                break;
        }
    };

    useFetchDropdownData(obtenerFincaProps);
    useFetchDropdownData(obtenerParcelaProps);
   
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
                <BackButtonComponent screenName={ScreenProps.ListPestsDiseases.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Problemas asociados a plagas o enfermedades</Text>
                        </View>

                        <View style={styles.formContainer}>
                        {isFirstFormVisible && (
                                <>
                                    <Text style={styles.formText} >Fecha</Text>
                                    {!showFecha && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('fecha')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.fecha}
                                                onChangeText={(text) => updateFormulario('fecha', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('fecha')}
                                            />
                                        </Pressable>

                                    )}

                                    {showFecha && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateFecha}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'fecha')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showFecha && Platform.OS === 'ios' && (
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
                                                onPress={() => toggleDatePicker('fecha')}
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
                                                onPress={() => confirmIOSDate('fecha')}
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
                                        maxLength={50}
                                    />
                                    <Text style={styles.formText} >Problema</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Problema"
                                        value={formulario.problema}
                                        onChangeText={(text) => updateFormulario('problema', text)}
                                        maxLength={100}
                                    />
                                    <Text style={styles.formText} >Plaga o Enfermedad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Plaga o enfermedad"
                                        value={formulario.plagaEnfermedad}
                                        onChangeText={(text) => updateFormulario('plagaEnfermedad', text)}
                                        maxLength={50}

                                    />
                                   <Text style={styles.formText} >Valoracion</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Incidencia", value: "Incidencia" },
                                            { label: "Severidad", value: "Severidad" },
                                           
                                        ]}
                                        value={formulario.incidencia}
                                        iconName=""
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('incidencia', selectedItem.value);
                                        }}
                                    />
                                           <View style={styles.container}>
                                              <Text style={styles.formText}>Valor(%):</Text>
                                                <TextInput
                                                  maxLength={5}
                                                  keyboardType='numeric'
                                                  style={styles.input}
                                                  placeholder="Valor"
                                                  value={formulario.valor === '' ? '' : `${formulario.valor}%`} // Muestra el porcentaje o vacío
                                                  onChangeText={handleTextChange}
                                                    />
                                            </View>
      
                                           
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
                                        <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyleRight} />
                                        </View>
                                    </TouchableOpacity>
                                </>
                            
                        )}
                            {isSecondFormVisible && (<>
                                <Text style={styles.formText} >Metodología de estimación</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Metodología de estimación"
                                    value={formulario.metodologiaEstimacion}
                                    onChangeText={(text) => updateFormulario('metodologiaEstimacion', text)}
                                    maxLength={100}
                                />
                                <Text style={styles.formText} >Acción tomada</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Acción tomada"
                                    value={formulario.accionTomada}
                                    onChangeText={(text) => updateFormulario('accionTomada', text)}
                                    maxLength={200}
                                />
                                {empresa &&
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
                                }
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
                     {isThirdFormVisible && (<>

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
                                                handleModify();
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