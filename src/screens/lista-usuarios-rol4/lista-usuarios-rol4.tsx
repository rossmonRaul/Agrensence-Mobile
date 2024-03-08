import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './lista-usuarios-rol4.styles'
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosPorRol4 } from '../../servicios/ServicioUsuario';
import { processData } from '../../utils/processData';
import { CustomRectangle } from '../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import BottomNavBar from '../../components/BottomNavbar/BottomNavbar';

export const ListaUsuarioRol4Screen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const { userData } = useAuth();


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Identificación': 'identificacion',
        'Nombre': 'nombre',
        'Correo': 'correo',
        'Estado': 'estado'
    };

    const handleRectanglePress = (identificacion: string) => {
        navigation.navigate(ScreenProps.AssignCompany.screenName, { identificacion: identificacion });
    };

    useEffect(() => {
        ObtenerUsuariosPorRol4()
            .then((response) => {
                //  Filtrar y formatear los datos originales
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
                item.identificacion.toLowerCase().includes(lowercaseQuery) ||
                item.correo.toLowerCase().includes(lowercaseQuery)
            );
        });
        setApiData(filteredData);
    };


    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Lista de usuarios</Text>
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
                    <TouchableOpacity key={item.identificacion} onPress={() => handleRectanglePress(item.identificacion)}>
                        <CustomRectangle
                            key={item.identificacion}
                            data={processData([item], keyMapping)?.data || []} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <BottomNavBar />

        </View>
    );
}