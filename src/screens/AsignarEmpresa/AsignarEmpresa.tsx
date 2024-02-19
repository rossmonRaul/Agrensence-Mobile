import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './AsignarEmpresa.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../components/Dropdown/Dropwdown';
import { ActualizarUsuario } from '../../servicios/ServicioUsuario';

import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../hooks/useFetchDropDownData';

import { ObtenerEmpresas } from '../../servicios/ServicioEmpresa';
import { ObtenerFincas } from '../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../servicios/ServicioParcela';
import { Screen_Names } from '../../constants';

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

interface RouteParams {
    identificacion: string;
}


export const AsignarEmpresaScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { identificacion } = route.params as RouteParams;
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [empresa, setEmpresa] = useState(null);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);

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
        let fincaSort = fincaDataOriginal.filter(item => item.id === itemValue.id);
        setFincaDataSort(fincaSort);
        setFinca(null)
        setParcela(null)
    }


    const handleValueFinca = (itemValue: any) => {
        setFinca(itemValue.value);
        let parcelaSort = parcelaDataOriginal.filter(item => item.id === itemValue.value);
        setParcelaDataSort(parcelaSort)
        setParcela(null);
    }

    // Función para validar la primera parte formulario


    // Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {
        // Se valida que la empresa, finca y parcela estén seleccionadas
        if (!empresa) {
            alert('Ingrese una empresa');
            return
        }
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
            identificacion: identificacion,
            idRol: 3,
            idEmpresa: empresa,
            idFinca: finca,
            idParcela: parcela,
            estado: 1
        };
        console.log(formData);

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await ActualizarUsuario(formData);
        console.log(responseInsert);
        // Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se actualizo el usuario correcamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(Screen_Names.Menu as never);
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
                    <Text style={styles.createAccountText} >Asignar empresa</Text>
                </View>

                <View style={styles.formContainer}>

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
                            onChange={(item) => (setParcela(item.value as never))}
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
                </View>

            </View>
        </View>
    );
}