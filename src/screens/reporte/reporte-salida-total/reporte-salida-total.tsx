import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Pressable, TextInput, Platform, Alert } from 'react-native';
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
import { ObtenerDatosRegistroSalidaPorFecha } from '../../../servicios/ServicioEntradaSalida';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { createExcelFile } from '../../../utils/fileExportExcel';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerReporteGasto } from '../../../servicios/ServicioReporte';
import { paginationStyles } from '../../../styles/pagination-styles.styles';


export const ReporteSalidaTotal:  React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [entradaSalidas, setEntradasSalidas] = useState<any[]>([]);
    const [entradaSalidasExportar, setEntradasSalidasExportar] = useState<any[]>([]);
    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
    const [salidasTotales, setSalidasTotales] = useState<any[]>([]);  
    const [currentPage, setCurrentPage] = useState(1);  // Añadido
    const itemsPerPage = 3;
    const keyMapping = {
        'IdRegistroEntradaSalida':'idRegistroEntradaSalida',
        'Fecha': 'fecha',
        'Detalles': 'detallesCompraVenta',
        //'Monto Ingreso': 'montoIngreso',
        'Monto Gasto': 'montoGasto',
        'Tipo': 'tipo',
        'Balance': 'balance'
    };

    const keyMappingTotal = {
        'Gasto Total': 'gastoTotal'
    };

    const [formulario, setFormulario] = useState({
        idFinca: '',
        fechaInicio: '',
        fechaFin: ''
    });



    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };

            try {
                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);

                // const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                //     .filter(item => item !== undefined)
                //     .map(item => item!.idFinca)))
                //     .map(idFinca => {
                //         const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                //         const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                //         return { idFinca, nombreFinca };
                //     });

                setFincas(fincasResponse);
                //se obtienen la orden de compra para despues poder filtrarlos

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

    const handleExportFile = async () => {
        try {
            // Solicitar permiso de escritura en el almacenamiento
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permisos insuficientes', 'Se requieren permisos para acceder al almacenamiento.');
                return;
            }

            if (entradaSalidas.length === 0) {
                Alert.alert('No hay datos para exportar');
                return;
            }
            function formatDate(date) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses son de 0 a 11
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
            const title = startDate && endDate ? formatDate(startDate) + ' ' + formatDate(endDate) : 'Reporte Gastos';

            const objEntradaSalida={idRegistroEntradaSalida:'',fecha:'',detallesCompraVenta:'Total',montoGasto:salidasTotales[0].gastoTotal,tipo:'',balance:salidasTotales[0].gastoTotal}
            entradaSalidasExportar.push(objEntradaSalida);

            const filePath = await createExcelFile(title, entradaSalidasExportar, keyMapping, 'Reporte Gastos');
            entradaSalidasExportar.pop();
            await Sharing.shareAsync(filePath)
            Alert.alert('Éxito', 'Archivo exportado correctamente.');
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            Alert.alert('Error', 'Ocurrió un error al exportar el archivo.');
        }
    };




    //funcion para la accion del dropdown de finca
    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        //se selecciona el item de finca
        setSelectedFinca(item.value);
        //se reinicia la seleccion de parcela
        //obtenerFlujoCajaPorFinca(fincaId);
        setStartDate(null);
        setEndDate(null);
    };

    const obtenerFlujoCajaPorFinca = async (fincaId: number,) => {
        try {

            const entradaSalidaFiltrado = apiData.filter(item => item.idFinca === fincaId);

            setEntradasSalidas(entradaSalidaFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const toggleDatePicker = (picker) => {
        switch (picker) {
            case "start":
                setShowStartDatePicker(!showStartDatePicker);
                break;
            case "end":
                setShowEndDatePicker(!showEndDatePicker);
                break;
            default:
                break;
        }
    };
    //se captura el evento de datetimepicker
    const onChange = (event, selectedDate, picker) => {
        const currentDate = selectedDate || new Date(); // Selecciona la fecha actual si no hay ninguna seleccionada
        switch (picker) {
            case 'start':
                setShowStartDatePicker(Platform.OS === 'ios');
                setStartDate(currentDate);
                break;
            case 'end':
                setShowEndDatePicker(Platform.OS === 'ios');
                setEndDate(currentDate);
                break;
            default:
                break;
        }

    };
    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
        return new Date(year, month - 1, day); // Restamos 1 al mes porque los meses en JavaScript son 0-11
    };

    const handleDateFilter = async () => {
        // const parseDate = (dateString) => {
        //     const [day, month, year] = dateString.split('/');
        //     return new Date(`${year}-${month}-${day}`);
        // };

         const fechaInicio = startDate?.toISOString().substring(10,-1);
 	     const fechaFinal = endDate?.toISOString().substring(10,-1);
        //Comparar fechas
        if (!selectedFinca ||selectedFinca === null) {
            alert('Ingrese la Finca');
            return
        }
        if (!startDate) {
            alert('La fecha inicio no es válida.');
            return
        }
        if (!endDate) {
            alert('La fecha final no es válida.');
            return
        }


          const formData = {
            idFinca: selectedFinca,
            fechaInicio: fechaInicio,
            fechaFin: fechaFinal,
        };

        // //  Se ejecuta el servicio de insertar  la entrada o salida
        //console.log("DATAEnviar",formData );
        const entradaSalidaResponse = await ObtenerReporteGasto(formData);
        //console.log('Entrada salida',entradaSalidaResponse);
        setEntradasSalidas(entradaSalidaResponse);
        setEntradasSalidasExportar(entradaSalidaResponse);

        setSalidasTotales([]);
        let valorGastoTotal=0;
        entradaSalidaResponse.forEach(obj => {
            valorGastoTotal+=obj.montoGasto;
            obj.montoGasto=formatNumber(obj.montoGasto);
            obj.balance=formatNumber(obj.balance);
        });
        const totales={gastoTotal:formatNumber(valorGastoTotal)};
        setSalidasTotales([totales]);
        setCurrentPage(1);
        setApiData(entradaSalidaResponse);

    
    };


    
    const formatNumber = (number: number) => {
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
        });
    };


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = entradaSalidas.slice(indexOfFirstItem, indexOfLastItem);
        //se formatea la fecha para que tenga el formato de español
    const formatSpanishDate = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString().slice(-2);
    
            return `${day}/${month}/${year}`;
        };
    const formatDate = (date: Date) => { // Aquí se crea un objeto Date a partir de la cadena dateString
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
    
            return `${year}-${month}-${day}`;
        };

        const renderPagination = () => {
            const totalPages = Math.ceil(entradaSalidas.length / itemsPerPage);
            let startPage = 1;
            let endPage = Math.min(totalPages, 3); // Máximo de 3 páginas visibles
        
            // Calcula el rango de páginas visibles
            if (currentPage > 1 && currentPage + 1 <= totalPages) {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            } else if (currentPage === totalPages) {
                startPage = currentPage - 2;
                endPage = currentPage;
            }
        
            const pageNumbers: number[] = [];
            for (let i = startPage; i <= endPage; i++) {
                if (i > 0 && i <= totalPages) { 
                    pageNumbers.push(i);
                }
            }
        
            //apartado para que no aparezca la paginación cuando todo quepa en una sola página
            if (totalPages <= 1) return null;

            return (
                <View style={paginationStyles.paginationContainer}>
                    {/* Botón para ir a la primera página */}
                    <TouchableOpacity
                        style={[
                            paginationStyles.pageButton,
                            currentPage === 1 && paginationStyles.activePageButton
                        ]}
                        onPress={() => setCurrentPage(1)}
                    >
                        <Text style={paginationStyles.pageButtonText}>{'<<'}</Text>
                    </TouchableOpacity>
                    {/* Botones para páginas */}
                    {pageNumbers.map(number => (
                        <TouchableOpacity
                            key={number}
                            style={[
                                paginationStyles.pageButton,
                                currentPage === number && paginationStyles.activePageButton
                            ]}
                            onPress={() => setCurrentPage(number)}
                        >
                            <Text style={paginationStyles.pageButtonText}>{number}</Text>
                        </TouchableOpacity>
                    ))}
                    {/* Botón para ir a la última página */}
                    <TouchableOpacity
                        style={[
                            paginationStyles.pageButton,
                            currentPage === totalPages && paginationStyles.activePageButton
                        ]}
                        onPress={() => setCurrentPage(totalPages)}
                    >
                        <Text style={paginationStyles.pageButtonText}>{'>>'}</Text>
                    </TouchableOpacity>
                </View>
            );
        };

    return (
        <View style={styles.container}>
        <View style={styles.listcontainer}>
            <BackButtonComponent screenName={ScreenProps.AdminReports.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Reporte Gastos</Text>
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

                <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            {!showStartDatePicker && (
                                <Pressable onPress={() => toggleDatePicker('start')}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Fecha Inicio'
                                        value={startDate ? startDate.toLocaleDateString() : ''}
                                        editable={false}
                                        onPressIn={() => toggleDatePicker('start')}
                                    />
                                </Pressable>
                            )}
                            {showStartDatePicker && (
                                <DateTimePicker
                                    value={startDate || new Date()}
                                    mode="date"
                                    display='spinner'
                                    onChange={(event, selectedDate) => onChange(event, selectedDate, 'start')}
                                    style={styles.dateTimePicker}
                                    minimumDate={new Date('2015-1-2')}
                                    maximumDate={new Date()} // No permite seleccionar una fecha futura
                                />
                            )}
                            {showStartDatePicker && Platform.OS === 'ios' && (
                                <View style={styles.iosPickerButtons}>
                                    <TouchableOpacity style={[styles.buttonPicker, { backgroundColor: "#11182711" }]} onPress={() => toggleDatePicker('start')}>
                                        <Text style={{ color: "#075985" }}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.buttonPicker, { backgroundColor: "#11182711" }]} onPress={() => toggleDatePicker('start')}>
                                        <Text style={{ color: "#075985" }}>Confirmar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {!showEndDatePicker && (
                            <Pressable onPress={() => toggleDatePicker('end')}>
                                <TextInput
                                    style={styles.input}
                                    placeholder='Fecha Fin'
                                    value={endDate ? endDate.toLocaleDateString() : ''}
                                    editable={false}
                                    onPressIn={() => toggleDatePicker('end')}
                                />
                            </Pressable>
                        )}
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display='spinner'
                                onChange={(event, selectedDate) => onChange(event, selectedDate, 'end')}
                                style={styles.dateTimePicker}
                                minimumDate={startDate || new Date('2015-1-2')} // La fecha mínima es la fecha de inicio seleccionada
                                maximumDate={new Date()} // No permite seleccionar una fecha futura
                            />
                        )}
                        {showEndDatePicker && Platform.OS === 'ios' && (
                            <View style={styles.iosPickerButtons}>
                                <TouchableOpacity style={[styles.buttonPicker, { backgroundColor: "#11182711" }]} onPress={() => toggleDatePicker('end')}>
                                    <Text style={{ color: "#075985" }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.buttonPicker, { backgroundColor: "#11182711" }]} onPress={() => toggleDatePicker('end')}>
                                    <Text style={{ color: "#075985" }}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleDateFilter} style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>Filtrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={handleExportFile}>
                <Text style={styles.filterButtonText}>Exportar Excel</Text>
            </TouchableOpacity>
            <View style={styles.rowContainer} >
                {!salidasTotales ? (
                    <>
                        <Text>No se encontraron datos</Text>
                    </>
                ) : (
                    <>
                        {salidasTotales.map((item, index) => (
                            <CustomRectangle
                                key={item.gastoTotal}
                                data={processData([item], keyMappingTotal)?.data || []} />
                        ))}
                    </>
                )}
            </View>
            <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                {!currentItems ? (
                    <>
                        <Text>No se encontraron datos</Text>
                    </>
                ) : (
                    <>
                        {currentItems.map((item, index) => (
                            <CustomRectangle
                                key={item.idRegistroEntradaSalida}
                                data={processData([item], keyMapping)?.data || []} />
                        ))}
                    </>
                )}
            </ScrollView>
            {renderPagination()}
        </View>
        <BottomNavBar />
    </View >
    );
};
