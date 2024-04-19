import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { styles } from './lista-pronostico-meteorologico.style'
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { WebView } from 'react-native-webview';
//import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
//import { residueDataInterface } from '../../../../interfaces/residuosInterfaces';
//import { ObtenerManejoResiduos } from '../../../../servicios/ServicioResiduos';
//import { RelacionFincaParcela } from '../../../../interfaces/userDataInterface';

import { ObtenerFincasUbicacionPorIdEmpresa, ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';

const API_WEATHER = `http://api.weatherapi.com/v1/current.json?key=19d59db408fe401f928191944240504&lang=es&q=`;

export const ListaPronosticoMeteorologico: React.FC = () => {
  const { userData } = useAuth();
  const [city, setCity] = useState('');
  const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
  const [fincas, setFincas] = useState<{ idFinca?: number; nombreFinca?: string }[] | []>([]);
  const [error, setError] = useState({
    error: false,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({
    city: '',
    country: '',
    temperature: 0,
    condition: '',
    conditionText: '',
    icon: '',
  });

  useEffect(() => {
    const obtenerDatosIniciales = async () => {
      // Lógica para obtener datos desde la API
      const formData = { idEmpresa: userData.idEmpresa };

      try {
        const datosInicialesObtenidos = await ObtenerFincasUbicacionPorIdEmpresa(formData);


        setFincas(datosInicialesObtenidos);



      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    obtenerDatosIniciales();
  }, []);



  function quitarTildes(texto: any) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const handleFincaChange = async (item: { label: string; value: string }) => {
    const fincaId = parseInt(item.value, 10);
    //se selecciona el item de finca
    setSelectedFinca(item.value);
    const ubicacion = quitarTildes(item.value);


    setError({ error: false, message: '' });
    setLoading(true);


    try {
      const res = await fetch(API_WEATHER + ubicacion + ' CR');
      const data = await res.json();

      if (data.error) {
        throw { message: data.error.message };
      }

      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.code,
        conditionText: data.current.condition.text,
        icon: "https:" + data.current.condition.icon,
      });

    } catch (error: any) {
      setError({ error: true, message: error.message });
    } finally {
      setLoading(false);
    }

  };



  return (
    <View style={styles.listcontainer}>
      <BackButtonComponent screenName={ScreenProps.AdminWeather.screenName} color={'#274c48'} />
      {/* <AddButtonComponent screenName={ScreenProps.RegisterResidue.screenName} color={'#274c48'} /> */}

      <View style={styles.textAboveContainer}>
        {/* <Text style={styles.textAbove} >Pronostico Meteorologico</Text> */}
      </View>
      <Text style={styles.title}>Pronóstico Meteorológico</Text>
      <View style={styles.searchContainer}>
        {/* Dropdown para Fincas */}
        <DropdownComponent

          placeholder="Seleccione una Finca"
          data={fincas.map(finca => ({ label: finca.nombre, value: finca.ubicacion }))}
          value={selectedFinca}
          iconName="tree"

          onChange={handleFincaChange}
        />
      </View>
      {weather.city && (
        <View style={styles.weatherContainer}>
          <Text style={styles.texto}>{weather.city}, {weather.country}</Text>
          <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
          <Text style={styles.texto}>{weather.temperature} °C</Text>
          <Text style={styles.texto}>{weather.conditionText}</Text>
        </View>
      )}
      <Text style={styles.poweredBy}>
        Powered by: {' '}
        <Text style={styles.link}>WeatherAPI.com</Text>
      </Text>
    </View>
  );
}

