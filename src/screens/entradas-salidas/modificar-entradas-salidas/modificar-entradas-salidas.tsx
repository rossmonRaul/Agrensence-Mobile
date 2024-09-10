import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import ListaComponenteEntradaSalida from '../../../components/ListaComponenteEntradaSalida/ListaComponenteEntradaSalida';
import ConfirmAlert from '../../../components/CustomAlert/ConfirmAlert';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';


interface RouteParams {
    idRegistroEntradaSalida: string,
    idFinca: string,
    fecha: string,
    tipo: string,
    detallesCompraVenta: string,
    total:string,
    estado: string
}
interface Button {
    text: string;
    onPress: () => void;
  }
interface Item {
    id: string;
    producto: string;
    cantidad: string;
    precioUnitario: string;
    iva: string;
    total: string;
}

export const ModificarEntradasSalidasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();

    const route = useRoute();

    const {
        idRegistroEntradaSalida,
        idFinca,
        fecha,
        tipo,
        detallesCompraVenta,
        total,
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

    const [DatosDelHijo, setDatosDelHijo] =  useState<Item[]>([]);
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca || '',
        identificacionUsuario: userData.identificacion,
        idRegistroEntradaSalida: idRegistroEntradaSalida || '',
        fecha: fecha || '',
        detallesCompraVenta: detallesCompraVenta || '',
        tipo: tipo || '',
        total: total || '',
        estado: estado || '',
    });

    const [title, setTitle] = useState('Entradas y salidas');

    const toggleTitle = () => {
        setTitle((prevTitle) => (prevTitle === 'Entradas y salidas' ? 'Listado productos' : 'Entradas y salidas'));
    };

    const recibirDatos = (datos: Item[]) => {
        setDatosDelHijo(datos);
      };
      const [isAlertVisible, setAlertVisible] = useState(false);
      const [isAlertVisibleEstado, setAlertVisibleEstado] = useState(false);
      const [alertProps, setAlertProps] = useState({
          message: '',
          buttons: [] as Button[], // Define el tipo explícitamente
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
                  navigation.navigate(ScreenProps.AdminAdminstration.screenName);
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
  
        const showConfirmAlert = async () => {
          setAlertVisibleEstado(true);
        };
    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    // Se defina una función para manejar el modificar cuando le da al boton de guardar
    const handleModify = async () => {
        if (DatosDelHijo.length === 0) {
            showInfoAlert('Por favor ingrese un producto a la lista.');
            return;
        }

        const MontoTotal = DatosDelHijo.reduce((sum, detalle) => sum + (parseFloat(detalle.total) || 0), 0);
        

      
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idRegistroEntradaSalida: formulario.idRegistroEntradaSalida,
            usuarioCreacionModificacion: userData.identificacion,
            fecha: dateFecha,
            detallesCompraVenta: formulario.detallesCompraVenta,
            tipo: formulario.tipo,
            total: MontoTotal,
            detalles:DatosDelHijo
        };
        //  Se ejecuta el servicio de insertar  de  la entrada/salida
        const responseInsert = await ModificarRegistroEntradaSalida(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se modifico la entrada/salida correctamente!')
            // Alert.alert('¡Se modifico la entrada/salida correctamente!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.ListInflowsOutflows.screenName as never);
            //         },
            //     },
            // ]);
        } else {
            showErrorAlert('!Oops! Parece que algo salió mal')
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
                
                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasResponse);
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
            showInfoAlert('La fecha no es válida.');
            return isValid;
        }
        if (formulario.tipo.trim() === '') {
            isValid = false;
            showInfoAlert('Por favor ingrese el tipo.');
            return;
        }
        if (formulario.detallesCompraVenta.trim() === '') {
            isValid = false;
            showInfoAlert('Por favor ingrese los detalles de compra/venta.');
            return;
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            isValid = false;
            showInfoAlert('Ingrese la Finca');
            return
        }

        return isValid;

    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idRegistroEntradaSalida: formulario.idRegistroEntradaSalida,
        };

        try {
            const responseInsert = await CambiarEstadoRegistroEntradaSalida(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se elimino esta entrada/salida correctamente!');
              //navigation.navigate(ScreenProps.CompanyList.screenName as never);
            } else {
                showErrorAlert('¡Oops! Parece que algo salió mal');
            }
          } catch (error) {
                showErrorAlert('¡Oops! Algo salió mal.');
          } finally {
            // setLoading(false);
            setAlertVisibleEstado(false);
          }
        //  Se muestra una alerta con opción de aceptar o cancelar
        // Alert.alert(
        //     'Eliminar este registro',
        //     '¿Estás seguro de que deseas eliminar esta entrada/salida?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se inserta el identificacion en la base de datos
        //                 const responseInsert = await CambiarEstadoRegistroEntradaSalida(formData);
        //                 // Se ejecuta el cambio de estado
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se elimino esta entrada/salida correctamente!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.AdminAdminstration.screenName
        //                                     );
        //                                 },
        //                             },
        //                         ]
        //                     );
        //                 } else {
        //                     alert('¡Oops! Parece que algo salió mal');
        //                 }
        //             },
        //         },
        //     ],
        //     { cancelable: false }
        // );
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
    const obtenerFincaProps = useMemo(() => ({
        fetchDataFunction: () => ObtenerFincas(userData.idEmpresa),
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    }), [userData.idEmpresa]);

    const obtenerParcelaProps = useMemo(() => ({
        fetchDataFunction: () => ObtenerParcelas(userData.idEmpresa),
        setDataFunction: setParcelaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idParcela',
        idKey: 'idFinca',
    }), [userData.idEmpresa]);
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
                            <Text style={styles.createAccountText} >{title}</Text>
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
                                    <Text style={styles.formText} >Finca</Text>
                                    {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                                        value={String(formulario.idFinca)}
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

                            <ListaComponenteEntradaSalida enviarDatos={recibirDatos} idRegistroEntradaSalida={parseInt(idRegistroEntradaSalida)} datosImperdibles={DatosDelHijo}/>
                                

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
                                            showConfirmAlert();
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
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.AdminAdminstration.screenName) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas eliminar esta entrada/salida?"
                buttons={[
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => setAlertVisibleEstado(false),
                },
                {
                text: 'Aceptar',
                onPress: handleChangeAccess,
                 },
                ]}
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