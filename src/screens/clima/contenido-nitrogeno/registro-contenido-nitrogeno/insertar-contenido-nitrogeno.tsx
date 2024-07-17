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
import { Ionicons } from '@expo/vector-icons';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';
import { InsertarRegistroContenidoNitrogeno, ObtenerPuntoMedicionFincaParcela } from '../../../../servicios/ServiciosContenidoNitrogeno';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';

export const InsertarContenidoNitrogenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    const [puntoMedicion, setPuntoMedicion] = useState(null);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [puntosMedicion, setPuntosMedicion] = useState<{ idPuntoMedicion: number;  codigo: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);

    const [showFecha, setShowFecha] = useState(false);

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    const [dateFecha, setDateFecha] = useState(new Date());

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        idPuntoMedicion: puntoMedicion,
        codigoPuntoMedicion: '',
        fechaMuestreo: '',
        contenidoNitrogenoSuelo: '',
        contenidoNitrogenoPlanta: '',
        metodoAnalisis: '',
        humedadObservable: '',
        condicionSuelo: '',
        observaciones: '',
        usuarioCreacionModificacion: userData.identificacion
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
            alert('La fecha de muestreo es requerida.');
            return isValid;
        }

        return isValid;
    };

    // Se define una función para manejar el registro cuando le da al botón de guardar
    const handleRegister = async () => {
        if (formulario.contenidoNitrogenoSuelo.trim() === '') {
            alert('El campo de contenido de nitrógeno en el suelo es requerido.');
            return;
        }
        
        if (formulario.contenidoNitrogenoPlanta.trim() === '') {
            alert('El campo de contenido de nitrógeno en la planta es requerido.');
            return;
        }

        if (formulario.metodoAnalisis.trim() === '') {
            alert('El campo método de análisis es requerido.');
            return;
        }

        if (formulario.humedadObservable.trim() === '') {
            alert('El campo de humedad observable es requerido.');
            return;
        }

        if (formulario.condicionSuelo.trim() === '') {
            alert('El campo condición del suelo es requerido.');
            return;
        }

        if (formulario.observaciones.trim() === '') {
            alert('El campo observaciones es requerido.');
            return;
        }

        // Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            idPuntoMedicion: formulario.idPuntoMedicion,
            codigoPuntoMedicion: formulario.codigoPuntoMedicion,
            fechaMuestreo: formatFecha(formulario.fechaMuestreo),
            contenidoNitrogenoSuelo: parseFloat(formulario.contenidoNitrogenoSuelo),
            contenidoNitrogenoPlanta: parseFloat(formulario.contenidoNitrogenoPlanta),
            metodoAnalisis: formulario.metodoAnalisis,
            humedadObservable: formulario.humedadObservable,
            condicionSuelo: formulario.condicionSuelo,
            observaciones: formulario.observaciones,
            usuarioCreacionModificacion: userData.identificacion
        };

        const responseInsert = await InsertarRegistroContenidoNitrogeno(formData);

        // Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert && responseInsert.indicador === 1) {
            Alert.alert('¡Se registró el contenido de nitrógeno correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.NitrogenContentList.screenName as never);
                    },
                },
            ]);
        } else {
            alert('¡Oops! Parece que algo salió mal');
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

    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date(); // Selecciona la fecha actual si no hay ninguna seleccionada
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

    const handleValueEmpresa = (idEmpresa: number) => {
        setEmpresa(idEmpresa);
        let fincaSort = fincaDataOriginal.filter(item => item.id === userData.idEmpresa.toString());
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
        setParcela(null);
        setPuntoMedicion(null);
        updateFormulario('idFinca', itemValue.value)
    }

    const handleValueParcela = async (itemValue: any) => {
        setParcela(itemValue.value);

        const fincaParcela = {
            idFinca: finca,
            idParcela: itemValue.value
        }
        
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        setPuntosMedicion(puntosMedicion)
        setPuntoMedicion(null);
        updateFormulario('idParcela', itemValue.value)
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

    /*  Se utiliza el hook useFetchDropdownData para obtener
        y gestionar los datos de fincas y parcelas */
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
                <BackButtonComponent screenName={ScreenProps.NitrogenContentList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Insertar contenido de nitrógeno</Text>
                        </View>
                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText}>Finca</Text>
                                    {empresa &&
                                        <DropdownComponent
                                            placeholder="Finca"
                                            data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                            value={finca}
                                            iconName='tree'
                                            onChange={handleValueFinca}
                                        />
                                    }

                                    <Text style={styles.formText}>Parcela</Text>
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={handleValueParcela}
                                    />

                                    <Text style={styles.formText}>Punto de medición</Text>
                                    <DropdownComponent
                                        placeholder="Punto de medición"
                                        data={puntosMedicion.map(puntoMedicion => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                        iconName='map-marker'
                                        value={puntoMedicion}
                                        onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}
                                    />
       
                                    <Text style={styles.formText}>Fecha de muestreo</Text>
                                    {!showFecha && (
                                        <Pressable onPress={() => toggleDatePicker('fechaMuestreo')}>
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
                                        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                            <TouchableOpacity style={[styles.buttonPicker, styles.pickerButton, { backgroundColor: "#11182711" }]} onPress={() => toggleDatePicker('fechaMuestreo')}>
                                                <Text style={[styles.buttonTextPicker, { color: "#075985" }]}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.buttonPicker, styles.pickerButton, { backgroundColor: "#11182711" }]} onPress={() => confirmIOSDate('fechaMuestreo')}>
                                                <Text style={[styles.buttonTextPicker, { color: "#075985" }]}>Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <TouchableOpacity style={styles.button} onPress={async () => {
                                        const isValid = validateFirstForm();
                                        if (isValid) {
                                            setSecondFormVisible(true);
                                        }
                                    }}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
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
                                        maxLength={50}
                                    />

                                    <Text style={styles.formText}>Humedad Observable</Text>
                                    <DropdownComponent
                                        placeholder="Humedad Observable"
                                        data={[
                                            { label: 'Alta', value: 'alta' },
                                            { label: 'Media', value: 'media' },
                                            { label: 'Baja', value: 'baja' }
                                        ]}
                                        iconName=''
                                        value={formulario.humedadObservable}
                                        onChange={(item) => updateFormulario('humedadObservable', item.value)}
                                    />

                                    <Text style={styles.formText}>Condición del Suelo</Text>
                                    <DropdownComponent
                                        placeholder="Condición del Suelo"
                                        data={[
                                            { label: 'Compacto', value: 'compacto' },
                                            { label: 'Suelto', value: 'suelto' },
                                            { label: 'Erosionado', value: 'erosionado' }
                                        ]}
                                        iconName=''
                                        value={formulario.condicionSuelo}
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

                                    <TouchableOpacity style={styles.backButton} onPress={() => {
                                        setSecondFormVisible(false);
                                    }}>
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                            <Text style={styles.buttonTextBack}> Atrás</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.button} onPress={() => {
                                        handleRegister();
                                    }}>
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Guardar cambios</Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
};
