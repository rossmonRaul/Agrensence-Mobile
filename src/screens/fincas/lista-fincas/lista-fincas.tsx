import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './lista-fincas.styles'
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';

export const ListaFincasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const { userData } = useAuth();


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Nombre': 'nombre',
        'Estado': 'estado'
        
    };

    const handleRectanglePress = (idFinca: string, Nombre: string, Estado: string) => {
        navigation.navigate(ScreenProps.ModifyEstate.screenName, { idFinca: idFinca, nombre: Nombre, estado: Estado });
    };

    useEffect(() => {
        ObtenerFincas()
            .then((response) => {
                
                //  Filtrar los datos de la api de acuerdo al id de la
                let fincaSort = response.filter(item => item.idEmpresa === userData.idEmpresa);

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
            
            <View style={styles.listcontainer}>
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <AddButtonComponent screenName={ScreenProps.RegisterEstate.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de fincas</Text>
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
                        <TouchableOpacity key={item.idFinca} onPress={() => handleRectanglePress(item.idFinca, item.nombre, item.estado)}>
                            <CustomRectangle
                                key={item.idFinca}
                                data={processData([item], keyMapping)?.data || []} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <BottomNavBar />

        </View>
    );
}