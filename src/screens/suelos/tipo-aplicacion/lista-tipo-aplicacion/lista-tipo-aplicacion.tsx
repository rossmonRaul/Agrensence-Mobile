import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerTipoAplicacion } from '../../../../servicios/ServicioTipoAplicacion';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import { RelacionFincaParcela, UserDataInterface } from '../../../../interfaces/userDataInterface';
import { ParcelaInterface } from '../../../../interfaces/empresaInterfaces';
import { FertilizerDataInterface } from '../../../../interfaces/fertilizanteInterface';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

// Definición de la interfaz para los datos de tipo de aplicación
interface TipoAplicacionDataInterface {
  idTipoAplicacion: number;
  nombre: string;
  estado: number; // 0: Inactivo, 1: Activo
}

export const ListaTipoAplicacionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [apiData, setApiData] = useState<TipoAplicacionDataInterface[]>([]);
  const [apiDataFiltrada, setApiDataFiltrada] = useState<TipoAplicacionDataInterface[]>([]);

  const obtenerDatosIniciales = async () => {
    try {
      // Lógica para obtener datos desde la API
      const tiposAplicacion: TipoAplicacionDataInterface[] = await ObtenerTipoAplicacion();
      setApiDataFiltrada(tiposAplicacion);
      setApiData(tiposAplicacion);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      obtenerDatosIniciales();
    }, [])
  );

  // Mapeo de claves para los datos de tipo de aplicación
  const keyMapping = {
    'Aplicación': 'nombre',
    'estado': 'estado',
  };

  // Función para manejar la acción de presionar un tipo de aplicación
  const handleRectanglePress = (idTipoAplicacion: number, nombre: string, estado: number) => {
    navigation.navigate(ScreenProps.ModifyApplicationType.screenName, {
      idTipoAplicacion,
      nombre,
      estado,
    });
  };

  // Conversión de estado de número a string
  const convertEstadoToString = (estado: number) => (estado === 0 ? 'Inactivo' : 'Activo');

  //funcion para poder buscar de acuerdo a al usuario, finca o parcela
  const handleSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase();

    const filteredData = apiData.filter((item) => {
      return (
        item.nombre.toLowerCase().includes(lowercaseQuery)
      );
    });
    setApiDataFiltrada(filteredData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.listcontainer}>
        <BackButtonComponent screenName={ScreenProps.MenuFloor.screenName} color={'#274c48'} />
        <AddButtonComponent screenName={ScreenProps.RegisterApplicationType.screenName} color={'#274c48'} />

        <View style={styles.textAboveContainer}>
          <Text style={styles.textAbove}>Lista de Tipos de Aplicación</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar información"
            onChangeText={(text) => handleSearch(text)}
          />
          <TouchableOpacity style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
          {apiDataFiltrada.map((item) => (
            <TouchableOpacity key={item.idTipoAplicacion} onPress={() => handleRectanglePress(item.idTipoAplicacion, item.nombre, item.estado)}>
              <CustomRectangle
                data={processData(
                  [
                    {
                      ...item,
                      estado: convertEstadoToString(item.estado),
                    },
                  ],
                  keyMapping
                )?.data || []}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <BottomNavBar />
    </View>
  );
};