import React, { useState, useEffect } from 'react';
import { View, ScrollView, ImageBackground, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../../../styles/global-styles.styles';
import { useNavigation } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { isEmail } from 'validator'
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';

import { GuardarUsuarioPorSuperUsuario } from '../../../servicios/ServicioUsuario';
import { ScreenProps } from '../../../constants';
import { validatePassword } from '../../../utils/validationPasswordUtil';
import { useAuth } from '../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { CrearParcela } from '../../../servicios/ServicioParcela';

export const RegistrarParcelaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [finca, setFinca] = useState(null);

    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        nombre: '',
        idFinca: '',
    });


    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const obtenerFincaProps: UseFetchDropdownDataProps<FincaInterface> = {

        fetchDataFunction: ObtenerFincas,
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    };

    useFetchDropdownData(obtenerFincaProps);

    useEffect(() => {

        let fincaSort = fincaDataOriginal.filter(item => item.id === userData.idEmpresa.toString());

        setFincaDataSort(fincaSort);
    }, [userData.idEmpresa, fincaDataOriginal, setFincaDataSort]);

    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {

        //  Se valida que la empresa, finca y parcela estén seleccionadas
        if (!formulario.nombre) {
            alert('Ingrese un nombre para la parcela');
            return
        }
        if (!formulario.idFinca) {
            alert('Seleccione una finca');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            nombre: formulario.nombre,
            idFinca: formulario.idFinca,
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await CrearParcela(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se creo la parcela correctamente!', '', [
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
                    source={require('../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                >
                </ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListPlot.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                        <View>
                            <Text style={styles.createAccountText} >Crea una parcela</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText} >Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la parcela"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                            />
                            <>
                                <DropdownComponent
                                    placeholder="Finca"
                                    data={fincaDataSort}
                                    iconName="tree"
                                    value={finca}
                                    onChange={(item) => (setFinca(item.value as never), updateFormulario('idFinca', item.value))}
                                />
                                {finca && <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        handleRegister();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                handleRegister();
                                            }}
                                        >
                                            <View style={styles.buttonContent}>
                                                <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                                <Text style={styles.buttonText}> Guardar Parcela</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>}
                            </>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
}