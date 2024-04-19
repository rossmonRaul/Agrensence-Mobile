import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { WaterDataInterface } from '../../../../interfaces/usoAguaInterface';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerUsuariosAsignadosPorIdentificacion, ObtenerUsuariosPorRol3 } from '../../../../servicios/ServicioUsuario';
import { ObtenerUsoAgua } from '../../../../servicios/ServicioUsoAgua';

export const ListaSeguimientoAguaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [fincas, setFincas] = useState<{ idFinca: number }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [apiData, setApiData] = useState<WaterDataInterface[]>([]);
    const [datosUsoAguaFiltradosData, setdatosUsoAguaFiltradosData] = useState<any[]>([]);
    const [datosUsoAgua, setdatosUsoAgua] = useState<any[]>([]);
    const [usoAguaFiltradosData, setUsoAguaFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);

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
        ///se obtienen los fertilizantes de la finca seleccionada
        obtenerUsoAguaPorFinca(fincaId);
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

            obtenerUsoAguaPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch fertilizantes.');
        }
    };

    //funcion para poder filtrar las parcelas por finca
    const obtenerUsoAguaPorFinca = async (fincaId: number) => {
        try {

            const resultado = parcelas.filter(item => item.idFinca === fincaId);

            setParcelasFiltradas(resultado);
        } catch (error) {
            console.error('Error fetching parcelas:', error);
        }
    };

    //se filtra los feritilizantes por finca y parcela seleccionados en el dropdown
    const obtenerUsoAguaPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const usoAguaFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setUsoAguaFiltrados(usoAguaFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                //se obtienen los fertilizantes para despues poder filtrarlos
                const fertilizantes = await ObtenerUsoAgua();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = fertilizantes.map((item) => ({
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
        'Actividad': 'actividad',
        'Caudal': 'caudal',
        'Consumo de agua': 'consumoAgua',
        'Observaciones': 'observaciones',
        'Estado': 'estado'
    };

    //funcion para enviarlo a modificar registro del seguimiento del uso del agua
    const handleRectanglePress = (idRegistroSeguimientoUsoAgua: string, idFinca: string, idParcela: string, fecha: string,
        actividad: string, caudal: number, consumoAgua: number,
        observaciones: string, estado: string) => {
        //ESTA PARTE SE MODIFICA CUANDO SE TENGA LA PANTALLA DE MODIFICAR
        navigation.navigate(ScreenProps.ModifyUseWatterScreen.screenName, {
            idRegistroSeguimientoUsoAgua: idRegistroSeguimientoUsoAgua,
            idFinca: idFinca, idParcela: idParcela,
            fecha: fecha, actividad: actividad,
            caudal: caudal, consumoAgua: consumoAgua, observaciones: observaciones,
            estado: estado
        });
    };

    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                {/* este es el boton de volver y se le coloca la pagina donde regresa*/}
                <BackButtonComponent screenName={ScreenProps.HidricMenu.screenName} color={'#274c48'} />
                {/* este es el boton de agregar y se le coloca la pagina donde agrega*/}
                <AddButtonComponent screenName={ScreenProps.RegisterUseWaterScreen.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de seguimiento del uso del agua </Text>
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
                    {usoAguaFiltradosData.map((item, index) => {

                        return (
                            <TouchableOpacity key={item.idRegistroSeguimientoUsoAgua} onPress={() => handleRectanglePress(item.idRegistroSeguimientoUsoAgua, item.idFinca, item.idParcela,
                                item.fecha, item.actividad, item.caudal, item.consumoAgua, item.observaciones, item.estado)}>
                                <CustomRectangle
                                    key={item.idRegistroSeguimientoUsoAgua}
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