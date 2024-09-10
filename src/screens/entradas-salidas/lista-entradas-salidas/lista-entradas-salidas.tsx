import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';

import { MaterialCommunityIcons } from '@expo/vector-icons'
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import { ObtenerDatosRegistroEntradaSalida, ObtenerDetallesRegistroEntradaSalidaExportar } from '../../../servicios/ServicioEntradaSalida';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { createExcelFile } from '../../../utils/fileExportExcel';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
interface Item {
    id: string;
    producto: string;
    cantidad: string;
    precioUnitario: string;
    iva: string;
    total: string;
}
interface Button {
    text: string;
    onPress: () => void;
  }
export const ListaEntradasSalidasScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [entradaSalidas, setEntradasSalidas] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [idRegistrosExportar, setIdRegistrosExportar] = useState<string | null>(null);
    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Fecha': 'fecha',
        'Tipo': 'tipo',
        'Detalles': 'detallesCompraVenta',
        'Monto total': 'total',
        'Estado': 'estado'
    };
    const keyMapping2 = {
        'Id': 'idDetalleRegistroEntradaSalida',
        'IdRegistroEntradaSalida': 'idRegistroEntradaSalida',
        'Producto': 'producto',
        'Cantidad': 'cantidad',
        'Precio Unitario': 'precioUnitario',
        'Iva': 'iva',
        'Total': 'total'
    };

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });



 const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
            },
            },
          ],
        });
        setAlertVisible(true);
      };
    
      const showErrorAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
               
              },
            },
          ],
        });
        setAlertVisible(true);
      };

      const showInfoAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
             
              },
            },
          ],
        });
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

    const handleRectanglePress = (idRegistroEntradaSalida: string, idFinca: string, fecha: string, tipo: string,
        detallesCompraVenta: string, total: string, estado: string) => {
        navigation.navigate(ScreenProps.ModifyInflowsOutflows.screenName, {
            idRegistroEntradaSalida: idRegistroEntradaSalida, idFinca: idFinca,
            fecha: fecha, tipo: tipo, detallesCompraVenta: detallesCompraVenta,
            total: total, estado: estado
        });
    };

    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };


        try {
            setSelectedFinca(null);
            setEntradasSalidas([]);

            // const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
            // const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
            //     .filter(item => item !== undefined)
            //     .map(item => item!.idFinca)))
            //     .map(idFinca => {
            //         const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
            //         const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
            //         return { idFinca, nombreFinca };
            //     });

            // setFincas(fincasUnicas);
            const fincasResponse = await ObtenerFincas(userData.idEmpresa);
            //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
            setFincas(fincasResponse);
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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    // useEffect(() => {
    //     const obtenerDatosIniciales = async () => {
    //         // Lógica para obtener datos desde la API
    //         const formData = { identificacion: userData.identificacion };

    //         try {
    //             const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
    //             const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
    //                 .filter(item => item !== undefined)
    //                 .map(item => item!.idFinca)))
    //                 .map(idFinca => {
    //                     const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
    //                     const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
    //                     return { idFinca, nombreFinca };
    //                 });

    //             setFincas(fincasUnicas);
    //             //se obtienen la orden de compra para despues poder filtrarlos
    //             const entradaSalidaResponse = await ObtenerDatosRegistroEntradaSalida();
    //             //si es 0 es inactivo sino es activo resetea los datos
    //             const filteredData = entradaSalidaResponse.map((item) => ({
    //                 ...item,
    //                 estado: item.estado === 0 ? 'Inactivo' : 'Activo',
    //             }));

    //             setApiData(filteredData);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     obtenerDatosIniciales();
    // }, []);





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

            let listaIds = '';
            setEntradasSalidas(entradaSalidaFiltrado);
            entradaSalidaFiltrado.forEach((item, index) => {
                // Añadir la ID a la variable y, si no es el último elemento, añadir una coma
                listaIds += item.idRegistroEntradaSalida;
                if (index < entradaSalidaFiltrado.length - 1) {
                    listaIds += ',';
                }
            });

            setIdRegistrosExportar(listaIds);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const handleExportFile = async () => {

        try {
            // Solicitar permiso de escritura en el almacenamiento
            const { status } = await MediaLibrary.requestPermissionsAsync();
            const formData2 = { ListaIdsExportar: idRegistrosExportar };
            const datosListaProductos: Item[] = await ObtenerDetallesRegistroEntradaSalidaExportar(formData2);
            if (status !== 'granted') {
                showInfoAlert('Permisos insuficientes, se requieren permisos para acceder al almacenamiento.');
                return;
            }

            if (datosListaProductos.length === 0) {
                showInfoAlert('No hay datos para exportar');
                return;
            }
            function formatDate(date) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses son de 0 a 11
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
            const title = 'Detalle entradas y salidas';

            const filePath = await createExcelFile(title, datosListaProductos, keyMapping2, 'Detalle entradas y salidas');

            await Sharing.shareAsync(filePath)
            showSuccessAlert('Éxito, archivo exportado correctamente.');
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            showErrorAlert('Error, ocurrió un error al exportar el archivo.');
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
                    <View style={styles.searchContainer}>
                    <Text style={styles.formText} >Finca:     </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                        customWidth={305}
                    />
                    </View>
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={handleExportFile}>
                    
                    <View style={styles.buttonContent}>
                            <MaterialCommunityIcons name="file-excel" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.filterButtonText}>Exportar excel</Text>
                    </View>
                </TouchableOpacity>
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
                                    item.fecha, item.tipo, item.detallesCompraVenta,
                                    item.total, item.estado
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
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => {} : undefined}
                />
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


