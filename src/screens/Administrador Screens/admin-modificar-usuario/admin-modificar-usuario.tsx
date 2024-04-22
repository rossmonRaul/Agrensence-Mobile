import React, { useState, useEffect } from 'react';
import { View, ImageBackground, ScrollView, Platform, KeyboardAvoidingView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-modificar-usuario.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';
import { EmpresaInterface, FincaInterface, ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import { ActualizarDatosUsuario, CambiarEstadoUsuarioFincaParcela, AsignarNuevaFincaParcela, AsignarFincaParcela } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
    identificacion: string;
    idEmpresa: number;
    idRol: number;
    idFinca: number;
    estado: string;
    idParcela: number;
    idUsuarioFincaParcela: number;
}

export const AdminModificarUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const { userData } = useAuth();
    const { identificacion, idEmpresa, estado, idRol, idFinca, idParcela, idUsuarioFincaParcela } = route.params as RouteParams;
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isFormVisible, setFormVisible] = useState(false);
    const [isSecondFormVisible, setIsSecondFormVisible] = useState(false);

    const [empresa, setEmpresa] = useState(idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);


    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: identificacion || '',
        nombre: '',
        contrasena: '',
        confirmarContrasena: '',
        idEmpresa: idEmpresa || '',
        idRol: idRol || '',
        idFinca: '',
        idParcela: '',
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    /*  Estan son las Props para obtener datos de empresas, 
       fincas y parcelas mediante el hook useFetchDropdownData */
    const obtenerEmpresasProps: UseFetchDropdownDataProps<EmpresaInterface> = {
        fetchDataFunction: ObtenerEmpresas,
        setDataFunction: setEmpresaData,
        labelKey: 'nombre',
        valueKey: 'idEmpresa',
        idKey: 'idEmpresa',
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
        y gestionar los datos de empresas, fincas y parcelas*/
    useFetchDropdownData(obtenerEmpresasProps);
    useFetchDropdownData(obtenerFincaProps);
    useFetchDropdownData(obtenerParcelaProps);


    const handleChangeAccess = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            idFinca: idFinca,
            idParcela: idParcela,
        };
        //  Se muestra una alerta con opción de aceptar o cancelar
        Alert.alert(
            'Confirmar cambio de acceso',
            '¿Estás seguro de que deseas cambiar el acceso para este usuario?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        //  Se realiza el cambio de acceso
                        const responseInsert = await CambiarEstadoUsuarioFincaParcela(formData);

                        //  Se muestra una alerta de éxito o error según la respuesta obtenida
                        if (responseInsert.indicador === 1) {
                            Alert.alert(
                                '¡Se actualizó el usuario correctamente!',
                                '',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate(
                                                ScreenProps.Menu.screenName
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

    //  Se definen funciones para manejar el cambio de valor en los dropdowns
    const handleValueEmpresa = (idEmpresa: number) => {
        setEmpresa(idEmpresa);
        let fincaSort = fincaDataOriginal.filter(item => item.id === idEmpresa.toString());
        setFincaDataSort(fincaSort);
        setFinca(null);
        setParcela(null);
    }


    //  Se utiliza useEffect para llamar a handleValueEmpresa solo una vez al montar el componente
    useEffect(() => {
        if (!handleEmpresaCalled && fincaDataOriginal.length > 0) {
            handleValueEmpresa(idEmpresa);
            setHandleEmpresaCalled(true);
        }
    }, [idEmpresa, fincaDataOriginal, handleEmpresaCalled]);

    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
    }

    //  Se hace la peticion para asigarne la nueva finca y parcela
    const handleFincaParcela = async () => {
        const formData = {
            identificacion: formulario.identificacion,
            idFinca: finca,
            idParcela: parcela
        };
        const responseInsert = await AsignarNuevaFincaParcela(formData);
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se le agrego la nueva finca y parcela al usuario correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.Menu.screenName);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
        }
    }
    //  Se define una función para manejar el registro del identificacion
    const handleModifyUser = async () => {
        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            idUsuario: idUsuarioFincaParcela,
            idFinca: finca,
            idParcela: parcela,
        };

        //  Se realiza la modificación de usuario
        const responseInsert = await AsignarFincaParcela(formData);


        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert(
                '¡Se actualizó el usuario correctamente!',
                '',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(
                                ScreenProps.Menu.screenName
                            );
                        },
                    },
                ]
            );
        } else {
            alert('¡Oops! Parece que algo salió mal');
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}

            >
                <ImageBackground
                    source={require('../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText} >Modificar usuario</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <>
                                {!isFormVisible ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                setFormVisible(true),
                                                    setIsSecondFormVisible(false)
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Modificar finca y parcela</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (<>
                                    {empresa &&
                                        <DropdownComponent
                                            placeholder="Finca"
                                            data={fincaDataSort}
                                            value={finca}
                                            iconName='tree'
                                            onChange={handleValueFinca}
                                        />
                                    }
                                    {finca &&
                                        <DropdownComponent
                                            placeholder="Parcela"
                                            data={parcelaDataSort}
                                            iconName='pagelines'
                                            value={parcela}
                                            onChange={(item) => (setParcela(item.value as never))}
                                        />
                                    }
                                    {parcela && <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => {
                                            handleModifyUser()
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Guardar cambios</Text>
                                        </View>
                                    </TouchableOpacity>}
                                </>)}
                                <View style={styles.secondForm}>
                                    {!isSecondFormVisible ? (<>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                setIsSecondFormVisible(true), setFormVisible(false)
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Agregar nueva finca y parcela</Text>
                                        </TouchableOpacity>
                                    </>) : (<>
                                        {empresa &&
                                            <DropdownComponent
                                                placeholder="Finca"
                                                data={fincaDataSort}
                                                value={finca}
                                                iconName='tree'
                                                onChange={handleValueFinca}
                                            />
                                        }
                                        {finca &&
                                            <DropdownComponent
                                                placeholder="Parcela"
                                                data={parcelaDataSort}
                                                iconName='pagelines'
                                                value={parcela}
                                                onChange={(item) => (setParcela(item.value as never))}
                                            />
                                        }
                                        {parcela && <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                handleFincaParcela()
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}>Guardar cambios</Text>
                                            </View>
                                        </TouchableOpacity>}
                                    </>)}
                                </View>

                            </>

                            {estado === 'Activo' ? <TouchableOpacity
                                style={styles.buttonDelete}
                                onPress={() => {
                                    handleChangeAccess();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="close-circle" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Inhabilitar acceso</Text>
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
                                        <Text style={styles.buttonText}>Habilitar acceso</Text>
                                    </View>
                                </TouchableOpacity>
                            }

                        </View>

                    </ScrollView>
                </View>
                <BottomNavBar />
            </KeyboardAvoidingView>
        </View>
    );
}