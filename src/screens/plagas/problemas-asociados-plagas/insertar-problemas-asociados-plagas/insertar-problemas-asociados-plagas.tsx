import React, { useState, useEffect, useMemo } from 'react';
import { View,Button,  ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';
import { InsertarRegistroSeguimientoPlagasYEnfermedades } from '../../../../servicios/ServicioPlagas&Enfermedades';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import * as DocumentPicker from "expo-document-picker";
import { InsertarDocumentacionProblemasDePlagas } from '../../../../servicios/ServicioPlagas&Enfermedades';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';

interface ButtonAlert {
    text: string;
    onPress: () => void;
  }

export const InsertarProblemasAsociadosPlagasScreen: React.FC = () => {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();


    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);

    const [showFecha, setShowFecha] = useState(false);

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [isFirstFormVisible, setFirstFormVisible] = useState(true);
    const [isThirdFormVisible, setThirdFormVisible] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [dateFecha, setDateFecha] = useState(new Date())
    const [value, setValue] = useState('');

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        identificacionUsuario: userData.identificacion,
        fecha: '',
        cultivo: '',
        problema: '',
        plagaEnfermedad: '',
        incidencia: '',
        metodologiaEstimacion: '',
        accionTomada: '',
        valor: '',
    });


    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as ButtonAlert[], // Define el tipo explícitamente
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
                navigation.navigate(ScreenProps.ListPestsDiseases.screenName as never);
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
	Keyboard.dismiss()
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
	Keyboard.dismiss()
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

    const [formDataDocument] = useState({
        idRegistroSeguimientoPlagasYEnfermedades: '',
        documento: '',
        nombreDocumento: '',
        usuarioCreacionModificacion: ''

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

        if (formulario.fecha.trim() === '') {
            isValid = false;
            showInfoAlert('La fecha es requerida.');
            return isValid;
        }

        if (formulario.cultivo.trim() === '') {
            isValid = false;
            showInfoAlert('El campo Cultivo es requerido.');
            return isValid;
        }

        if (formulario.problema.trim() === '') {
            isValid = false;
            showInfoAlert('El campo Problema es requerido.');
            return isValid;
        }

        if (formulario.plagaEnfermedad.trim() === '') {
            isValid = false;
            showInfoAlert('El campo Plaga/Enfermedad es requerido.');
            return isValid;
        }

        if (formulario.incidencia.trim() === '') {
            isValid = false;
            showInfoAlert('El campo Incidencia es requerido.');
            return isValid;
        }


        return isValid;
    };

    const validateSecondForm = () => {
        let isValid = true;

        if (formulario.metodologiaEstimacion.trim() === '') {
            showInfoAlert('El campo Metodología de estimación es requerido.');
            return;
        }

        if (formulario.accionTomada.trim() === '') {
            showInfoAlert('El campo Acción tomada es requerido.');
            return;
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            showInfoAlert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            showInfoAlert('Ingrese la Parcela');
            return;
        }
        return isValid
    }
    const readAsBase64 = async (uri: string): Promise<string> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error al leer el archivo como base64:', error);
            throw error;
        }
    };

    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {

        if (selectedFiles.length<1) {
            showInfoAlert('Se debe insertar minimo una imagen');
            return;
        }
        try {
            setLoading(true)
            setThirdFormVisible(false)
            //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
            const formData = {
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

            //  Se ejecuta el servicio de insertar 
            const responseInsert = await InsertarRegistroSeguimientoPlagasYEnfermedades(formData);
            let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

            //  Se muestra una alerta de éxito o error según la respuesta obtenida
            if (responseInsert.indicador === 1) {
                formDataDocument.idRegistroSeguimientoPlagasYEnfermedades = responseInsert.mensaje
                formDataDocument.usuarioCreacionModificacion = userData.identificacion
                for (const file of selectedFiles) {
                    try {
                        const base64Data = await readAsBase64(file.uri);
                        formDataDocument.nombreDocumento = file.name;
                        formDataDocument.documento = base64Data;

                        const resultadoDocumento = await InsertarDocumentacionProblemasDePlagas(formDataDocument);

                        if (resultadoDocumento.indicador !== 1) {
                            errorEnviandoArchivos = true; // Marcar que hubo un error
                        }
                    } catch (error) {
                        console.error('Error al leer el archivo:', error);
                    }
                }

                if (errorEnviandoArchivos) {
                    showErrorAlert('Error al insertar uno o varios documentos');
                } else {
                    showSuccessAlert('Se registro correctamente')
                    // Alert.alert('Se registro correctamente', '', [
                    //     {
                    //         text: 'OK',
                    //         onPress: () => {
                    //             navigation.navigate(ScreenProps.ListPestsDiseases.screenName as never);
                    //         },
                    //     },
                    // ]);
                }

            } else {
                showErrorAlert('Error al registrar');
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

                setParcelas(parcelasUnicas);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {

            const parcelasFiltradas = parcelas.filter(item => item.idFinca == fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };

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
    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        obtenerParcelasPorFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcela(null);
        updateFormulario('idFinca', itemValue.value)
    }
    const obtenerFincaProps= useMemo(() => ({
        fetchDataFunction: () => ObtenerFincas(userData.idEmpresa),
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    }), [userData.idEmpresa]);

    const obtenerParcelaProps= useMemo(() => ({
        fetchDataFunction: () => ObtenerParcelas(userData.idEmpresa),
        setDataFunction: setParcelaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idParcela',
        idKey: 'idFinca',
    }), [userData.idEmpresa]);


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
   
    const handleTextChange = (text) => {
        // Elimina caracteres no numéricos excepto puntos
        let numericText = text.replace(/[^0-9.]/g, '');
    
        // Verifica la cantidad de puntos en el texto
        const pointCount = (numericText.match(/\./g) || []).length;
    
        // Si hay más de un punto, no actualiza el estado
        if (pointCount > 1) {
          console.error('Error: Más de un punto decimal.');
          return;
        }
    
        // Si el texto está vacío, simplemente actualiza el valor como una cadena vacía
        if (numericText === '') {
          setFormulario(prevState => ({ ...prevState, valor: '' }));
          return;
        }
    
        // Convierte el texto a número
        let numericValue = Number(numericText);
    
        // Verifica si el valor convertido es un número válido
        if (isNaN(numericValue)) {
          console.error('Error: Valor convertido no es un número válido.');
          setFormulario(prevState => ({ ...prevState, valor: '' }));
          return;
        }
    
        // Limita el rango entre 0 y 100
        numericValue = Math.max(0, Math.min(100, numericValue));
    
        // Actualiza el formulario con el valor procesado
        setFormulario(prevState => ({ ...prevState, valor: numericValue.toString() }));
      };
    
    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de fincas y parcelas*/
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
                showErrorAlert('No se puede ingresar más de 3 archivos');
                return;
            }

            // Validar cada archivo para verificar el tamaño
            const validFiles = acceptedFiles.filter(file => {
                // Verificar tamaño (mayor de 5 MB)
                if (file.size > 5 * 1024 * 1024) { // 5 MB en bytes
                    showErrorAlert(`El archivo es mayor de 5 MB`);
                    return false;
                }
                return true;
            });

            // Si no hay archivos válidos después de la validación, salir de la función
            if (validFiles.length === 0) {
                return;
            }

            // Renombrar archivos si tienen el mismo nombre
            const newFiles: { name: string; uri: string; type: string; size: number }[] = [];
            validFiles.forEach(file => {
                let fileName = file.name;
                let index = 1;
                while (selectedFiles.some(fileObj => fileObj.name === fileName)) {
                    const parts = file.name.split('.');
                    const name = parts.slice(0, -1).join('.');
                    const extension = parts[parts.length - 1];
                    fileName = `${name}(${index}).${extension}`;
                    index++;
                }
                newFiles.push({ ...file, name: fileName });
            });
            setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

        } catch (error) {
            console.error("Error en selecionar el documento: ", error);
        }
    };
    const handleRemoveFile = (indexToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(newFiles);
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
                                    <Text style={styles.formText} >Plaga o enfermedad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Plaga o enfermedad"
                                        value={formulario.plagaEnfermedad}
                                        onChangeText={(text) => updateFormulario('plagaEnfermedad', text)}
                                        maxLength={50}

                                    />
                                   <Text style={styles.formText} >Valoración</Text>
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
                                                  <Text style={styles.formText}>Valor:</Text>
                                                    <TextInput
                                                      maxLength={100}
                                                      keyboardType='numeric'
                                                      style={styles.input}
                                                      placeholder="Valor"
                                                      value={formulario.valor === '' ? '' : `${formulario.valor}%`}
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

                         {isSecondFormVisible && (
                            <>
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
                                (
                                    <>
                                    <Text style={styles.formText} >Finca</Text>
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                    </>
                                )
                                }
                                {finca &&
                                (
                                    <>
                                    <Text style={styles.formText} >Parcela</Text>
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={(item) => (setParcela(item.value as never), (updateFormulario('idParcela', item.value)))}
                                    />
                                     </>
                                )
                                }
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
                                 <Text style={styles.buttonTextBack}>Seleccionar archivos</Text>
                              </TouchableOpacity>
                                 {/* Mostrar archivos seleccionados */}
                                  <View style={styles.fileList}>
                                      {selectedFiles.map((file, index) => (
                                      <View key={index} style={styles.fileItem}>
                                     <Text style={styles.fileName}>{file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}</Text>
                                      <Button title="X" onPress={() => handleRemoveFile(index)} />
                                      </View>
                                       ))}
                                    </View>

                                  
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
                                    style={styles.button}
                                      onPress={() => {
                                       handleRegister();
                                    }}
                                     >
                                         <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                         <Text style={styles.buttonText}> Guardar problema asociado a plagas</Text>
                                          </View>
                                  </TouchableOpacity>
                                 
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListPestsDiseases.screenName as never) : undefined}
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