import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './admin-lista-mediciones-sensor.styles'

import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
import { ObtenerMedicionesSensor } from '../../../servicios/ServiciosSensor';

export const ListaMedicionesSensorScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const { userData } = useAuth();


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Nombre': 'nombre',
        'Unidad Medida': 'unidadMedida',
        'Nomenclatura': 'nomenclatura',
        'Estado': 'estado',
    };

    const handleRectanglePress = (idMedicion: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyMeasureSensor.screenName, { idMedicion: idMedicion, estado: estado });
    };

    useFocusEffect(useCallback(() => {
        ObtenerMedicionesSensor()
        .then((response) => {
            const filteredData = response.map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));
            setOriginalApiData(filteredData);
            setApiData(filteredData);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    }, []));

    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = originalApiData.filter((item) => {
            return (
                item.nombre.toLowerCase().includes(lowercaseQuery)
            );
        });
        setApiData(filteredData);
    };


    return (
        <View style={styles.container} >
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterMeasureSensor.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de Mediciones</Text>
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
                        <TouchableOpacity key={item.idMedicion} onPress={() => handleRectanglePress(item.idMedicion, item.estado)}>
                            <CustomRectangle
                                key={item.idMedicion}
                                data={processData([item], keyMapping)?.data || []}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <BottomNavBar />

        </View>
    );
}