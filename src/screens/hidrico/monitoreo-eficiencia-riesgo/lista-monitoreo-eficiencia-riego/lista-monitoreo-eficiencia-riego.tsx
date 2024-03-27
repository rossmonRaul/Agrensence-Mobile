import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './lista-monitoreo-eficiencia-riego.styles';
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
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerEficienciaRiego } from '../../../../servicios/ServicioUsoAgua';

export const ListaMonitoreoEficienciaRiegoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [rotacionCultivos, setRotacionCultivos] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Volumen de agua utilizado': 'volumenAguaUtilizado',
        'Fugas': 'estadoTuberiasYAccesorios',
        'Uniformidad del riego': 'uniformidadRiego',
        'Estado de los aspersores': 'estadoAspersores',
        'Estado de canales de riego': 'estadoCanalesRiego',
        'Nivel freático': 'nivelFreatico',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idMonitoreoEficienciaRiego: string, idFinca: string, idParcela: string, estado: string) => {
        // Encuentra el elemento correspondiente en los datos originales utilizando el ID único
        const originalDataItem = originalApiData.find(item => item.idMonitoreoEficienciaRiego === idMonitoreoEficienciaRiego);

        if (originalDataItem) {
            // Si se encuentra el elemento correspondiente, puedes acceder a sus propiedades directamente
            navigation.navigate(ScreenProps.ModifyIrrigationEfficiency.screenName, {
                idMonitoreoEficienciaRiego: originalDataItem.idMonitoreoEficienciaRiego,
                idFinca: idFinca,
                volumenAguaUtilizado: originalDataItem.volumenAguaUtilizado,
                estadoTuberiasYAccesorios: originalDataItem.estadoTuberiasYAccesorios,
                uniformidadRiego: originalDataItem.uniformidadRiego,
                estadoAspersores: originalDataItem.estadoAspersores,
                estadoCanalesRiego: originalDataItem.estadoCanalesRiego,
                nivelFreatico: originalDataItem.nivelFreatico,
                idParcela: idParcela,
                estado: estado
            });
        } else {
            // Maneja el caso en el que no se encuentra el elemento correspondiente
            console.error('No se encontró el elemento correspondiente en los datos originales.');
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };

            try {
                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
                const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idFinca)))
                    .map(idFinca => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                        const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                        return { idFinca, nombreFinca };
                    });

                setFincas(fincasUnicas);
                //Se obtienen las parcelas para poder hacer los filtros despues


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
                //se obtienen la rotacion de cultivos para despues poder filtrarlos
                const rotacionCultivosResponse = await ObtenerEficienciaRiego();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = rotacionCultivosResponse.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                    estadoTuberiasYAccesorios: item.estadoTuberiasYAccesorios === false ? 'No se encontraron fugas' : 'Se encontraron fugas',
                    uniformidadRiego: item.uniformidadRiego === false ? 'No se observa distrubción' : 'Se observa distrubción',
                    estadoAspersores: item.estadoAspersores === false ? 'No estan obstruidos' : 'Estan obstruidos',
                    estadoCanalesRiego: item.estadoCanalesRiego === false ? 'No se encuentran malezas u obstrucciones' : 'Se encuentran malezas u obstrucciones',
                }));
                setOriginalApiData(rotacionCultivosResponse);
                setApiData(filteredData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);



    //funcion para poder filtrar las parcelas por finca
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {

            const resultado = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(resultado);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
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
        ///se obtienen la rotacion de cultivos de la finca seleccionada
        obtenerRotacionCultivosPorRotacionPorFinca(fincaId);
    };

    //funcion para la accion del dropdown parcela
    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        //se necesita el fincaId para poder hacer el filtrado
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        //se asigna el valor de la parcela en selecteParcela
        setSelectedParcela(item.value)
        //si finca Id es null no se puede seleciona ni traer el y mostrar los rotacion de cultivos
        if (fincaId !== null) {

            obtenerRotacionCultivosPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };


    const obtenerRotacionCultivosPorRotacionPorFinca = async (fincaId: number) => {
        try {

            const rotacionCultivosFiltrado = apiData.filter(item => item.idFinca === fincaId)
            setRotacionCultivos(rotacionCultivosFiltrado)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const obtenerRotacionCultivosPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const rotacionCultivosFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setRotacionCultivos(rotacionCultivosFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.HidricMenu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertIrrigationEfficiency.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de monitoreo eficiencia de riego</Text>
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
                    {rotacionCultivos.map((item, index) => ( // Cambiar rotacionCultivos por rotacionCultivosFiltradosData
                        <TouchableOpacity key={item.idMonitoreoEficienciaRiego} onPress={() => handleRectanglePress(
                            item.idMonitoreoEficienciaRiego, item.idFinca, item.idParcela, item.estado
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
