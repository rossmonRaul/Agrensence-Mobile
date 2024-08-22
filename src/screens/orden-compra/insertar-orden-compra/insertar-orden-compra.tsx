import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { useNavigation } from '@react-navigation/native';
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
import { InsertarOrdenDeCompra,ObtenerUltimoIdOrdenDeCompra } from '../../../servicios/ServicioOrdenCompra';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../hooks/useFetchDropDownData';
import ListaComponenteOrdenCompra from '../../../components/ListaComponenteOrdenCompra/ListaComponenteOrdenCompra';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Item {
    id: string;
    producto: string;
    cantidad: string;
    precioUnitario: string;
    iva: string;
    total: string;
}
export const InsertarOrdenCompraScreen: React.FC = () => {
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

    const [showFechaOrden, setShowFechaOrden] = useState(false);
    const [showFechaEntrega, setShowFechaEntrega] = useState(false);
    const [dateFechaOrden, setDateFechaOrden] = useState(new Date())
    const [dateFechaEntrega, setDateFechaEntrega] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [DatosDelHijo, setDatosDelHijo] =  useState<Item[]>([]);
    const [inputs, setInputs] = useState(['']);
    const [ultimoIdOrdenDeCompra, setUltimoIdOrdenDeCompra] = useState(null);
    const [title, setTitle] = useState('Orden de compra');

    const toggleTitle = () => {
        setTitle((prevTitle) => (prevTitle === 'Orden de compra' ? 'Listado productos' : 'Orden de compra'));
    };

    const handleInputsChange = (index, newValue) => {
        const newInputs = [...inputs];

        const isDuplicate = newInputs.slice(0, index).some((input) => input === newValue);

        if (!isDuplicate) {
            newInputs[index] = newValue;
            setInputs(newInputs);
        } else {
            Alert.alert('Este valor ya ha sido seleccionado anteriormente.')
        }
    };

    const handleAddInput = () => {
        // Verificar si el último elemento del array no está vacío
        const lastInput = inputs[inputs.length - 1];
        if (typeof lastInput === 'string' && lastInput.trim() !== '') {
            // Agregar un nuevo elemento al array
            setInputs([...inputs, '']);
        } else {
            // Si el último elemento está vacío, muestra una alerta o realiza alguna acción
            Alert.alert('Por favor, seleccione un valor antes de agregar otro campo.');
        }
    };

    const handleRemoveInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        identificacionUsuario: userData.identificacion,
        numeroOrden: '',
        fechaOrden: '',
        fechaEntrega: '',
        proveedor: '',
        observaciones: ''
    });

    const recibirDatos = (datos: Item[]) => {
        setDatosDelHijo(datos);
        
      };
    
    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };


    const validateFirstForm = () => {
        let isValid = true;
        if (!formulario.idFinca || formulario.idFinca === null) {
            isValid = false;
            alert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            isValid = false;
            alert('Ingrese la Parcela');
            return
        }

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

        if (formulario.observaciones.trim() === '') {
            isValid = false;
            alert('Por favor ingrese observaciones o n/a.');
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

    const validateSecondForm = () => {
        let isValid = true;


        return isValid
    }
    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {
        if (DatosDelHijo.length === 0) {
            alert('Por favor ingrese un producto a la lista.');
            return;
        }

        
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const MontoTotal = DatosDelHijo.reduce((sum, detalle) => sum + (parseFloat(detalle.total) || 0), 0);
        
        // DatosDelHijo.forEach(detalle => {
        //     MontoTotal += parseInt(detalle.total) || 0;
        //   });
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            usuarioCreacionModificacion: userData.identificacion,
            numeroDeOrden: formulario.numeroOrden,
            proveedor: formulario.proveedor,
            fechaOrden: formatDate(dateFechaOrden),
            fechaEntrega: formatDate(dateFechaEntrega),
            observaciones: formulario.observaciones,
            total: MontoTotal,
            detalles:DatosDelHijo
        };

        //  Se ejecuta el servicio de insertar  la orden de compra
        const responseInsert = await InsertarOrdenDeCompra(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se registro la orden de compra correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        //navigation.navigate(ScreenProps.AdminAdminstration.screenName as never);ScreenProps.ListPurchaseOrder.screenName
                        navigation.navigate(ScreenProps.ListPurchaseOrder.screenName as never);
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
                const datosUltimoIdOrdenDeCompra= await ObtenerUltimoIdOrdenDeCompra();
                //setUltimoIdOrdenDeCompra(datosUltimoIdOrdenDeCompra.numeroDeOrden);
                formulario.numeroOrden=datosUltimoIdOrdenDeCompra.numeroDeOrden.toString();

                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

                // const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                //     .filter(item => item !== undefined)
                //     .map(item => item!.idFinca)))
                //     .map(idFinca => {
                //         const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                //         const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                //         return { idFinca, nombreFinca };
                //     });

                // setFincas(fincasUnicas);

                // const parcelasUnicas = datosInicialesObtenidos.map(item => ({
                //     idFinca: item.idFinca,
                //     idParcela: item.idParcela,
                //     nombre: item.nombreParcela,
                // }));

                // setParcelas(parcelasUnicas);
                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasFiltradas);
                const parcelasResponse = await ObtenerParcelas(userData.idEmpresa);
                const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                setParcelas(parcelasFiltradas);

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
                            <Text style={styles.createAccountText} >{title}</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
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
                                    <Text style={styles.formText} >Número de orden</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="Número de orden..."
                                        value={formulario.numeroOrden}
                                        editable={false}
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
                                    <Text style={styles.formText} >Observaciones</Text>
                                    <TextInput
                                    maxLength={200}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Observaciones..."
                                    value={formulario.observaciones}
                                    onChangeText={(text) => updateFormulario('observaciones', text)}
                                    /> 
                                    

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
                                            const isValid = validateFirstForm();

                                            if (isValid) {
                                                setSecondFormVisible(true);
                                                toggleTitle();
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

                              
                                <ListaComponenteOrdenCompra enviarDatos={recibirDatos} idOrdenDeCompra={0} datosImperdibles={DatosDelHijo}/>
                                
                                

                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => {
                                        setSecondFormVisible(false);
                                        toggleTitle();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                        <Text style={styles.buttonTextBack}> Atrás</Text>
                                    </View>
                                </TouchableOpacity>
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
