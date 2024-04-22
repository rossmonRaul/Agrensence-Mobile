import React, { useState, useEffect } from 'react';
import { Button, Pressable, View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { ActualizarManejoFertilizantes, CambiarEstadoManejoFertilizantes } from '../../../../servicios/ServicioFertilizantes';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { CambiarEstadoProductividadCultivo, EditarProductividadCultivo } from '../../../../servicios/ServicioCultivos';
interface RouteParams {
    idFinca: string;
    idParcela: string;
    idManejoProductividadCultivo: string;
    cultivo: string;
    temporada: string;
    area: number;
    produccion: number;
    productividad: number;
    estado: string;
}

export const ModificarProductividadScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [temporadas, setTemporadas] = useState<{ nombre: string }[] | []>([]);
    // Se agregan las temporadas deseadas al cargar el componente
    useEffect(() => {
        setTemporadas([
            { nombre: 'Lluviosa' },
            { nombre: 'Seca' }
        ]);
    }, []);
    const { idManejoProductividadCultivo, idFinca, idParcela, cultivo, temporada, area,
        produccion, productividad, estado } = route.params as RouteParams;
    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    const [selectedTemporada, setSelectedTemporada] = useState<string | null>(null);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        idManejoProductividadCultivo: idManejoProductividadCultivo,
        cultivo: cultivo,
        temporada: temporada,
        area: area,
        produccion: produccion,
        productividad: productividad
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };
    //funcion para validar que todo este completo en la primera parte del formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.cultivo && !formulario.temporada && !formulario.area &&
            !formulario.produccion && !formulario.productividad) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }

        if (!formulario.cultivo) {
            alert('Ingrese una cultivo');
            isValid = false;
            return
        }

        if (!formulario.area) {
            alert('Ingrese el área');
            isValid = false;
            return
        }

        if (!/^\d+(\.\d+)?$/.test(formulario.area.toString())) {
            alert('El área debe contener solo números y si son decimales utilizar .');
            isValid = false;
            return;
        }

        if (!formulario.produccion) {
            alert('Ingrese la producción');
            isValid = false;
            return
        }

        if (!/^\d+(\.\d+)?$/.test(formulario.produccion.toString())) {
            alert('La producción debe contener solo números válidos y si son decimales utilizar . ');
            isValid = false;
            return;
        }



        if (!formulario.productividad) {
            alert('Ingrese la productividad');
            isValid = false;
            return
        }

        if (!/^\d+(\.\d+)?$/.test(formulario.productividad.toString())) {
            alert('La productividad debe contener solo números y si son decimales utilizar .');
            isValid = false;
            return;
        }

        return isValid
    }
    // Se define una función para manejar el registro del manejo de fertilizantes
    const handleRegister = async () => {

        if (!formulario.temporada || formulario.temporada === null) {
            alert('Seleccione la temporada');
            return
        }

        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Seleccione la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Seleccione la Parcela');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            IdFinca: formulario.idFinca,
            IdParcela: formulario.idParcela,
            Cultivo: formulario.cultivo,
            Temporada: selectedTemporada,
            Area: formulario.area,
            Produccion: formulario.produccion,
            Productividad: formulario.productividad,
            IdManejoProductividadCultivo: idManejoProductividadCultivo,
            Usuario: userData.identificacion
        };

        //  Se ejecuta el servicio de isertar el manejo de fertilizante
        const responseInsert = await EditarProductividadCultivo(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Exito en modificar!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.AdminCrops.screenName as never);
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

                setParcelas(parcelasUnicas)

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
        setSelectedTemporada(temporada || null)
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
    //funcion para desactivar o activar el manejo de fertilizantes
    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            IdManejoProductividadCultivo: idManejoProductividadCultivo,
        };

        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de estado',
            '¿Estás seguro de que deseas cambiar el estado del registro?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se ejecuta el servicio para cambiar el estado del manejo del fertilizante
                        const responseInsert = await CambiarEstadoProductividadCultivo(formData);
                        //Se valida si los datos recibidos de la api son correctos
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el estado del registro correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.AdminCrops.screenName
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
                <BackButtonComponent screenName={ScreenProps.AdminCrops.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar productividad</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>

                                    <Text style={styles.formText} >Cultivo</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cultivo"
                                        value={formulario.cultivo}
                                        onChangeText={(text) => updateFormulario('cultivo', text)}
                                    />
                                    <Text style={styles.formText} >Área (ha)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Área"
                                        value={formulario.area.toString()}
                                        onChangeText={(text) => updateFormulario('area', text)}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Producción (ton)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Producción"
                                        value={formulario.produccion.toString()}
                                        onChangeText={(text) => updateFormulario('produccion', text)}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Productividad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Productividad"
                                        value={formulario.productividad.toString()}
                                        onChangeText={(text) => updateFormulario('productividad', text)}
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

                            ) : (
                                <>
                                    <Text style={styles.formText} >Temporada</Text>
                                    {/* Dropdown para Temporadas */}
                                    <DropdownComponent
                                        placeholder="Seleccione una Temporada"
                                        data={temporadas.map(temporadas => ({ label: temporadas.nombre, value: String(temporadas.nombre) }))}
                                        value={selectedTemporada}
                                        iconName="sun-o"
                                        onChange={(selectedItem) => {
                                            // Manejar el cambio en la selección de la finca
                                            setSelectedTemporada(selectedItem.value);

                                            // Actualizar el formulario con la selección de la finca
                                            updateFormulario('temporada', selectedItem.value);
                                        }}
                                    />

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
                                    <View style={styles.buttonContainer}>
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
                                            style={[styles.button, { width: 150 }]}
                                            onPress={() => {
                                                handleRegister();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Guardar</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

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