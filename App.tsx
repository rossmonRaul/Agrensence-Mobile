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
//TipoAplicacion
import { ListaTipoAplicacionScreen } from "./src/screens/suelos/tipo-aplicacion/lista-tipo-aplicacion/lista-tipo-aplicacion";
import { RegistrarTipoAplicacionScreen } from "./src/screens/suelos/tipo-aplicacion/registrar-tipo-aplicacion/registrar-tipo-aplicacion";
import { ModificarTipoAplicacionScreen } from "./src/screens/suelos/tipo-aplicacion/modificar-tipo-aplicacion/modificar-tipo-aplicacion";

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
import { ListaMedicionesSensorScreen } from './src/screens/Administrador Screens/admin-lista-mediciones-sensor/admin-lista-mediciones-sensor';
import { AdminModificarMedicionSensorScreen } from './src/screens/Administrador Screens/admin-mediciones-sensor/admin-modificar-medicion';
import { AdminRegistrarMedicionScreen } from './src/screens/Administrador Screens/admin-mediciones-sensor/admin-registrar-medicion';
import { AdministracionSensores } from './src/screens/administracion-sensores/administracion-sensores';
import { ListaSensoresScreen } from './src/screens/sensores/registro-sensores/lista-registro-sensores/lista-registro-sensores';
import { InsertarSensoresScreen } from './src/screens/sensores/registro-sensores/insertar-registro-sensores/insertar-registro-sensores';
import { ModificarSensoresScreen } from './src/screens/sensores/registro-sensores/modificar-registro-sensores/modificar-registro-sensores';
import ErrorBoundary from './src/components/ErrorBoundary/ErrorBoundary';
import { ListaPuntoMedicionScreen } from './src/screens/punto-medicion/lista-punto-medicion/lista-punto-medicion';
import { InsertarPuntoMedicionScreen } from './src/screens/punto-medicion/registrar-punto-medicion/registrar-punto-medicion';
import { ModificarPuntoMedicionScreen } from './src/screens/punto-medicion/modificar-punto-medicion/modificar-punto-medicion';
import { AdminAdministracion } from './src/screens/administacion-orden-compra/administacion-orden-compra';
import { ListaOrdenCompraScreen } from './src/screens/orden-compra/lista-orden-compra/lista-orden-compra';
import { InsertarOrdenCompraScreen } from './src/screens/orden-compra/insertar-orden-compra/insertar-orden-compra';
import { ModificarOrdenCompraScreen } from './src/screens/orden-compra/modificar-orden-compra/modificar-orden-compra';
import { ListaEntradasSalidasScreen } from './src/screens/entradas-salidas/lista-entradas-salidas/lista-entradas-salidas';
import { InsertarEntradasSalidasScreen } from './src/screens/entradas-salidas/entradas-salidas/insertar-entradas-salidas';
import { ModificarEntradasSalidasScreen } from './src/screens/entradas-salidas/modificar-entradas-salidas/modificar-entradas-salidas';
import { ListaManoObraScreen } from './src/screens/mano-obra/lista-mano-obra/lista-mano-obra';
import { InsertarManoObraScreen } from './src/screens/mano-obra/insertar-mano-obra/insertar-mano-obra';
import { ModificarManoObraScreen } from './src/screens/mano-obra/modificar-mano-obra/modificar-mano-obra';
import { ListaFlujoCajaScreen } from './src/screens/flujo-caja/lista-flujo-caja/lista-flujo-caja';

import { AdministracionReportes } from "./src/screens/administracion-reportes/administracion-reportes";
import { ReporteEntradaSalidaTotal } from "./src/screens/reporte/reporte-entrada-salida-total/reporte-entrada-salida-total";
import { ReporteEntradaTotal } from "./src/screens/reporte/reporte-entrada-total/reporte-entrada-total";
import { ReporteSalidaTotal } from "./src/screens/reporte/reporte-salida-total/reporte-salida-total";
import { ReporteOrdenDeCompra } from "./src/screens/reporte/reporte-orden-de-compra/reporte-orden-de-compra";
import { ReportePlanilla } from "./src/screens/reporte/reporte-planilla/reporte-planilla";

import { ListaSaludPlantaScreen } from './src/screens/agricultura-precision/salud-planta/lista-salud-planta/lista-salud-planta';
import { RegistrarSaludPlantaScreen } from './src/screens/agricultura-precision/salud-planta/registro-salud-planta/registro-salud-planta';
import { ModificarSaludPlantaScreen } from './src/screens/agricultura-precision/salud-planta/modificar-salud-planta/modificar-salud-planta';

import { ListaContenidoClorofilaScreen } from './src/screens/agricultura-precision/contenido-clorofila/lista-contenido-clorofila/lista-contenido-clorofila';
import { InsertarContenidoClorofilaScreen } from './src/screens/agricultura-precision/contenido-clorofila/registro-contenido-clorofila/insertar-contenido-clorofila';
import { ModificarContenidoClorofilaScreen } from './src/screens/agricultura-precision/contenido-clorofila/modificar-contenido-clorofila/modificar-contenido-clorofila';
import { AdministracionAgriculturaPrecision } from './src/screens/administacion-agricultura-precision/administacion-agricultura-precision';

