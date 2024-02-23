import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './admin-lista-usuarios.styles'
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosPorRol2, ObtenerUsuariosPorRol3 } from '../../../servicios/ServicioUsuario';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
export const AdminListaUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([])
    const { userData } = useAuth();

    //  Se hace el mapeo segun los datos que se ocupen en el formateo

    let keyMapping = {}
    const formData = {
        idEmpresa: userData.idEmpresa
    }

    if (userData.idRol === 1) {
        keyMapping = {
            'Identificación': 'identificacion',
            'Correo': 'correo',
            'Estado': 'estado'
        };
    } else if (userData.idRol === 2) {
        keyMapping = {
            'Identificación': 'identificacion',
            'Correo': 'correo',
            'Estado': 'estado',
            'Finca': 'nombreFinca',
            'Parcela': 'nombreParcela',
        };
    }
    const handleRectanglePress = (item: any) => {

        const { identificacion, idEmpresa, idRol, idFinca, idParcela, idUsuarioFincaParcela } = item;
        if (userData.idRol === 1) {
            navigation.navigate(ScreenProps.AdminModifyAdminUser.screenName, { identificacion, idEmpresa, idRol, idFinca, idParcela });
        } else if (userData.idRol === 2) {
            navigation.navigate(ScreenProps.AdminModifyUser.screenName, { identificacion, idEmpresa, idRol, idFinca, idParcela, idUsuarioFincaParcela });
        }
    };

    useFocusEffect(
        //  Se recarga la pagina en dado caso de que lo necesesite
        React.useCallback(() => {
            //  Segun si es rol 1 o 2 carga un metodo de fetch o el otro
            const fetchMethod = userData.idRol === 1
                ? () => ObtenerUsuariosPorRol2()
                : () => ObtenerUsuariosPorRol3(formData);

            fetchMethod()
                //  Se filtran los datos de estado por activo o inactivo
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

        }, [userData.idRol])
    );

    //Hace la busqueda de los datos segun los datos que inserte
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
                {apiData.map((item, index) => {
                    //  Esto verifica que si el idRol es 1 que utilice la identificación y si no el idUsuarioFincaParcela
                    const modifiedIdentificacion = userData.idRol === 1 ? item.identificacion : item.idUsuarioFincaParcela;

                    return (
                        <TouchableOpacity key={modifiedIdentificacion} onPress={() => handleRectanglePress(item)}>
                            <CustomRectangle
                                key={modifiedIdentificacion}
                                data={processData([{ ...item }], keyMapping)?.data || []}
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <BottomNavBar />
        </View>
    );
}