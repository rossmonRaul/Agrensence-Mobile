import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import ConfirmAlert from '../../../../components/CustomAlert/ConfirmAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';

interface Button {
    text: string;
    onPress: () => void;
  }

interface RouteParams {
    idMonitoreoEficienciaRiego: string,
    idFinca: string,
    idParcela: string,
    volumenAguaUtilizado: number,
    estadoTuberiasYAccesorios: boolean,
    uniformidadRiego: boolean,
   // estadoAspersores: boolean,
    estadoCanalesRiego: boolean,
    nivelFreatico: number,
    uniformidadalerta: string,
    uniformidaddetalles: string,
    fugasalerta: string,
    fugasdetalles: string,
    canalesalerta: string,
    canalesdetalles: string,
    estado: string
}

export const ModificarMonitoreoEficienciaRiegoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
      const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();

    const route = useRoute();

    const { idMonitoreoEficienciaRiego,
        idFinca,
        idParcela,
        volumenAguaUtilizado,
        estadoTuberiasYAccesorios,
        uniformidadRiego,
        //estadoAspersores,
        estadoCanalesRiego,
        nivelFreatico,
        uniformidadalerta,
        uniformidaddetalles,
        fugasalerta,
        fugasdetalles,
        canalesalerta,
        canalesdetalles,
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
   // const [estadoAspersoresModificar, setEstadoAspersores] = useState(estadoAspersores || false);
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
                navigation.navigate(ScreenProps.ListIrrigationEfficiency.screenName as never);
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
	Keyboard.dismiss();
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
	Keyboard.dismiss();
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

      const showConfirmAlert = async () => {
        setAlertVisibleEstado(true);
      };
    const handleCheckBoxChange = (isChecked, setStateFunction, clearFields) => {
        setStateFunction(isChecked); // Actualiza el estado del checkbox
        if (!isChecked) {
            clearFields(); // Limpiar campos si el checkbox se desmarca
        }
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        identificacionUsuario: userData.identificacion,
        consumoAgua: volumenAguaUtilizado || '',
        estadoTuberias: estadoTuberiasYAccesorios || '',
        uniformidadRiego: uniformidadRiego || '',
        //estadoAspersores: estadoAspersores || '',
        estadoCanalesRiego: estadoCanalesRiego || '',
        nivelFreatico: nivelFreatico || '',
        uniformidadalerta: uniformidadalerta|| '',
        uniformidaddetalles: uniformidaddetalles || '',
        fugasalerta: fugasalerta || '',
        fugasdetalles: fugasdetalles || '',
        canalesalerta: canalesalerta || '',
        canalesdetalles: canalesdetalles|| '',
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
           // estadoAspersores: estadoAspersoresModificar,
            estadoCanalesRiego: estadoCanalesRiegoModificar,
            nivelFreatico: formulario.nivelFreatico,
            uniformidadalerta: formulario.uniformidadalerta,
            uniformidaddetalles: formulario.uniformidaddetalles,
            fugasalerta: formulario.fugasalerta,
            fugasdetalles: formulario.fugasdetalles,
            canalesalerta: formulario.canalesalerta,
            canalesdetalles: formulario.canalesdetalles,
            
            
        };

        //  Se ejecuta el servicio de insertar el monitoreo de eficiencia de riego
        const responseInsert = await ActualizarRegistroEficienciaRiego(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se modifico el registro de monitoreo eficiencia de riego!')
            // Alert.alert('¡Se modifico el registro de monitoreo eficiencia de riego!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.ListIrrigationEfficiency.screenName as never);
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

        try {
            const responseInsert = await CambiarEstadoRegistroEficienciaRiego(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert('¡Se actualizó el estado de esta rotación de monitoreo eficiencia riego!');
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
        //     'Confirmar cambio de estado',
        //     '¿Estás seguro de que deseas cambiar el estado del monitoreo eficiencia riego?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se inserta el identificacion en la base de datos
        //                 const responseInsert = await CambiarEstadoRegistroEficienciaRiego(formData);
        //                 // Se ejecuta el cambio de estado
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se actualizó el estado de esta rotación de monitoreo eficiencia riego!',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.ListIrrigationEfficiency.screenName
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
                                    <Text style={styles.formText} >Consumo agua (L)</Text>
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
                                        <View style={styles.checkboxContainer}>
                                          <Text style={styles.formText}>Fugas en el sistema de riego</Text>
                                            <CheckBox
                                              checked={estadoTuberiasModificar}
                                                checkedIcon='check-square-o'
                                                 uncheckedIcon='square-o'
                                                    checkedColor='#578458'
                                                     uncheckedColor='#578458'
                                                     onPress={() => handleCheckBoxChange(
                                                       !estadoTuberiasModificar,
                                                       setEstadoTuberias, // Asegúrate de usar la función correcta
                                                       () => {
                                                        updateFormulario('fugasalerta', ''); // Limpiar campo
                                                         updateFormulario('fugasdetalles', ''); // Limpiar campo
                                                        }
                                                     )}
                                                  containerStyle={styles.checkbox}
                                           />
                                     </View>

                                        {estadoTuberiasModificar && (
                                           <>
                                              <Text style={styles.formText}>Rango de alerta de fugas en el sistema de riego:</Text>
                                                  <DropdownComponent
                                                   placeholder="Seleccione"
                                                    data={[
                                                    { label: "Bajo", value: "Bajo" },
                                                    { label: "Medio", value: "Medio" },
                                                    { label: "Alto", value: "Alto" },
                                                    ]}
                                                   value={formulario.fugasalerta}
                                                    iconName=""
                                                     onChange={(selectedItem) => updateFormulario('fugasalerta', selectedItem.value)}
                                                 />
                                            <Text style={styles.formText}>Detalles de fugas en el sistema de riego:</Text>
                                               <TextInput
                                                 style={styles.input}
                                                 placeholder="Detalles"
                                                  value={formulario.fugasdetalles}
                                                  onChangeText={(text) => updateFormulario('fugasdetalles', text)}
                                                   maxLength={200}
                                                />
                                            </>
                                        )}

                                    <View style={styles.checkboxContainer}>
                                      <Text style={styles.formText}>Uniformidad de riego</Text>
                                       <CheckBox
                                       checked={uniformidadRiegoModificar}
                                        checkedIcon='check-square-o'
                                        uncheckedIcon='square-o'
                                        checkedColor='#578458'
                                        uncheckedColor='#578458'
                                         onPress={() => handleCheckBoxChange(
                                        !uniformidadRiegoModificar,
                                           setUniformidadRiego, // Asegúrate de usar la función correcta
                                        () => {
                                      updateFormulario('uniformidadalerta', ''); // Limpiar campo
                                      updateFormulario('uniformidaddetalles', ''); // Limpiar campo
                                      }
                                    )}
                                       containerStyle={styles.checkbox}
                                     />
                                  </View>

                                {uniformidadRiegoModificar && (
                                  <>
                                  <Text style={styles.formText}>Rango de alerta de uniformidad de riego:</Text>
                                  <DropdownComponent
                                  placeholder="Seleccione"
                                   data={[
                                     { label: "Bajo", value: "Bajo" },
                                     { label: "Medio", value: "Medio" },
                                     { label: "Alto", value: "Alto" },
                                    ]}
                                   value={formulario.uniformidadalerta}
                                   iconName=""
                                    onChange={(selectedItem) => updateFormulario('uniformidadalerta', selectedItem.value)}
                                   />
                                  <Text style={styles.formText}>Detalles de uniformidad de riego:</Text>
                                 <TextInput
                                   style={styles.input}
                                    placeholder="Detalles"
                                     value={formulario.uniformidaddetalles}
                                     onChangeText={(text) => updateFormulario('uniformidaddetalles', text)}
                                      maxLength={200}
                                    />
                                    </>
                                  )}

                                   <View style={styles.checkboxContainer}>
                                     <Text style={styles.formText}>Obstrucción canales de riego</Text>
                                         <CheckBox
                                         checked={estadoCanalesRiegoModificar}
                                         checkedIcon='check-square-o'
                                         uncheckedIcon='square-o'
                                         checkedColor='#578458'
                                         uncheckedColor='#578458'
                                        onPress={() => handleCheckBoxChange(
                                          !estadoCanalesRiegoModificar,
                                         setEstadoCanalesRiego, // Asegúrate de usar la función correcta
                                         () => {
                                            updateFormulario('canalesalerta', ''); // Limpiar campo
                                            updateFormulario('canalesdetalles', ''); // Limpiar campo
                                           }
                                         )}
                                          containerStyle={styles.checkbox}
                                           />
                                         </View>

                                    {estadoCanalesRiegoModificar && (
                                      <>
                                      <Text style={styles.formText}>Rango de alerta de obstrucción en canales de riego:</Text>
                                      <DropdownComponent
                                       placeholder="Seleccione"
                                         data={[
                                          { label: "Bajo", value: "Bajo" },
                                            { label: "Medio", value: "Medio" },
                                             { label: "Alto", value: "Alto" },
                                         ]}
                                           value={formulario.canalesalerta}
                                           iconName=""
                                              onChange={(selectedItem) => updateFormulario('canalesalerta', selectedItem.value)}
                                            />
                                            <Text style={styles.formText}>Detalles de obstrucción en canales de riego:</Text>
                                            <TextInput
                                             style={styles.input}
                                              placeholder="Detalles"
                                               value={formulario.canalesdetalles}
                                                onChangeText={(text) => updateFormulario('canalesdetalles', text)}
                                                    maxLength={200}
                                               />
       
                                              </>
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
                                <Text style={styles.formText} >Finca</Text>
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
                                <Text style={styles.formText} >Parcela</Text>
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
                                            showConfirmAlert();
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
                                            showConfirmAlert();
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
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListIrrigationEfficiency.screenName as never) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas cambiar el estado del monitoreo eficiencia riego?"
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

