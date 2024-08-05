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
import { ModificarPreparacionTerreno, CambiarEstadoPreparacionTerreno } from '../../../../servicios/ServicioPreparacionTerreno';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { ObtenerDatosPreparacionTerrenoActividad, ObtenerDatosPreparacionTerrenoMaquinaria } from '../../../../servicios/ServicioPreparacionTerreno';

interface RouteParams {
    idPreparacionTerreno: string;
    idFinca: string;
    idParcela: string;
    fecha: string;
    idActividad: string; 
    idMaquinaria: string; 
    observaciones: string;
    identificacion: string;
    horasTrabajadas: string;
    pagoPorHora: string;
    estado: string;
}

export const ModificarPreparacionTerrenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const { idPreparacionTerreno, idFinca, idParcela, fecha, idActividad, idMaquinaria, observaciones, identificacion, horasTrabajadas, pagoPorHora, estado } = route.params as RouteParams;

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [actividades, setActividades] = useState<{ idActividad: number; nombre: string }[]>([]);
    const [maquinarias, setMaquinarias] = useState<{ idMaquinaria: number; nombre: string }[]>([]);

    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        fecha: fecha,
        idActividad: idActividad,
        idMaquinaria: idMaquinaria,
        observaciones: observaciones,
        identificacion: identificacion,
        horasTrabajadas: horasTrabajadas,
        pagoPorHora: pagoPorHora
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.fecha && !formulario.idActividad && !formulario.idMaquinaria) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return;
        }
        if (!formulario.fecha) {
            alert('Ingrese una fecha');
            isValid = false;
            return;
        }
        if (!formulario.idActividad) {
            alert('Ingrese una actividad');
            isValid = false;
            return;
        }
        if (!formulario.idMaquinaria) {
            alert('Ingrese una maquinaria');
            isValid = false;
            return;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!formulario.observaciones) {
            alert('Por favor rellene el formulario');
            return;
        }

        if (!formulario.observaciones) {
            alert('Ingrese las Observaciones');
            return;
        }

        if (!formulario.idFinca || formulario.idFinca === null) {
            alert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            alert('Ingrese la Parcela');
            return;
        }

        const formData = {
            idPreparacionTerreno: idPreparacionTerreno,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            fecha: formatDate(),
            idActividad: formulario.idActividad,
            idMaquinaria: formulario.idMaquinaria,
            observaciones: formulario.observaciones,
            identificacion: formulario.identificacion,
            horasTrabajadas: parseFloat(formulario.horasTrabajadas),  
            pagoPorHora: parseFloat(formulario.pagoPorHora),          
            totalPago: parseFloat(formulario.horasTrabajadas) * parseFloat(formulario.pagoPorHora),  
            usuarioCreacionModificacion: userData.identificacion,
        };
        

        const responseInsert = await ModificarPreparacionTerreno(formData);

        if (responseInsert.indicador === 1) {
            Alert.alert('¡Exito en modificar!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListLandPreparation.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal');
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

                const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
                setActividades(actividadesResponse);

                const maquinariasResponse = await ObtenerDatosPreparacionTerrenoMaquinaria();
                setMaquinarias(maquinariasResponse);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
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
    }, [idFinca, fincas]);

    useEffect(() => {
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);

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

    const handleChangeAccess = async () => {
        const formData = {
            idPreparacionTerreno: idPreparacionTerreno,
        };

        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar el registro?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const responseInsert = await CambiarEstadoPreparacionTerreno(formData);
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Registro eliminado con éxito!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(ScreenProps.ListLandPreparation.screenName);
                                        },
                                    },
                                ]
                            );
                        } else {
                            alert('¡Oops! Parece que algo salió mal al eliminar el registro.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const formatSpanishDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    };

    const formatDate = () => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        return `${year}-${month}-${day}`;
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = ({ type }, selectedDate) => {
        if (type === "set" && selectedDate instanceof Date) {
            const formattedDate = formatSpanishDate(selectedDate);
            setDate(selectedDate);
            updateFormulario('fecha', formattedDate);
            if (Platform.OS === "android") {
                toggleDatePicker();
            }
        } else {
            toggleDatePicker();
        }
    };

    const confirmIOSDate = () => {
        toggleDatePicker();
        updateFormulario('fecha', formatSpanishDate(date));
    };

    const handleNumericInput = (text: string, field: string) => {
        const numericValue = text.replace(/[^0-9.,]/g, ''); // Remover cualquier cosa que no sea número, punto o coma
        updateFormulario(field, numericValue);
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
                <BackButtonComponent screenName={ScreenProps.ListLandPreparation.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText} >Modificar Preparación de Terreno</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText}>Fecha</Text>
                                    {!showPicker && (
                                        <Pressable onPress={toggleDatePicker}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="01/07/24"
                                                value={formulario.fecha}
                                                onChangeText={(text) => updateFormulario('fecha', text)}
                                                editable={false}
                                                onPressIn={toggleDatePicker}
                                            />
                                        </Pressable>
                                    )}

                                    {showPicker && (
                                        <DateTimePicker
                                            mode="date"
                                            display='spinner'
                                            value={date}
                                            onChange={onChange}
                                            style={styles.dateTimePicker}
                                            maximumDate={new Date()}
                                            minimumDate={new Date('2015-1-2')}
                                        />
                                    )}
                                    {showPicker && Platform.OS === 'ios' && (
                                        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                            <TouchableOpacity
                                                style={[styles.buttonPicker, styles.pickerButton, { backgroundColor: "#11182711" }]}
                                                onPress={toggleDatePicker}
                                            >
                                                <Text style={[styles.buttonTextPicker, { color: "#075985" }]}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.buttonPicker, styles.pickerButton, { backgroundColor: "#11182711" }]}
                                                onPress={confirmIOSDate}
                                            >
                                                <Text style={[styles.buttonTextPicker, { color: "#075985" }]}>Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <Text style={styles.formText} >Actividad</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione una Actividad"
                                        data={actividades.map(act => ({ label: act.nombre, value: String(act.idActividad) }))}
                                        value={String(formulario.idActividad)}
                                        iconName="list"
                                        onChange={(selectedItem) => {
                                            updateFormulario('idActividad', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Maquinaria</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione una Maquinaria"
                                        data={maquinarias.map(maq => ({ label: maq.nombre, value: String(maq.idMaquinaria) }))}
                                        value={String(formulario.idMaquinaria)}
                                        iconName="gears"
                                        onChange={(selectedItem) => {
                                            updateFormulario('idMaquinaria', selectedItem.value);
                                        }}
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
                                    <Text style={styles.formText} >Identificación</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Identificación"
                                        value={formulario.identificacion}
                                        onChangeText={(text) => updateFormulario('identificacion', text)}
                                    />
                                    <Text style={styles.formText} >Horas Trabajadas</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Horas Trabajadas"
                                        value={String(formulario.horasTrabajadas)}
                                        onChangeText={(text) => handleNumericInput(text, 'horasTrabajadas')}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Pago por Hora</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pago por Hora"
                                        value={String(formulario.pagoPorHora)}
                                        onChangeText={(text) => handleNumericInput(text, 'pagoPorHora')}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.formText} >Finca</Text>
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
                                    <Text style={styles.formText} >Parcela</Text>
                                    <DropdownComponent
                                        placeholder={selectedParcela ? selectedParcela : "Seleccionar Parcela"}
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        value={selectedParcela}
                                        iconName="pagelines"
                                        onChange={(selectedItem) => {
                                            setSelectedParcela(selectedItem.value);
                                            updateFormulario('idParcela', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Observaciones</Text>
                                    <TextInput
                                        style={styles.inputMultiline}
                                        placeholder="Observaciones"
                                        value={formulario.observaciones}
                                        onChangeText={(text) => updateFormulario('observaciones', text)}
                                        multiline
                                        numberOfLines={5}
                                    />
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.button, { width: '100%' }]}
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
                                                <Ionicons name="trash" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Eliminar</Text>
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
