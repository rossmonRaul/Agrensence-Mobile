import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerMedidasCultivos } from '../../../servicios/ServicioCultivos';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';

export const ListaMedidasCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Medida': 'medida',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idMedidasCultivos: string, Medida : string,  Estado: string) => {
        navigation.navigate(ScreenProps.ModifyCropMeasurements.screenName, { idMedidasCultivos, medida : Medida , estado: Estado });
    };

    const fetchData = async () => {
        try {
            const response = await ObtenerMedidasCultivos();
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
            item.medida.toLowerCase().includes(lowercaseQuery)
        ));
        setApiData(filteredData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertCropMeasurements.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de Medidas de Cultivos</Text>
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
                        <TouchableOpacity key={item.idMedidasCultivos} onPress={() => handleRectanglePress(item.idMedidasCultivos, item.medida, item.estado)}>
                            <CustomRectangle
                                key={item.idMedidasCultivos}
                                data={processData([item], keyMapping)?.data || []} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <BottomNavBar />
        </View>
    );
};
