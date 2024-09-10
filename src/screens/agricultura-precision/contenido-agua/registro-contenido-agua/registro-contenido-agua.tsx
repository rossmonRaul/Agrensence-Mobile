import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import { InsertarRegistroContenidoDeAgua,ObtenerPuntoMedicionFincaParcela } from '../../../../servicios/ServicioContenidoAgua';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
interface ButtonAlert{
    text: string;
    onPress: () => void;
  }

export const InsertarContenidoAguaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
   // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();


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
        fechaMuestreo:'',
        contenidoDeAguaEnSuelo: '',
        contenidoDeAguaEnPlanta:'',
        metodoDeMedicion:'',
        condicionSuelo:'',
        usuarioCreacionModificacion: ''


        
    });
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as ButtonAlert[], // Define el tipo explícitamente
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
                navigation.navigate(ScreenProps.WaterContentList.screenName as never);
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

   // Función para obtener la fecha po defecto 


// const getTodayDate = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     let month = today.getMonth() + 1;
//     let day = today.getDate();

//     // Asegurar que el mes y el día tengan dos dígitos
//     const formattedMonth = month < 10 ? "0" + month : month.toString();
//     const formattedDay = day < 10 ? "0" + day : day.toString();

//     return formattedDay + "-" + formattedMonth + "-" + year;
// };


// // En useEffect para inicializar la fecha al cargar la pantalla
// useEffect(() => {
//     const todayDate = getTodayDate();
//     setFormulario(prevState => ({
//         ...prevState,
//         fechaMuestreo: todayDate
//     }));
// }, []);


const getTodayDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // Asegurar que el día y el mes tengan dos dígitos
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;

    return `${formattedDay}/${formattedMonth}/${year}`;
};

const formatFecha = (fecha: string) => {
    const parts = fecha.split('/');
    if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return fecha; // En caso de error, devolver la fecha original
};


useEffect(() => {
    const todayDate = getTodayDate();
    setFormulario(prevState => ({
        ...prevState,
        fechaMuestreo: todayDate
    }));
}, []);



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
            showInfoAlert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            isValid = false;
            showInfoAlert('Ingrese la Parcela');
            return;
        }

        if (!formulario.idPuntoMedicion|| formulario.idPuntoMedicion === null) {
            isValid = false;
            showInfoAlert('Ingrese el punto de Medición');
            return;
        }
        
        if (formulario.fechaMuestreo.trim() === '') {
            isValid = false;
            showInfoAlert('La fecha es requerida.');
            return isValid;
        }


        return isValid;
    };


    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {
        if (formulario.contenidoDeAguaEnSuelo.trim() === '') {
            showInfoAlert('El Contenido de Agua en el Suelo es requerido.');
            return;
        }
        
        if (formulario.contenidoDeAguaEnPlanta.trim() === '') {
            showInfoAlert('El Contenido de Agua en la Planta es requerido.');
            return;
        }

        if (formulario.metodoDeMedicion.trim() === '') {
            showInfoAlert('El Metodo de Medicion es requerido.');
            return;
        }

        if (formulario.condicionSuelo.trim() === '') {
            showInfoAlert('La Condicion del Suelo es requerido.');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            idPuntoMedicion: formulario.idPuntoMedicion,
            usuarioCreacionModificacion: userData.identificacion,
            fechaMuestreo: formatFecha(formulario.fechaMuestreo),
            contenidoDeAguaEnSuelo: formulario.contenidoDeAguaEnSuelo,
            contenidoDeAguaEnPlanta:formulario.contenidoDeAguaEnPlanta,
            metodoDeMedicion:formulario.metodoDeMedicion,
            condicionSuelo: formulario.condicionSuelo,
        };
        //  Se ejecuta el servicio de insertar problemas asociados a plagas y enfermedades
        const responseInsert = await InsertarRegistroContenidoDeAgua(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se registro de contenido de Agua correctamente!')
            // Alert.alert('¡Se registro de contenido de Agua correctamente!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.WaterContentList.screenName as never);
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

    const obtenerFincaProps= useMemo(() => ({
        fetchDataFunction: () => ObtenerFincas(userData.idEmpresa),
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    }), [userData.idEmpresa]);

    const obtenerParcelaProps= useMemo(() => ({
        fetchDataFunction: () => ObtenerParcelas(userData.idEmpresa),
        setDataFunction: setParcelaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idParcela',
        idKey: 'idFinca',
    }), [userData.idEmpresa]);


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
                <BackButtonComponent screenName={ScreenProps.WaterContentList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Insertar Contenido de Agua</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {!isSecondFormVisible ? (
                                <>

                                <Text style={styles.formText} >Finca:</Text>
                                  {empresa &&
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                }

                                <Text style={styles.formText} >Parcela:</Text>
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={handleValueParcela}
                                    />

                                <Text style={styles.formText} >Punto de medición:</Text>
                                    <DropdownComponent
                                        placeholder="Punto de medición"
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
                                        <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.iconStyleRight} />
                                        </View>
                                    </TouchableOpacity>
                                </>

                            ) : (<>

                                <Text style={styles.formText} >Contenido de Agua en el Suelo:</Text>
                                <TextInput
                                        style={styles.input}
                                         keyboardType='numeric'
                                        placeholder="Contenido De Agua en el Suelo"
                                        value={formulario.contenidoDeAguaEnSuelo}
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
                                    onChangeText={(text) => updateFormulario('metodoDeMedicion', text)}
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
                                            handleRegister();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Guardar Contenido de Agua</Text>
                                        </View>
                                    </TouchableOpacity>
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.WaterContentList.screenName as never) : undefined}
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