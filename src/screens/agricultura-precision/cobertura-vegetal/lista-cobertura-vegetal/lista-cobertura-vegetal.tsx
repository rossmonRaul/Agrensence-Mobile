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
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { ObtenerRegistroCoberturaVegetal } from '../../../../servicios/ServicioCoberturaVegetal';
import { paginationStyles } from '../../../../styles/pagination-styles.styles';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
export const ListaCoberturaVegetalScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    //const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [coberturaVegetal, setcoberturaVegetal] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombreParcela?: string; }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombreParcela?: string }[] | []>([]);
    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

       // Estados para la paginación
       const [currentPage, setCurrentPage] = useState(1);  // Añadido
       const itemsPerPage = 3;


    // Se hace el mapeo según los datos que se ocupen en el formateo
    const keyMapping = {
        'Cultivo': 'cultivo',
        'Punto de medición': 'codigo',
        'altura de Maleza': 'nombreAlturaMaleza',
        'densidad de Maleza': 'nombreDensidadMaleza',
        'humedad Observable': 'nombreHumedadObservable',
    };


    
    const handleRectanglePress = (idCoberturaVegetal, idFinca, idParcela, idPuntoMedicion, cultivo, alturaMaleza, densidadMaleza, humedadObservable, estado) => {
    
        // Navega a la pantalla de modificación con los valores de texto
        navigation.navigate(ScreenProps.ModifyVegetationcover.screenName, {
            idCoberturaVegetal,
            idFinca,
            idParcela,
            idPuntoMedicion,
            cultivo,
            alturaMaleza,
            densidadMaleza,
            humedadObservable,
            estado
        });
    };

    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };


        try {
            setSelectedFinca(null);
            setSelectedParcela(null);
            setcoberturaVegetal([]);

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
                //se obtienen los datos de el registro condiciones meteorologicas para despues poder filtrarlos
                const registrocoberturaVegetalResponse = await ObtenerRegistroCoberturaVegetal();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = registrocoberturaVegetalResponse.map((item) => ({
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                }));
                setOriginalApiData(registrocoberturaVegetalResponse);
                setCurrentPage(1);

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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = coberturaVegetal.slice(indexOfFirstItem, indexOfLastItem);

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
    };

    //funcion para la accion del dropdown parcela
    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);

        //se necesita el fincaId para poder hacer el filtrado
        const fincaId = selectedFinca !== null ? parseInt(selectedFinca, 10) : null;
        //se asigna el valor de la parcela en selecteParcela
        setSelectedParcela(item.value)
        
        //si finca Id es null no se puede seleciona ni traer el y mostrar el registro condiciones meteorologica
        if (fincaId !== null) {

            obtenerRegistrocoberturaVegetalPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };




    // filtra los datos de el registro condiciones meteorologica
    const obtenerRegistrocoberturaVegetalPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const coberturaVegetalFiltrado = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setcoberturaVegetal(coberturaVegetalFiltrado);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const renderPagination = () => {
        const totalPages = Math.ceil(coberturaVegetal.length / itemsPerPage);
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
                <BackButtonComponent screenName={ScreenProps.MenuPrecisionAgriculture.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertVegetationcover.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista Cobertura Vegetal</Text>
                </View>

                <View style={styles.dropDownContainer}>
                    {/* Dropdown para Fincas */}
                    <View style={styles.searchContainer}>
                    <Text style={styles.formText} >Finca:     </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
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
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                        customWidth={305}
                    />
                    </View>
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                             {!currentItems ? (
                    <>
                        <Text>No se encontraron datos</Text>
                    </>
                    ) : (
                    <>
                        {currentItems.map((item, index) => (
                            
                            <TouchableOpacity key={item.idCoberturaVegetal} onPress={() => handleRectanglePress(
                                item.idCoberturaVegetal, item.idFinca, item.idParcela,item.idPuntoMedicion, item.cultivo, item.alturaMaleza, item.densidadMaleza, item.humedadObservable, item.estado
                            )}>
                                <CustomRectangle
                                key={item.idCoberturaVegetal}
                                data={processData([item], keyMapping)?.data || []} />
                                </TouchableOpacity>
                            
                        ))}
                    </>
                    )}
                       
                </ScrollView>
                {renderPagination()}
            </View>
            <BottomNavBar />
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