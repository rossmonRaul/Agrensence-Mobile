import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from './lista-seguimiento-agua.styles'
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
import { WaterDataInterface } from '../../../../interfaces/usoAguaInterface';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerUsuariosPorRol3 } from '../../../../servicios/ServicioUsuario';
import { ObtenerUsoAgua } from '../../../../servicios/ServicioUsoAgua';

export const ListaSeguimientoAguaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [fincas, setFincas] = useState<{ idFinca: number }[] | []>([]);
    const [apiData, setApiData] = useState<WaterDataInterface[]>([]);
    const [datosUsoAguaFiltradosData, setdatosUsoAguaFiltradosData] = useState<any[]>([]);
    const [datosUsoAgua, setdatosUsoAgua] = useState<any[]>([]);

    //para poder hacer el filtro de los datos del api
    useEffect(() => {
        // Obtener los IDs de las fincas del usuario
        const idFincasUsuario = fincas.map(finca => finca.idFinca);
    
        // Filtrar las medicionesUsoAguaFiltradas por los IDs de las fincas del usuario
        const medicionesUsoAguafiltradas = apiData.filter(item => idFincasUsuario.includes(item.idFinca));
        
        // Actualizar el estado con las mediciones filtradas
        setdatosUsoAguaFiltradosData(medicionesUsoAguafiltradas);
        setdatosUsoAgua(medicionesUsoAguafiltradas)
    }, [apiData, fincas]);
    

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { idEmpresa: userData.idEmpresa };
            try {

                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosPorRol3(formData);
                
                const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idFinca)))
                    .map(idFinca => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                        const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                        return { idFinca, nombreFinca };
                    });
                    setFincas(fincasUnicas);
                const datosUsoAgua = await ObtenerUsoAgua();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = datosUsoAgua.map((item) => ({
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
        'Fecha': 'fecha',
        'Actividad': 'actividad',
        'Caudal': 'caudal',
        'Consumo de agua': 'consumoAgua',
        'Observaciones': 'observaciones', 
        'Estado': 'estado'
    };

    //funcion para enviarlo a modificar registro del seguimiento del uso del agua
    const handleRectanglePress = (idRegistroSeguimientoUsoAgua: string,idFinca: string, idParcela: string, fecha: string,
        actividad: string, caudal: number, consumoAgua: number,
        observaciones: string, estado: string) => {
            //ESTA PARTE SE MODIFICA CUANDO SE TENGA LA PANTALLA DE MODIFICAR
        navigation.navigate(ScreenProps.ModifyUseWatterScreen.screenName, {
            idRegistroSeguimientoUsoAgua: idRegistroSeguimientoUsoAgua,
            idFinca:idFinca,idParcela:idParcela,
            fecha: fecha, actividad: actividad,
            caudal: caudal, consumoAgua: consumoAgua, observaciones: observaciones,
            estado: estado
        });
    };
    //funcion para poder buscar de acuerdo a al usuario, finca o parcela
    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = datosUsoAguaFiltradosData.filter((item) => {
            return (
                    item.actividad.toString().toLowerCase().includes(lowercaseQuery)
            );
        });

        setdatosUsoAgua(filteredData);
    };

    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                {/* este es el boton de volver y se le coloca la pagina donde regresa*/}
                <BackButtonComponent screenName={ScreenProps.HidricMenu.screenName} color={'#274c48'} />
                {/* este es el boton de agregar y se le coloca la pagina donde agrega*/}
                <AddButtonComponent screenName={ScreenProps.RegisterUseWaterScreen.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de seguimiento del uso del agua </Text>
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
                    {datosUsoAgua.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idRegistroSeguimientoUsoAgua} onPress={() => handleRectanglePress(item.idRegistroSeguimientoUsoAgua,item.idFinca, item.idParcela,
                                item.fecha, item.actividad, item.caudal, item.consumoAgua, item.observaciones,item.estado)}>
                                <CustomRectangle
                                    key={item.idRegistroSeguimientoUsoAgua}
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