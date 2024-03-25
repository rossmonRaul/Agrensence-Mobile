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
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';

export const ListaRotacionCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos originales sin filtrar
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [rotacionCultivosFiltradosData, setRotacionCultivosFiltradosData] = useState<any[]>([]);
    const [rotacionCultivos, setRotacionCultivos] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Cultivo': 'cultivo',
        'Epoca siembra': 'epocaSiembra',
        'Tiempo siembra': 'tiempoCosecha',
        'Cultivo siembra': 'cultivoSiguiente',
        'Epoca siguiente de siembra': 'epocaSiembraCultivoSiguiente',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idRotacionCultivoSegunEstacionalidad: string, idFinca: string, idParcela: string, cultivo: string,
        epocaSiembra: string, tiempoCosecha: string, cultivoSiguiente: string,
        epocaSiembraCultivoSiguiente: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyCropRotation.screenName, {
            idRotacionCultivoSegunEstacionalidad: idRotacionCultivoSegunEstacionalidad, idFinca: idFinca, idParcela: idParcela,
            cultivo: cultivo, epocaSiembra: epocaSiembra, tiempoCosecha: tiempoCosecha, cultivoSiguiente: cultivoSiguiente,
            epocaSiembraCultivoSiguiente: epocaSiembraCultivoSiguiente, estado: estado
        });
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

                const parcelas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idParcela)))
                    .map(idParcela => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
                        const idFinca = relacion ? relacion.idFinca : -1;
                        const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
                        return { idFinca, idParcela, nombreParcela };
                    });

                setParcelas(parcelas);

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
                item.cultivoSiguiente.toLowerCase().includes(lowercaseQuery)
            );
        });
        setRotacionCultivos(filteredData);
    };

    //funcion para la accion del dropdown de finca
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        //se selecciona el item de finca
        setSelectedFinca(item.value);
        //se reinicia la seleccion de parcela
        setSelectedParcela('Seleccione una Parcela')
        //se obtienen las parcelas de la finca seleccionada
        obtenerParcelasPorFinca(fincaId);
        ///se obtienen los fertilizantes de la finca seleccionada
        obtenerFertilizantesPorFinca(fincaId);
    };

    //funcion para la accion del dropdown parcela
    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        //se necesita el fincaId para poder hacer el filtrado
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        //se asigna el valor de la parcela en selecteParcela
        setSelectedParcela(item.value)
        //si finca Id es null no se puede seleciona ni traer el y mostrar los fertilizantes 
        if (fincaId !== null) {

            obtenerFertilizantesPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch fertilizantes.');
        }
    };
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {

            const resultado = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(resultado);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };
    const obtenerFertilizantesPorFinca = async (fincaId: number) => {
        try {

            const rotacionFiltrada = apiData.filter(item => item.idFinca === fincaId)
            setRotacionCultivosFiltradosData(rotacionFiltrada)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    //se filtra los feritilizantes por finca y parcela seleccionados en el dropdown
    const obtenerFertilizantesPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const rotacionFiltrada = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setRotacionCultivosFiltradosData(rotacionFiltrada);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertCropRotation.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de rotación de cultivos</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    {/* Dropdown para Fincas */}
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="map-marker"
                        onChange={handleFincaChange}
                    />

                    {/* Dropdown para Parcelas */}
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="map-marker"
                        onChange={handleParcelaChange}
                    />
                </View>
                {/* <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar información"
                        onChangeText={(text) => handleSearch(text)}
                    />
                    <TouchableOpacity style={styles.searchIconContainer}>
                        <Ionicons name="search" size={20} color="#333" />
                    </TouchableOpacity>
                </View> */}

                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {rotacionCultivosFiltradosData.map((item, index) => ( // Cambiar rotacionCultivos por rotacionCultivosFiltradosData
                        <TouchableOpacity key={item.idRotacionCultivoSegunEstacionalidad} onPress={() => handleRectanglePress(
                            item.idRotacionCultivoSegunEstacionalidad, item.idFinca, item.idParcela,
                            item.cultivo, item.epocaSiembra, item.tiempoCosecha, item.cultivoSiguiente,
                            item.epocaSiembraCultivoSiguiente, item.estado
                        )}>
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
