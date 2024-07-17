import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation } from '@react-navigation/native';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropdownData } from '../../../../hooks/useFetchDropDownData';
import { UseFetchDropdownDataProps } from '../../../../hooks/useFetchDropDownData';
import { FincaInterface } from '../../../../interfaces/empresaInterfaces';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { useFetchDropdownData } from '../../../../hooks/useFetchDropDownData';
import { InsertarRegistroCantidadDePlantas,ObtenerPuntoMedicionFincaParcela } from '../../../../servicios/ServicioCantidadDePlantas';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';

export const InsertarCantidadDePlantasScreen: React.FC = () => {
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

    const [dateFecha, setDateFecha] = useState(new Date())

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        idPuntoMedicion:puntoMedicion,
        identificacionUsuario: userData.identificacion,
        cultivo: '',
        cantidadPromedioMetroCuadrado:'',
        usuarioCreacionModificacion: ''
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };


    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        setParcela(null);
        setPuntoMedicion(null);
        updateFormulario('idFinca', itemValue.value)
        obtenerParcelasPorFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);

    }

    const handleValueParcela = async (itemValue: any) => {
        setParcela(itemValue.value);

        const fincaParcela = {
            idFinca: finca,
            idParcela: itemValue.value
        }

        setPuntoMedicion(null);
        updateFormulario('idParcela', itemValue.value)
        
        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
        setPuntosMedicion(puntosMedicion)
        

    }

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
        

        return isValid;
    };


    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {
        if (formulario.cultivo.trim() === '') {
            alert('El campo Cultivo es requerido.');
            return;
        }
        
        if (formulario.cantidadPromedioMetroCuadrado.trim() === '') {
            alert('El campo de cantidad promedio (m²) requerido.');
            return;
        }


        console.log('formulario antes de insertar')
        console.log(formulario)
        console.log('formulario antes de insertar')
        
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            idPuntoMedicion: formulario.idPuntoMedicion,
            usuarioCreacionModificacion: userData.identificacion,
            cultivo: formulario.cultivo,
            cantidadPromedioMetroCuadrado:formulario.cantidadPromedioMetroCuadrado,
        };
        //  Se ejecuta el servicio de insertar problemas asociados a plagas y enfermedades
        const responseInsert = await InsertarRegistroCantidadDePlantas(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se registro el registro de cantidad de plantas correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.NumberOfPlantsList.screenName as never);
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

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {

            const parcelasFiltradas = parcelas.filter(item => item.idFinca == fincaId);

            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
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
                <BackButtonComponent screenName={ScreenProps.NumberOfPlantsList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Insertar cantidad de plantas</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>

                                <Text style={styles.formText} >Finca</Text>
                                  {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                }

                                <Text style={styles.formText} >Parcela</Text>
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={handleValueParcela}
                                    />

                                <Text style={styles.formText} >Punto de medición</Text>
                                    <DropdownComponent
                                        placeholder="Punto de medición"
                                        data={puntosMedicion.map(puntoMedicion => ({ label: puntoMedicion.codigo, value: String(puntoMedicion.idPuntoMedicion) }))}
                                        iconName='map-marker'
                                        value={puntoMedicion}
                                        onChange={(item) => (setPuntoMedicion(item.value as never), (updateFormulario('idPuntoMedicion', item.value)))}
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

                                <Text style={styles.formText} >Cultivo</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cultivo"
                                        value={formulario.cultivo}
                                        onChangeText={(text) => updateFormulario('cultivo', text)}
                                        maxLength={50}
                                    />
                                <Text style={styles.formText} >Cantidad Promedio (m²)</Text>
                                <TextInput
                                    maxLength={100}
                                    keyboardType='numeric'
                                    style={styles.input}
                                    placeholder="0.0"
                                    value={formulario.cantidadPromedioMetroCuadrado}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9.]/g, '');

                                        // Verifica la cantidad de puntos en el texto
                                        const pointCount = (numericText.match(/\./g) || []).length;
                                    
                                        // Si hay más de un punto, no actualiza el estado
                                        if (pointCount > 1) {
                                          return;
                                        }// Elimina caracteres no numéricos menos las comas y puntos
                                        updateFormulario('cantidadPromedioMetroCuadrado', numericText);
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
                                            handleRegister();
                                        }}
                                    >
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
}