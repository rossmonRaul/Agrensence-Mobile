import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, Keyboard, } from 'react-native';
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
import { CrearRegistroEficienciaRiego } from '../../../../servicios/ServicioUsoAgua';
import CustomAlert from '../../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }
export const InsertarMonitoreoEficienciaRiegoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();

    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[] | []>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [isSecondFormVisible, setSecondFormVisible] = useState(false);

    const [estadoTuberias, setEstadoTuberias] = useState(false);
    const [uniformidadRiego, setUniformidadRiego] = useState(false);
    const [estadoAspersores, setEstadoAspersores] = useState(false);
    const [estadoCanalesRiego, setEstadoCanalesRiego] = useState(false);
    

    const handleCheckBoxChange = (isChecked, setStateFunction, clearFields) => {
        setStateFunction(isChecked);
        if (!isChecked) {
            clearFields(); // Limpiar campos si el checkbox se desmarca
        }
    };
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        idFinca: finca,
        idParcela: parcela,
        identificacionUsuario: userData.identificacion,
        consumoAgua: '',
        estadoTuberias: estadoTuberias,
        uniformidadRiego: uniformidadRiego,
        estadoAspersores: estadoAspersores,
        estadoCanalesRiego: estadoCanalesRiego,
        nivelFreatico: '',
        uniformidadalerta:'',
        uniformidaddetalles:'',
        fugasalerta:'',
        fugasdetalles:'',
        canalesalerta:'',
        canalesdetalles:'',
    });


    const [isAlertVisible, setAlertVisible] = useState(false);
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
    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };


    const validateFirstForm = () => {
        let isValid = true;



        if (formulario.consumoAgua.trim() === '') {
            isValid = false;
            showInfoAlert('Por favor ingrese el volumen de agua utilizado.');
            return isValid;
        }
        if (formulario.nivelFreatico.trim() === '') {
            isValid = false;
            showInfoAlert('Por favor ingrese el nivel freático.');
            return isValid;
        }

        return isValid;

    }

    // Se defina una función para manejar el registro cuando le da al boton de guardar
    const handleRegister = async () => {


        if (!formulario.idFinca || formulario.idFinca === null) {
            showInfoAlert('Ingrese la Finca');
            return
        }
        if (!formulario.idParcela || formulario.idParcela === null) {
            showInfoAlert('Ingrese la Parcela');
            return
        }
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            usuarioCreacionModificacion: userData.identificacion,
            volumenAguaUtilizado: formulario.consumoAgua,
            estadoTuberiasYAccesorios: estadoTuberias,
            uniformidadRiego: uniformidadRiego,
            estadoAspersores: estadoAspersores,
            estadoCanalesRiego: estadoCanalesRiego,
            nivelFreatico: formulario.nivelFreatico,
            uniformidadalerta: formulario.uniformidadalerta,
            uniformidaddetalles: formulario.uniformidaddetalles,
            fugasalerta: formulario.fugasalerta,
            fugasdetalles: formulario.fugasdetalles,
            canalesalerta: formulario.canalesalerta,
            canalesdetalles: formulario.canalesdetalles,
        };

        //  Se ejecuta el servicio de insertar el monitoreo de eficiencia de riego
        const responseInsert = await CrearRegistroEficienciaRiego(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            showSuccessAlert('¡Se registro el monitoreo eficiencia riego correctamente!')
            // Alert.alert('¡Se registro el monitoreo eficiencia riego correctamente!', '', [
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
    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        obtenerParcelasPorFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
        updateFormulario('idFinca', itemValue.value)
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
                                    {/* <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Fugas en el Sistema de Riego</Text>
                                        <CheckBox
                                            checked={estadoTuberias}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!estadoTuberias, setEstadoTuberias)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                    <Text style={styles.formText} >Rango de Alerta de fugas en el sistema de riego :</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione"
                                        data={[
                                            { label: "Bajo", value: "Bajo" },
                                            { label: "Medio", value: "Medio" },
                                            { label: "Alto", value: "Alto" },
                                          

                                        ]}
                                        value={formulario.fugasalerta}
                                        iconName=""
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('fugasalerta', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Detalles de fugas en el sistema de riego:</Text>
                                         <TextInput
                                    style={styles.input}
                                    placeholder="Detalles"
                                    value={formulario.fugasdetalles}
                                    onChangeText={(text) => updateFormulario('fugasdetalles', text)}
                                    maxLength={200}
                                />


                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Uniformidad de Riego</Text>
                                        <CheckBox
                                            checked={uniformidadRiego}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!uniformidadRiego, setUniformidadRiego)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                    <Text style={styles.formText} >Rango de Alerta de Uniformidad de riego :</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione"
                                        data={[
                                            { label: "Bajo", value: "Bajo" },
                                            { label: "Medio", value: "Medio" },
                                            { label: "Alto", value: "Alto" },
                                          

                                        ]}
                                        value={formulario.uniformidadalerta}
                                        iconName=""
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('uniformidadalerta', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Detalles de Uniformidad de riego:</Text>
                                         <TextInput
                                    style={styles.input}
                                    placeholder="Detalles"
                                    value={formulario.uniformidaddetalles}
                                    onChangeText={(text) => updateFormulario('uniformidaddetalles', text)}
                                    maxLength={200}
                                />

                                   

                                    <View style={styles.checkboxContainer}>
                                        <Text style={styles.formText}>Obstrucción en Canales de Riego</Text>
                                        <CheckBox
                                            checked={estadoCanalesRiego}
                                            checkedIcon='check-square-o'
                                            uncheckedIcon='square-o'
                                            checkedColor='#578458'
                                            uncheckedColor='#578458'
                                            onPress={() => handleCheckBoxChange(!estadoCanalesRiego, setEstadoCanalesRiego)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                    <Text style={styles.formText} >Rango de Alerta de Obstrucción en Canales de Riego:</Text>
                                    <DropdownComponent
                                        placeholder="Seleccione"
                                        data={[
                                            { label: "Bajo", value: "Bajo" },
                                            { label: "Medio", value: "Medio" },
                                            { label: "Alto", value: "Alto" },
                                          

                                        ]}
                                        value={formulario.canalesalerta}
                                        iconName=""
                                        onChange={(selectedItem) => {

                                            // Actualizar el formulario con la selección de la categoría
                                            updateFormulario('canalesalerta', selectedItem.value);
                                        }}
                                    />
                                    <Text style={styles.formText} >Detalles de Obstrucción en Canales de Riego:</Text>
                                         <TextInput
                                    style={styles.input}
                                    placeholder="Detalles"
                                    value={formulario.canalesdetalles}
                                    onChangeText={(text) => updateFormulario('canalesdetalles', text)}
                                    maxLength={200}
                                /> */}
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
                                     <View style={styles.container}>
            <View style={styles.checkboxContainer}>
                <Text style={styles.formText}>Fugas en el sistema de riego</Text>
                <CheckBox
                    checked={estadoTuberias}
                    checkedIcon='check-square-o'
                    uncheckedIcon='square-o'
                    checkedColor='#578458'
                    uncheckedColor='#578458'
                    onPress={() => handleCheckBoxChange(
                        !estadoTuberias,
                        setEstadoTuberias,
                        () => {
                            updateFormulario('fugasalerta', ''); // Limpiar campo
                            updateFormulario('fugasdetalles', ''); // Limpiar campo
                        }
                    )}
                    containerStyle={styles.checkbox}
                />
            </View>

            {estadoTuberias && (
                <>
                    <Text style={styles.formText}>Rango de alerta de fugas en el sistema de riego :</Text>
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
                    checked={uniformidadRiego}
                    checkedIcon='check-square-o'
                    uncheckedIcon='square-o'
                    checkedColor='#578458'
                    uncheckedColor='#578458'
                    onPress={() => handleCheckBoxChange(
                        !uniformidadRiego,
                        setUniformidadRiego,
                        () => {
                            updateFormulario('uniformidadalerta', ''); // Limpiar campo
                            updateFormulario('uniformidaddetalles', ''); // Limpiar campo
                        }
                    )}
                    containerStyle={styles.checkbox}
                />
            </View>

            {uniformidadRiego && (
                <>
                    <Text style={styles.formText}>Rango de alerta de uniformidad de riego :</Text>
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
                    checked={estadoCanalesRiego}
                    checkedIcon='check-square-o'
                    uncheckedIcon='square-o'
                    checkedColor='#578458'
                    uncheckedColor='#578458'
                    onPress={() => handleCheckBoxChange(
                        !estadoCanalesRiego,
                        setEstadoCanalesRiego,
                        () => {
                            updateFormulario('canalesalerta', ''); // Limpiar campo
                            updateFormulario('canalesdetalles', ''); // Limpiar campo
                        }
                    )}
                    containerStyle={styles.checkbox}
                />
            </View>

            {estadoCanalesRiego && (
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
        </View>
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

                                {empresa &&
                                (
                                    <>
                                    <Text style={styles.formText} >Finca</Text>
                                    <DropdownComponent
                                        placeholder="Finca"
                                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                                        value={finca}
                                        iconName='tree'
                                        onChange={handleValueFinca}
                                    />
                                    </>
                                )
                                }
                                {finca &&
                                (
                                    <>
                                    <Text style={styles.formText} >Parcela</Text>
                                    <DropdownComponent
                                        placeholder="Parcela"
                                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                                        iconName='pagelines'
                                        value={parcela}
                                        onChange={(item) => (setParcela(item.value as never), (updateFormulario('idParcela', item.value)))}
                                    />
                                       </>
                                )
                                }
                                
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
                                            <Text style={styles.buttonText}>Guardar monitoreo </Text>
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
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListIrrigationEfficiency.screenName as never) : undefined}
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