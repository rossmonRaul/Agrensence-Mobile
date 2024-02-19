import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';

import { AsignarUsuariosScreen } from './src/screens/asignar-usuarios/asignar-usuarios';
import { IncioScreen } from './src/screens/inicio/inicio';
import { RegistrarScreen } from './src/screens/registrar/registrar';
import { MenuScreen } from './src/screens/menu/menu';
import { AdminRegistrarScreen } from './src/screens/admin-registrar/admin-registrar';
import { AsignarEmpresaScreen } from './src/screens/AsignarEmpresa/AsignarEmpresa';

import { Screen_Names } from './src/constants';
import { useFontsLoader } from './src/hooks/useFontsLoader';
import { styles } from './src/screens/inicio/inicio.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContextProvider } from './src/context/UserProvider';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const { fontsLoaded, fontLoadingError } = useFontsLoader();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    identificacion: "",
    correo: "",
    idEmpresa: 0,
    idFinca: 0,
    idParcela: 0,
    idRol: 0,
    estado: false
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error al cargar datos almacenados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (fontLoadingError) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Error al cargar las fuentes</Text>
      </View>
    );
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Cargando las fuentes de letra</Text>
        <ActivityIndicator size="large" color="#548256" />
      </View>
    );
  }
  /*
  <Stack.Navigator
          initialRouteName={userData.idRol !== 0 ? Screen_Names.Menu : Screen_Names.Login}
          screenOptions={{ headerShown: false }}
        >
        <Stack.Navigator
          initialRouteName={Screen_Names.AdminRegistrar}
          screenOptions={{ headerShown: false }}
        >
  */
  console.log(userData)
  return (
    <UserContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={userData.idRol !== 0 ? Screen_Names.Menu : Screen_Names.Login}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name={Screen_Names.Login} component={IncioScreen} />
          <Stack.Screen name={Screen_Names.Register} component={RegistrarScreen} />
          <Stack.Screen name={Screen_Names.Menu} component={MenuScreen} />
          <Stack.Screen name={Screen_Names.AdminRegistrar} component={AdminRegistrarScreen} />
          <Stack.Screen name={Screen_Names.AssignEmpresa} component={AsignarEmpresaScreen} />

          <Stack.Screen name={'AssignUsers'} component={AsignarUsuariosScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;
