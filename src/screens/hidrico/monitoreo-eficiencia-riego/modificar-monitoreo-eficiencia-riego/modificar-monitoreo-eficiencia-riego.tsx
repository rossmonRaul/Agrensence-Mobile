import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { CheckBox } from 'react-native-elements';
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
import { ActualizarRegistroEficienciaRiego } from '../../../../servicios/ServicioUsoAgua';
import { CambiarEstadoRegistroEficienciaRiego } from '../../../../servicios/ServicioUsoAgua';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

interface RouteParams {
    idMonitoreoEficienciaRiego: string,
    idFinca: string,
    idParcela: string,
    volumenAguaUtilizado: number,
    estadoTuberiasYAccesorios: boolean,
    uniformidadRiego: boolean,
    estadoAspersores: boolean,
    estadoCanalesRiego: boolean,
    nivelFreatico: number,
    estado: string
}

export const ModificarMonitoreoEficienciaRiegoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const { idMonitoreoEficienciaRiego,
        idFinca,
        idParcela,
        volumenAguaUtilizado,
        estadoTuberiasYAccesorios,
        uniformidadRiego,
        estadoAspersores,
        estadoCanalesRiego,
        nivelFreatico,
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


    const [estadoTuberiasModificar, setEstadoTuberias] = useState(estadoTuberiasYAccesorios || false);
    const [uniformidadRiegoModificar, setUniformidadRiego] = useState(uniformidadRiego || false);
    const [estadoAspersoresModificar, setEstadoAspersores] = useState(estadoAspersores || false);
    const [estadoCanalesRiegoModificar, setEstadoCanalesRiego] = useState(estadoCanalesRiego || false);


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


    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        identificacionUsuario: userData.identificacion,
        consumoAgua: volumenAguaUtilizado || '',
        estadoTuberias: estadoTuberiasYAccesorios || '',
        uniformidadRiego: uniformidadRiego || '',
        estadoAspersores: estadoAspersores || '',
        estadoCanalesRiego: estadoCanalesRiego || '',
        nivelFreatico: nivelFreatico || '',
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



        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMonitoreoEficienciaRiego: idMonitoreoEficienciaRiego,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            usuarioCreacionModificacion: userData.identificacion,
            volumenAguaUtilizado: formulario.consumoAgua,
            estadoTuberiasYAccesorios: estadoTuberiasModificar,
            uniformidadRiego: uniformidadRiegoModificar,
            estadoAspersores: estadoAspersoresModificar,
            estadoCanalesRiego: estadoCanalesRiegoModificar,
            nivelFreatico: formulario.nivelFreatico,
        };

        //  Se ejecuta el servicio de insertar el monitoreo de eficiencia de riego
        const responseInsert = await ActualizarRegistroEficienciaRiego(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico el registro de monitoreo eficiencia de riego!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.HidricMenu.screenName as never);
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
    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // el monitoreo de eficiencia de riego ya tiene una finca asignada
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


    const toggleDatePicker = (picker) => {
        switch (picker) {
            case "siembra":
                setShowPickerSiembra(!showPickerSiembra);
                break;
            case "cosecha":
                setShowPickerTiempoCosecha(!showPickerEpocaSiembra);
                break;
            case "siguienteSiembra":
                setShowPickerEpocaSiembra(!showPickerTiempoCosecha);
                break;
            default:
                break;
        }
    };
    const validateFirstForm = () => {
        let isValid = true;



        return isValid;

    }

    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMonitoreoEficienciaRiego: idMonitoreoEficienciaRiego,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado del monitoreo eficiencia riego?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoRegistroEficienciaRiego(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado de esta rotación de monitoreo eficiencia riego!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.HidricMenu.screenName
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
                <BackButtonComponent screenName={ScreenProps.ListIrrigationEfficiency.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Monitoreo eficiencia de riego</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText} >Consumo Agua (L)</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="0"
                                        value={formulario.consumoAgua.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('consumoAgua', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Fugas en el Sistema de Riego</Text>
                                        <CheckBox
                                            checked={estadoTuberiasModificar}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!estadoTuberiasModificar, setEstadoTuberias)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>

                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Uniformidad de Riego</Text>
                                        <CheckBox
                                            checked={uniformidadRiegoModificar}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!uniformidadRiegoModificar, setUniformidadRiego)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>

                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Obstruccion en Aspersores</Text>
                                        <CheckBox
                                            checked={estadoAspersoresModificar}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!estadoAspersoresModificar, setEstadoAspersores)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>

                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Obstrucción en Canales de Riego</Text>
                                        <CheckBox
                                            checked={estadoCanalesRiegoModificar}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!estadoCanalesRiegoModificar, setEstadoCanalesRiego)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                    <Text style={styles.formText} >Nivel freático</Text>
                                    <TextInput
                                        maxLength={50}
                                        style={styles.input}
                                        placeholder="0"
                                        value={formulario.nivelFreatico.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('nivelFreatico', numericText);
                                        }}
                                        keyboardType="numeric"
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
                                <DropdownComponent
                                    placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
                                    data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                    value={selectedFinca}
                                    iconName='tree'
                                    onChange={(selectedItem) => {
                                        // Manejar el cambio en la selección de la finca
                                        handleFincaChange(selectedItem);

                                        // Actualizar el formulario con la selección de la finca
                                        updateFormulario('idFinca', selectedItem.value);
                                    }}
                                />
                                <DropdownComponent
                                    placeholder={selectedParcela ? selectedParcela : "Seleccionar Parcela"}
                                    data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                    value={selectedParcela}
                                    iconName='pagelines'
                                    onChange={(selectedItem) => {
                                        // Manejar el cambio en la selección de la parcela
                                        setSelectedParcela(selectedItem.value);

                                        // Actualizar el formulario con la selección de la parcela
                                        updateFormulario('idParcela', selectedItem.value);
                                    }}
                                />
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
                                            <Text style={styles.buttonText}>Desactivar</Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => {
                                            handleChangeAccess();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Activar</Text>
                                        </View>
                                    </TouchableOpacity>
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