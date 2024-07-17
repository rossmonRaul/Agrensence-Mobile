import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
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
import { ModificarRegistroContenidoDeAgua, ObtenerPuntoMedicionFincaParcela ,CambiarEstadoRegistroContenidoDeAgua } from '../../../../servicios/ServicioContenidoAgua';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RouteParams {
    idContenidoDeAgua: string,
    idFinca: string,
    idParcela: string,
    idPuntoMedicion: string,
    fechaMuestreo: string,
    contenidoDeAguaEnSuelo : string,
    contenidoDeAguaEnPlanta : string,
    metodoDeMedicion : string,
    condicionSuelo: string,
    estado: string
}

export const ModificarContenidoAguaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const route = useRoute();

    const { idContenidoDeAgua,
        idFinca,
        idParcela,
        idPuntoMedicion,
        fechaMuestreo,
        contenidoDeAguaEnSuelo,
        contenidoDeAguaEnPlanta,
        metodoDeMedicion,
        condicionSuelo,
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
    const [puntosMedicion, setPuntosMedicion] = useState<{ idPuntoMedicion: number;  codigo: string }[] | []>([]);

    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [showFecha, setShowFecha] = useState(false);

    const [dateFecha, setDateFecha] = useState(new Date())

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);


    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idContenidoDeAgua: idContenidoDeAgua,
        idFinca: idFinca,
        idParcela: idParcela,
        idPuntoMedicion:idPuntoMedicion,
        identificacionUsuario: userData.identificacion,
        fechaMuestreo: fechaMuestreo,
        contenidoDeAguaEnSuelo: contenidoDeAguaEnSuelo,
        contenidoDeAguaEnPlanta : contenidoDeAguaEnPlanta,
        metodoDeMedicion : metodoDeMedicion,
        condicionSuelo : condicionSuelo
       
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

       
        
        if (parseFloat(formulario.contenidoDeAguaEnSuelo) < 0.1) {
            alert('El contenido de agua en el suelo debe ser mayor que cero.');
            return;
        }
 
        if (parseFloat(formulario.contenidoDeAguaEnPlanta) < 0.1) {
            alert('El contenido de agua en la Planta debe ser mayor que cero.');
            return;
        }
         if (formulario.metodoDeMedicion.trim() === '') {
            alert('El Metodo de medicion es requerido.');
            return;
        }
        
        if (formulario.condicionSuelo.trim() === '') {
            alert('Debe seleccionar la condicion del suelo');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idContenidoDeAgua: idContenidoDeAgua,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            idPuntoMedicion: formulario.idPuntoMedicion,
            fechaMuestreo: formatFecha(formulario.fechaMuestreo),
            contenidoDeAguaEnSuelo: formulario.contenidoDeAguaEnSuelo,
            contenidoDeAguaEnPlanta: formulario.contenidoDeAguaEnPlanta,
            metodoDeMedicion: formulario.metodoDeMedicion,
            condicionSuelo: formulario.condicionSuelo,
            usuarioCreacionModificacion: userData.identificacion,
        };
        //  Se ejecuta el servicio de modificar el registro problemas asociados a plagas y enfermedades
        const responseInsert = await ModificarRegistroContenidoDeAgua(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico el registro de contenido de Agua!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps. WaterContentList.screenName as never);
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
                const fincaParcela = {
                    idFinca: formulario.idFinca,
                    idParcela: formulario.idParcela
                }
                
                const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
                setPuntosMedicion(puntosMedicion);
                setPuntoMedicion(formulario.idPuntoMedicion);
    
                const puntoMedicionInicial = puntosMedicion.find(puntoMedicion => puntoMedicion.idPuntoMedicion === parseInt(formulario.idPuntoMedicion));

                // Establecer el nombre de la parcela inicial como selectedFinca
                setPuntoMedicion(puntoMedicionInicial?.codigo || null);
                

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);
    useEffect(() => {
        // Buscar la finca correspondiente, esto se hace para cargar las parcelas que se necesitan en dropdown porque
        // problemas asociados a plagas y enfermedades tiene una finca asignada
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

        if (!formulario.idPuntoMedicion|| formulario.idPuntoMedicion === null) {
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
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idContenidoDeAgua: idContenidoDeAgua,
        };


        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar el registro de contenido de Agua?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se inserta el identificacion en la base de datos
                        const responseInsert = await CambiarEstadoRegistroContenidoDeAgua(formData);
                        // Se ejecuta el cambio de estado
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se eliminó el registro de contenido de Agua!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps. WaterContentList.screenName
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
    const handleParcelaChange = async (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);
        setSelectedParcela(item.value);
        //se acctualiza el id parcela para que seleccione otra vez la parcela
        updateFormulario('idPuntoMedicion', '');
        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: parcelaId
        }
        
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        setPuntosMedicion(puntosMedicion)
        setPuntoMedicion(null);
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
    const confirmIOSDate = (picker) => {
        switch (picker) {
            case 'fecha':
                setShowFecha(false);
                updateFormulario('fechaMuestreo', formatSpanishDate(dateFecha));
                break;
            default:
                break;
        }
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
                <BackButtonComponent screenName={ScreenProps. WaterContentList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar Contenido de Agua</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                   <Text style={styles.formText} >Finca</Text>
                                  {empresa &&
                                   <DropdownComponent
                                   placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
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

                                <Text style={styles.formText} >Parcela:</Text>
                                
                                    <DropdownComponent
                                    placeholder={selectedParcela ? selectedParcela : "Seleccionar Parcela"}
                                    data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                    value={selectedParcela}
                                    iconName="pagelines"
                                    onChange={(selectedItem) => {
                                        // Manejar el cambio en la selección de la parcela
                                        handleParcelaChange(selectedItem);

                                        // Actualizar el formulario con la selección de la parcela
                                        updateFormulario('idParcela', selectedItem.value);
                                    }}
                                    />
                                <Text style={styles.formText} >Punto de medición:</Text>
                                    <DropdownComponent
                                        placeholder={puntoMedicion ? puntoMedicion : "Seleccionar Punto de medición"}
                                        data={puntosMedicion.map(puntoMedicion => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                        iconName='map-marker'
                                        value={puntoMedicion}
                                        onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}
                                    />

                                    <Text style={styles.formText} >Fecha Muestreo:</Text>
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
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                    </TouchableOpacity>
                                </>

                            ) : (<>
                                  <Text style={styles.formText} >Contenido de Agua en el Suelo:</Text>
                                    <TextInput
                                         maxLength={100}
                                         keyboardType='numeric'
                                          style={styles.input}
                                          placeholder="Contenido De Agua en el Suelo"
                                         value={formulario.contenidoDeAguaEnSuelo.toString()}
                                           onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
    
                                            // Verifica la cantidad de puntos en el texto
                                            const pointCount = (numericText.match(/\./g) || []).length;
                                        
                                            // Si hay más de un punto, no actualiza el estado
                                            if (pointCount > 1) {
                                              return;
                                            }
                                            updateFormulario('contenidoDeAguaEnSuelo', numericText);
                                        }}
                                    />
                                  <Text style={styles.formText} >Contenido de Agua en la Planta:</Text>
                                  <TextInput
                                    maxLength={100}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="Contenido De Agua en la Planta"
                                    value={formulario.contenidoDeAguaEnPlanta.toString()}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9.]/g, '');

                                        // Verifica la cantidad de puntos en el texto
                                        const pointCount = (numericText.match(/\./g) || []).length;
                                    
                                        // Si hay más de un punto, no actualiza el estado
                                        if (pointCount > 1) {
                                          return;
                                        }
                                        updateFormulario('contenidoDeAguaEnPlanta', numericText);
                                    }}
                                    
                                />

                                <Text style={styles.formText} >Metodo de Medicion:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Metodo de Medicion"
                                    value={formulario.metodoDeMedicion}
                                    onChangeText={(text) => updateFormulario('metododeMedicion', text)}
                                    maxLength={200}
                                />



                                 <Text style={styles.formText} >Condicion del Suelo:</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione"
                                        data={[
                                            { label: "Compacto", value: "Compacto" },
                                            { label: "Suelto", value: "Suelto" },
                                            { label: "Erosionado", value: "Erosionado" },
                                            { label: "Saturado", value: "Saturado" },
                                            { label: "Arenoso", value: "Arenoso" }
                                
                                        ]}
                                        value={formulario.condicionSuelo}
                                        iconName=""
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('condicionSuelo', selectedItem.value);
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
                                            <Ionicons name="trash-bin" size={20} color="white" style={styles.iconStyle} />
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