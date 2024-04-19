import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { Ionicons } from '@expo/vector-icons';
//import { ObtenerFertilizantes } from '../../../../servicios/ServicioFertilizantes';
import { ObtenerDatosPreparacionTerreno } from '../../../../servicios/ServicioPreparacionTerreno';
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
import { LandPreparationDataInterface } from '../../../../interfaces/preparacionTerreno';
import { ObtenerUsuariosAsignadosPorIdentificacion, ObtenerUsuariosPorRol3 } from '../../../../servicios/ServicioUsuario';


export const ListaPreparacionTerrenoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [apiData, setApiData] = useState<LandPreparationDataInterface[]>([]);
    const [preparacionTerrenoFiltradosData, setPreparacionTerrenoFiltrados] = useState<any[]>([]);
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
                //console.log(datosInicialesObtenidos)
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
                const preparacionTerreno = await ObtenerDatosPreparacionTerreno();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = preparacionTerreno.map((item) => ({
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
    const obtenerPreparacionTerrenoPorFinca = async (fincaId: number) => {
        try {

            const preparacionTerrenoFiltrado = apiData.filter(item => item.idFinca === fincaId)
            setPreparacionTerrenoFiltrados(preparacionTerrenoFiltrado)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    //se filtra los feritilizantes por finca y parcela seleccionados en el dropdown
    const obtenerPreparacionTerrenoPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const fertilizanteFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setPreparacionTerrenoFiltrados(fertilizanteFiltrado);
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
        obtenerPreparacionTerrenoPorFinca(fincaId);
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

            obtenerPreparacionTerrenoPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };


    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha': 'fecha',
        'Actividad': 'actividad',
        'Maquinaria': 'maquinaria',
        'Observaciones': 'observaciones',
        'Estado': 'estado',
    };



    //funcion para que enviarlo a modificar la el manejo de fertilizantes
    const handleRectanglePress = (idPreparacionTerreno: string, idFinca: string, idParcela: string, fecha: string,
        actividad: string, maquinaria: string, observaciones: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyLandPreparation.screenName, {
            idPreparacionTerreno: idPreparacionTerreno, idFinca: idFinca, idParcela: idParcela,
            fecha: fecha, actividad: actividad, maquinaria: maquinaria, observaciones: observaciones, estado: estado
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
                    {preparacionTerrenoFiltradosData.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idPreparacionTerreno} onPress={() => handleRectanglePress(item.idPreparacionTerreno, item.idFinca, item.idParcela, item.fecha,
                                item.actividad, item.maquinaria, item.observaciones, item.estado)}>
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