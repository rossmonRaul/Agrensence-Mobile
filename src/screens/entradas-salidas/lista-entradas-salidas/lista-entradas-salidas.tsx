import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerDatosRegistroEntradaSalida } from '../../../servicios/ServicioEntradaSalida';

export const ListaEntradasSalidasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [entradaSalidas, setEntradasSalidas] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha': 'fecha',
        'Tipo': 'tipo',
        'Detalles': 'detallesCompraVenta',
        'Precio unitario (₡/cantidad)': 'precioUnitario',
        'Cantidad': 'cantidad',
        'Monto total': 'montoTotal',
        'Estado': 'estado'
    };
    const handleRectanglePress = (idRegistroEntradaSalida: string, idFinca: string, fecha: string, tipo: string,
        detallesCompraVenta: string, cantidad: string, precioUnitario: string, montoTotal: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyInflowsOutflows.screenName, {
            idRegistroEntradaSalida: idRegistroEntradaSalida, idFinca: idFinca,
            fecha: fecha, tipo: tipo, detallesCompraVenta: detallesCompraVenta, cantidad: cantidad, precioUnitario: precioUnitario,
            montoTotal: montoTotal, estado: estado
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
                //se obtienen la orden de compra para despues poder filtrarlos
                const entradaSalidaResponse = await ObtenerDatosRegistroEntradaSalida();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = entradaSalidaResponse.map((item) => ({
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





    //funcion para la accion del dropdown de finca
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        //se selecciona el item de finca
        setSelectedFinca(item.value);
        //se reinicia la seleccion de parcela
        obtenerRotacionCultivosPorFinca(fincaId);
    };

    const obtenerRotacionCultivosPorFinca = async (fincaId: number,) => {
        try {

            const entradaSalidaFiltrado = apiData.filter(item => item.idFinca === fincaId);

            setEntradasSalidas(entradaSalidaFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.AdminAdminstration.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertInflowsOutflows.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de entradas y salidas</Text>
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


                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>

                    {!entradaSalidas ? (
                        <>
                            <Text>No se encontraron datos</Text>
                        </>
                    ) : (
                        <>
                            {entradaSalidas.map((item, index) => (
                                <TouchableOpacity key={item.idRegistroEntradaSalida} onPress={() => handleRectanglePress(
                                    item.idRegistroEntradaSalida, item.idFinca,
                                    item.fecha, item.tipo, item.detallesCompraVenta, item.cantidad, item.precioUnitario,
                                    item.montoTotal, item.estado
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
