import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerDatosPreparacionTerreno, ObtenerDatosPreparacionTerrenoActividad, ObtenerDatosPreparacionTerrenoMaquinaria } from '../../../../servicios/ServicioPreparacionTerreno';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { RelacionFincaParcela, UserDataInterface } from '../../../../interfaces/userDataInterface';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { LandPreparationDataInterface } from '../../../../interfaces/preparacionTerreno';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

type RootStackParamList = {
    ListLandPreparation: { reload: boolean };
};

export const ListaPreparacionTerrenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute<RouteProp<RootStackParamList, 'ListLandPreparation'>>();

    const [apiData, setApiData] = useState<LandPreparationDataInterface[]>([]);
    const [preparacionTerrenoFiltradosData, setPreparacionTerrenoFiltrados] = useState<any[]>([]);
    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);

    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const [actividades, setActividades] = useState<{ idActividad: number; nombre: string }[]>([]);
    const [maquinarias, setMaquinarias] = useState<{ idMaquinaria: number; nombre: string }[]>([]);

    const obtenerDatosIniciales = async () => {
        const formData = { identificacion: userData.identificacion };

        try {
            const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
            const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                .filter(item => item !== undefined)
                .map(item => item!.idFinca)))
                .map(idFinca => {
                    const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                    const nombreFinca = relacion ? relacion.nombreFinca : '';
                    return { idFinca, nombreFinca };
                });

            setFincas(fincasUnicas);

            const parcelas = Array.from(new Set(datosInicialesObtenidos
                .filter(item => item !== undefined)
                .map(item => item!.idParcela)))
                .map(idParcela => {
                    const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
                    const idFinca = relacion ? relacion.idFinca : -1;
                    const nombreParcela = relacion ? relacion.nombreParcela : '';
                    return { idFinca, idParcela, nombreParcela };
                });

            setParcelas(parcelas);

            const preparacionTerreno = await ObtenerDatosPreparacionTerreno();
            const filteredData = preparacionTerreno.filter(item => item.estado === 1).map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));

            setApiData(filteredData);

            // Obtener actividades y maquinarias
            const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
            setActividades(actividadesResponse);

            const maquinariasResponse = await ObtenerDatosPreparacionTerrenoMaquinaria();
            setMaquinarias(maquinariasResponse);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            obtenerDatosIniciales();

            // Limpiar selectores y lista de registros
            setSelectedFinca(null);
            setSelectedParcela(null);
            setParcelasFiltradas([]);
            setPreparacionTerrenoFiltrados([]);

            return () => {
            };
        }, [route.params?.reload])
    );

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const resultado = parcelas.filter(item => item.idFinca === fincaId);
            setParcelasFiltradas(resultado);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };

    const obtenerPreparacionTerrenoPorFinca = async (fincaId: number) => {
        try {
            const preparacionTerrenoFiltrado = apiData.filter(item => item.idFinca === fincaId);
            setPreparacionTerrenoFiltrados(preparacionTerrenoFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const obtenerPreparacionTerrenoPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {
            const preparacionTerrenoFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);
            setPreparacionTerrenoFiltrados(preparacionTerrenoFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        setSelectedParcela('Seleccione una Parcela');
        obtenerParcelasPorFinca(fincaId);
        obtenerPreparacionTerrenoPorFinca(fincaId);
    };

    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        setSelectedParcela(item.value);
        if (fincaId !== null) {
            obtenerPreparacionTerrenoPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };

    const keyMapping = {
        'Fecha': 'fecha',
        'Actividad': 'actividad',
        'Maquinaria': 'maquinaria',
        'Identificación': 'identificacion',
        'Horas Trabajadas': 'horasTrabajadas',
        'Pago por Hora': 'pagoPorHora',
        'Pago Total': 'totalPago',
        'Observaciones': 'observaciones',
    };

    const handleRectanglePress = (idPreparacionTerreno: string, idFinca: string, idParcela: string, fecha: string,
        actividad: string, maquinaria: string, observaciones: string, identificacion: string, horasTrabajadas: string, pagoPorHora: string, estado: string) => {
        const actividadSeleccionada = actividades.find(act => act.nombre === actividad);
        const maquinariaSeleccionada = maquinarias.find(maq => maq.nombre === maquinaria);

        navigation.navigate(ScreenProps.ModifyLandPreparation.screenName, {
            idPreparacionTerreno: idPreparacionTerreno,
            idFinca: idFinca,
            idParcela: idParcela,
            fecha: fecha,
            idActividad: actividadSeleccionada?.idActividad || null,
            idMaquinaria: maquinariaSeleccionada?.idMaquinaria || null,
            observaciones: observaciones,
            identificacion: identificacion,
            horasTrabajadas: horasTrabajadas,
            pagoPorHora: pagoPorHora,
            estado: estado
        });
    };

    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminCrops.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterLandPreparation.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de Preparación de Terreno</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                    />

                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {preparacionTerrenoFiltradosData.map((item, index) => {
                        return (
                            <TouchableOpacity key={item.idPreparacionTerreno} onPress={() => handleRectanglePress(item.idPreparacionTerreno, item.idFinca, item.idParcela, item.fecha,
                                item.actividad, item.maquinaria, item.observaciones, item.identificacion, item.horasTrabajadas, item.pagoPorHora, item.estado)}>
                                <CustomRectangle
                                    key={item.idPreparacionTerreno}
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
