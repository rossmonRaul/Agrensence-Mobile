import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { processData } from '../../../utils/processData';
import { CustomRectangle } from '../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect, } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../components/AddButton/AddButton';
import { ObtenerUsuariosPorRol3 } from '../../../servicios/ServicioUsuario';
import { ObtenerDatosOrdenDeCompra,ObtenerDetalleOrdenDeCompraPorId, ObtenerDetallesOrdenDeCompraExportar } from '../../../servicios/ServicioOrdenCompra';
import { RelacionFincaParcela } from '../../../interfaces/userDataInterface';
import DropdownComponent from '../../../components/Dropdown/Dropwdown';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { createExcelFile } from '../../../utils/fileExportExcel';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
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
export const ListaOrdenCompraScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [ordenCompra, setOrdenCompra] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    const [idRegistrosExportar, setIdRegistrosExportar] = useState<string | null>(null);

    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Número orden': 'numeroDeOrden',
        'Fecha orden': 'fechaOrden',
        'Fecha entrega': 'fechaEntrega',
        'Proveedor': 'proveedor',
        'Observaciones': 'observaciones',
        'Monto total': 'total',
        'Estado': 'estado'
    };

    const keyMapping2 = {
        'Id': 'idDetalleOrdenDeCompra',
        'IdOrdenCompra': 'idOrdenDeCompra',
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
    // item.idOrdenDeCompra, item.idFinca, item.idParcela,
    //                         item.numeroDeOrden, item.proveedor, item.fechaOrden, item.fechaEntrega,
    //                         item.productosAdquiridos, item.cantidad, item.precioUnitario,item.montoTotal, item.observaciones,  item.estado
    const handleRectanglePress = (idOrdenDeCompra: string, idFinca: string, idParcela: string, numeroDeOrden: string,
        proveedor: string, fechaOrden: string, fechaEntrega: string,observaciones: string, total: string,  estado: string) => {
        navigation.navigate(ScreenProps.ModifyPurchaseOrder.screenName, {
            idOrdenDeCompra: idOrdenDeCompra, idFinca: idFinca, idParcela: idParcela,
            numeroDeOrden: numeroDeOrden, proveedor: proveedor, fechaOrden: fechaOrden, fechaEntrega: fechaEntrega,
            observaciones: observaciones,total: total,  estado: estado
        });
    };

    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };
    
                try {
                    setSelectedFinca(null);
                    setSelectedParcela(null);
                    setOrdenCompra([]);
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
                    // //Se obtienen las parcelas para poder hacer los filtros despues
    
    
                    // const parcelas = Array.from(new Set(datosInicialesObtenidos
                    //     .filter(item => item !== undefined)
                    //     .map(item => item!.idParcela)))
                    //     .map(idParcela => {
                    //         const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
                    //         const idFinca = relacion ? relacion.idFinca : -1;
                    //         const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
                    //         return { idFinca, idParcela, nombreParcela };
                    //     });
    
                    // setParcelas(parcelas);
                    const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                    //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                    setFincas(fincasResponse);
                    const parcelasResponse = await ObtenerParcelas(userData.idEmpresa);
                    //const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasResponse);
                    //se obtienen la orden de compra para despues poder filtrarlos
                    const ordenCompraResponse = await ObtenerDatosOrdenDeCompra();
                    //si es 0 es inactivo sino es activo resetea los datos
                    const filteredData = ordenCompraResponse.map((item) => ({
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


    // useFocusEffect(
    //     React.useCallback(() => {
    //         const obtenerDatosIniciales = async () => {
    //             // Lógica para obtener datos desde la API
    //             const formData = { identificacion: userData.identificacion };
    
    //             try {
    //                 const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
    //                 const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
    //                     .filter(item => item !== undefined)
    //                     .map(item => item!.idFinca)))
    //                     .map(idFinca => {
    //                         const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
    //                         const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
    //                         return { idFinca, nombreFinca };
    //                     });
    
    //                 setFincas(fincasUnicas);
    //                 //Se obtienen las parcelas para poder hacer los filtros despues
    
    
    //                 const parcelas = Array.from(new Set(datosInicialesObtenidos
    //                     .filter(item => item !== undefined)
    //                     .map(item => item!.idParcela)))
    //                     .map(idParcela => {
    //                         const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
    //                         const idFinca = relacion ? relacion.idFinca : -1;
    //                         const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
    //                         return { idFinca, idParcela, nombreParcela };
    //                     });
    
    //                 setParcelas(parcelas);
    //                 //se obtienen la orden de compra para despues poder filtrarlos
    //                 const ordenCompraResponse = await ObtenerDatosOrdenDeCompra();
    //                 //si es 0 es inactivo sino es activo resetea los datos
    //                 const filteredData = ordenCompraResponse.map((item) => ({
    //                     ...item,
    //                     estado: item.estado === 0 ? 'Inactivo' : 'Activo',
    //                 }));
    
    //                 setApiData(filteredData);
    //             } catch (error) {
    //                 console.error('Error fetching data:', error);
    //             }
    //         };
    
    //         obtenerDatosIniciales();
    //     }, [])
    //   );
    // useFocusEffect(() => {
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
    //             //Se obtienen las parcelas para poder hacer los filtros despues


    //             const parcelas = Array.from(new Set(datosInicialesObtenidos
    //                 .filter(item => item !== undefined)
    //                 .map(item => item!.idParcela)))
    //                 .map(idParcela => {
    //                     const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
    //                     const idFinca = relacion ? relacion.idFinca : -1;
    //                     const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
    //                     return { idFinca, idParcela, nombreParcela };
    //                 });

    //             setParcelas(parcelas);
    //             //se obtienen la orden de compra para despues poder filtrarlos
    //             const ordenCompraResponse = await ObtenerDatosOrdenDeCompra();
    //             //si es 0 es inactivo sino es activo resetea los datos
    //             const filteredData = ordenCompraResponse.map((item) => ({
    //                 ...item,
    //                 estado: item.estado === 0 ? 'Inactivo' : 'Activo',
    //             }));

    //             setApiData(filteredData);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     obtenerDatosIniciales();
    // }, );



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
        ///se obtienen la orden de compra de la finca seleccionada
    };

    //funcion para la accion del dropdown parcela
    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        //se necesita el fincaId para poder hacer el filtrado
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        //se asigna el valor de la parcela en selecteParcela
        setSelectedParcela(item.value)
        //si finca Id es null no se puede seleciona ni traer el y mostrar la orden de compra
        if (fincaId !== null) {

            obtenerRotacionCultivosPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };



    const obtenerRotacionCultivosPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const rotacionCultivosFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);
            let listaIds = '';
            setOrdenCompra(rotacionCultivosFiltrado);
            rotacionCultivosFiltrado.forEach((item, index) => {
                // Añadir la ID a la variable y, si no es el último elemento, añadir una coma
                listaIds += item.idOrdenDeCompra;
                if (index < rotacionCultivosFiltrado.length - 1) {
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
            const formData2 = { ListaIdsExportar: idRegistrosExportar};
            const datosListaProductos: Item[] = await ObtenerDetallesOrdenDeCompraExportar(formData2);
            if (status !== 'granted') {
                showInfoAlert('Permisos insuficientes, re requieren permisos para acceder al almacenamiento.');
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
            const title = 'Detalle de Compra';

            const filePath = await createExcelFile(title, datosListaProductos, keyMapping2, 'Detalle de Compra');

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
                <AddButtonComponent screenName={ScreenProps.InsertPurchaseOrder.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista orden de compra</Text>
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
                    {/* Dropdown para Parcelas */}
                    <View style={styles.searchContainer}>
                    <Text style={styles.formText} >Parcela: </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
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
                {/* <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar información"
                        onChangeText={(text) => handleSearch(text)}
                    />
                    <TouchableOpacity style={styles.searchIconContainer}>
                        <Ionicons name="search" size={20} color="#333" />
                    </TouchableOpacity>
                </View> */}

                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {ordenCompra.map((item, index) => ( // Cambiar ordenCompra por OrdenCompraFiltradosData
                        <TouchableOpacity key={item.idOrdenDeCompra} onPress={() => handleRectanglePress(
                            item.idOrdenDeCompra, item.idFinca, item.idParcela,
                            item.numeroDeOrden, item.proveedor, item.fechaOrden, item.fechaEntrega,
                            item.observaciones,item.total, item.estado
                        )}>
                            <CustomRectangle
                                key={item.idFinca}
                                data={processData([item], keyMapping)?.data || []} />
                        </TouchableOpacity>
                    ))}
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
