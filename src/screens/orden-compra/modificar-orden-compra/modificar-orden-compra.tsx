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
import { ModificarOrdenDeCompra, CambiarEstadoOrdenDeCompra } from '../../../servicios/ServicioOrdenCompra';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../hooks/useFetchDropDownData';
interface RouteParams {
    idOrdenDeCompra: string,
    idFinca: string,
    idParcela: string,
    numeroDeOrden: string,
    proveedor: string,
    fechaOrden: string,
    fechaEntrega: string,
    productosAdquiridos: string,
    cantidad: string,
    precioUnitario: string,
    montoTotal: string,
    observaciones: string,
    estado: string
}

export const ModificarOrdenCompraScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const {
        idOrdenDeCompra,
        idFinca,
        idParcela,
        numeroDeOrden,
        proveedor,
        fechaOrden,
        fechaEntrega,
        productosAdquiridos,
        cantidad,
        precioUnitario,
        montoTotal,
        observaciones,
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

    const [showFechaOrden, setShowFechaOrden] = useState(false);
    const [showFechaEntrega, setShowFechaEntrega] = useState(false);
    const [dateFechaOrden, setDateFechaOrden] = useState(new Date())
    const [dateFechaEntrega, setDateFechaEntrega] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca || '',
        idParcela: idParcela || '',
        identificacionUsuario: userData.identificacion,
        numeroOrden: numeroDeOrden || '',
        fechaOrden: fechaOrden || '',
        fechaEntrega: fechaEntrega || '',
        proveedor: proveedor || '',
        productoAdquirido: productosAdquiridos || '',
        precioUnitario: precioUnitario || '',
        cantidad: cantidad || '',
        montoTotal: montoTotal || '',
        observaciones: observaciones || ''
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
        if (formulario.cantidad.trim() === '') {
            alert('Por favor ingrese la cantidad.');
            return;
        }
        if (formulario.precioUnitario.trim() === '') {
            alert('Por favor ingrese el precio unitario.');
            return;
        }
        if (formulario.observaciones.trim() === '') {
            alert('Por favor ingrese observaciones o n/a.');
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
        const fechaOrden = parseDate(formulario.fechaOrden);
        const fechaEntrega = parseDate(formulario.fechaEntrega);
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,

            idOrdenDeCompra: idOrdenDeCompra,
            usuarioCreacionModificacion: userData.identificacion,
            numeroDeOrden: formulario.numeroOrden,
            proveedor: formulario.proveedor,
            fechaOrden: fechaOrden,
            fechaEntrega: fechaEntrega,
            productosAdquiridos: formulario.productoAdquirido,
            cantidad: formulario.cantidad,
            precioUnitario: formulario.precioUnitario,
            montoTotal: formulario.montoTotal,
            observaciones: formulario.observaciones
        };
        //  Se ejecuta el servicio de insertar  de  la orden de compra
        const responseInsert = await ModificarOrdenDeCompra(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico la orden de compra correctamente!', '', [
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
    useEffect(() => {
        // Buscar la parcela correspondiente
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));

        // Establecer el nombre de la parcela inicial como selectedFinca
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

    //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('/');

        // Verificar si el año ya tiene "20" al inicio
        const fullYear = year.startsWith("20") ? year : `20${year}`;

        return new Date(`${fullYear}-${month}-${day}`);
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
            case "orden":
                setShowFechaOrden(!showFechaOrden);
                break;
            case "entrega":
                setShowFechaEntrega(!showFechaEntrega);
                break;
            default:
                break;
        }
    };
    //se captura el evento de datetimepicker
    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date(); // Selecciona la fecha actual si no hay ninguna seleccionada
        switch (picker) {
            case 'orden':
                setShowFechaOrden(Platform.OS === 'ios');
                setDateFechaOrden(currentDate);
                break;
            case 'entrega':
                setShowFechaEntrega(Platform.OS === 'ios');
                setDateFechaEntrega(currentDate);
                break;
            default:
                break;
        }

        if (event.type === 'set') {
            const formattedDate = formatSpanishDate(currentDate);
            updateFormulario(picker === 'orden' ? 'fechaOrden' : 'fechaEntrega', formattedDate);
        }
    };
    const confirmIOSDate = (picker) => {
        switch (picker) {
            case 'orden':
                setShowFechaOrden(false);
                updateFormulario('fechaOrden', formatSpanishDate(dateFechaOrden));
                break;
            case 'entrega':
                setShowFechaEntrega(false);
                updateFormulario('fechaEntrega', formatSpanishDate(dateFechaEntrega));
                break;
            default:
                break;
        }
    };
    const validateFirstForm = () => {
        let isValid = true;
        if (formulario.numeroOrden.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el número de orden.');
            return;
        }
        if (formulario.proveedor.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el proveedor.');
            return;
        }

        if (formulario.productoAdquirido.trim() === '') {
            isValid = false;
            alert('Por favor ingrese el producto adquirido.');
            return;
        }
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        const DateOrden = parseDate(formulario.fechaOrden);
        const DateEntrega = parseDate(formulario.fechaEntrega);

        // Comparar fechas
        if (isNaN(DateOrden.getTime())) {
            isValid = false;
            alert('La fecha de orden no es válida.');
            return isValid;
        }

        if (isNaN(DateEntrega.getTime())) {
            isValid = false;
            alert('La fecha de entrega no es válida.');
            return isValid;
        }

        if (DateEntrega < DateOrden) {
            isValid = false;
            alert('El de entrega no puede ser anterior a la fecha de orden.');
            return isValid;
        }

        return isValid;

    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idOrdenDeCompra: idOrdenDeCompra,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Eliminar este registro',
            '¿Estás seguro de que deseas eliminar esta orden de compra?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoOrdenDeCompra(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó elimino esta orden de compra correctamente!',
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
                <BackButtonComponent screenName={ScreenProps.ListPurchaseOrder.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Registro orden de compra</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText} >Número de orden</Text>
                                    <Text style={styles.formText} >Número de orden</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="Número de orden..."
                                        value={formulario.numeroOrden}
                                        onChangeText={(text) => {
                                            updateFormulario('numeroOrden', text);

                                        }}
                                    />
                                    <Text style={styles.formText} >Proveedor</Text>
                                    <TextInput
                                        maxLength={75}
                                        style={styles.input}
                                        placeholder="Proveedor..."
                                        value={formulario.proveedor}
                                        onChangeText={(text) => updateFormulario('proveedor', text)}
                                    />
                                    <Text style={styles.formText}>Fecha de orden</Text>

                                    {!showFechaOrden && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('orden')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.fechaOrden}
                                                onChangeText={(text) => updateFormulario('fechaOrden', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('orden')}
                                            />
                                        </Pressable>

                                    )}

                                    {showFechaOrden && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateFechaOrden}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'orden')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showFechaOrden && Platform.OS === 'ios' && (
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
                                                onPress={() => toggleDatePicker('orden')}
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
                                                onPress={() => confirmIOSDate('orden')}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}


                                    <Text style={styles.formText} >Fecha de entrega</Text>
                                    {!showFechaEntrega && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('entrega')}

                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.fechaEntrega}
                                                onChangeText={(text) => updateFormulario('fechaEntrega', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('entrega')}
                                            />
                                        </Pressable>

                                    )}
                                    {showFechaEntrega && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateFechaEntrega}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'entrega')}
                                            style={styles.dateTimePicker}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showFechaEntrega && Platform.OS === 'ios' && (
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
                                                onPress={() => toggleDatePicker('entrega')}
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
                                                onPress={() => confirmIOSDate('entrega')}
                                            >

                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>

                                            </TouchableOpacity>

                                        </View>
                                    )}
                                    <Text style={styles.formText} >Producto Adquirido</Text>
                                    <TextInput
                                        maxLength={200}
                                        style={styles.input}
                                        placeholder="Producto Adquirido..."
                                        value={formulario.productoAdquirido}
                                        onChangeText={(text) => updateFormulario('productoAdquirido', text)}
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

                                <Text style={styles.formText}>Cantidad (kg)</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Cantidad..."
                                    value={formulario.cantidad}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'cantidad'
                                        updateFormulario('cantidad', text);
                                        // Calcular el monto total y actualizar el estado 'montoTotal'
                                        const montoTotal = parseInt(text) * parseInt(formulario.precioUnitario);
                                        updateFormulario('montoTotal', montoTotal.toString());
                                    }}
                                />
                                <Text style={styles.formText}>Precio unitario (₡/kg)</Text>
                                <TextInput
                                    keyboardType='numeric'
                                    maxLength={100}
                                    style={styles.input}
                                    placeholder="Precio unitario..."
                                    value={formulario.precioUnitario}
                                    onChangeText={(text) => {
                                        // Actualizar el estado 'precioUnitario'
                                        updateFormulario('precioUnitario', text);
                                        // Calcular el monto total y actualizar el estado 'montoTotal'
                                        const montoTotal = parseInt(formulario.cantidad) * parseInt(text);
                                        updateFormulario('montoTotal', montoTotal.toString());
                                    }}
                                />
                                <Text style={styles.formText} >Monto total</Text>
                                <TextInput
                                    maxLength={100}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Monto total..."
                                    value={formulario.montoTotal}
                                    readOnly={true}
                                    onChangeText={(text) => updateFormulario('montoTotal', text)}
                                />
                                <Text style={styles.formText} >Observaciones</Text>
                                <TextInput
                                    maxLength={200}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Observaciones..."
                                    value={formulario.observaciones}
                                    onChangeText={(text) => updateFormulario('observaciones', text)}
                                />
                                {empresa &&
                                    <DropdownComponent
                                        placeholder="Seleccionar Finca"
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