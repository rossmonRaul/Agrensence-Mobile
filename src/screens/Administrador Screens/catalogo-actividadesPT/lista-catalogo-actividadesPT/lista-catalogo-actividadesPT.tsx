import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerDatosPreparacionTerrenoActividad } from '../../../../servicios/ServicioCatalogoActividadPT';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
interface ActividadInterface {
    idActividad: number;
    nombre: string;
    estado: number;
}

type RootStackParamList = {
    ListCatalogoActividades: { reload: boolean };
};

export const ListaCatalogoActividadesPTScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();
    const route = useRoute<RouteProp<RootStackParamList, 'ListCatalogoActividades'>>();

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [apiData, setApiData] = useState<ActividadInterface[]>([]);
    const [actividadesFiltradasData, setActividadesFiltradas] = useState<ActividadInterface[]>([]);

    const obtenerDatosIniciales = async () => {
        try {
            const actividades = await ObtenerDatosPreparacionTerrenoActividad();
            const filteredData = actividades.map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));
            setApiData(filteredData);
            setOriginalApiData(filteredData);
            setActividadesFiltradas(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            obtenerDatosIniciales();

            return () => { };
        }, [route.params?.reload])
    );

    const handleRectanglePress = (actividad: ActividadInterface) => {
        navigation.navigate(ScreenProps.ModifyCatalogoActividad.screenName, {
            idActividad: actividad.idActividad,
            nombre: actividad.nombre,
            usuarioCreacionModificacion: userData.identificacion,
            estado: actividad.estado
        });
    };

    const keyMapping = {
        'Nombre': 'nombre',
        'Estado': 'estado'
    };

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
                <AddButtonComponent screenName={ScreenProps.RegisterCatalogoActividad.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Catálogo de actividades de preparación de terreno</Text>
                </View>

                <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#888" style={{   position: 'absolute', right: 20,top:10, zIndex: 1,}} />
                <TextInput
                    style={[styles.searchInput, {marginLeft:45}]}
                    placeholder="Buscar información"
                    onChangeText={(text) => handleSearch(text)}
                />
                {/* <TouchableOpacity style={styles.searchIconContainer}>
                    <Ionicons name="search" size={20} color="#333" />
                </TouchableOpacity> */}
            </View>

                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {apiData.map((item) => {
                        const estadoTexto = item.estado === 1 ? 'Inactivo' : 'Activo';
                        return (
                            <TouchableOpacity key={item.idActividad} onPress={() => handleRectanglePress(item)}>
                                <CustomRectangle
                                    key={item.idActividad}
                                    data={processData([{ ...item, estado: estadoTexto }], keyMapping)?.data || []}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            <BottomNavBar />
            {isAlertVisibleAuth  && (
                <CustomAlertAuth
                isVisible={isAlertVisibleAuth }
                onClose={hideAlertAuth }
                message={alertPropsAuth .message}
                iconType={alertPropsAuth .iconType}
                buttons={alertPropsAuth .buttons}
                navigateTo={alertPropsAuth .iconType === 'success' ? () => {} : undefined}
                />
                )}
        </View>
    );
}

export default ListaCatalogoActividadesPTScreen;
