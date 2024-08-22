import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerDatosRegistroManoObra } from '../../../servicios/ServicioManoObra';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';

export const ListaManoObraScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [manoObra, setManoObra] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha': 'fecha',
        'Actividad': 'actividad',
        'Identificacion': 'identificacion',
        'Trabajador': 'trabajador',
        'Horas trabajadas': 'horasTrabajadas',
        'Pago por hora (₡)': 'pagoPorHora',
        'Total pago (₡)': 'totalPago',
        'Estado': 'estado'
    };

    const handleRectanglePress = (idRegistroManoObra: string, idFinca: string, fecha: string, actividad: string, identificacion: string, trabajador: string,
        horasTrabajadas: string, pagoPorHora: string, totalPago: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyManoObra.screenName, {
            idRegistroManoObra: idRegistroManoObra, idFinca: idFinca, fecha: fecha,
            actividad: actividad, identificacion: identificacion, trabajador: trabajador, horasTrabajadas: horasTrabajadas, pagoPorHora: pagoPorHora,
            totalPago: totalPago, estado: estado
        });
    };


    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };
        setSelectedFinca(null)
        setManoObra([])

        try {
            const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
            const fincasResponse = await ObtenerFincas(userData.idEmpresa);
            const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
            setFincas(fincasFiltradas);

            //se obtienen la mano de obra para despues poder filtrarlos
            const manoObreaResponse = await ObtenerDatosRegistroManoObra();
            //si es 0 es inactivo sino es activo resetea los datos
            const filteredData = manoObreaResponse.map((item) => ({
                ...item,
                estado: item.estado === 0 ? 'Inactivo' : 'Activo',
            }));
            setApiData(filteredData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );


    //funcion para la accion del dropdown de finca
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        //se selecciona el item de finca
        setSelectedFinca(item.value);
        //se reinicia la seleccion de parcela
        obtenerManoObraPorFinca(fincaId);
    };

    const obtenerManoObraPorFinca = async (fincaId: number,) => {
        try {

            const manoObraFiltrado = apiData.filter(item => item.idFinca === fincaId);

            setManoObra(manoObraFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminAdminstration.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertManoObra.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de registros de mano obra</Text>
                </View>
                <View style={styles.dropDownContainer}>
                    {/* Dropdown para Fincas */}
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                        customWidth={375}
                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {!manoObra ? (
                        <>
                            <Text>No se encontraron datos</Text>
                        </>
                    ) : (
                        <>
                            {manoObra.map((item, index) => (
                                <TouchableOpacity key={item.idRegistroManoObra} onPress={() => handleRectanglePress(
                                    item.idRegistroManoObra, item.idFinca, item.fecha,
                                    item.actividad, item.identificacion, item.trabajador, item.horasTrabajadas, item.pagoPorHora,
                                    item.totalPago, item.estado
                                )}>
                                    <CustomRectangle
                                        key={item.idFinca}
                                        data={processData([item], keyMapping)?.data || []} />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
            <BottomNavBar />
        </View>
    );
};
