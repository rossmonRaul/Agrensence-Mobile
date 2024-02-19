import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './asignar-usuarios.styles'
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosRolNoAsignado } from '../../servicios/ServicioUsuario';
import { processData } from '../../utils/processData';
import { CustomRectangle } from '../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { Screen_Names } from '../../constants';
import { NavigationProp } from '@react-navigation/native';

type AppParamList = {
    AssignEmpresa: { identificacion: string };
};
export const AsignarUsuariosScreen: React.FC = () => {
    const navigation = useNavigation();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const handleBackPress = () => {
        console.log('Botón de retroceso presionado');
    };


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Identificación': 'identificacion',
        'Correo': 'correo',
        'Estado': 'estado'
    };

    const handleRectanglePress = (
        navigation: NavigationProp<AppParamList>,
        identificacion: string
    ) => {
        navigation.navigate('AssignEmpresa', { identificacion: identificacion });
    };

    useEffect(() => {
        ObtenerUsuariosRolNoAsignado()
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
            <BackButtonComponent onPress={handleBackPress} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Asignar usuarios</Text>
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
                    <TouchableOpacity key={item.identificacion} onPress={() => handleRectanglePress(navigation as never, item.identificacion)}>
                        <CustomRectangle
                            key={item.identificacion}
                            data={processData([item], keyMapping)?.data || []} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

        </View>
    );
}