import { ListaCantidadDePlantasScreen } from './src/screens/agricultura-precision/cantidad-plantas/lista-cantidad-plantas/lista-cantidad-plantas';
import { InsertarCantidadDePlantasScreen } from './src/screens/agricultura-precision/cantidad-plantas/registro-cantidad-plantas/insertar-cantidad-plantas';
import { ModificarCantidadDePlantasScreen } from './src/screens/agricultura-precision/cantidad-plantas/modificar-cantidad-plantas/modificar-cantidad-plantas';

import { ListaContenidoAguaScreen } from './src/screens/agricultura-precision/contenido-agua/lista-contenido-agua/lista-contenido-agua';
import { InsertarContenidoAguaScreen } from './src/screens/agricultura-precision/contenido-agua/registro-contenido-agua/registro-contenido-agua';
import { ModificarContenidoAguaScreen } from './src/screens/agricultura-precision/contenido-agua/modificar-contenido-agua/modificar-contenido-agua';

//Cobertura Vegetal
import { ListaCoberturaVegetalScreen } from './src/screens/agricultura-precision/cobertura-vegetal/lista-cobertura-vegetal/lista-cobertura-vegetal';
import { InsertarCoberturaVegetalScreen } from './src/screens/agricultura-precision/cobertura-vegetal/registro-cobertura-vegetal/insertar-cobertura-vegetal';
import { ModificarCoberturaVegetalScreen } from './src/screens/agricultura-precision/cobertura-vegetal/modificar-cobertura-vegetal/modificar-cobertura-vegetal';

import { ListaContenidoNitrogenoScreen } from './src/screens/clima/contenido-nitrogeno/lista-contenido-nitrogeno/lista-contenido-nitrogeno';
import { InsertarContenidoNitrogenoScreen } from './src/screens/clima/contenido-nitrogeno/registro-contenido-nitrogeno/insertar-contenido-nitrogeno';
import { ModificarContenidoNitrogenoScreen } from './src/screens/clima/contenido-nitrogeno/modificar-contenido-nitrogeno/modificar-contenido-nitrogeno';

import { ListaCatalogoActividadesPTScreen } from './src/screens/cultivos/catalogo-actividadesPT/lista-catalogo-actividadesPT/lista-catalogo-actividadesPT';
import { InsertarCatalogoActividadPTScreen } from './src/screens/cultivos/catalogo-actividadesPT/registar-catalogo-actividadesPT/registar-catalogo-actividadesPT';
import { ModificarCatalogoActividadPTScreen } from './src/screens/cultivos/catalogo-actividadesPT/modificar-catalogo-actividadesPT/modificar-catalogo-actividadesPT';

