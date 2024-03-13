import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from './lista-calidad-suelo.style'
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { FloorDataInterface } from '../../../../interfaces/calidadsueloInterfaces';
import { ObtenerMedicionesSuelo } from '../../../../servicios/ServicioCalidadSuelo';

export const ListaCalidadSueloScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [apiData, setApiData] = useState<FloorDataInterface[]>([]);
    const [calidadSueloFiltradosData, setCalidadSueloFiltradosData] = useState<any[]>([]);
    //para poder hacer el filtro de los datos del api
    useEffect(() => {
        //filtrar los datos con la identificacion del usuario que inicia
        const medicionesSuelofiltradas = apiData.filter(item => item.identificacionUsuario === userData.identificacion);
        setCalidadSueloFiltradosData(medicionesSuelofiltradas);
    }, [apiData, userData.identificacion]);
    
    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            
            try {
                const medicionesSuelo = await ObtenerMedicionesSuelo();
                
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = medicionesSuelo.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));
                setApiData(filteredData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        obtenerDatosIniciales();
    }, [userData.identificacion]);
    

    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha:': 'fechaCreacion',
        'Usuario': 'usuario',
        'Finca': 'finca',
        'Parcela': 'parcela',
        'Estado':'estado'
    };



    //funcion para enviarlo a modificar calidad suelo 
    const handleRectanglePress = (idMedicionesSuelo: number,medicionesCalidadSuelo:string,
        respiracionSuelo:number,infiltracion: number,densidadAparente:number,
        conductividadElectrica:number,Ph:number,nitratosSuelo:number,estabilidadAgregados:number,
        desleimiento:number,lombrices:number, observaciones:string, calidadAgua:number, estado: string) => {
            
        navigation.navigate(ScreenProps.ModifyQualityFloorScreen.screenName, {idMedicionesSuelo:idMedicionesSuelo,
            medicionesCalidadSuelo:medicionesCalidadSuelo,respiracionSuelo:respiracionSuelo,
            infiltracion:infiltracion,densidadAparente:densidadAparente,conductividadElectrica:conductividadElectrica,
            ph:Ph,nitratosSuelo:nitratosSuelo,estabilidadAgregados:estabilidadAgregados,desleimiento:desleimiento,
            lombrices:lombrices,observaciones:observaciones,calidadAgua:calidadAgua, estado:estado
        });
    };
    //funcion para poder buscar de acuerdo a al usuario, finca o parcela
    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = apiData.filter((item) => {
            return (
                item.usuario.toLowerCase().includes(lowercaseQuery) ||
                item.parcela.toLowerCase().includes(lowercaseQuery) ||
                item.finca.toLowerCase().includes(lowercaseQuery)
            );
        });
        setCalidadSueloFiltradosData(filteredData);
    };


    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.MenuFloor.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterQualityFloorScreen.screenName} color={'#274c48'} />
                
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de Calidad de Suelo</Text>
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
                    {calidadSueloFiltradosData.map((item, index) => {
                        
                        return (
                            <TouchableOpacity key={item.idMedicionesSuelo} onPress={() => handleRectanglePress(item.idMedicionesSuelo,
                            item.medicionesCalidadSuelo,item.respiracionSuelo,item.infiltracion,item.densidadAparente,item.conductividadElectrica,
                            item.pH,item.nitratosSuelo,item.estabilidadAgregados,item.desleimiento,item.lombrices,item.observaciones,
                            item.calidadAgua, item.estado)}>
                                <CustomRectangle
                                    key={item.idMedicionesSuelo}
                                    data={processData([item], keyMapping)?.data || []} />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

            </View>

            <BottomNavBar />

        </View>
    );
}