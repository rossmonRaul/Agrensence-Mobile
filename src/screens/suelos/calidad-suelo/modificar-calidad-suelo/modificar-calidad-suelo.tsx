import React, { useState, useEffect } from 'react';
import { View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { FontAwesome } from '@expo/vector-icons';
import { ModificarMedicionesSuelo, CambiarEstadoMedicionesSuelo } from '../../../../servicios/ServicioCalidadSuelo';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

//datos desde la lista para mostrarlos en los input
interface RouteParams {
    idMedicionesSuelo: string
    medicionesCalidadSuelo: string;
    respiracionSuelo: number;
    infiltracion: number;
    densidadAparente: number;
    conductividadElectrica: number;
    ph: number;
    nitratosSuelo: number;
    estabilidadAgregados: number;
    desleimiento: number;
    lombrices: number;
    observaciones: string;
    calidadAgua: number;
    idFinca: string;
    idParcela: string;
    estado: string;
}
export const ModificarCalidadSueloScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();


    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [isThirdFormVisible, setThirdFormVisible] = useState(false);

    const route = useRoute();
    const { idMedicionesSuelo, medicionesCalidadSuelo, respiracionSuelo, infiltracion,
        densidadAparente, conductividadElectrica,
        ph, nitratosSuelo, estabilidadAgregados, desleimiento, lombrices,
        observaciones, calidadAgua, idFinca, idParcela, estado } = route.params as RouteParams;

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        medicionesCalidadSuelo: medicionesCalidadSuelo,
        respiracionSuelo: respiracionSuelo,
        infiltracion: infiltracion,
        densidadAparente: densidadAparente,
        conductividadElectrica: conductividadElectrica,
        ph: ph,
        nitratosSuelo: nitratosSuelo,
        estabilidadAgregados: estabilidadAgregados,
        desleimiento: desleimiento,
        lombrices: lombrices,
        observaciones: observaciones,
        calidadAgua: calidadAgua,
        idFinca: idFinca,
        idParcela: idParcela,
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    //validar la primera parte del formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.medicionesCalidadSuelo && !formulario.respiracionSuelo &&
            !formulario.infiltracion && !formulario.densidadAparente && !formulario.conductividadElectrica) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.medicionesCalidadSuelo) {
            alert('Ingrese una Medicion de la Calidad del Suelo');
            isValid = false;
            return
        }
        if (!formulario.respiracionSuelo) {
            alert('Ingrese la Respiracion del Suelo');
            isValid = false;
            return
        }
        if (!formulario.infiltracion) {
            alert('Ingrese la Infiltracion');
            isValid = false;
            return
        }
        if (!formulario.densidadAparente) {
            alert('Ingrese la Densidad Aparente');
            isValid = false;
            return
        }
        if (!formulario.conductividadElectrica) {
            alert('Ingrese la Conductividad Electrica');
            isValid = false;
            return
        }

        return isValid
    }
    //validar la segunda parte el formulario
    const validateSecondForm = () => {
        let isValid = true;

        if (!formulario.ph && !formulario.nitratosSuelo &&
            !formulario.estabilidadAgregados && !formulario.desleimiento && !formulario.lombrices) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (!formulario.ph) {
            alert('Ingrese el Ph');
            isValid = false;
            return
        }
        if (!formulario.nitratosSuelo) {
            alert('Ingrese el Nitrato del Suelo');
            isValid = false;
            return
        }
        if (!formulario.estabilidadAgregados) {
            alert('Ingrese la Estabilidad Agregados');
            isValid = false;
            return
        }
        if (!formulario.desleimiento) {
            alert('Ingrese el Desleimiento');
            isValid = false;
            return
        }
        if (!formulario.lombrices) {
            alert('Ingrese la Canitdad de lombrices');
            isValid = false;
            return
        }

        return isValid
    }
    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {

        if (!formulario.observaciones && !formulario.calidadAgua) {
            alert('Por favor rellene el formulario');
            return
        }

        if (!formulario.observaciones) {
            alert('Ingrese las Observaciones');
            return
        }
        if (!formulario.calidadAgua) {
            alert('Ingrese la Calidad del Agua');
            return
        }
        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMedicionesSuelo: idMedicionesSuelo,
            medicionesCalidadSuelo: formulario.medicionesCalidadSuelo,
            respiracionSuelo: formulario.respiracionSuelo,
            infiltracion: formulario.infiltracion,
            densidadAparente: formulario.densidadAparente,
            conductividadElectrica: formulario.conductividadElectrica,
            ph: formulario.ph,
            nitratosSuelo: formulario.nitratosSuelo,
            estabilidadAgregados: formulario.estabilidadAgregados,
            desleimiento: formulario.desleimiento,
            lombrices: formulario.lombrices,
            observaciones: formulario.observaciones,
            calidadAgua: formulario.calidadAgua,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
        };

        //  Se ejecuta el servicio de de modificar calidad de suelo
        const responseInsert = await ModificarMedicionesSuelo(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se modifico la calidad del suelo correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListQualityFloorScreen.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
        }
    };


    //funcion para desactivar o activar el mediciones de suelo
    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idMedicionesSuelo: idMedicionesSuelo,
        };

        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado del de la calidad del suelo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se ejecuta el servicio para cambiar el estado del mediciones de suelo
                        const responseInsert = await CambiarEstadoMedicionesSuelo(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado del de la calidad del suelo correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.ListQualityFloorScreen.screenName
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

                setParcelas(parcelasUnicas)

                const cargaInicialParcelas = parcelasUnicas.filter((parcela: any) => fincasUnicas.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);

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
    // esto es para cargar el nombre de la parcela con id Parcela que ya viene con el fertilizante
    useEffect(() => {
        // Buscar la parcela correspondiente
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));

        // Establecer el nombre de la parcela inicial como selectedFinca
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

    //se obtienen las parcelas con la finca
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
    //funcion para la accion de dropdown
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        //se acctualiza el id parcela para que seleccione otra vez la parcela
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela')
        //se obtienen las parcelas de la finca
        obtenerParcelasPorFinca(fincaId);
    };

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
                <BackButtonComponent screenName={ScreenProps.ListQualityFloorScreen.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar Calidad del Suelo</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible && !isThirdFormVisible && (
                                <>

                                    <Text style={styles.formText} >Medicion del Suelo</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Calidad del Suelo"
                                        value={formulario.medicionesCalidadSuelo}
                                        onChangeText={(text) => updateFormulario('medicionesCalidadSuelo', text)}
                                    />
                                    <Text style={styles.formText} >Respiración del Suelo (mg CO2-C/g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Respiración del Suelo"
                                        value={formulario.respiracionSuelo.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('respiracionSuelo', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Infiltración (mm/hora)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Infiltración"
                                        value={formulario.infiltracion.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('infiltracion', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Densidad Aparente (g/cm³)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Densidad Aparente"
                                        value={formulario.densidadAparente.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('densidadAparente', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Conductividad Electrica (ds/m)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Conductividad Electrica"
                                        value={formulario.conductividadElectrica.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('conductividadElectrica', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
                                            const isValid = validateFirstForm();

                                            if (isValid) {
                                                setSecondFormVisible(true);
                                                setThirdFormVisible(false)
                                            }

                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyleRight} />
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}

                            {isSecondFormVisible && !isThirdFormVisible && (

                                <>

                                    <Text style={styles.formText} >Ph (unidad de ph)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ph"
                                        value={formulario.ph.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('ph', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Nitratos de Suelo (mg/kg)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nitratos de Suelo"
                                        value={formulario.nitratosSuelo.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('nitratosSuelo', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Estabilidad de Agregados (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Estabilidad de Agregados"
                                        value={formulario.estabilidadAgregados.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('estabilidadAgregados', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Desleimiento (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Desleimiento"
                                        value={formulario.desleimiento.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('desleimiento', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Lombrices (número de lombrices/m²)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Lombrices"
                                        value={formulario.lombrices.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, ''); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('lombrices', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => {
                                                setSecondFormVisible(false);
                                                setThirdFormVisible(false)
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="arrow-back-outline" size={20} color="black" style={styles.iconStyle} />
                                                <Text style={styles.buttonTextBack}> Atrás</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, { width: 150 }]}
                                            onPress={async () => {
                                                const isValid = validateSecondForm();

                                                if (isValid) {
                                                    setSecondFormVisible(false);
                                                    setThirdFormVisible(true)
                                                }

                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Text style={styles.buttonText}>Siguiente </Text>
                                                <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyle} />

                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </>


                            )}

                            {!isSecondFormVisible && isThirdFormVisible && (

                                <>
                                    <Text style={styles.formText} >Finca</Text>
                                    {/* Dropdown para Fincas */}
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
                                    <Text style={styles.formText} >Parcela</Text>
                                    {/* Dropdown para Parcelas */}
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

                                    <Text style={styles.formText} >Observaciones</Text>
                                    <TextInput
                                        style={styles.inputMultiline}
                                        placeholder="Observaciones de la Fisica del Suelo"
                                        value={formulario.observaciones}
                                        onChangeText={(text) => updateFormulario('observaciones', text)}
                                        multiline
                                        numberOfLines={5}
                                    />
                                    <Text style={styles.formText} >Calidad del Agua (mg/L)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Calidad del Agua"
                                        value={formulario.calidadAgua.toString()}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9.,]/g, '').replace(',', '.'); // Elimina caracteres no numéricos menos las comas y puntos
                                            updateFormulario('calidadAgua', numericText);
                                        }}
                                        keyboardType="numeric"
                                    />
                                    

                                    
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => {
                                                setSecondFormVisible(true);
                                                setThirdFormVisible(false)
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
                                                handleRegister();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Guardar</Text>
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
                                                <Text style={styles.buttonText}> Desactivar</Text>
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            style={styles.buttonActive}
                                            onPress={() => {
                                                handleChangeAccess();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Activar</Text>
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