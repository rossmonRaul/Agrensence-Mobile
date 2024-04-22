import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../../styles/global-styles.styles';
import { useNavigation } from '@react-navigation/native';
import DropdownComponent from '../../components/Dropdown/Dropwdown';
import { isEmail } from 'validator'
import { ObtenerFincas } from '../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../servicios/ServicioParcela';
import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../hooks/useFetchDropDownData';
import { GuardarUsuario } from '../../servicios/ServicioUsuario';
import { ScreenProps } from '../../constants';
import { validatePassword } from '../../utils/validationPasswordUtil';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { FincaInterface, ParcelaInterface } from '../../interfaces/empresaInterfaces';
import BottomNavBar from '../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'

export const RegistrarUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);
    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: '',
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        empresa: '',
        idEmpresa: userData.idEmpresa,
        idFinca: '',
        idParcela: ''
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };
    const handleValueEmpresa = (idEmpresa: number) => {
        setEmpresa(idEmpresa);
        let fincaSort = fincaDataOriginal.filter(item => item.id === idEmpresa.toString());
        setFincaDataSort(fincaSort);
        setFinca(null);
        setParcela(null);
    }
    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
    }
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


    // Función para validar la primera parte formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.identificacion && !formulario.nombre && !formulario.correo && !formulario.contrasena && !formulario.confirmarContrasena) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (isValid && !formulario.identificacion) {
            alert('Ingrese una identificacion');
            isValid = false;
            return
        }
        if (isValid && !formulario.nombre) {
            alert('Ingrese un nombre completo');
            isValid = false;
            return
        }
        if (isValid && (!formulario.correo || !isEmail(formulario.correo))) {
            alert('Ingrese un correo electrónico válido');
            isValid = false;
            return
        }
        if (isValid && !formulario.contrasena) {
            alert('Ingrese una contraseña');
            isValid = false;
            return
        }
        if (isValid && !validatePassword(formulario.contrasena)) {
            isValid = false;
        }

        if (isValid && formulario.contrasena !== formulario.confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            isValid = false;
            return
        }

        return isValid
    }
    //  Se utiliza useEffect para llamar a handleValueEmpresa solo una vez al montar el componente
    useEffect(() => {
        if (!handleEmpresaCalled && fincaDataOriginal.length > 0) {
            handleValueEmpresa(userData.idEmpresa);
            setHandleEmpresaCalled(true);
        }
    }, [userData.idEmpresa, fincaDataOriginal, handleEmpresaCalled]);

    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {

        //  Se valida que la  finca y parcela estén seleccionadas

        if (!finca) {
            alert('Ingrese una finca');
            return
        }
        if (!parcela) {
            alert('Ingrese una parcela');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            nombre: formulario.nombre,
            correo: formulario.correo,
            contrasena: formulario.contrasena,
            idEmpresa: userData.idEmpresa,
            idFinca: finca,
            idParcela: parcela
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await GuardarUsuario(formData);

        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 0) {
            Alert.alert('¡Se creo el usuario correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.Menu.screenName as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}

            >
                <ImageBackground
                    source={require('../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>

                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText} >Crea una cuenta</Text>
                        </View>

                        <View style={styles.formContainer}>

                            {!isSecondFormVisible ? (
                                <>
                                    <Text style={styles.formText} >Identificación</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Identificación"
                                        value={formulario.identificacion}
                                        onChangeText={(text) => updateFormulario('identificacion', text)}
                                    />
                                    <Text style={styles.formText} >Nombre</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre Completo"
                                        value={formulario.nombre}
                                        onChangeText={(text) => updateFormulario('nombre', text)}
                                    />
                                    <Text style={styles.formText} >Correo electrónico</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="correo@ejemplo.com"
                                        value={formulario.correo}
                                        // Se puede utilizar el para el correo .toLowerCase()
                                        onChangeText={(text) => updateFormulario('correo', text)}
                                    />
                                    <Text style={styles.formText} >Contraseña</Text>
                                    <TextInput style={styles.input}
                                        secureTextEntry={true}
                                        value={formulario.contrasena}
                                        placeholder="Contraseña"
                                        onChangeText={(text) => updateFormulario('contrasena', text)}
                                    />
                                    <Text style={styles.formText} >Confirmar contraseña</Text>
                                    <TextInput style={styles.input}
                                        secureTextEntry={true}
                                        value={formulario.confirmarContrasena}
                                        placeholder="Confirmar contraseña"
                                        onChangeText={(text) => updateFormulario('confirmarContrasena', text)}
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
                                            handleRegister();
                                        }}
                                    >
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                            <Text style={styles.buttonText}>Guardar cambios</Text>
                                        </View>
                                    </TouchableOpacity>}
                                </>
                            )}

                        </View>
                    </ScrollView>

                </View>
                <BottomNavBar />
            </KeyboardAvoidingView>
        </View>
    );
}