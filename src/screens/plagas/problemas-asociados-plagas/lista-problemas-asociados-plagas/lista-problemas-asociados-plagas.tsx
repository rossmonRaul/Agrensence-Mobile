import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerRegistroSeguimientoPlagasYEnfermedades } from '../../../../servicios/ServicioPlagas&Enfermedades';

export const ListaProblemasAsociadosPlagasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [problemasAsociadosPlagas, setProblemasAsociadosPlagas] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha': 'fecha',
        'Cultivo': 'cultivo',
        'Plaga': 'plagaEnfermedad',
        'Problema': 'problema',
        'Incidencia': 'incidencia',
        'Metodología de estimación': 'metodologiaEstimacion',
        'Acción tomada': 'accionTomada',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idRegistroSeguimientoPlagasYEnfermedades: string, idFinca: string, idParcela: string, fecha: string,
        cultivo: string, plagaEnfermedad: string, incidencia: string, metodologiaEstimacion: string, problema: string, accionTomada: string, estado: string) => {
        // Encuentra el elemento correspondiente en los datos originales utilizando el ID único

        // Si se encuentra el elemento correspondiente, puedes acceder a sus propiedades directamente
        navigation.navigate(ScreenProps.ModifyPestsDiseases.screenName, {
            idRegistroSeguimientoPlagasYEnfermedades: idRegistroSeguimientoPlagasYEnfermedades,
            idFinca: idFinca,
            idParcela: idParcela,
            fecha: fecha,
            cultivo: cultivo,
            plagaEnfermedad: plagaEnfermedad,
            incidencia: incidencia,
            metodologiaEstimacion: metodologiaEstimacion,
            problema: problema,
            accionTomada: accionTomada,
            estado: estado
        });

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
                //se obtienen los datos de el registro problemas asociados a plagas para despues poder filtrarlos
                const registroProblemasAsociadosPlagasResponse = await ObtenerRegistroSeguimientoPlagasYEnfermedades();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = registroProblemasAsociadosPlagasResponse.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));
                setOriginalApiData(registroProblemasAsociadosPlagasResponse);
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
    };

    //funcion para la accion del dropdown parcela
    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        //se necesita el fincaId para poder hacer el filtrado
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        //se asigna el valor de la parcela en selecteParcela
        setSelectedParcela(item.value)
        //si finca Id es null no se puede seleciona ni traer el y mostrar el registro problemas asociados a plagas
        if (fincaId !== null) {

            obtenerProblemasAsociadosPlagasPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };




    // filtra los datos de el registro problemas asociados a plagas
    const obtenerProblemasAsociadosPlagasPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const problemasAsociaadosFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setProblemasAsociadosPlagas(problemasAsociaadosFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.MenuPests.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertPestsDiseases.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista problemas asociados a plagas y enfermedades </Text>
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
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {problemasAsociadosPlagas.map((item, index) => (
                        <TouchableOpacity key={item.idRegistroSeguimientoPlagasYEnfermedades} onPress={() => handleRectanglePress(
                            item.idRegistroSeguimientoPlagasYEnfermedades, item.idFinca, item.idParcela, item.fecha, item.cultivo, item.plagaEnfermedad, item.incidencia,
                            item.metodologiaEstimacion, item.problema, item.accionTomada, item.estado
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
