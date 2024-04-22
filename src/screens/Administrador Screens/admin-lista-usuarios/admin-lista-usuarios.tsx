import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosPorRol2, ObtenerUsuariosPorRol3, ObtenerUsuariosPorIdEmpresa } from '../../../servicios/ServicioUsuario';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
interface RouteParams {
    datoValidacion?: string;
}

export const AdminListaUsuarioScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    //  Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    //  Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([])
    const { userData } = useAuth();
    const { params } = useRoute();
    const route = useRoute();

    const { datoValidacion } = route.params as RouteParams;

    //  Se hace el mapeo segun los datos que se ocupen en el formateo

    let keyMapping = {}
    const formData = {
        idEmpresa: userData.idEmpresa
    }

    if (userData.idRol === 1) {
        keyMapping = {
            'Identificación': 'identificacion',
            'Nombre': 'nombre',
            'Correo': 'correo',
            'Estado': 'estado'
        };
    } else if (datoValidacion === '1' && userData.idRol === 2) {
        keyMapping = {
            'Identificación': 'identificacion',
            'Nombre': 'nombre',
            'Correo': 'correo',
            'Estado': 'estado'
        };
    }
    else if (userData.idRol === 2) {
        keyMapping = {
            'Identificación': 'identificacion',
            'Nombre': 'nombre',
            'Correo': 'correo',
            'Estado': 'estado',
            'Finca': 'nombreFinca',
            'Parcela': 'nombreParcela',
        };
    }
    const handleRectanglePress = (item: any) => {

        const { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela, idUsuarioFincaParcela } = item;
        if (userData.idRol === 1) {
            navigation.navigate(ScreenProps.AdminModifyAdminUser.screenName, { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela });
        } else if (datoValidacion === '1' && userData.idRol === 2) {
            navigation.navigate(ScreenProps.AdminModifyAdminUser.screenName, { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela });
        }
        else if (userData.idRol === 2) {
            navigation.navigate(ScreenProps.AdminModifyUser.screenName, { identificacion, nombre, correo, idEmpresa, estado, idRol, idFinca, idParcela, idUsuarioFincaParcela });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // Verifica si el dato específico está presente y el rol es 2
            if (datoValidacion === '1' && userData.idRol === 2) {
                ObtenerUsuariosPorIdEmpresa(formData)
                    .then((response) => {
                        // Procesa y filtra los datos como lo hacías antes
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
            } else {
                // Si el dato específico no está presente o el rol no es 2, usa el método existente
                const fetchMethod = userData.idRol === 1
                    ? () => ObtenerUsuariosPorRol2()
                    : () => ObtenerUsuariosPorRol3(formData);

                fetchMethod()
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
            }
        }, [userData.idRol, datoValidacion])
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
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                {userData.idRol === 1 &&
                    <AddButtonComponent screenName={ScreenProps.AdminRegisterUser.screenName} color={'#274c48'} />
                }
                {userData.idRol === 2 && datoValidacion === '1' &&
                    <AddButtonComponent screenName={ScreenProps.Register.screenName} color={'#274c48'} />
                }
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
                        const modifiedIdentificacion = userData.idRol === 1 || userData.idRol == 2 && datoValidacion === '1' ? item.identificacion : item.idUsuarioFincaParcela;

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
            </View>

            <BottomNavBar />
        </View>

    );
}