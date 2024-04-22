import React, { useState, useEffect } from 'react';
import { View, Button, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import * as DocumentPicker from "expo-document-picker";
import { InsertarDocumentacionRiesgoNatural, InsertarRiesgoNatural } from '../../../../servicios/ServicioRiesgoNatural';

export const RegistrarRiesgosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [isFirstFormVisible, setFirstFormVisible] = useState(true);
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [isThirdFormVisible, setThirdFormVisible] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date())

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: selectedFinca,
        idParcela: selectedParcela,
        fecha: '',
        riesgoNatural: '',
        practicaPreventiva: '',
        responsable: '',
        resultadoPractica: '',
        accionesCorrectivas: '',
        observaciones: '',
        usuarioCreacionModificacion: ''
    });

    const [formDataDocument] = useState({
        idRiesgoNatural: '',
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


    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.riesgoNatural && !formulario.fecha
            && !formulario.practicaPreventiva && !formulario.responsable
            && !formulario.resultadoPractica) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.riesgoNatural) {
            alert('Ingrese un Riesgo Natural');
            isValid = false;
            return
        }
        if (!formulario.fecha) {
            alert('Ingrese la Fecha');
            isValid = false;
            return
        }
        if (!formulario.practicaPreventiva) {
            alert('Ingrese la Practica Preventiva');
            isValid = false;
            return
        }

        if (!formulario.responsable) {
            alert('Ingrese el Responsable');
            isValid = false;
            return
        }
        if (!formulario.resultadoPractica) {
            alert('Ingrese un Resultado de Practica Preventiva');
            isValid = false;
            return
        }
        return isValid
    }

    const validateSecondForm = () => {
        let isValid = true;

        if (!formulario.accionesCorrectivas
            && !formulario.observaciones) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }

        if (!formulario.accionesCorrectivas) {
            alert('Ingrese las Acciones Correctivas');
            isValid = false;
            return
        }
        if (!formulario.observaciones) {
            alert('Ingrese la Observaciones');
            isValid = false;
            return
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            return
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
        try {
            setLoading(true)
            setThirdFormVisible(false)
            //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
            const formData = {
                idFinca: formulario.idFinca,
                idParcela: formulario.idParcela,
                riesgoNatural: formulario.riesgoNatural,
                fecha: formatDate(),
                practicaPreventiva: formulario.practicaPreventiva,
                responsable: formulario.responsable,
                resultadoPractica: formulario.resultadoPractica,
                accionesCorrectivas: formulario.accionesCorrectivas,
                observaciones: formulario.observaciones,
                usuarioCreacionModificacion: userData.identificacion,
            };

            //  Se ejecuta el servicio de insertar 
            const responseInsert = await InsertarRiesgoNatural(formData);
            let errorEnviandoArchivos = false; // Variable para rastrear si hubo un error al enviar archivos

            //  Se muestra una alerta de éxito o error según la respuesta obtenida
            if (responseInsert.indicador === 1) {
                formDataDocument.idRiesgoNatural = responseInsert.mensaje
                formDataDocument.usuarioCreacionModificacion = userData.identificacion
                for (const file of selectedFiles) {
                    try {
                        const base64Data = await readAsBase64(file.uri);
                        formDataDocument.NombreDocumento = file.name;
                        formDataDocument.Documento = base64Data;

                        const resultadoDocumento = await InsertarDocumentacionRiesgoNatural(formDataDocument);

                        if (resultadoDocumento.indicador !== 1) {
                            errorEnviandoArchivos = true; // Marcar que hubo un error
                        }
                    } catch (error) {
                        console.log('Error al leer el archivo:', error);
                    }
                }

                if (errorEnviandoArchivos) {
                    alert('Error al insertar uno o varios documentos');
                } else {
                    Alert.alert('Se registro correctamente', '', [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate(ScreenProps.AdminWeather.screenName as never);
                            },
                        },
                    ]);
                }

            } else {
                alert('Error al registrar');
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
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        updateFormulario('idParcela', '')
        setSelectedParcela('Seleccione una Parcela')
        obtenerParcelasPorFinca(fincaId);
    };

    //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    //se formatea la fecha para que tenga el formato para enviarle los datos a la base de datos
    const formatDate = () => { // Aquí se crea un objeto Date a partir de la cadena dateString
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

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
            updateFormulario('fecha', formattedDate);
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
            if (selectedFiles.length + acceptedFiles.length > 5) {
                alert('No se puede ingresar más de 5 archivos');
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
            console.log("Error en selecionar el documento: ", error);
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
                <BackButtonComponent screenName={ScreenProps.AdminWeather.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Riesgos Naturales</Text>
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

                                    <Text style={styles.formText} >Riesgo Natural</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Terremoto", value: "Terremoto" },
                                            { label: "Deslizamiento", value: "Deslizamiento" },
                                            { label: "Incendio", value: "Incendio" },
                                            { label: "Inundacion", value: "Inundacion" },
                                            { label: "Sequía", value: "Sequía" },
                                            { label: "Huracan", value: "Huracan" }
                                        ]}
                                        value={formulario.riesgoNatural}
                                        iconName="exclamation"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('riesgoNatural', selectedItem.value);
                                        }}
                                    />

                                    <Text style={styles.formText} >Resultado de la Practica</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione..."
                                        data={[
                                            { label: "Bueno", value: "Bueno" },
                                            { label: "Regular", value: "Regular" },
                                            { label: "Malo", value: "Malo" },
                                        ]}
                                        value={formulario.resultadoPractica}
                                        iconName="check"
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('resultadoPractica', selectedItem.value);
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

                                    <Text style={styles.formText} >Practica Preventiva</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Practica Preventiva"
                                        value={formulario.practicaPreventiva}
                                        onChangeText={(text) => updateFormulario('practicaPreventiva', text)}
                                    />
                                    <Text style={styles.formText} >Responsable</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Responsable"
                                        value={formulario.responsable}
                                        onChangeText={(text) => updateFormulario('responsable', text)}
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

                                    <Text style={styles.formText} >Finca</Text>
                                    {/* Dropdown para Fincas */}
                                    <DropdownComponent
                                        placeholder="Seleccione una Finca"
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
                                        placeholder="Seleccione una Parcela"
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

                                    <Text style={styles.formText} >Acciones Correctivas</Text>
                                    <TextInput
                                        style={styles.inputMultiline}
                                        placeholder="Acciones Correctivas"
                                        value={formulario.accionesCorrectivas}
                                        onChangeText={(text) => updateFormulario('accionesCorrectivas', text)}
                                        multiline
                                    />
                                    <Text style={styles.formText} >Observaciones</Text>
                                    <TextInput
                                        style={styles.inputMultiline}
                                        placeholder="Observaciones"
                                        value={formulario.observaciones}
                                        onChangeText={(text) => updateFormulario('observaciones', text)}
                                        multiline
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
                                                <Text style={styles.fileName}>{file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}</Text>
                                                <Button title="X" onPress={() => handleRemoveFile(index)} />
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