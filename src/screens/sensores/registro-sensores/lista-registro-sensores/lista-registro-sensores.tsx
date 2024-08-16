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
import { ObtenerSensores, ObtenerMedicionesAutorizadasSensor } from '../../../../servicios/ServiciosSensor';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';

export const ListaSensoresScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [problemasAsociadosPlagas, setProblemasAsociadosPlagas] = useState<any[]>([]);

    const [fincas, setFincas] = useState<[]>([]);
    const [parcelas, setParcelas] = useState<[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Identificador (EUI)': 'identificadorSensor',
        'Nombre': 'nombre',
        'Modelo': 'modelo',
        'Estado sensor': 'estadoSensor',
        'Punto medición': 'codigoPuntoMedicion',
        'Mediciones autorizadas': 'medicionesAutorizadaSensor',
        'Estado': 'estado'
    };

    //item.idSensor, item.identificadorSensor, item.nombre, item.modelo, item.idEstado, item.idPuntoMedicion, item.estado

    const handleRectanglePress = (idSensor: string, identificadorSensor: string, nombre: string, modelo: string,
        idEstado: string, idPuntoMedicion: string, codigoPuntoMedicion: string, estadoSensor: string, estado: string, idMediciones: number[][]) => {
        // Encuentra el elemento correspondiente en los datos originales utilizando el ID único

        // Si se encuentra el elemento correspondiente, puedes acceder a sus propiedades directamente
        navigation.navigate(ScreenProps.ModifySensors.screenName, {
            idSensor: idSensor,
            identificadorSensor: identificadorSensor,
            nombre: nombre,
            modelo: modelo,
            idEstado: idEstado,
            idPuntoMedicion: idPuntoMedicion,
            codigoPuntoMedicion: codigoPuntoMedicion,
            estadosensor: estadoSensor,
            estado: estado,
            idMediciones: idMediciones
        });

    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            try {
                const fincasResponse = await ObtenerFincas(); 
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasFiltradas);
                const parcelasResponse = await ObtenerParcelas();
                const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                setParcelas(parcelasFiltradas);
                //se obtienen los datos de el registro de sensores para despues poder filtrarlos
                const registroSensores = await ObtenerSensores();
                const datosSensoresAutorizados = await ObtenerMedicionesAutorizadasSensor();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = registroSensores.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));
                const datosConAutorizacion = filteredData.map((dato: any) => {
                    const sensoresAutorizados = datosSensoresAutorizados.filter((sensor: any) => sensor.idSensor === dato.idSensor);
                    const medicionesAutorizadas = sensoresAutorizados.map((sensor: any) => sensor.medicionAutorizadaSensor).join(', ');
                    const idMediciones = sensoresAutorizados.map((sensor: any) => [sensor.idMedicionAutorizadaSensor, sensor.idMedicion]); // Nuevo array de IdMedicion
                    return {
                        ...dato,
                        medicionesAutorizadaSensor: medicionesAutorizadas,
                        idMediciones: idMediciones // Nueva propiedad con array de IdMedicion
                    };
                });
                setOriginalApiData(registroSensores);
                setApiData(datosConAutorizacion);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);



    //funcion para poder filtrar las parcelas por finca
    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {

            const resultado = parcelas.filter((item: any) => item.idFinca === fincaId);

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
        //si finca Id es null no se puede seleciona ni traer el y mostrar el registro de sensores

        if (fincaId !== null) {

            obtenerProblemasAsociadosPlagasPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };




    // filtra los datos de el registro de sensores

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
                <BackButtonComponent screenName={ScreenProps.AdminSensors.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertSensors.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista sensores</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map((finca: any) => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="map-marker"
                        onChange={handleFincaChange}
                    />

                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map((parcela: any) => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="map-marker"
                        onChange={handleParcelaChange}
                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {problemasAsociadosPlagas.map((item, index) => (
                        <TouchableOpacity key={item.idSensor} onPress={() => handleRectanglePress(
                            item.idSensor, item.identificadorSensor, item.nombre, item.modelo, item.idEstado, item.idPuntoMedicion, item.codigoPuntoMedicion, item.estadoSensor, item.estado,
                            item.idMediciones
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
