import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerRegistroContenidoNitrogeno } from '../../../../servicios/ServiciosContenidoNitrogeno';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
type RootStackParamList = {
    ListaContenidoNitrogenoScreen: { reload: boolean };
};

export const ListaContenidoNitrogenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    const route = useRoute<RouteProp<RootStackParamList, 'ListaContenidoNitrogenoScreen'>>();

    const [apiData, setApiData] = useState<any[]>([]);
    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [eficienciaRiego, setEficienciaRiego] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    // mapeo de datos
    const keyMapping = {
        'Código Punto de Medición': 'codigoPuntoMedicion',
        'Fecha de Muestreo': 'fecha',
        'Nitrógeno en Suelo (%)': 'contenidoNitrogenoSuelo',
        'Nitrógeno en Planta (%)': 'contenidoNitrogenoPlanta',
        'Método de Análisis': 'metodoAnalisis',
        'Humedad Observable': 'humedadObservable',
        'Condición del Suelo': 'condicionSuelo',
        'Observaciones': 'observaciones',
    };

    const handleRectanglePress = (idContenidoDeNitrogeno, idFinca, idParcela, idPuntoMedicion, fecha, contenidoNitrogenoSuelo, contenidoNitrogenoPlanta, metodoAnalisis, humedadObservable, condicionSuelo, observaciones, estado) => {
        navigation.navigate(ScreenProps.ModifyNitrogenContent.screenName, {
            idContenidoDeNitrogeno,
            idFinca,
            idParcela,
            idPuntoMedicion,
            fecha,
            contenidoNitrogenoSuelo,
            contenidoNitrogenoPlanta,
            metodoAnalisis,
            humedadObservable,
            condicionSuelo,
            observaciones,
            estado
        });
    };

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
            const registroContenidoNitrogenoResponse = await ObtenerRegistroContenidoNitrogeno();
            const filteredData = registroContenidoNitrogenoResponse
                .filter(item => item.estado !== 0) // Filtrar solo los registros activos
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) 
                .map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));
            setOriginalApiData(registroContenidoNitrogenoResponse);
            setApiData(filteredData);
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
            setEficienciaRiego([]);

            return () => {
                // Limpiar si es necesario
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

    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        setSelectedParcela('Seleccione una Parcela');
        obtenerParcelasPorFinca(fincaId);
    };

    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        setSelectedParcela(item.value);
        if (fincaId !== null) {
            obtenerRegistroContenidoNitrogenoPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };

    const obtenerRegistroContenidoNitrogenoPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {
            const contenidoNitrogenoFiltrado = apiData
                .filter(item => item.idFinca === fincaId && item.idParcela === parcelaId)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setEficienciaRiego(contenidoNitrogenoFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.MenuPrecisionAgriculture.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertNitrogenContent.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove}>Lista contenido nitrógeno</Text>
                </View>

                <View style={styles.dropDownContainer}>
                <View style={styles.searchContainer}>
                <Text style={styles.formText} >Finca:     </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                        customWidth={305}
                    />
                    </View>

                     <View style={styles.searchContainer}>
                     <Text style={styles.formText} >Parcela: </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                        customWidth={305}
                    />
                    </View>
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {eficienciaRiego.map((item, index) => (
                        <TouchableOpacity key={item.idContenidoDeNitrogeno} onPress={() => handleRectanglePress(
                            item.idContenidoDeNitrogeno, item.idFinca, item.idParcela, item.idPuntoMedicion, item.fecha, item.contenidoNitrogenoSuelo, item.contenidoNitrogenoPlanta,
                            item.metodoAnalisis, item.humedadObservable, item.condicionSuelo, item.observaciones, item.estado
                        )}>
                            <CustomRectangle
                                key={item.idContenidoDeNitrogeno}
                                data={processData([item], keyMapping)?.data || []} />
                        </TouchableOpacity>
                    ))}
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
};
