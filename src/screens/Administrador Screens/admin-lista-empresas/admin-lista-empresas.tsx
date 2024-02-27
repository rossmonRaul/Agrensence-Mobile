import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './admin-lista-empresas.styles'
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ObtenerEmpresas } from '../../../servicios/ServicioEmpresa';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';

export const ListaEmpresaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const { userData } = useAuth();


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Nombre de empresa': 'nombre',
        'Estado': 'estado',
    };

    const handleRectanglePress = (idEmpresa: string, nombre: string, estado: string) => {
        navigation.navigate(ScreenProps.AdminModifyCompany.screenName, { idEmpresa: idEmpresa, nombre: nombre, estado: estado });
    };

    useEffect(() => {
        //  Se obtienen las empresas y luego se filtra el estado por activo o inactivo
        ObtenerEmpresas()
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
    }, []);

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
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <AddButtonComponent screenName={ScreenProps.AdminRegisterCompany.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Lista de empresas</Text>
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
                    <TouchableOpacity key={item.idEmpresa} onPress={() => handleRectanglePress(item.idEmpresa, item.nombre, item.estado)}>
                        <CustomRectangle
                            key={item.idEmpresa}
                            data={processData([item], keyMapping)?.data || []}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <BottomNavBar />

        </View>
    );
}