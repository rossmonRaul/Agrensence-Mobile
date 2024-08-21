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
export const ListaFlujoCajaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);
    const [entradaSalidas, setEntradasSalidas] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
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

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            // Lógica para obtener datos desde la API
            const formData = { identificacion: userData.identificacion };

            try {
                const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);

                // const fincasUnicas = Array.from(new Set(datosInicialesObtenidos
                //     .filter(item => item !== undefined)
                //     .map(item => item!.idFinca)))
                //     .map(idFinca => {
                //         const relacion = datosInicialesObtenidos.find(item => item?.idFinca === idFinca);
                //         const nombreFinca = relacion ? relacion.nombreFinca : ''; // Verificamos si el objeto no es undefined
                //         return { idFinca, nombreFinca };
                //     });

                setFincas(fincasFiltradas);
                //se obtienen la orden de compra para despues poder filtrarlos
                const entradaSalidaResponse = await ObtenerDatosRegistroSalidaPorFecha();
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
            const title = startDate && endDate ? formatDate(startDate) + ' ' + formatDate(endDate) : 'Flujo de caja';

            const filePath = await createExcelFile(title, entradaSalidas, keyMapping, 'FlujoCaja');

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
        obtenerFlujoCajaPorFinca(fincaId);
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

    const handleDateFilter = () => {
        if (!startDate || !endDate) {
            return;
        }

        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        const filteredData = apiData.filter(item => {
            const itemDate = parseDate(item.fecha);
            const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
            return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
        });

        setEntradasSalidas(filteredData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista flujo de caja</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    {/* Dropdown para Fincas */}
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombre, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
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
                                    minimumDate={new Date('2015-1-2')}
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
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {!entradaSalidas ? (
                        <>
                            <Text>No se encontraron datos</Text>
                        </>
                    ) : (
                        <>
                            {entradaSalidas.map((item, index) => (
                                <CustomRectangle
                                    key={item.idRegistroEntradaSalida}
                                    data={processData([item], keyMapping)?.data || []} />
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
            <BottomNavBar />
        </View >
    );
};
