import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './registrar.styles';
import { useNavigation } from '@react-navigation/native';
import DropdownComponent from '../../components/Dropdown/Dropwdown';
import { isEmail } from 'validator'

import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../hooks/useFetchDropDownData';

import { ObtenerEmpresas } from '../../servicios/ServicioEmpresa';
import { ObtenerFincas } from '../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../servicios/ServicioParcela';
import { InsertarUsuario } from '../../servicios/ServicioUsuario';


//  Se definen las interfaces para representar la estructura de datos de las empresas, fincas y parcelas
interface Empresa {
    nombre: string;
    idEmpresa: number;
}

interface Finca {
    idFinca: number;
    nombre: string;
    idEmpresa: number;
}
interface Parcela {
    nombre: string;
    idParcela: number;
    idFinca: number;
}


export const RegistrarScreen: React.FC = () => {
    const navigation = useNavigation();
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [isSecondFormVisible, setSecondFormVisible] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);

    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        identificacion: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        empresa: '',
        finca: '',
        parcela: '',
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
    const obtenerEmpresasProps: UseFetchDropdownDataProps<Empresa> = {
        fetchDataFunction: ObtenerEmpresas,
        setDataFunction: setEmpresaData,
        labelKey: 'nombre',
        valueKey: 'idEmpresa',
        idKey: 'idEmpresa',
    };

    const obtenerFincaProps: UseFetchDropdownDataProps<Finca> = {
        fetchDataFunction: ObtenerFincas,
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    };

    const obtenerParcelaProps: UseFetchDropdownDataProps<Parcela> = {
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

    //  Se definen funciones para manejar el cambio de valor en los dropdowns
    const handleValueEmpresa = (itemValue: any) => {
        setEmpresa(itemValue.value);
        updateFormulario('empresa', itemValue.value);
        let fincaSort = fincaDataOriginal.filter(item => item.id === itemValue.id);
        setFincaDataSort(fincaSort);
        setFinca(null)
        setParcela(null)
    }


    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        updateFormulario('finca', itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
    }

    // Función para validar la primera parte formulario
    const validateFirstForm = () => {
        let isValid = true;

        if (!formulario.identificacion && !formulario.correo && !formulario.contrasena && !formulario.confirmarContrasena) {
            alert('Por favor rellene el formulario');
            isValid = false;
            return
        }
        if (isValid && !formulario.identificacion) {
            alert('Ingrese un nombre de identificacion');
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
        if (isValid && formulario.contrasena !== formulario.confirmarContrasena) {
            alert('Las contraseñas no coinciden');
            isValid = false;
            return
        }

        return isValid
    }

    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {
        let isValid = true;
        // Se valida que la empresa, finca y parcela estén seleccionadas
        if (isValid && !formulario.empresa) {
            alert('Ingrese una empresa');
            return
        }
        if (isValid && !formulario.finca) {
            alert('Ingrese una finca');
            return
        }
        if (isValid && !formulario.parcela) {
            alert('Ingrese una parcela');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            identificacion: formulario.identificacion,
            correo: formulario.correo,
            contrasena: formulario.contrasena,
            idEmpresa: formulario.empresa,
            idFinca: formulario.finca,
            idParcela: formulario.parcela,
        };
        console.log(formData);

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await InsertarUsuario(formData);

        // Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 0) {
            Alert.alert('¡Gracias por unirte a nuestra app!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate('Login' as never);
                    },
                },
            ]);
        } else {
            alert('!Oops! Parece que algo salió mal')
        }

    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>

            <View style={styles.lowerContainer}>
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
                            <DropdownComponent
                                placeholder="Empresa"
                                data={empresaData}
                                iconName="building-o"
                                value={empresa}
                                onChange={handleValueEmpresa}
                            />
                            {empresa &&
                                <DropdownComponent
                                    placeholder="Finca"
                                    data={fincaDataSort}
                                    value={finca}
                                    iconName='map-marker'
                                    onChange={handleValueFinca}
                                />
                            }
                            {finca &&
                                <DropdownComponent
                                    placeholder="Parcela"
                                    data={parcelaDataSort}
                                    iconName='map-marker'
                                    value={parcela}
                                    onChange={(item) => (setParcela(item.value as never), updateFormulario('parcela', item.value))}
                                />
                            }


                            {parcela && <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <Text style={styles.buttonText}>Enviar</Text>
                            </TouchableOpacity>}

                        </>

                    )}

                    <View style={styles.loginButtonContainer} >

                        <TouchableOpacity onPress={() => { navigation.navigate('Login' as never) }}>
                            <Text style={styles.loginButtonText} >Iniciar sesión</Text>
                        </TouchableOpacity>


                    </View>
                </View>

            </View>
        </View>
    );
}