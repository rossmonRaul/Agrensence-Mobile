import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerRegistroPuntoMedicion } from '../../../servicios/ServicioPuntoMedicion';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';

export const ListaPuntoMedicionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Parcela': 'nombreParcela',
        'Código': 'codigo',
        'Altitud': 'altitud',
        'Latitud': 'latitud',
        'Longitud': 'longitud',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idPuntoMedicion: string, idFinca: string, idParcela: string, codigo: string, altitud : string, latitud: string, longitud: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyMeasurementPoint.screenName, { idPuntoMedicion:idPuntoMedicion,idFinca: idFinca, idParcela: idParcela, codigo: codigo
            ,altitud:altitud,latitud:latitud, longitud:longitud, estado: estado });
    };

    const fetchData = async () => {
        try {
            const response = await ObtenerRegistroPuntoMedicion({idEmpresa:userData.idEmpresa});
            //console.log(response);
            // Filtrar los datos de la API de acuerdo al id de la empresa
            //const fincaSort = response.filter(item => item.idEmpresa === userData.idEmpresa);
            // Filtrar y formatear los datos originales
            const filteredData = response.map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));
            setOriginalApiData(filteredData);
            setApiData(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Utilizamos useFocusEffect en lugar de useEffect
    useFocusEffect(useCallback(() => {
        fetchData();
    }, []));

    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();
        const filteredData = originalApiData.filter((item) => (
            item.codigo.toLowerCase().includes(lowercaseQuery)
        ));
        setApiData(filteredData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertMeasurementPoint.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista puntos medición</Text>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar información"
                        onChangeText={(text) => handleSearch(text)}
                    />
                    <TouchableOpacity style={styles.searchIconContainer}>
                        <Ionicons name="search" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {apiData.map((item, index) => (
                        <TouchableOpacity key={item.idPuntoMedicion} onPress={() => handleRectanglePress(item.idPuntoMedicion,item.idFinca,item.idParcela,item.codigo,item.altitud,item.latitud,item.longitud, item.estado)}>
                            <CustomRectangle
                                key={item.idPuntoMedicion}
                                data={processData([item], keyMapping)?.data || []} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <BottomNavBar />
        </View>
    );
};
