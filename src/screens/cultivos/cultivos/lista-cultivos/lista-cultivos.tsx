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
import { ObtenerCultivos } from '../../../../servicios/ServicioCultivos';
import { ObtenerFincas } from '../../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../../servicios/ServicioParcela';
import { paginationStyles } from '../../../../styles/pagination-styles.styles';

export const ListaCultivosScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    // Estado para los datos mostrados en la pantalla
    const [apiData, setApiData] = useState<any[]>([]);

    const [originalApiData, setOriginalApiData] = useState<any[]>([]);
    const [cultivo, setCultivo] = useState<any[]>([]);

    const [fincas, setFincas] = useState<{ idFinca?: number; nombre?: string }[] | []>([]);
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
        'Finca': 'nombreFinca',
        'Parcela': 'nombreParcela',
    };

    const handleRectanglePress = (idCultivo: string, idFinca: string, idParcela: string, cultivo: String, estado: String) => {
        // Encuentra el elemento correspondiente en los datos originales utilizando el ID único

        // Si se encuentra el elemento correspondiente, puedes acceder a sus propiedades directamente
        navigation.navigate(ScreenProps.ModifyCrop.screenName, {
            idCultivo: idCultivo,
            idFinca: idFinca,
            idParcela: idParcela,
            cultivo: cultivo,
            estado: estado,
        });

    };

    const fetchData = async () => {
        const formData = { identificacion: userData.identificacion };


        try {
            setSelectedFinca(null);
            setSelectedParcela(null);
            setCultivo([]);

                // const datosInicialesObtenidos: RelacionFincaParcela[] = await ObtenerUsuariosAsignadosPorIdentificacion(formData);


                const fincasResponse = await ObtenerFincas(userData.idEmpresa);
                //const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === userData.idEmpresa);
                setFincas(fincasResponse);

                const parcelasResponse = await ObtenerParcelas(userData.idEmpresa);
                //const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                setParcelas(parcelasResponse);


                //se obtienen los datos de el registro condiciones meteorologicas para despues poder filtrarlos
                const registroCultivosResponse = await ObtenerCultivos();

                setOriginalApiData(registroCultivosResponse);
                setCurrentPage(1);

                setApiData(registroCultivosResponse);

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
    const currentItems = cultivo.slice(indexOfFirstItem, indexOfLastItem);
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

            obtenerRegistroCultivosPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Selected Finca is null. Cannot fetch preparacion Terreno.');
        }
    };




    // filtra los datos de el registro condiciones meteorologica
    const obtenerRegistroCultivosPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {

            const CultivosFiltrados = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);

            setCultivo(CultivosFiltrados);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const renderPagination = () => {
        const totalPages = Math.ceil(cultivo.length / itemsPerPage);
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
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <AddButtonComponent screenName={ScreenProps.InsertCrop.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Lista de cultivos</Text>
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
                    {/* Dropdown para Parcelas */}
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                    />
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                             {!currentItems ? (
                    <>
                        <Text>No se encontraron datos</Text>
                    </>
                    ) : (
                    <>
                        {currentItems.map((item, index) => (
                            
                            <TouchableOpacity key={item.idCultivo} onPress={() => handleRectanglePress(
                                item.idCultivo, item.idFinca, item.idParcela, item.cultivo, item.estado
                            )}>
                                <CustomRectangle
                                key={item.idCultivo}
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
};