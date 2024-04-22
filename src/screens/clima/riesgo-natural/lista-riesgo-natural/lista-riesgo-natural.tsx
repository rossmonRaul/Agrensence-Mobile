import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
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
import { riesgoNaturalDataInterface } from '../../../../interfaces/riesgoNaturalInterface';
import { ObtenerRiesgosNaturales } from '../../../../servicios/ServicioRiesgoNatural';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

export const ListaRiesgoNaturalScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [parcelas, setParcelas] = useState<{ idParcela: number }[] | []>([]);
    const [apiData, setApiData] = useState<riesgoNaturalDataInterface[]>([]);
    const [riesgosFiltradosData, setRiesgosFiltradosData] = useState<any[]>([]);
    const [riesgos, setRiesgos] = useState<any[]>([]);

    //para poder hacer el filtro de los datos del api
    useEffect(() => {
        // Obtener los IDs de las parcelas del usuario
        const idParcelasUsuario = parcelas.map(parcela => parcela.idParcela);

        // Filtrar las residuosFiltradas por los IDs de las parcelas del usuario
        const residuosfiltradas = apiData.filter(item => idParcelasUsuario.includes(item.idParcela));

        // Actualizar el estado con las residuos filtradas
        setRiesgosFiltradosData(residuosfiltradas);
        setRiesgos(residuosfiltradas)
    }, [apiData, parcelas]);


    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };
            try {

                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

                const parcelasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idParcela)))
                    .map(idParcela => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
                        const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
                        return { idParcela, nombreParcela };
                    });
                setParcelas(parcelasUnicas)
                const riesgosNaturales = await ObtenerRiesgosNaturales();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = riesgosNaturales.map((item) => ({
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
        'Finca': 'nombreFinca',
        'Parcela': 'nombreParcela',
        'Riesgo': 'riesgoNatural',
        'Responsable': 'responsable',
        'Estado': 'estado'
    };



    //funcion para enviarlo a modificar residuo
    const handleRectanglePress = (idRiesgoNatural: string, fecha: string, riesgoNatural: string,
        practicaPreventiva: string, responsable: number, resultadoPractica: string,
        accionesCorrectivas: string, observaciones: string, idFinca: string, idParcela: string,
        estado: string) => {

        navigation.navigate(ScreenProps.ModifyRiskNatural.screenName, {
            idRiesgoNatural: idRiesgoNatural, fecha: fecha, riesgoNatural: riesgoNatural,
            practicaPreventiva: practicaPreventiva, responsable: responsable,
            resultadoPractica: resultadoPractica, accionesCorrectivas: accionesCorrectivas,
            observaciones: observaciones, idFinca: idFinca, idParcela: idParcela, estado: estado
        });
    };
    //funcion para poder buscar de acuerdo a al usuario, finca o parcela
    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = riesgosFiltradosData.filter((item) => {
            return (
                item.nombreParcela.toLowerCase().includes(lowercaseQuery) ||
                item.nombreFinca.toLowerCase().includes(lowercaseQuery)
            );
        });
        setRiesgos(filteredData);
    };


    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminWeather.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertRiskNatural.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista Riesgos Naturales</Text>
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
                    {riesgos.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idRiesgoNatural} onPress={() => handleRectanglePress(item.idRiesgoNatural, item.fecha, item.riesgoNatural,
                                item.practicaPreventiva, item.responsable, item.resultadoPractica, item.accionesCorrectivas, item.observaciones, item.idFinca, item.idParcela,
                                item.estado)}>
                                <CustomRectangle
                                    key={item.idRiesgoNatural}
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