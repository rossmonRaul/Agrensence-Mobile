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
import { residueDataInterface } from '../../../../interfaces/residuosInterfaces';
import { ObtenerManejoResiduos } from '../../../../servicios/ServicioResiduos';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

export const ListaManejoResiduosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [parcelas, setParcelas] = useState<{ idParcela: number }[] | []>([]);
    const [apiData, setApiData] = useState<residueDataInterface[]>([]);
    const [residuosFiltradosData, setResiduosFiltradosData] = useState<any[]>([]);
    const [residuos, setResiduos] = useState<any[]>([]);

    //para poder hacer el filtro de los datos del api
    useEffect(() => {
        // Obtener los IDs de las parcelas del usuario
        const idParcelasUsuario = parcelas.map(parcela => parcela.idParcela);

        // Filtrar las residuosFiltradas por los IDs de las parcelas del usuario
        const residuosfiltradas = apiData.filter(item => idParcelasUsuario.includes(item.idParcela));

        // Actualizar el estado con las residuos filtradas
        setResiduosFiltradosData(residuosfiltradas);
        setResiduos(residuosfiltradas)
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
                const medicionesSuelo = await ObtenerManejoResiduos();
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
        'Usuario': 'usuario',
        'Residuo': 'residuo',
        'Fecha Generacion': 'fechaGeneracion',
        'Fecha Manejo': 'fechaManejo',
        'Destino': 'destinoFinal',
        'Cantidad(kg)': 'cantidad',
        'Accion Manejo': 'accionManejo',
        'Finca': 'finca',
        'Parcela': 'parcela',
        'Estado': 'estado'
    };



    //funcion para enviarlo a modificar residuo
    const handleRectanglePress = (idManejoResiduos: number, residuo: string, fechaGeneracion: string,
        fechaManejo: string, cantidad: number, accionManejo: string, destinoFinal: string, idFinca: number, idParcela: number,
        estado: string) => {

        navigation.navigate(ScreenProps.ModifyResidue.screenName, {
            idManejoResiduos: idManejoResiduos, residuo: residuo,
            fechaGeneracion: fechaGeneracion, fechaManejo: fechaManejo, cantidad: cantidad, accionManejo: accionManejo, destinoFinal: destinoFinal,
            idFinca: idFinca, idParcela: idParcela, estado: estado
        });
    };
    //funcion para poder buscar de acuerdo a al usuario, finca o parcela
    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = residuosFiltradosData.filter((item) => {
            return (
                item.usuario.toLowerCase().includes(lowercaseQuery) ||
                item.parcela.toLowerCase().includes(lowercaseQuery) ||
                item.finca.toLowerCase().includes(lowercaseQuery)
            );
        });
        setResiduos(filteredData);
    };


    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminCrops.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterResidue.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista Residuos</Text>
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
                    {residuos.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idManejoResiduos} onPress={() => handleRectanglePress(item.idManejoResiduos, item.residuo, item.fechaGeneracion,
                                item.fechaManejo, item.cantidad, item.accionManejo, item.destinoFinal, item.idFinca, item.idParcela,
                                item.estado)}>
                                <CustomRectangle
                                    key={item.idManejoResiduos}
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