import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { ObtenerRegistroContenidoNitrogeno, ModificarRegistroContenidoNitrogeno, ObtenerPuntoMedicionFincaParcela, CambiarEstadoRegistroContenidoNitrogeno } from '../../../../servicios/ServiciosContenidoNitrogeno';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RouteParams {
    idContenidoDeNitrogeno: string,
    idFinca: string,
    idParcela: string,
    idPuntoMedicion: string,
    fechaMuestreo: string,
    contenidoNitrogenoSuelo: string,
    contenidoNitrogenoPlanta: string,
    metodoAnalisis: string,
    humedadObservable: string,
    condicionSuelo: string,
    observaciones: string,
    estado: string
}

export const ModificarContenidoNitrogenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const { idContenidoDeNitrogeno,
        idFinca,
        idParcela,
        idPuntoMedicion,
        fechaMuestreo,
        contenidoNitrogenoSuelo,
        contenidoNitrogenoPlanta,
        metodoAnalisis,
        humedadObservable,
        condicionSuelo,
        observaciones,
        estado
    } = route.params as RouteParams;

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    const [puntoMedicion, setPuntoMedicion] = useState<string | null>(null);

    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [puntosMedicion, setPuntosMedicion] = useState<{ idPuntoMedicion: number; codigo: string }[] | []>([]);

    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [showFecha, setShowFecha] = useState(false);

    const [dateFecha, setDateFecha] = useState(new Date());

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };

    const [formulario, setFormulario] = useState({
        idContenidoDeNitrogeno: idContenidoDeNitrogeno,
        idFinca: idFinca || '',
        idParcela: idParcela || '',
        idPuntoMedicion: idPuntoMedicion || '',
        identificacionUsuario: userData.identificacion,
        fechaMuestreo: formatSpanishDate(new Date()),
        contenidoNitrogenoSuelo: contenidoNitrogenoSuelo || '',
        contenidoNitrogenoPlanta: contenidoNitrogenoPlanta || '',
        metodoAnalisis: metodoAnalisis || '',
        humedadObservable: humedadObservable || '',
        condicionSuelo: condicionSuelo || '',
        observaciones: observaciones || ''
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleModify = async () => {
        if (formulario.contenidoNitrogenoSuelo.trim() === '') {
            alert('El campo Contenido de Nitrógeno en el Suelo es requerido.');
            return;
        }
        
        if (parseFloat(formulario.contenidoNitrogenoSuelo) < 0.1) {
            alert('El valor de nitrógeno en el suelo debe ser mayor que cero.');
            return;
        }

        if (formulario.contenidoNitrogenoPlanta.trim() === '') {
            alert('El campo Contenido de Nitrógeno en la Planta es requerido.');
            return;
        }
        
        if (parseFloat(formulario.contenidoNitrogenoPlanta) < 0.1) {
            alert('El valor de nitrógeno en la planta debe ser mayor que cero.');
            return;
        }

        if (formulario.metodoAnalisis.trim() === '') {
            alert('El campo Método de Análisis es requerido.');
            return;
        }

        if (formulario.humedadObservable.trim() === '') {
            alert('El campo Humedad Observable es requerido.');
            return;
        }

        if (formulario.condicionSuelo.trim() === '') {
            alert('El campo Condición del Suelo es requerido.');
            return;
        }

        if (formulario.observaciones.trim() === '') {
            alert('El campo Observaciones es requerido.');
            return;
        }

        const formData = {
            idContenidoDeNitrogeno: idContenidoDeNitrogeno,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            idPuntoMedicion: formulario.idPuntoMedicion,
            codigoPuntoMedicion: puntoMedicion,
            fechaMuestreo: formatFecha(formulario.fechaMuestreo),
            contenidoNitrogenoSuelo: parseFloat(formulario.contenidoNitrogenoSuelo),
            contenidoNitrogenoPlanta: parseFloat(formulario.contenidoNitrogenoPlanta),
            metodoAnalisis: formulario.metodoAnalisis,
            humedadObservable: formulario.humedadObservable,
            condicionSuelo: formulario.condicionSuelo,
            observaciones: formulario.observaciones,
            usuarioCreacionModificacion: userData.identificacion
        };

        const responseInsert = await ModificarRegistroContenidoNitrogeno(formData);
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modificó el registro de contenido de nitrógeno!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.NitrogenContentList.screenName as never);
                    },
                },
            ]);
        } else {
            alert('¡Oops! Parece que algo salió mal')
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            const formData = { identificacion: userData.identificacion };

            try {
                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

                const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idFinca)))
                    .map(idFinca => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                        const nombreFinca = relacion ? relacion.nombreFinca : '';
                        return { idFinca, nombreFinca };
                    });

                setFincas(fincasUnicas);

                const parcelasUnicas = datosInicialesObtenidos.map(item => ({
                    idFinca: item.idFinca,
                    idParcela: item.idParcela,
                    nombre: item.nombreParcela,
                }));
                setParcelas(parcelasUnicas);
                const fincaParcela = {
                    idFinca: formulario.idFinca,
                    idParcela: formulario.idParcela
                }
                
                const cargaInicialParcelas = parcelasUnicas.filter((parcela: any) => fincasUnicas.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);

                const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
                setPuntosMedicion(puntosMedicion);
                setPuntoMedicion(formulario.idPuntoMedicion);
    
                const puntoMedicionInicial = puntosMedicion.find(puntoMedicion => puntoMedicion.idPuntoMedicion === parseInt(formulario.idPuntoMedicion));

                setPuntoMedicion(puntoMedicionInicial?.codigo || null);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();

        const obtenerDatosNitrogeno = async () => {
            try {
                const registrosNitrogeno = await ObtenerRegistroContenidoNitrogeno();
                const registroActual = registrosNitrogeno.find(registro => registro.idContenidoDeNitrogeno === parseInt(idContenidoDeNitrogeno));

                if (registroActual) {
                    setFormulario(prevState => ({
                        ...prevState,
                        contenidoNitrogenoSuelo: registroActual.contenidoNitrogenoSuelo.toString(),
                        contenidoNitrogenoPlanta: registroActual.contenidoNitrogenoPlanta.toString()
                    }));
                }
            } catch (error) {
                console.error('Error fetching nitrogeno data:', error);
            }
        };

        obtenerDatosNitrogeno();
    }, []);

    useEffect(() => {
        const fincaInicial = fincas.find(finca => finca.idFinca === parseInt(idFinca));
        setSelectedFinca(fincaInicial?.nombreFinca || null);

        const obtenerParcelasIniciales = async () => {
            try {
                const parcelasFiltradas = parcelas.filter(item => item.idFinca === parseInt(idFinca));
                setParcelasFiltradas(parcelasFiltradas);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        obtenerParcelasIniciales();
    }, [idFinca, finca, fincas]);

    useEffect(() => {
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.idFinca || formulario.idFinca === null) {
            isValid = false;
            alert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            isValid = false;
            alert('Ingrese la Parcela');
            return;
        }

        if (!formulario.idPuntoMedicion || formulario.idPuntoMedicion === null) {
            isValid = false;
            alert('Ingrese el punto de Medición');
            return;
        }
        
        if (formulario.fechaMuestreo.trim() === '') {
            isValid = false;
            alert('La fecha es requerida.');
            return isValid;
        }

        return isValid;
    };

    const handleChangeAccess = async () => {
        const formData = {
            idContenidoDeNitrogeno: idContenidoDeNitrogeno,
        };

        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar el registro de contenido de nitrógeno?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: async () => {
                        const responseInsert = await CambiarEstadoRegistroContenidoNitrogeno(formData);
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se eliminó el registro de contenido de nitrógeno!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.NitrogenContentList.screenName
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
        setFinca(null);
        setParcela(null);
    };

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
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela');
        obtenerParcelasPorFinca(fincaId);
    };

    const handleParcelaChange = async (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);
        setSelectedParcela(item.value);
        updateFormulario('idPuntoMedicion', '');
        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: parcelaId
        }
        
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        setPuntosMedicion(puntosMedicion);
        setPuntoMedicion(null);
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

    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date();
        switch (picker) {
            case 'fechaMuestreo':
                setShowFecha(Platform.OS === 'ios');
                setDateFecha(currentDate);
                break;
            default:
                break;
        }

        if (event.type === 'set') {
            const formattedDate = formatSpanishDate(currentDate);
            updateFormulario(picker === 'fechaMuestreo' ? 'fechaMuestreo' : '', formattedDate);
        }
    };

    const confirmIOSDate = (picker) => {
        switch (picker) {
            case 'fechaMuestreo':
                setShowFecha(false);
                updateFormulario('fechaMuestreo', formatSpanishDate(dateFecha));
                break;
            default:
                break;
        }
    };

    const toggleDatePicker = (picker) => {
        switch (picker) {
            case "fechaMuestreo":
                setShowFecha(!showFecha);
                break;
            default:
                break;
        }
    };

    useFetchDropdownData(obtenerFincaProps);
    useFetchDropdownData(obtenerParcelaProps);
    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <BackButtonComponent screenName={ScreenProps.ChlorophyllContentList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Modificar contenido de nitrógeno</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText}>Finca</Text>
                                    {empresa &&
                                        <DropdownComponent
                                            placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
                                            data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                            value={selectedFinca}
                                            iconName="tree"
                                            onChange={(selectedItem) => {
                                                handleFincaChange(selectedItem);
                                                updateFormulario('idFinca', selectedItem.value);
                                            }}
                                        />
                                    }

                                    <Text style={styles.formText}>Parcela</Text>
                                    <DropdownComponent
                                        placeholder={selectedParcela ? selectedParcela : "Seleccionar Parcela"}
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        value={selectedParcela}
                                        iconName="pagelines"
                                        onChange={(selectedItem) => {
                                            handleParcelaChange(selectedItem);
                                            updateFormulario('idParcela', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText}>Punto de medición</Text>
                                    <DropdownComponent
                                        placeholder={puntoMedicion ? puntoMedicion : "Seleccionar Punto de medición"}
                                        data={puntosMedicion.map(puntoMedicion => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                        iconName='map-marker'
                                        value={puntoMedicion}
                                        onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}
                                    />

                                    <Text style={styles.formText}>Fecha de Muestreo</Text>
                                    {!showFecha && (
                                        <Pressable
                                            onPress={() => toggleDatePicker('fechaMuestreo')}
                                        >
                                            <TextInput
                                                style={styles.input}
                                                placeholder='00/00/00'
                                                value={formulario.fechaMuestreo}
                                                onChangeText={(text) => updateFormulario('fechaMuestreo', text)}
                                                editable={false}
                                                onPressIn={() => toggleDatePicker('fechaMuestreo')}
                                            />
                                        </Pressable>
                                    )}

                                    {showFecha && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={dateFecha}
                                            onChange={(event, selectedDate) => onChange(event, selectedDate, 'fechaMuestreo')}
                                            style={styles.dateTimePicker}
                                            maximumDate={new Date()}
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
                                                onPress={() => toggleDatePicker('fechaMuestreo')}
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
                                                onPress={() => confirmIOSDate('fechaMuestreo')}
                                            >
                                                <Text style={[
                                                    styles.buttonTextPicker,
                                                    { color: "#075985" }
                                                ]}>Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

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
                            ) : (
                                <>
                                    <Text style={styles.formText}>Contenido de Nitrógeno en el Suelo</Text>
                                    <TextInput
                                        maxLength={100}
                                        keyboardType='numeric'
                                        style={styles.input}
                                        placeholder="Contenido de Nitrógeno en el Suelo"
                                        value={formulario.contenidoNitrogenoSuelo}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
                                            const pointCount = (numericText.match(/\./g) || []).length;
                                            if (pointCount > 1) {
                                                return;
                                            }
                                            updateFormulario('contenidoNitrogenoSuelo', numericText);
                                        }}
                                    />

                                    <Text style={styles.formText}>Contenido de Nitrógeno en la Planta</Text>
                                    <TextInput
                                        maxLength={100}
                                        keyboardType='numeric'
                                        style={styles.input}
                                        placeholder="Contenido de Nitrógeno en la Planta"
                                        value={formulario.contenidoNitrogenoPlanta}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
                                            const pointCount = (numericText.match(/\./g) || []).length;
                                            if (pointCount > 1) {
                                                return;
                                            }
                                            updateFormulario('contenidoNitrogenoPlanta', numericText);
                                        }}
                                    />

                                    <Text style={styles.formText}>Método de Análisis</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Método de Análisis"
                                        value={formulario.metodoAnalisis}
                                        onChangeText={(text) => updateFormulario('metodoAnalisis', text)}
                                        maxLength={100}
                                    />

                                    <Text style={styles.formText}>Humedad Observable</Text>
                                    <DropdownComponent
                                        placeholder={formulario.humedadObservable || "Seleccionar Humedad Observable"}
                                        data={[
                                            { label: 'Alta', value: 'Alta' },
                                            { label: 'Media', value: 'Media' },
                                            { label: 'Baja', value: 'Baja'}
                                        ]}
                                        value={formulario.humedadObservable}
                                        iconName=''
                                        onChange={(item) => updateFormulario('humedadObservable', item.value)}
                                    />

                                    <Text style={styles.formText}>Condición del Suelo</Text>
                                    <DropdownComponent
                                        placeholder={formulario.condicionSuelo || "Seleccionar Condición del Suelo"}
                                        data={[
                                            { label: 'Compacto', value: 'Compacto' },
                                            { label: 'Suelto', value: 'Suelto' },
                                            { label: 'Erosionado', value: 'Erosionado' }
                                        ]}
                                        value={formulario.condicionSuelo}
                                        iconName=''
                                        onChange={(item) => updateFormulario('condicionSuelo', item.value)}
                                    />

                                    <Text style={styles.formText}>Observaciones</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Observaciones"
                                        value={formulario.observaciones}
                                        onChangeText={(text) => updateFormulario('observaciones', text)}
                                        maxLength={200}
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
                                                <Ionicons name="trash-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}>Eliminar</Text>
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
