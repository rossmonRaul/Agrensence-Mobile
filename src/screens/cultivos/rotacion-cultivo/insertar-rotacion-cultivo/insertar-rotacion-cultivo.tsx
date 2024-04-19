import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
import { FontAwesome } from '@expo/vector-icons';
import { InsertarRotacionCultivoSegunEstacionalidad } from '../../../../servicios/ServicioCultivos';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';

export const InsertarRotacionCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [showPickerSiembra, setShowPickerSiembra] = useState(false);
    const [showPickerEpocaSiembra, setShowPickerEpocaSiembra] = useState(false);
    const [showPickerTiempoCosecha, setShowPickerTiempoCosecha] = useState(false);
    const [dateSiembra, setDateSiembra] = useState(new Date())
    const [dateEpocaSiembra, setDateEpocaSiembra] = useState(new Date())
    const [dateTiempoCosecha, setDateTiempoCosecha] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        identificacionUsuario: userData.identificacion,
        cultivo: '',
        epocaSiembra: '',
        tiempoCosecha: '',
        cultivoSiguiente: '',
        epocaSiembraCultivoSiguiente: ''
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
        // Validación del campo Cultivo
        if (formulario.cultivo.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el Cultivo.');
            return;
        } else if (formulario.cultivo.trim().length > 50) {
            isValid = false;
            alert('El Cultivo no puede tener más de 50 caracteres.');
            return;
        }

        // Validación de la Epoca Siembra
        const regexDate = /^\d{2}\/\d{2}\/\d{2}$/;
        if (!regexDate.test(formulario.epocaSiembra.trim())) {
            isValid = false;
            alert('Por favor ingrese la Época Siembra en formato dd/mm/aa.');
            return isValid;
        }

        // Validación de la Epoca de siembra siguiente
        if (!regexDate.test(formulario.epocaSiembraCultivoSiguiente.trim())) {
            isValid = false;
            alert('Por favor ingrese la Época de siembra siguiente en formato dd/mm/aa.');
            return isValid;
        }



        // Validación del Tiempo cosecha
        if (!regexDate.test(formulario.tiempoCosecha.trim())) {
            isValid = false;
            alert('Por favor ingrese el Tiempo cosecha en formato dd/mm/aa.');
            return isValid;
        }
        // Convertir las fechas a objetos Date
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        const epocaSiembraDate = parseDate(formulario.epocaSiembra);
        const epocaSiembraCultivoSiguienteDate = parseDate(formulario.epocaSiembraCultivoSiguiente);
        const tiempoCosechaDate = parseDate(formulario.tiempoCosecha);

        // Comparar fechas
        if (isNaN(epocaSiembraDate.getTime())) {
            isValid = false;
            alert('La fecha de Época de siembra no es válida.');
            return isValid;
        }

        if (isNaN(epocaSiembraCultivoSiguienteDate.getTime())) {
            isValid = false;
            alert('La fecha de Época de siembra siguiente no es válida.');
            return isValid;
        }

        if (isNaN(tiempoCosechaDate.getTime())) {
            isValid = false;
            alert('La fecha de Tiempo de cosecha no es válida.');
            return isValid;
        }

        if (tiempoCosechaDate <= epocaSiembraDate || tiempoCosechaDate >= epocaSiembraCultivoSiguienteDate) {
            isValid = false;
            alert('El tiempo de cosecha no puede ser anterior a la época de siembra ni tampoco después de la época de siembra siguiente.');
            return isValid;
        }

        if (epocaSiembraCultivoSiguienteDate <= epocaSiembraDate || epocaSiembraCultivoSiguienteDate <= tiempoCosechaDate) {
            isValid = false;
            alert('Época de siembra no puede ser anterior a la época de siembra ni tampoco al tiempo de cosecha.');
            return isValid;
        }

        if (formulario.cultivoSiguiente.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el Cultivo siguiente.');
            return isValid;
        } else if (formulario.cultivoSiguiente.trim().length > 50) {
            isValid = false;
            alert('El Cultivo siguiente no puede tener más de 50 caracteres.');
            return;
        }

        return isValid;

    }

    const validateSecondForm = () => {
        let isValid = true;


        return isValid
    }
    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {


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
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            identificacionUsuario: userData.identificacion,
            cultivo: formulario.cultivo,
            epocaSiembra: formatDate(dateSiembra),
            tiempoCosecha: formatDate(dateTiempoCosecha),
            cultivoSiguiente: formulario.cultivoSiguiente,
            epocaSiembraCultivoSiguiente: formatDate(dateEpocaSiembra)
        };

        //  Se ejecuta el servicio de insertar  la rotación de cultivo
        const responseInsert = await InsertarRotacionCultivoSegunEstacionalidad(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se registro la rotación de cultivo correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.CropRotationList.screenName as never);
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


    //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    //se formatea la fecha para que tenga el formato para enviarle los datos a la base de datos
    const formatDate = (date: Date) => { // Aquí se crea un objeto Date a partir de la cadena dateString
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        return `${year}-${month}-${day}`;
    };

    const toggleDatePicker = (picker) => {
        switch (picker) {
            case "siembra":
                setShowPickerSiembra(!showPickerSiembra);
                break;
            case "cosecha":
                setShowPickerTiempoCosecha(!showPickerTiempoCosecha);
                break;
            case "siguienteSiembra":
                setShowPickerEpocaSiembra(!showPickerEpocaSiembra);
                break;
            default:
                break;
        }
    };
    //se captura el evento de datetimepicker
    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date(); // Selecciona la fecha actual si no hay ninguna seleccionada
        switch (picker) {
            case 'siembra':
                setShowPickerSiembra(Platform.OS === 'ios');
                setDateSiembra(currentDate);
                break;
            case 'cosecha':
                setShowPickerTiempoCosecha(Platform.OS === 'ios');
                setDateTiempoCosecha(currentDate);
                break;
            case 'siguienteSiembra':
                setShowPickerEpocaSiembra(Platform.OS === 'ios');
                setDateEpocaSiembra(currentDate);
                break;
            default:
                break;
        }

        if (event.type === 'set') {
            const formattedDate = formatSpanishDate(currentDate);
            updateFormulario(picker === 'siembra' ? 'epocaSiembra' : picker === 'cosecha' ? 'tiempoCosecha' : 'epocaSiembraCultivoSiguiente', formattedDate);
        }
    };
    const confirmIOSDate = (picker) => {
        switch (picker) {
            case 'siembra':
                setShowPickerSiembra(false);
                updateFormulario('epocaSiembra', formatSpanishDate(dateSiembra));
                break;
            case 'cosecha':
                setShowPickerTiempoCosecha(false);
                updateFormulario('tiempoCosecha', formatSpanishDate(dateTiempoCosecha));
                break;
            case 'siguienteSiembra':
                setShowPickerEpocaSiembra(false);
                updateFormulario('epocaSiembraCultivoSiguiente', formatSpanishDate(dateEpocaSiembra));
                break;
            default:
                break;
        }
    };;
    const handleValueEmpresa = (idEmpresa: number) => {
        setEmpresa(idEmpresa);
        let fincaSort = fincaDataOriginal.filter(item => item.id === userData.idEmpresa.toString());
        setFincaDataSort(fincaSort);
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
        setParcelaDataSort(parcelaSort)
        setParcela(null);
        updateFormulario('idFinca', itemValue.value)
    }
    const obtenerFincaProps: UseFetchDropdownDataProps<FincaInterface> = {
        fetchDataFunction: ObtenerFincas,
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    };

    const obtenerParcelaProps: UseFetchDropdownDataProps<ParcelaInterface> = {
        fetchDataFunction: ObtenerParcelas,
        setDataFunction: setParcelaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idParcela',
        idKey: 'idFinca',
    };
    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de fincas y parcelas*/
    useFetchDropdownData(obtenerFincaProps);
    useFetchDropdownData(obtenerParcelaProps);
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
                <BackButtonComponent screenName={ScreenProps.CropRotationList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Rotación de cultivo</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText} >Cultivo</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="Arroz, Maíz, Papa..."
                                        value={formulario.cultivo}
                                        onChangeText={(text) => updateFormulario('cultivo', text)}
                                    />
                                    <Text style={styles.formText}>Época Siembra</Text>

                                    {!showPickerSiembra && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('siembra')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.epocaSiembra}
                                                onChangeText={(text) => updateFormulario('epocaSiembra', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('siembra')}
                                            />
                                        </Pressable>

                                    )}

                                    {showPickerSiembra && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateSiembra}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'siembra')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPickerSiembra && Platform.OS === 'ios' && (
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
                                                onPress={() => confirmIOSDate('siembra')}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}


                                    <Text style={styles.formText} >Época de siembra siguiente</Text>
                                    {!showPickerEpocaSiembra && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('siguienteSiembra')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.epocaSiembraCultivoSiguiente}
                                                onChangeText={(text) => updateFormulario('epocaSiembraCultivoSiguiente', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('siguienteSiembra')}
                                            />
                                        </Pressable>

                                    )}
                                    {showPickerEpocaSiembra && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateEpocaSiembra}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'siguienteSiembra')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPickerEpocaSiembra && Platform.OS === 'ios' && (
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
                                                onPress={() => toggleDatePicker('siguienteSiembra')}
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
                                                onPress={() => confirmIOSDate('siguienteSiembra')}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}
                                    <Text style={styles.formText} >Tiempo cosecha</Text>
                                    {!showPickerTiempoCosecha && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('cosecha')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.tiempoCosecha}
                                                onChangeText={(text) => updateFormulario('tiempoCosecha', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('cosecha')}
                                            />
                                        </Pressable>

                                    )}

                                    {showPickerTiempoCosecha && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateTiempoCosecha}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'cosecha')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPickerTiempoCosecha && Platform.OS === 'ios' && (
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
                                                onPress={() => toggleDatePicker('cosecha')}
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
                                                onPress={() => confirmIOSDate('cosecha')}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}


                                    <Text style={styles.formText} >Cultivo siguiente</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="Arroz, Maíz, Papa..."
                                        value={formulario.cultivoSiguiente}
                                        onChangeText={(text) => updateFormulario('cultivoSiguiente', text)}
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
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                    </TouchableOpacity>
                                </>

                            ) : (<>

                                {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                }
                                {finca &&
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={(item) => (setParcela(item.value as never), (updateFormulario('idParcela', item.value)))}
                                    />
                                }
                                {parcela && <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleRegister();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}>Guardar cambios</Text>
                                    </View>
                                </TouchableOpacity>}
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