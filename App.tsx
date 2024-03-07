import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { ScreenProps } from './src/constants';
import { useFontsLoader } from './src/hooks/useFontsLoader';
import { styles } from './src/screens/inicio-sesion/inicio-sesion.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContextProvider } from './src/context/UserProvider';
import { IncioSesionScreen } from "./src/screens/inicio-sesion/inicio-sesion";
import { RegistrarUsuarioScreen } from "./src/screens/registrar-usuario/registrar-usuario";
import { MenuScreen } from "./src/screens/menu-principal/menu-principal";
import { ListaUsuarioRol4Screen } from "./src/screens/lista-usuarios-rol4/lista-usuarios-rol4";
import { ListaEmpresaScreen } from "./src/screens/Administrador Screens/admin-lista-empresas/admin-lista-empresas";
import { AdminRegistrarUsuarioScreen } from "./src/screens/Administrador Screens/admin-registrar-usuario/admin-registrar-usuario";
import { AdminRegistrarEmpresaScreen } from "./src/screens/Administrador Screens/admin-registrar-empresa/admin-registrar-empresa";
import { AdminModificarUsuarioScreen } from "./src/screens/Administrador Screens/admin-modificar-usuario/admin-modificar-usuario";
import { AdminModificarEmpresaScreen } from "./src/screens/Administrador Screens/admin-modificar-empresa/admin-modificar-empresa";
import { AdminListaUsuarioScreen } from "./src/screens/Administrador Screens/admin-lista-usuarios/admin-lista-usuarios";
import { AdminModificarUsuarioAdmnistradorScreen } from "./src/screens/Administrador Screens/admin-modificar-usuario-administrador/admin-modificar-usuario-administrador";
import { AdminAsignarEmpresaScreen } from "./src/screens/Administrador Screens/admin-asignar-empresa-usuario/admin-asignar-empresa-usuario";
import { ListaFincasScreen } from "./src/screens/fincas/lista-fincas/lista-fincas";
import { RegistrarFincaScreen } from "./src/screens/fincas/registrar-finca/registrar-finca";
import { ModificarFincaScreen } from "./src/screens/fincas/modificar-finca/modificar-finca";
import { ListaParcelasScreen } from "./src/screens/parcelas/lista-parcelas/lista-parcelas";
import { RegistrarParcelaScreen } from "./src/screens/parcelas/registrar-parcela/registrar-parcela";
import { ModificarParcelaScreen } from "./src/screens/parcelas/modificar-parcela/modificar-parcela";


const Stack = createNativeStackNavigator();
const AppNavigator = ({ navigation }) => {
  useEffect(() => {
    const handleBackButton = () => {
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
}

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
  const [screenPropsLoaded, setScreenPropsLoaded] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => backHandler.remove();
  }, []);
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

    const loadScreenProps = () => {

      setScreenPropsLoaded(true);
    };

    loadUserData();
    loadScreenProps();
  }, []);


  if (fontLoadingError) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Error al cargar las fuentes</Text>
      </View>
    );
  }

  if (!fontsLoaded || loading || !screenPropsLoaded) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Cargando las fuentes de letra</Text>
        <ActivityIndicator size="large" color="#548256" />
      </View>
    );
  }

  /*
  <Stack.Navigator
          initialRouteName={userData.idRol !== 0 ? ScreenProps.Menu.screenName : ScreenProps.Login.screenName}
          screenOptions={{ headerShown: false }}
        >
        <Stack.Navigator
          initialRouteName={ScreenProps.Login.screenName}
          screenOptions={{ headerShown: false }}
        >
  */
  return (
    <UserContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={userData.idRol !== 0 ? ScreenProps.Menu.screenName : ScreenProps.Login.screenName}
          screenOptions={{ headerShown: false, gestureEnabled: false, headerLeft: () => null, }}
        >
          <Stack.Screen name={ScreenProps.Login.screenName} component={IncioSesionScreen} />
          <Stack.Screen name={ScreenProps.Register.screenName} component={RegistrarUsuarioScreen} />
          <Stack.Screen name={ScreenProps.Menu.screenName} component={MenuScreen} />
          <Stack.Screen name={ScreenProps.AdminRegisterUser.screenName} component={AdminRegistrarUsuarioScreen} />
          <Stack.Screen name={ScreenProps.AssignCompany.screenName} component={AdminAsignarEmpresaScreen} />
          <Stack.Screen name={ScreenProps.AdminUserList.screenName} component={AdminListaUsuarioScreen} />
          <Stack.Screen name={ScreenProps.CompanyList.screenName} component={ListaEmpresaScreen} />
          <Stack.Screen name={ScreenProps.AdminModifyCompany.screenName} component={AdminModificarEmpresaScreen} />
          <Stack.Screen name={ScreenProps.AdminRegisterCompany.screenName} component={AdminRegistrarEmpresaScreen} />
          <Stack.Screen name={ScreenProps.ListUsersRol4.screenName} component={ListaUsuarioRol4Screen} />
          <Stack.Screen name={ScreenProps.AdminModifyAdminUser.screenName} component={AdminModificarUsuarioAdmnistradorScreen} />
          <Stack.Screen name={ScreenProps.AdminModifyUser.screenName} component={AdminModificarUsuarioScreen} />
          <Stack.Screen name={ScreenProps.ListEstate.screenName} component={ListaFincasScreen} />
          <Stack.Screen name={ScreenProps.RegisterEstate.screenName} component={RegistrarFincaScreen} />
          <Stack.Screen name={ScreenProps.ModifyEstate.screenName} component={ModificarFincaScreen} />
          <Stack.Screen name={ScreenProps.ListPlot.screenName} component={ListaParcelasScreen} />
          <Stack.Screen name={ScreenProps.RegisterPlot.screenName} component={RegistrarParcelaScreen} />
          <Stack.Screen name={ScreenProps.ModifyPlot.screenName} component={ModificarParcelaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;
