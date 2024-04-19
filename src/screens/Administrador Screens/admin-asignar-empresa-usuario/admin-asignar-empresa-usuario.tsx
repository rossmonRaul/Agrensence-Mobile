import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-asignar-empresa-usuario.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { AsignarEmpresaFincaYParcela } from '../../../servicios/ServicioUsuario';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';
import { useAuth } from '../../../hooks/useAuth';
import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmpresaInterface, FincaInterface, ParcelaInterface } from '../../../interfaces/empresaInterfaces';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
interface RouteParams {
    identificacion: string;
}


export const AdminAsignarEmpresaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { identificacion } = route.params as RouteParams;
    /*  Se definen los estados para controlar la visibilidad 
        del segundo formulario y almacenar datos del formulario*/
    const [empresa, setEmpresa] = useState(userData.idEmpresa);
    const [finca, setFinca] = useState(null);
    const [parcela, setParcela] = useState(null);

    //  Se definen estados para almacenar datos obtenidos mediante el hook useFetchDropdownData
    const [empresaData, setEmpresaData] = useState<DropdownData[]>([]);
    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [parcelaDataOriginal, setParcelaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);
    const [parcelaDataSort, setParcelaDataSort] = useState<DropdownData[]>([]);
    const [handleEmpresaCalled, setHandleEmpresaCalled] = useState(false);

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

    //  Se definen funciones para manejar el cambio de valor en los dropdowns
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


    //  Se defina una función para manejar el registro del identificacion
    const handleRegister = async () => {
        //  Se valida que la finca y parcela estén seleccionadas
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
            idEmpresa: empresa,
            idFinca: finca,
            idParcela: parcela
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await AsignarEmpresaFincaYParcela(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se actualizo el usuario correcamente!', '', [
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
    };
    //  Se utiliza useEffect para llamar a handleValueEmpresa solo una vez al montar el componente
    useEffect(() => {
        if (!handleEmpresaCalled && fincaDataOriginal.length > 0) {
            handleValueEmpresa(userData.idEmpresa);
            setHandleEmpresaCalled(true);
        }
    }, [userData.idEmpresa, fincaDataOriginal, handleEmpresaCalled]);


    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Habilitar usuario</Text>
                </View>

                <View style={styles.formContainer}>


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
                </View>

            </View>
            <BottomNavBar />

        </View>
    );
}