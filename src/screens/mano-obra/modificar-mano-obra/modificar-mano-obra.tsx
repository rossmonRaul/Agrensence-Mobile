import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../hooks/useFetchDropDownData';
import { ModificarRegistroManoObra, CambiarEstadoRegistroManoObra } from '../../../servicios/ServicioManoObra';
interface RouteParams {
    idRegistroManoObra: string,
    idFinca: string,
    fecha: string,
    actividad: string,
    identificacion: string,
    trabajador: string,
    horasTrabajadas: string,
    pagoPorHora: string,
    totalPago: string,
    estado: string,
}

export const ModificarManoObraScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const {
        idRegistroManoObra,
        idFinca,
        fecha,
        actividad,
        identificacion,
        trabajador,
        horasTrabajadas,
        pagoPorHora,
        totalPago,
        estado
    } = route.params as RouteParams;

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

    const [showFecha, setShowFecha] = useState(false);
    const [dateFecha, setDateFecha] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca || '',
        identificacionUsuario: userData.identificacion,
        idRegistroManoObra: idRegistroManoObra || '',
        fecha: fecha || '',
        actividad: actividad || '',
        identificacion: identificacion || '',
        trabajador: trabajador || '',
        horasTrabajadas: horasTrabajadas || '',
        pagoPorHora: pagoPorHora || '',
        totalPago: totalPago || '',
        estado: estado || '',
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    // Se defina una función para manejar el modificar cuando le da al boton de guardar
    const handleModify = async () => {
        if (parseFloat(formulario.pagoPorHora) < 0.1) {
            alert('El pago por hora debe ser mayor que cero.');
            return;
        }
        if (parseFloat(formulario.horasTrabajadas) < 0.1) {
            alert('Las horas trabajadas deben ser mayor que cero.');
            return;
        }
        if (formulario.horasTrabajadas.toString().trim() === '') {
            alert('Por favor ingrese las horas trabajadas.');
            return;
        }
        if (formulario.pagoPorHora.toString().trim() === '') {
            alert('Por favor ingrese el pago por hora.');
            return;
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idRegistroManoObra: formulario.idRegistroManoObra,
            usuarioCreacionModificacion: userData.identificacion,
            fecha: dateFecha,
            actividad: formulario.actividad,
            identificacion:formulario.identificacion,
            trabajador: formulario.trabajador,
            horasTrabajadas: formulario.horasTrabajadas,
            pagoPorHora: formulario.pagoPorHora,
            totalPago: formulario.totalPago,
        };
        //  Se ejecuta el servicio de insertar  el registro de mano de obra
        const responseInsert = await ModificarRegistroManoObra(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico el registro de mano obra correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListManoObra.screenName as never);
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

                const fincasResponse = await ObtenerFincas();
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasFiltradas);

                const parcelasUnicas = datosInicialesObtenidos.map(item => ({
                    idFinca: item.idFinca,
                    idParcela: item.idParcela,
                    nombre: item.nombreParcela,
                }));

                setParcelas(parcelasUnicas);
                setSelectedFinca(String(idFinca));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);
    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // el fertilizante ya tiene una finca asignada
        const fincaInicial = fincas.find(finca => finca.idFinca.toString() === idFinca.toString());
        updateFormulario('idFinca', idFinca)
        // Establecer el nombre de la finca inicial como selectedFinca
        setSelectedFinca(fincaInicial?.nombreFinca || null);
    }, [idFinca, fincas]);

    //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
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
    //se captura el evento de datetimepicker
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
            updateFormulario(picker === 'fecha' ? 'fecha' : 'fecha', formattedDate);
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
    const validateFirstForm = () => {
        let isValid = true;
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        const fecha = parseDate(formulario.fecha);

        if (isNaN(fecha.getTime())) {
            isValid = false;
            alert('La fecha no es válida.');
            return isValid;
        }
        if (formulario.actividad.trim() === '') {
            isValid = false;
            alert('Por favor ingrese la actividad.');
            return;
        }
        if (formulario.identificacion.trim() === '') {
            isValid = false;
            alert('Por favor ingrese la identificación.');
            return;
        }
        if (formulario.trabajador.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el trabajador.');
            return;
        }
        return isValid;

    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idRegistroManoObra: formulario.idRegistroManoObra,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Eliminar este registro',
            '¿Estás seguro de que deseas eliminar este registro de mano obra?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoRegistroManoObra(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se elimino este registro de mano obra correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.ListManoObra.screenName
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
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        //se acctualiza el id parcela para que seleccione otra vez la parcela
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela')
        //se obtienen las parcelas de la finca
        obtenerParcelasPorFinca(fincaId);
    };
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
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
    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        obtenerParcelasPorFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
        updateFormulario('idFinca', itemValue.value)
    }

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
                    source={require('../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListManoObra.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText} >Modificar registro de mano de obra</Text>
                        </View>
                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText}>Fecha</Text>
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
                                    <Text style={styles.formText} >Actividad</Text>
                                    <TextInput
                                        maxLength={200}
                                        style={styles.input}
                                        placeholder="Actividad..."
                                        value={formulario.actividad}
                                        onChangeText={(text) => updateFormulario('actividad', text)}
                                    />
                                    <Text style={styles.formText} >Identificación</Text>
                                    <TextInput
                                        maxLength={200}
                                        style={styles.input}
                                        placeholder="Identificación..."
                                        value={formulario.identificacion}
                                        onChangeText={(text) => updateFormulario('identificacion', text)}
                                    />
                                    <Text style={styles.formText} >Trabajador</Text>
                                    <TextInput
                                        maxLength={200}
                                        style={styles.input}
                                        placeholder="Trabajador..."
                                        value={formulario.trabajador}
                                        onChangeText={(text) => updateFormulario('trabajador', text)}
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

                            ) : (<>

                                <Text style={styles.formText}>Pago por hora (₡)</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Pago por hora..."
                                    value={formulario.pagoPorHora.toString()}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'pagoPorHora'
                                        updateFormulario('pagoPorHora', text);
                                        // Calcular el monto total y actualizar el estado 'totalPago'
                                        const totalPago = Number(text) * Number(formulario.horasTrabajadas);
                                        updateFormulario('totalPago', totalPago.toString());
                                    }}
                                />
                                <Text style={styles.formText}>Horas trabajadas</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Horas trabajadas..."
                                    value={formulario.horasTrabajadas.toString()}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'horasTrabajadas'
                                        updateFormulario('horasTrabajadas', text);
                                        // Calcular el monto total y actualizar el estado 'totalPago'
                                        const totalPago = Number(formulario.pagoPorHora) * Number(text);
                                        updateFormulario('totalPago', totalPago.toString());
                                    }}
                                />
                                <Text style={styles.formText} >Total pago (₡)</Text>
                                <TextInput
                                    maxLength={100}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Total pago (₡)..."
                                    value={formulario.totalPago.toString()}
                                    onChangeText={(text) => updateFormulario('totalPago', text)}
                                    readOnly={true}
                                />
                                {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                                        value={idFinca.toString()}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                }

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
                                            <Text style={styles.buttonText}>Eliminar</Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <>
                                    </>
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