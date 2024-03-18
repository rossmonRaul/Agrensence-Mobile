import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './lista-rotacion-cultivo.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { ObtenerUsuariosPorRol3 } from '../../../../servicios/ServicioUsuario';
import { ObtenerRotacionCultivoSegunEstacionalidad } from '../../../../servicios/ServicioCultivos';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

export const ListaRotacionCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [fincas, setFincas] = useState<{ idFinca: number }[] | []>([]);

    // Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [rotacionCultivosFiltradosData, setRotacionCultivosFiltradosData] = useState<any[]>([]);
    const [rotacionCultivos, setRotacionCultivos] = useState<any[]>([]);
    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Cultivo': 'cultivo',
        'Epoca siembra': 'epocaSiembra',
        'Tiempo siembra': 'tiempoCosecha',
        'Cultivo siembra': 'cultivoSiguiente',
        'Epoca siguiente de siembra': 'epocaSiembraCultivoSiguiente',
        'Estado': 'estado'
    };

    const handleRectanglePress = () => {
        console.log('Hola');
    };

    useEffect(() => {
        // Obtener los IDs de las fincas del usuario
        const idFincasUsuario = fincas.map(finca => finca.idFinca);

        // Filtrar las medicionesSueloFiltradas por los IDs de las fincas del usuario
        const medicionesSuelofiltradas = apiData.filter(item => idFincasUsuario.includes(item.idFinca));

        // Actualizar el estado con las mediciones filtradas
        setRotacionCultivosFiltradosData(medicionesSuelofiltradas);
        setRotacionCultivos(medicionesSuelofiltradas)
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
                const medicionesSuelo = await ObtenerRotacionCultivoSegunEstacionalidad();

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



    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = rotacionCultivosFiltradosData.filter((item) => {
            return (
                item.cultivo.toLowerCase().includes(lowercaseQuery) ||
                item.epocaSiembra.toLowerCase().includes(lowercaseQuery) ||
                item.tiempoCosecha.toLowerCase().includes(lowercaseQuery) ||
                item.cultivoSiguiente.toLowerCase().includes(lowercaseQuery) ||
                item.epocaSiembraCultivoSiguiente.toLowerCase().includes(lowercaseQuery)
            );
        });
        setRotacionCultivos(filteredData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertCropRotation.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de rotación de cultivos</Text>
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
                    {rotacionCultivos.map((item, index) => (
                        <TouchableOpacity key={item.idRotacionCultivoSegunEstacionalidad} onPress={() => handleRectanglePress()}>
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
};
