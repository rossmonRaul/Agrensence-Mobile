import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { RelacionFincaParcela, UserDataInterface } from '../../../../interfaces/userDataInterface';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { ProduccionDataInterdace } from '../../../../interfaces/produccionInterface';
import { ObtenerProductividadCultivos } from '../../../../servicios/ServicioCultivos';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

export const ListaProductividadScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [apiData, setApiData] = useState<ProduccionDataInterdace[]>([]);
    const [productividadFiltradaData, setProductividadFiltrada] = useState<any[]>([]);
    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);

    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

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
                //se obtienen los fertilizantes para despues poder filtrarlos
                const cultivos = await ObtenerProductividadCultivos();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = cultivos.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));

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

    //se filtra para los fertilizantes por finca
    const obtenerProductividadPorFinca = async (fincaId: number) => {
        try {

            const productividadFiltrado = apiData.filter(item => item.idFinca === fincaId)
            setProductividadFiltrada(productividadFiltrado)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    //se filtra los feritilizantes por finca y parcela seleccionados en el dropdown
    const obtenerProductividadPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const productividadFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setProductividadFiltrada(productividadFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
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
        ///se obtienen los fertilizantes de la finca seleccionada
        obtenerProductividadPorFinca(fincaId);
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

            obtenerProductividadPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch fertilizantes.');
        }
    };


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Usuario': 'nombreUsuario',
        'Cultivo': 'cultivo',
        'Finca': 'finca',
        'Parcela': 'parcela',
        'Temporada': 'temporada',
        'Área (ha)': 'area',
        'Producción (ton)': 'produccion',
        'Productividad': 'productividad',
        'Estado': 'estado',
    };



    //funcion para que enviarlo a modificar la productividad
    const handleRectanglePress = (idManejoProductividadCultivo: string, idFinca: string, idParcela: string, cultivo: string,
        temporada: string, area: number, produccion: number,
        productividad: number, Estado: string) => {
        navigation.navigate(ScreenProps.ModifyProductivity.screenName, {
            idManejoProductividadCultivo: idManejoProductividadCultivo, idFinca: idFinca, idParcela: idParcela,
            cultivo: cultivo, temporada: temporada, area: area, produccion: produccion,
            productividad: productividad, estado: Estado
        });
    };



    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminCrops.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.RegisterProductivity.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de Productividad</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    {/* Dropdown para Fincas */}
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                    />

                    {/* Dropdown para Parcelas */}
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {productividadFiltradaData.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idManejoProductividadCultivo} onPress={() => handleRectanglePress(item.idManejoProductividadCultivo, item.idFinca, item.idParcela, item.cultivo,
                                item.temporada, item.area, item.produccion,
                                item.productividad, item.estado)}>
                                <CustomRectangle
                                    key={item.idManejoProductividadCultivo}
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