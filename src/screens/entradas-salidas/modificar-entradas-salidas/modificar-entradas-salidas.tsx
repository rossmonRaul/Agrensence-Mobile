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
import { ModificarRegistroEntradaSalida, CambiarEstadoRegistroEntradaSalida } from '../../../servicios/ServicioEntradaSalida';
interface RouteParams {
    idRegistroEntradaSalida: string,
    idFinca: string,
    fecha: string,
    tipo: string,
    detallesCompraVenta: string,
    cantidad: string,
    precioUnitario: string,
    montoTotal: string,
    estado: string
}

export const ModificarEntradasSalidasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const {
        idRegistroEntradaSalida,
        idFinca,
        fecha,
        tipo,
        detallesCompraVenta,
        cantidad,
        precioUnitario,
        montoTotal,
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
        idRegistroEntradaSalida: idRegistroEntradaSalida || '',
        fecha: fecha || '',
        detallesCompraVenta: detallesCompraVenta || '',
        tipo: tipo || '',
        cantidad: cantidad || '',
        precioUnitario: precioUnitario || '',
        montoTotal: montoTotal || '',
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
        if (formulario.cantidad.toString().trim() === '') {
            alert('Por favor ingrese la cantidad.');
            return;
        }
        if (formulario.precioUnitario.toString().trim() === '') {
            alert('Por favor ingrese el precio unitario.');
            return;
        }
        if (formulario.tipo.trim() === '') {
            alert('Por favor ingrese el tipo.');
            return;
        }

        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idRegistroEntradaSalida: formulario.idRegistroEntradaSalida,
            usuarioCreacionModificacion: userData.identificacion,
            fecha: dateFecha,
            detallesCompraVenta: formulario.detallesCompraVenta,
            tipo: formulario.tipo,
            cantidad: formulario.cantidad,
            precioUnitario: formulario.precioUnitario,
            montoTotal: formulario.montoTotal,
        };
        //  Se ejecuta el servicio de insertar  de  la entrada/salida
        const responseInsert = await ModificarRegistroEntradaSalida(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico la entrada/salida correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.AdminAdminstration.screenName as never);
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

        // Comparar fechas
        if (isNaN(fecha.getTime())) {
            isValid = false;
            alert('La fecha no es válida.');
            return isValid;
        }
        if (formulario.tipo.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el tipo.');
            return;
        }
        if (formulario.detallesCompraVenta.trim() === '') {
            isValid = false;
            alert('Por favor ingrese los detalles de compra/venta.');
            return;
        }

        return isValid;

    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idRegistroEntradaSalida: formulario.idRegistroEntradaSalida,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Eliminar este registro',
            '¿Estás seguro de que deseas eliminar esta entrada/salida?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoRegistroEntradaSalida(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se elimino esta entrda/salida correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.AdminAdminstration.screenName
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
    const entradasSalidasValues = [
        {
            label: 'Compra', value: 'Compra'
        },
        {

            label: 'Venta', value: 'Venta'
        }
    ]
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
                <BackButtonComponent screenName={ScreenProps.ListInflowsOutflows.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar entradas y salidas</Text>
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
                                    <DropdownComponent
                                        placeholder="Tipo"
                                        data={entradasSalidasValues}
                                        value={formulario.tipo}
                                        iconName=''
                                        height={40}
                                        onChange={(value) => updateFormulario('tipo', value.value)}
                                    />
                                    <Text style={styles.formText} >Detalles de la compra/venta</Text>
                                    <TextInput
                                        maxLength={200}
                                        style={styles.input}
                                        placeholder="Detalles de la compra/venta..."
                                        value={formulario.detallesCompraVenta}
                                        onChangeText={(text) => updateFormulario('detallesCompraVenta', text)}
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

                                <Text style={styles.formText}>Cantidad</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Cantidad..."
                                    value={formulario.cantidad.toString()}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'cantidad'
                                        updateFormulario('cantidad', text);
                                        // Calcular el monto total y actualizar el estado 'montoTotal'
                                        const montoTotal = Number(text) * Number(formulario.precioUnitario);
                                        updateFormulario('montoTotal', montoTotal.toString());
                                    }}
                                />
                                <Text style={styles.formText}>Precio unitario (₡/cantidad)</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Precio unitario..."
                                    value={formulario.precioUnitario.toString()}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'precioUnitario'
                                        updateFormulario('precioUnitario', text);
                                        // Calcular el monto total y actualizar el estado 'montoTotal'
                                        const montoTotal = Number(formulario.cantidad) * Number(text);
                                        updateFormulario('montoTotal', montoTotal.toString());
                                    }}
                                />
                                <Text style={styles.formText} >Monto total</Text>
                                <TextInput
                                    maxLength={100}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Monto total..."
                                    value={formulario.montoTotal.toString()}
                                    onChangeText={(text) => updateFormulario('montoTotal', text)}
                                    readOnly={true}
                                />
                                {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={String(formulario.idFinca)}
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