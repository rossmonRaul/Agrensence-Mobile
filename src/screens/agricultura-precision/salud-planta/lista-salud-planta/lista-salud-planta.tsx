import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { riesgoNaturalDataInterface } from '../../../../interfaces/riesgoNaturalInterface';
import { ObtenerSaludDeLaPlanta } from '../../../../servicios/ServicioSaludDeLaPlanta';
import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { paginationStyles } from '../../../../styles/pagination-styles.styles';

export const ListaSaludPlantaScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const [parcelas, setParcelas] = useState<{ idParcela: number }[] | []>([]);
    const [apiData, setApiData] = useState<riesgoNaturalDataInterface[]>([]);
    const [saludPlantaFiltradosData, setSaludPlantaFiltradosData] = useState<any[]>([]);
    const [saludPlanta, setSaludPlanta] = useState<any[]>([]);
     // Estados para la paginación
     const [currentPage, setCurrentPage] = useState(1);  // Añadido
     const itemsPerPage = 3;


const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = saludPlanta.slice(indexOfFirstItem, indexOfLastItem);
    //para poder hacer el filtro de los datos del api
    useEffect(() => {
        // Obtener los IDs de las parcelas del usuario
        const idParcelasUsuario = parcelas.map(parcela => parcela.idParcela);

        // Filtrar las residuosFiltradas por los IDs de las parcelas del usuario
        const residuosfiltradas = apiData.filter(item => idParcelasUsuario.includes(item.idParcela));

        // Actualizar el estado con las residuos filtradas
        setSaludPlantaFiltradosData(residuosfiltradas);
        setSaludPlanta(residuosfiltradas)
    }, [apiData, parcelas]);


    // useEffect(() => {
    //     const obtenerDatosIniciales = async () => {
    //         // Lógica para obtener datos desde la API
    //         const formData = { identificacion: userData.identificacion };
    //         try {

    //             const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

    //             const parcelasUnicas = Array.from(new Set(datosInicialesObtenidos
    //                 .filter(item => item !== undefined)
    //                 .map(item => item!.idParcela)))
    //                 .map(idParcela => {
    //                     const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
    //                     const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
    //                     return { idParcela, nombreParcela };
    //                 });
    //             setParcelas(parcelasUnicas)
    //             const saludPlanta = await ObtenerSaludDeLaPlanta();
    //             //si es 0 es inactivo sino es activo resetea los datos
    //             const filteredData = saludPlanta.map((item) => ({
    //                 ...item,
    //                 estado: item.estado === 0 ? 'Inactivo' : 'Activo',
    //             }));

    //             setApiData(filteredData);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     obtenerDatosIniciales();
    // }, [userData.identificacion]);


    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };


        try {
            setSaludPlanta([]);
            const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);

                const parcelasUnicas = Array.from(new Set(datosInicialesObtenidos
                    .filter(item => item !== undefined)
                    .map(item => item!.idParcela)))
                    .map(idParcela => {
                        const relacion = datosInicialesObtenidos.find(item => item?.idParcela === idParcela);
                        const nombreParcela = relacion ? relacion.nombreParcela : ''; // Verificamos si el objeto no es undefined
                        return { idParcela, nombreParcela };
                    });
                setParcelas(parcelasUnicas)
                const saludPlanta = await ObtenerSaludDeLaPlanta();
                //si es 0 es inactivo sino es activo resetea los datos
                const filteredData = saludPlanta.map((item) => ({
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

    //  Se hace el mapeo segun los datos que se ocupen en el formateo
    const keyMapping = {
        'Finca': 'nombreFinca',
        'Parcela': 'nombreParcela',
        'Fecha': 'fecha',
        'Cultivo':'cultivo',
        'Color Hojas': 'colorHojas',
        'Tamano y Forma de la Hoja': 'tamanoFormaHoja',
        'Estado de Tallo': 'estadoTallo',
        'Estado de Raíz': 'estadoRaiz'
    };



    //funcion para enviarlo a modificar residuo
    const handleRectanglePress = (idSaludDeLaPlanta: string,  idFinca: string, idParcela: string, fecha: string, cultivo: string,
        idColorHojas: string, idTamanoFormaHoja: number, idEstadoTallo: string, idEstadoRaiz: string, estado: string) => {

        navigation.navigate(ScreenProps.ModifyPlantHealth.screenName, {
            idSaludDeLaPlanta: idSaludDeLaPlanta, idFinca: idFinca, idParcela: idParcela, fecha: fecha, cultivo: cultivo,
            idColorHojas: idColorHojas, idTamanoFormaHoja: idTamanoFormaHoja, idEstadoTallo: idEstadoTallo, idEstadoRaiz: idEstadoRaiz,
            estado: estado
        });
    };
    //funcion para poder buscar de acuerdo a al usuario, finca o parcela
    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredData = saludPlantaFiltradosData.filter((item) => {
            return (
                item.nombreParcela.toLowerCase().includes(lowercaseQuery) ||
                item.nombreFinca.toLowerCase().includes(lowercaseQuery)
            );
        });
        setSaludPlanta(filteredData);
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(saludPlanta.length / itemsPerPage);
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
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.MenuPrecisionAgriculture.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertPlantHealth.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista Salud de la Planta</Text>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar información por finca o parcela"
                        onChangeText={(text) => handleSearch(text)}
                    />
                    <TouchableOpacity style={styles.searchIconContainer}>
                        <Ionicons name="search" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                {!currentItems ? (
                    <>
                        <Text>No se encontraron datos</Text>
                    </>
                    ) : (
                    <>
                        {currentItems.map((item, index) => (
                            
                            <TouchableOpacity key={item.idSaludDeLaPlanta} onPress={() => handleRectanglePress(item.idSaludDeLaPlanta, item.idFinca, item.idParcela,
                                item.fecha, item.cultivo, item.idColorHojas, item.idTamanoFormaHoja, item.idEstadoTallo, item.idEstadoRaiz, item.estado)}>
                                <CustomRectangle
                                key={item.idSaludDeLaPlanta}
                                data={processData([item], keyMapping)?.data || []} />
                                </TouchableOpacity>
                            
                        ))}
                    </>
                    )}
                </ScrollView>
                {renderPagination()}
            </View>

            <BottomNavBar />

        </View>
    );
}