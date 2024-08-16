import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../hooks/useFetchDropDownData';
import { InsertarRegistroEntradaSalida } from '../../../servicios/ServicioEntradaSalida';
import ListaComponenteEntradaSalida from '../../../components/ListaComponenteEntradaSalida/ListaComponenteEntradaSalida';
interface Item {
    id: string;
    producto: string;
    cantidad: string;
    precioUnitario: string;
    iva: string;
    total: string;
}

export const InsertarEntradasSalidasScreen: React.FC = () => {
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

    const [showFechaOrden, setShowFecha] = useState(false);
    const [dateFecha, setDateFecha] = useState(new Date())
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [DatosDelHijo, setDatosDelHijo] =  useState<Item[]>([]);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        identificacionUsuario: userData.identificacion,
        idRegistroEntradaSalida: '',
        fecha: '',
        detallesCompraVenta: '',
        tipo: ''
    });

    const [title, setTitle] = useState('Entradas y salidas');

    const toggleTitle = () => {
        setTitle((prevTitle) => (prevTitle === 'Entradas y salidas' ? 'Listado productos' : 'Entradas y salidas'));
    };

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
        if (!formulario.idFinca || formulario.idFinca === null) {
            isValid = false;
            alert('Ingrese la Finca');
            return
        }

        return isValid;

    }

    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {
            if (DatosDelHijo.length === 0) {
                alert('Por favor ingrese un producto a la lista.');
                return;
            }

        const MontoTotal = DatosDelHijo.reduce((sum, detalle) => sum + (parseFloat(detalle.total) || 0), 0);
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            usuarioCreacionModificacion: userData.identificacion,
            fecha: formatDate(dateFecha),
            detallesCompraVenta: formulario.detallesCompraVenta,
            tipo: formulario.tipo,
            total: MontoTotal,
            detalles:DatosDelHijo
        };

        //  Se ejecuta el servicio de insertar  la entrada o salida
        const responseInsert = await InsertarRegistroEntradaSalida(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se registro la entrada o salida correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListInflowsOutflows.screenName as never);
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
                // const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

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

                const fincasResponse = await ObtenerFincas();
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasFiltradas);
                // const parcelasResponse = await ObtenerParcelas();
                // const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                // setParcelas(parcelasFiltradas);
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
            case "fecha":
                setShowFecha(!showFechaOrden);
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

    const entradasSalidasValues = [
        {
            label: 'Compra', value: 'Compra'
        },
        {

            label: 'Venta', value: 'Venta'
        }
    ]
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
                            <Text style={styles.createAccountText} >{title}</Text>
                        </View>
                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText}>Fecha</Text>
                                    {!showFechaOrden && (
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
                                    {showFechaOrden && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateFecha}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'fecha')}
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
                                     <Text style={styles.formText} >Tipo</Text>
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
                                    {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                    }


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

                                <ListaComponenteEntradaSalida enviarDatos={recibirDatos} idRegistroEntradaSalida={0} datosImperdibles={DatosDelHijo}/>
      

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
                                {finca && <TouchableOpacity
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