import { ListaMedidasCultivosScreen } from './src/screens/medidas-cultivos/lista-medidas-cultivos/lista-medidas-cultivos'
import { RegistrarMedidasCultivosScreen } from './src/screens/medidas-cultivos/registrar-medidas-cultivos/registrar-medidas-cultivos';
import { ModificarMedidasCultivosScreen } from './src/screens/medidas-cultivos/modificar-medidas-cultivos/modificar-medidas-cultivos';

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
    <ErrorBoundary>
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
            <Stack.Screen name={ScreenProps.ListMeasureSensor.screenName} component={ListaMedicionesSensorScreen} />
            <Stack.Screen name={ScreenProps.ModifyMeasureSensor.screenName} component={AdminModificarMedicionSensorScreen} />
            <Stack.Screen name={ScreenProps.RegisterMeasureSensor.screenName} component={AdminRegistrarMedicionScreen} />

            <Stack.Screen name={ScreenProps.AdminSensors.screenName} component={AdministracionSensores} />
            <Stack.Screen name={ScreenProps.ListSensors.screenName} component={ListaSensoresScreen} />
            <Stack.Screen name={ScreenProps.InsertSensors.screenName} component={InsertarSensoresScreen} />
            <Stack.Screen name={ScreenProps.ModifySensors.screenName} component={ModificarSensoresScreen} />

            <Stack.Screen name={ScreenProps.ListMeasurementPoint.screenName} component={ListaPuntoMedicionScreen} />
            <Stack.Screen name={ScreenProps.InsertMeasurementPoint.screenName} component={InsertarPuntoMedicionScreen} />
            <Stack.Screen name={ScreenProps.ModifyMeasurementPoint.screenName} component={ModificarPuntoMedicionScreen} />
            <Stack.Screen name={ScreenProps.AdminAdminstration.screenName} component={AdminAdministracion} />
            <Stack.Screen name={ScreenProps.ListPurchaseOrder.screenName} component={ListaOrdenCompraScreen} />
            <Stack.Screen name={ScreenProps.InsertPurchaseOrder.screenName} component={InsertarOrdenCompraScreen} />
            <Stack.Screen name={ScreenProps.ModifyPurchaseOrder.screenName} component={ModificarOrdenCompraScreen} />
            <Stack.Screen name={ScreenProps.ListInflowsOutflows.screenName} component={ListaEntradasSalidasScreen} />
            <Stack.Screen name={ScreenProps.InsertInflowsOutflows.screenName} component={InsertarEntradasSalidasScreen} />
            <Stack.Screen name={ScreenProps.ModifyInflowsOutflows.screenName} component={ModificarEntradasSalidasScreen} />
            <Stack.Screen name={ScreenProps.ListManoObra.screenName} component={ListaManoObraScreen} />
            <Stack.Screen name={ScreenProps.InsertManoObra.screenName} component={InsertarManoObraScreen} />
            <Stack.Screen name={ScreenProps.ModifyManoObra.screenName} component={ModificarManoObraScreen} />
            <Stack.Screen name={ScreenProps.ListCashFlow.screenName} component={ListaFlujoCajaScreen} />

            <Stack.Screen name={ScreenProps.AdminReports.screenName} component={AdministracionReportes} />

            <Stack.Screen name={ScreenProps.ReportEntradaSalidaTotal.screenName} component={ReporteEntradaSalidaTotal } />
            <Stack.Screen name={ScreenProps.ReportEntradaTotal.screenName} component={ReporteEntradaTotal } />
            <Stack.Screen name={ScreenProps.ReportSalidaTotal.screenName} component={ReporteSalidaTotal } />
            <Stack.Screen name={ScreenProps.ReportOrdenDeCompra.screenName} component={ReporteOrdenDeCompra } />
            <Stack.Screen name={ScreenProps.ReportPlanilla.screenName} component={ReportePlanilla } />

            <Stack.Screen name={ScreenProps.MenuPrecisionAgriculture.screenName} component={AdministracionAgriculturaPrecision} />
            <Stack.Screen name={ScreenProps.PlantHealthList.screenName} component={ListaSaludPlantaScreen } />
            <Stack.Screen name={ScreenProps.InsertPlantHealth.screenName} component={RegistrarSaludPlantaScreen } />
            <Stack.Screen name={ScreenProps.ModifyPlantHealth.screenName} component={ModificarSaludPlantaScreen } />

            <Stack.Screen name={ScreenProps.ChlorophyllContentList.screenName} component={ListaContenidoClorofilaScreen } />
            <Stack.Screen name={ScreenProps.InsertChlorophyllContent.screenName} component={InsertarContenidoClorofilaScreen } />
            <Stack.Screen name={ScreenProps.ModifyChlorophyllContent.screenName} component={ModificarContenidoClorofilaScreen } />

            <Stack.Screen name={ScreenProps.NumberOfPlantsList.screenName} component={ListaCantidadDePlantasScreen } />
            <Stack.Screen name={ScreenProps.InsertNumberOfPlantsContent.screenName} component={InsertarCantidadDePlantasScreen } />
            <Stack.Screen name={ScreenProps.ModifyNumberOfPlantsContent.screenName} component={ModificarCantidadDePlantasScreen } />

            <Stack.Screen name={ScreenProps.WaterContentList.screenName} component={ListaContenidoAguaScreen } />
            <Stack.Screen name={ScreenProps.InsertWaterContent.screenName} component={InsertarContenidoAguaScreen } />
            <Stack.Screen name={ScreenProps.ModifyWaterContent.screenName} component={ModificarContenidoAguaScreen } />

            <Stack.Screen name={ScreenProps.VegetationcoverList.screenName} component={ListaCoberturaVegetalScreen } />
            <Stack.Screen name={ScreenProps.InsertVegetationcover.screenName} component={InsertarCoberturaVegetalScreen } />
            <Stack.Screen name={ScreenProps.ModifyVegetationcover.screenName} component={ModificarCoberturaVegetalScreen } />

            <Stack.Screen name={ScreenProps.NitrogenContentList.screenName} component={ListaContenidoNitrogenoScreen} />
            <Stack.Screen name={ScreenProps.InsertNitrogenContent.screenName} component={InsertarContenidoNitrogenoScreen}/>
            <Stack.Screen name={ScreenProps.ModifyNitrogenContent.screenName} component={ModificarContenidoNitrogenoScreen}/>

            <Stack.Screen name={ScreenProps.ListCatalogoActividades.screenName} component={ListaCatalogoActividadesPTScreen}/>
            <Stack.Screen name={ScreenProps.RegisterCatalogoActividad.screenName} component={InsertarCatalogoActividadPTScreen}/>
            <Stack.Screen name={ScreenProps.ModifyCatalogoActividad.screenName} component={ModificarCatalogoActividadPTScreen}/>

            <Stack.Screen name={ScreenProps.CropMeasurementsList.screenName} component={ListaMedidasCultivosScreen} />
            <Stack.Screen name={ScreenProps.InsertCropMeasurements.screenName} component={RegistrarMedidasCultivosScreen}/>
            <Stack.Screen name={ScreenProps.ModifyCropMeasurements.screenName} component={ModificarMedidasCultivosScreen}/>

          </Stack.Navigator>
        </NavigationContainer>
      </UserContextProvider>
    </ErrorBoundary>
  );
};

export default App;

