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
import { MenuSueloScreen } from "./src/screens/suelos/menu-suelos/menu-suelos";
import { ListaUsuarioRol4Screen } from "./src/screens/lista-usuarios-rol4/lista-usuarios-rol4";
import { ListaEmpresaScreen } from "./src/screens/Administrador Screens/admin-lista-empresas/admin-lista-empresas";
import { AdminRegistrarUsuarioScreen } from "./src/screens/Administrador Screens/admin-registrar-usuario/admin-registrar-usuario";
import { AdministracionCultivos } from "./src/screens/administracion-cultivos/administracion-cultivos";
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
import { ListaFertilizantesScreen } from "./src/screens/suelos/manejo-fertilizantes/lista-manejo-fertilizantes/lista-manejo-fertilizantes";
import { RegistrarFertilizanteScreen } from "./src/screens/suelos/manejo-fertilizantes/registrar-manejo-fertilizantes/registrar-manejo-fertilizantes";
import { ModificarFertilizanteScreen } from "./src/screens/suelos/manejo-fertilizantes/modificar-manejo-fertilizante/modificar-manejo-fertilizantes";
import { ListaCalidadSueloScreen } from "./src/screens/suelos/calidad-suelo/lista-calidad-suelo/lista-calidad-suelo";
import { RegistrarCalidadSueloScreen } from "./src/screens/suelos/calidad-suelo/registrar-calidad-suelo/registrar-calidad-suelo";
import { ModificarCalidadSueloScreen } from "./src/screens/suelos/calidad-suelo/modificar-calidad-suelo/modificar-calidad-suelo";
import { ListaRotacionCultivosScreen } from './src/screens/cultivos/rotacion-cultivo/lista-rotacion-cultivo/lista-rotacion-cultivo';
import { InsertarRotacionCultivosScreen } from './src/screens/cultivos/rotacion-cultivo/insertar-rotacion-cultivo/insertar-rotacion-cultivo';
import { ModificarRotacionCultivosScreen } from './src/screens/cultivos/rotacion-cultivo/modificar-rotacion-cultivo/modificar-rotacion-cultivo';
import { ListaProductividadScreen } from './src/screens/cultivos/productividad/lista-productividad/lista-productividad';
import { RegistrarProductividadScreen } from './src/screens/cultivos/productividad/registrar-productividad/registrar-productividad';
import { ModificarProductividadScreen } from './src/screens/cultivos/productividad/modificar-productividad/modificar-productividad';
import { ListaPreparacionTerrenoScreen } from './src/screens/cultivos/preparacion-terreno/lista-preparacion-terreno/lista-preparacion-terreno';
import { ModificarPreparacionTerrenoScreen } from './src/screens/cultivos/preparacion-terreno/modificar-preparacion-terreno/modificar-preparacion-terreno';
import { RegistrarPreparacionTerrenoScreen } from './src/screens/cultivos/preparacion-terreno/registrar-preparacion-terreno/registrar-preparacion-terreno';
import { ListaManejoResiduosScreen } from './src/screens/cultivos/manejo-residuos/lista-manejo-residuos/lista-manejo-residuos';
import { RegistrarResiduosScreen } from './src/screens/cultivos/manejo-residuos/registrar-manejo-residuos/registrar-manejo-residuos';
import { ModificarResiduosScreen } from './src/screens/cultivos/manejo-residuos/modificar-manejo-residuos/modificar-manejo-residuos';
import { MenuHidricoScreen } from './src/screens/hidrico/menu-hidrico/menu-hidrico';
import { ListaSeguimientoAguaScreen } from './src/screens/hidrico/seguimiento-agua/lista-seguimiento-agua/lista-seguimiento-agua';
import { RegistrarUsoAguaScreen } from './src/screens/hidrico/seguimiento-agua/registrar-seguimiento-agua/registrar-seguimiento-agua';
import { ModificarUsoAguaScreen } from './src/screens/hidrico/seguimiento-agua/modificar-seguimiento-agua/modificar-seguimiento-agua';
import { ListaMonitoreoEficienciaRiegoScreen } from './src/screens/hidrico/monitoreo-eficiencia-riego/lista-monitoreo-eficiencia-riego/lista-monitoreo-eficiencia-riego';
import { InsertarMonitoreoEficienciaRiegoScreen } from './src/screens/hidrico/monitoreo-eficiencia-riego/insertar-monitoreo-eficiencia-riego/insertar-monitoreo-eficiencia-riego';
import { ModificarMonitoreoEficienciaRiegoScreen } from './src/screens/hidrico/monitoreo-eficiencia-riego/modificar-monitoreo-eficiencia-riego/modificar-monitoreo-eficiencia-riego';
import { ListaConductividadElectricaSueloScreen } from './src/screens/hidrico/conductividad-electrica-del-suelo/lista-conductividad-electrica-del-suelo/lista-conductividad-electrica-del-suelo';
import { AdministracionClima } from "./src/screens/administacion-clima/administacion-clima";
import { ListaPronosticoMeteorologico } from './src/screens/clima/pronostico-meteorologico/lista-pronostico-meteorologico/lista-pronostico-meteorologico';
import { ListaCondicionesMeteorologicasClimaticasScreen } from './src/screens/clima/condiciones-meteorologicas-climaticas/lista-condiciones-meteorologicas-climaticas/lista-condiciones-meteorologicas-climaticas';
import { InsertarCondicionesMeteorologicasClimaticasScreen } from './src/screens/clima/condiciones-meteorologicas-climaticas/insertar-condiciones-meteorologicas-climaticas/insertar-condiciones-meteorologicas-climaticas';
import { ModificarCondicionesMeterologicasClimaticasScreen } from './src/screens/clima/condiciones-meteorologicas-climaticas/modificar-condiciones-meteorologicas-climaticas/modificar-condiciones-meteorologicas-climaticas';
import { ListaRiesgoNaturalScreen } from './src/screens/clima/riesgo-natural/lista-riesgo-natural/lista-riesgo-natural';
import { RegistrarRiesgosScreen } from './src/screens/clima/riesgo-natural/registro-riesgo-natural/registro-riesgo-natural';
import { ModificarRiesgoNaturalScreen } from './src/screens/clima/riesgo-natural/modificar-riesgo-natural/modificar-riesgo-natural';
import { AdministracionPlagas } from './src/screens/plagas/administracion-plagas/administracion-plagas';
import { ListaProblemasAsociadosPlagasScreen } from './src/screens/plagas/problemas-asociados-plagas/lista-problemas-asociados-plagas/lista-problemas-asociados-plagas';
import { InsertarProblemasAsociadosPlagasScreen } from './src/screens/plagas/problemas-asociados-plagas/insertar-problemas-asociados-plagas/insertar-problemas-asociados-plagas';
import { ModificarProblemasAsociadosPlagasScreen } from './src/screens/plagas/problemas-asociados-plagas/modificar-problemas-asociados-plagas/modificar-problemas-asociados-plagas';

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
          <Stack.Screen name={ScreenProps.MenuFloor.screenName} component={MenuSueloScreen} />
          <Stack.Screen name={ScreenProps.AdminRegisterUser.screenName} component={AdminRegistrarUsuarioScreen} />
          <Stack.Screen name={ScreenProps.AssignCompany.screenName} component={AdminAsignarEmpresaScreen} />
          <Stack.Screen name={ScreenProps.AdminUserList.screenName} component={AdminListaUsuarioScreen} />
          <Stack.Screen name={ScreenProps.AdminCrops.screenName} component={AdministracionCultivos} />
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
          <Stack.Screen name={ScreenProps.ListFertilizer.screenName} component={ListaFertilizantesScreen} />
          <Stack.Screen name={ScreenProps.RegisterFertilizer.screenName} component={RegistrarFertilizanteScreen} />
          <Stack.Screen name={ScreenProps.ModifyFertilizer.screenName} component={ModificarFertilizanteScreen} />
          <Stack.Screen name={ScreenProps.ListQualityFloorScreen.screenName} component={ListaCalidadSueloScreen} />
          <Stack.Screen name={ScreenProps.RegisterQualityFloorScreen.screenName} component={RegistrarCalidadSueloScreen} />
          <Stack.Screen name={ScreenProps.ModifyQualityFloorScreen.screenName} component={ModificarCalidadSueloScreen} />
          <Stack.Screen name={ScreenProps.CropRotationList.screenName} component={ListaRotacionCultivosScreen} />
          <Stack.Screen name={ScreenProps.InsertCropRotation.screenName} component={InsertarRotacionCultivosScreen} />
          <Stack.Screen name={ScreenProps.ModifyCropRotation.screenName} component={ModificarRotacionCultivosScreen} />
          <Stack.Screen name={ScreenProps.ListProductivity.screenName} component={ListaProductividadScreen} />
          <Stack.Screen name={ScreenProps.RegisterProductivity.screenName} component={RegistrarProductividadScreen} />
          <Stack.Screen name={ScreenProps.ModifyProductivity.screenName} component={ModificarProductividadScreen} />
          <Stack.Screen name={ScreenProps.ListLandPreparation.screenName} component={ListaPreparacionTerrenoScreen} />
          <Stack.Screen name={ScreenProps.RegisterLandPreparation.screenName} component={RegistrarPreparacionTerrenoScreen} />
          <Stack.Screen name={ScreenProps.ModifyLandPreparation.screenName} component={ModificarPreparacionTerrenoScreen} />
          <Stack.Screen name={ScreenProps.ResidueList.screenName} component={ListaManejoResiduosScreen} />
          <Stack.Screen name={ScreenProps.RegisterResidue.screenName} component={RegistrarResiduosScreen} />
          <Stack.Screen name={ScreenProps.ModifyResidue.screenName} component={ModificarResiduosScreen} />
          <Stack.Screen name={ScreenProps.HidricMenu.screenName} component={MenuHidricoScreen} />
          <Stack.Screen name={ScreenProps.WatchListWaterScreen.screenName} component={ListaSeguimientoAguaScreen} />
          <Stack.Screen name={ScreenProps.RegisterUseWaterScreen.screenName} component={RegistrarUsoAguaScreen} />
          <Stack.Screen name={ScreenProps.ModifyUseWatterScreen.screenName} component={ModificarUsoAguaScreen} />
          <Stack.Screen name={ScreenProps.ListIrrigationEfficiency.screenName} component={ListaMonitoreoEficienciaRiegoScreen} />
          <Stack.Screen name={ScreenProps.InsertIrrigationEfficiency.screenName} component={InsertarMonitoreoEficienciaRiegoScreen} />
          <Stack.Screen name={ScreenProps.ModifyIrrigationEfficiency.screenName} component={ModificarMonitoreoEficienciaRiegoScreen} />
          <Stack.Screen name={ScreenProps.ListSoilElectricalConductivity.screenName} component={ListaConductividadElectricaSueloScreen} />

          <Stack.Screen name={ScreenProps.AdminWeather.screenName} component={AdministracionClima} />
          <Stack.Screen name={ScreenProps.WatchWeather.screenName} component={ListaPronosticoMeteorologico} />
          <Stack.Screen name={ScreenProps.ListWeatherClimateConditions.screenName} component={ListaCondicionesMeteorologicasClimaticasScreen} />
          <Stack.Screen name={ScreenProps.InsertWeatherClimateConditions.screenName} component={InsertarCondicionesMeteorologicasClimaticasScreen} />
          <Stack.Screen name={ScreenProps.ModifyWeatherClimateConditions.screenName} component={ModificarCondicionesMeterologicasClimaticasScreen} />
          <Stack.Screen name={ScreenProps.RiskNaturalList.screenName} component={ListaRiesgoNaturalScreen} />
          <Stack.Screen name={ScreenProps.ModifyRiskNatural.screenName} component={ModificarRiesgoNaturalScreen} />
          <Stack.Screen name={ScreenProps.InsertRiskNatural.screenName} component={RegistrarRiesgosScreen} />
          <Stack.Screen name={ScreenProps.MenuPests.screenName} component={AdministracionPlagas} />
          <Stack.Screen name={ScreenProps.ListPestsDiseases.screenName} component={ListaProblemasAsociadosPlagasScreen} />
          <Stack.Screen name={ScreenProps.InsertPestsDiseases.screenName} component={InsertarProblemasAsociadosPlagasScreen} />
          <Stack.Screen name={ScreenProps.ModifyPestsDiseases.screenName} component={ModificarProblemasAsociadosPlagasScreen} />



        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;
