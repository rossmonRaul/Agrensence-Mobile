import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { FincaInterface } from '../../../interfaces/empresaInterfaces';
import { useFetchDropdownData, UseFetchDropdownDataProps, DropdownData } from '../../../hooks/useFetchDropDownData';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';

export const ListaParcelasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const { userData } = useAuth();

    const [finca, setFinca] = useState(null);

    const [fincaDataOriginal, setFincaDataOriginal] = useState<DropdownData[]>([]);
    const [fincaDataSort, setFincaDataSort] = useState<DropdownData[]>([]);

    const handleValueFinca = (itemValue: any) => {

        setFinca(itemValue.value);
        // Convertir itemValue.value a número
        const fincaId = parseInt(itemValue.value, 10)
        ObtenerParcelas()
            .then((response) => {

                //  Filtrar los datos de la api de acuerdo al id de la
                let fincaSort = response.filter(item => item.idFinca === fincaId);

                //  Filtrar y formatear los datos originales
                const filteredData = fincaSort.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));

                setOriginalApiData(filteredData);
                setApiData(filteredData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Nombre': 'nombre',
        'Estado': 'estado'
    };
    //funcion para que se carguen las fincas en el dropdown
    const obtenerFincaProps: UseFetchDropdownDataProps<FincaInterface> = {

        fetchDataFunction: ObtenerFincas,
        setDataFunction: setFincaDataOriginal,
        labelKey: 'nombre',
        valueKey: 'idFinca',
        idKey: 'idEmpresa',
    };
    //Llamar a la funcion encargada de obtener las fincas
    useFetchDropdownData(obtenerFincaProps);

    useEffect(() => {
        // filtrar los datos de acuerdo al id de la empresa
        let fincaSort = fincaDataOriginal.filter(item => item.id === userData.idEmpresa.toString());

        setFincaDataSort(fincaSort);

    }, [userData.idEmpresa, fincaDataOriginal, setFincaDataSort]);

    const obtenerParcelasPorFincaIds = async () => {
        try {
            const fincaIdsArray = fincaDataSort.map((finca) => parseInt(finca.value, 10));
            const response = await ObtenerParcelas();

            const fincaSort = response.filter(item => fincaIdsArray.includes(item.idFinca));

            const filteredData = fincaSort.map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));

            setOriginalApiData(filteredData);
            setApiData(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // useEffect para obtener parcelas cuando fincaDataSort cambia
    useEffect(() => {
        obtenerParcelasPorFincaIds();
    }, [fincaDataSort]);

    useFocusEffect(
        React.useCallback(() => {
            // Lógica para recargar la página (por ejemplo, volver a obtener los datos)
            obtenerParcelasPorFincaIds();
        }, [userData.idEmpresa, fincaDataSort])
    );

    //funcion para que enviarlo a modificar la parcela
    const handleRectanglePress = (idParcela: string, Nombre: string, Estado: string) => {
        navigation.navigate(ScreenProps.ModifyPlot.screenName, { idParcela: idParcela, nombre: Nombre, estado: Estado });
    };

    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterPlot.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de parcelas</Text>
                </View>

                <View style={styles.dropDownContainer}>

                    <DropdownComponent
                        placeholder="Finca"
                        data={fincaDataSort}
                        value={finca}
                        iconName='tree'
                        onChange={handleValueFinca}

                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {apiData.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idParcela} onPress={() => handleRectanglePress(item.idParcela, item.nombre, item.estado)}>
                                <CustomRectangle
                                    key={item.idParcela}
                                    data={processData([item], keyMapping)?.data || []} />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

            </View>

            <BottomNavBar />

        </View>
    );
}