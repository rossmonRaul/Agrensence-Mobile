import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import { ModificarRegistroCantidadDePlantas, ObtenerPuntoMedicionFincaParcela, CambiarEstadoRegistroCantidadDePlantas } from '../../../../servicios/ServicioCantidadDePlantas';
import { formatSpanishDate, formatFecha } from '../../../../utils/dateFortmatter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CambiarEstadoCultivo, EditarCultivo } from '../../../../servicios/ServicioCultivos';
import ConfirmAlert from '../../../../components/CustomAlert/ConfirmAlert';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';

interface Button {
    text: string;
    onPress: () => void;
  }
interface RouteParams {
    idCultivo: string,
    idFinca: string,
    idParcela: string,
    cultivo: string,
    estado: string
}

export const ModificarCultivoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();

    const route = useRoute();

    const { idCultivo,
        idFinca,
        idParcela,
        cultivo,
        estado
    } = route.params as RouteParams;

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);


    const [fincas, setFincas] = useState<{ idFinca: number; nombre: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);

    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [showFecha, setShowFecha] = useState(false);

    const [dateFecha, setDateFecha] = useState(new Date())

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);


    const handleCheckBoxChange = (value, setState) => {
        setState(value);
    };
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
                navigation.navigate(ScreenProps.CropsList.screenName);
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
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

      const showConfirmAlert = async () => {
        setAlertVisibleEstado(true);
      };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idCultivo: idCultivo,
        idFinca: idFinca || '',
        idParcela: idParcela || '',
        identificacionUsuario: userData.identificacion,
        cultivo: cultivo || '',
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
        Keyboard.dismiss()
        if (!formulario.idFinca || formulario.idFinca === null) {
            showInfoAlert('Ingrese la Finca');
            return;
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            showInfoAlert('Ingrese la Parcela');
            return;
        }

        if (formulario.cultivo.trim() === '') {
            showInfoAlert('El campo Cultivo es requerido.');
            return;
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idCultivo: idCultivo,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            usuarioCreacionModificacion: userData.identificacion,
            cultivo: formulario.cultivo,
        };
        //  Se ejecuta el servicio de modificar el registro problemas asociados a plagas y enfermedades
        const responseInsert = await EditarCultivo(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se modifico el registro de cultivo!')
            // Alert.alert('¡Se modifico el registro de cultivo!', '', [
            //     {
            //         text: 'OK',
            //         onPress: () => {
            //             navigation.navigate(ScreenProps.CropsList.screenName as never);
            //         },
            //     },
            // ]);
        } else 
        showErrorAlert('¡Oops! Parece que algo salió mal');
        // Alert.alert('¡Oops! Parece que algo salió mal', responseInsert.mensaje, [
        //     { text: 'OK' },
        // ]);
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };

            try {
                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasResponse);
                
                const parcelasResponse = await ObtenerParcelas(userData.idEmpresa);
                //const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                setParcelas(parcelasResponse);

                const cargaInicialParcelas = parcelasResponse.filter((parcela: any) => fincasResponse.some((f: any) => idFinca === parcela.idFinca));
                setParcelasFiltradas(cargaInicialParcelas);

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
        setSelectedFinca(fincaInicial?.nombre || null);


    }, [idFinca, finca, fincas]);
    useEffect(() => {
        // Buscar la parcela correspondiente
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));

        // Establecer el nombre de la parcela inicial como selectedFinca
        setSelectedParcela(parcelaInicial?.nombre || null);
    }, [idParcela, parcelas]);


    const handleChangeAccess = async () => {
        Keyboard.dismiss()
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idCultivo: idCultivo,
        };
        try {
            const responseInsert = await CambiarEstadoCultivo(formData);
            if (responseInsert.indicador === 1) {
              // Mostrar éxito o realizar otra acción
              showSuccessAlert( '¡Se eliminó el registro de cultivo');
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
        //     'Confirmar eliminación',
        //     '¿Estás seguro de que deseas eliminar el registro de cultivo?',
        //     [
        //         {
        //             text: 'Cancelar',
        //             style: 'cancel',
        //         },
        //         {
        //             text: 'Aceptar',
        //             onPress: async () => {
        //                 //  Se inserta el identificacion en la base de datos
        //                 const responseInsert = await CambiarEstadoCultivo(formData);
        //                 // Se ejecuta el cambio de estado
        //                 if (responseInsert.indicador === 1) {
        //                     Alert.alert(
        //                         '¡Se eliminó el registro de cultivo',
        //                         '',
        //                         [
        //                             {
        //                                 text: 'OK',
        //                                 onPress: () => {
        //                                     navigation.navigate(
        //                                         ScreenProps.CropsList.screenName
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
        updateFormulario('idPuntoMedicion', '');
        setSelectedParcela(null); // Resetear parcela
        //se obtienen las parcelas de la finca
        obtenerParcelasPorFinca(fincaId);
    };
    const handleParcelaChange = async (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);
        setSelectedParcela(item.value);
        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: parcelaId
        }
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
                <BackButtonComponent screenName={ScreenProps.CropsList.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Modificar cultivo</Text>
                        </View>

                        <View style={styles.formContainer}>
                                <Text style={styles.formText} >Finca</Text>
                                {empresa &&
                                    <DropdownComponent
                                        placeholder={selectedFinca ? selectedFinca : "Seleccionar Finca"}
                                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
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

                                <Text style={styles.formText} >Parcela</Text>

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

                            <Text style={styles.formText} >Cultivo</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Cultivo"
                                value={formulario.cultivo}
                                onChangeText={(text) => updateFormulario('cultivo', text)}
                                maxLength={50}
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
                            {parseInt(estado) === 1
                                ? <TouchableOpacity
                                    style={styles.buttonDelete}
                                    onPress={() => {
                                        showConfirmAlert();
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
                                        showConfirmAlert();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}>Activar</Text>
                                    </View>
                                </TouchableOpacity>
                            }
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.CropsList.screenName) : undefined}
                />
                <ConfirmAlert
                isVisible={isAlertVisibleEstado}
                onClose={() => setAlertVisibleEstado(false)}
                title="Confirmar cambio de estado"
                message="¿Estás seguro de que deseas eliminar el registro de cultivo?"
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