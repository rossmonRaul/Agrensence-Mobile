
// Se definen las constantes de los nombres de las pantallas y los componentes de cada uno
export const ScreenProps = {
    Login: { screenName: 'Login' },
    Register: { screenName: 'Register' },
    Menu: { screenName: 'Menu' },
    MenuFloor: { screenName: 'MenuSueloScreen' },
    AdminRegisterUser: { screenName: 'AdminRegisterUser' },
    AssignCompany: { screenName: 'AssignCompany' },
    CompanyList: { screenName: 'CompanyList' },
    AdminModifyCompany: { screenName: 'AdminModifyCompany' },
    AdminRegisterCompany: { screenName: 'AdminRegisterCompany' },
    ListUsersRol4: { screenName: 'ListUsersRol4' },
    AdminModifyUser: { screenName: 'AdminModifyUser' },
    AdminModifyAdminUser: { screenName: 'AdminModifyAdminUser' },
    AdminCrops: { screenName: 'AdministracionCultivos' },
    AdminUserList: { screenName: 'AdminUserList' },
    AdminCreateCompany: { screenName: 'AdminCreateCompany' },
    ListEstate: { screenName: 'ListEstate' },
    RegisterEstate: { screenName: 'RegistrarFincaScreen' },
    ModifyEstate: { screenName: 'ModificarFincaScreen' },
    ListPlot: { screenName: 'ListaParcelasScreen' },
    RegisterPlot: { screenName: 'RegistrarParcelaScreen' },
    ModifyPlot: { screenName: 'ModificarParcelaScreen' },
    ListFertilizer: { screenName: 'ListaFertilizantesScreen' },
    RegisterFertilizer: { screenName: 'RegistrarFertilizanteScreen' },
    ModifyFertilizer: { screenName: 'ModificarFertilizanteScreen' },
    ListApplicationType: { screenName: 'ListaTipoAplicacionScreen' },
    RegisterApplicationType: { screenName: 'RegistrarTipoAplicacionScreen' },
    ModifyApplicationType: { screenName: 'ModificarTipoAplicacionScreen' },
    ListQualityFloorScreen: { screenName: 'ListaCalidadSueloScreen' },
    RegisterQualityFloorScreen: { screenName: 'RegistrarCalidadSueloScreen' },
    ModifyQualityFloorScreen: { screenName: 'ModificarCalidadSueloScreen' },
    CropRotationList: { screenName: 'CropRotationList' },
    InsertCropRotation: { screenName: 'InsertCropRotation' },
    ModifyCropRotation: { screenName: 'ModifyCropRotation' },
    ListLandPreparation: { screenName: 'ListaPreparacionTerrenoScreen' },
    RegisterLandPreparation: { screenName: 'RegistrarPreparacionTerrenoScreen' },
    ModifyLandPreparation: { screenName: 'ModificarPreparacionTerrenoScreen' },
    ListProductivity: { screenName: 'ListaProductividadScreen' },
    RegisterProductivity: { screenName: 'RegistrarProductividadScreen' },
    ModifyProductivity: { screenName: 'ModificarProductividadScreen' },
    ResidueList: { screenName: 'ListaManejoResiduosScreen' },
    RegisterResidue: { screenName: 'RegistrarResiduosScreen' },
    ModifyResidue: { screenName: 'ModificarResiduosScreen' },
    HidricMenu: { screenName: 'MenuHidricoScreen' },
    WatchListWaterScreen: { screenName: 'ListaSeguimientoAguaScreen' },
    RegisterUseWaterScreen: { screenName: 'RegistrarUsoAguaScreen' },
    ModifyUseWatterScreen: { screenName: 'ModificarUsoAguaScreen' },
    ListIrrigationEfficiency: { screenName: 'ListIrrigationEfficiency' },
    InsertIrrigationEfficiency: { screenName: 'InsertIrrigationEfficiency' },
    ModifyIrrigationEfficiency: { screenName: 'ModifyIrrigationEfficiency' },
    ListSoilElectricalConductivity: { screenName: 'ListSoilElectricalConductivity' },
    WatchWeather: { screenName: 'WatchWeather' },
    AdminWeather: { screenName: 'AdministracionClima' },
    ListWeatherClimateConditions: { screenName: 'ListWeatherClimateConditions' },
    InsertWeatherClimateConditions: { screenName: 'InsertWeatherClimateConditions' },
    ModifyWeatherClimateConditions: { screenName: 'ModifyWeatherClimateConditions' },
    RiskNaturalList: { screenName: 'ListaRiesgoNaturalScreen' },
    InsertRiskNatural: { screenName: 'RegistrarRiesgosScreen' },
    ModifyRiskNatural: { screenName: 'ModificarRiesgoNaturalScreen' },
    MenuPests: { screenName: 'MenuPests' },
    InsertPestsDiseases: { screenName: 'InsertPestsDiseases' },
    ListPestsDiseases: { screenName: 'ListPestsDiseases' },
    ModifyPestsDiseases: { screenName: 'ModifyPestsDiseases' },
    ListMeasureSensor: { screenName: 'ListMeasureSensor' },
    ModifyMeasureSensor: { screenName: 'ModifyMeasureSensor' },
    RegisterMeasureSensor: { screenName: 'RegisterMeasureSensor' },
    AdminSensors: { screenName: 'AdminSensors' },
    ListSensors: { screenName: 'ListSensors' },
    ModifySensors: { screenName: 'ModifySensors' },
    InsertSensors: { screenName: 'InsertSensors' },

    InsertMeasurementPoint: { screenName: 'InsertMeasurementPoint' },
    ListMeasurementPoint: { screenName: 'ListMeasurementPoint' },
    ModifyMeasurementPoint: { screenName: 'ModifyMeasurementPoint' },
    AdminAdminstration: { screenName: 'AdminAdminstration' },
    ListPurchaseOrder: { screenName: 'ListPurchaseOrder' },
    ModifyPurchaseOrder: { screenName: 'ModifyPurchaseOrder' },
    InsertPurchaseOrder: { screenName: 'InsertPurchaseOrder' },
    ListInflowsOutflows: { screenName: 'ListInflowsOutflows' },
    InsertInflowsOutflows: { screenName: 'InsertInflowsOutflows' },
    ModifyInflowsOutflows: { screenName: 'ModifyInflowsOutflows' },
    ListManoObra: { screenName: 'ListManoObra' },
    ModifyManoObra: { screenName: 'ModifyManoObra' },
    InsertManoObra: { screenName: 'InsertManoObra' },
    ListCashFlow: { screenName: 'ListCashFlow' },

    AdminReports: { screenName: 'adminReports' },
    ReportEntradaSalidaTotal: { screenName: 'reportEntradaSalidaTotal' },
    ReportEntradaTotal: { screenName: 'reportEntradaTotal' },
    ReportSalidaTotal: { screenName: 'reportSalidaTotal' },
    ReportOrdenDeCompra: { screenName: 'reportOrdenDeCompra' },
    ReportPlanilla: { screenName: 'reportPlanilla' },

    MenuPrecisionAgriculture: { screenName: 'MenuPrecisionAgriculture' },
    PlantHealthList: { screenName: 'ListaSaludPlantaScreen' },
    InsertPlantHealth: { screenName: 'RegistrarSaludPlantaScreen' },
    ModifyPlantHealth: { screenName: 'ModificarSaludPlantaScreen' },

    ChlorophyllContentList: { screenName: 'ListaContenidoClorofilaScreen' },
    InsertChlorophyllContent: { screenName: 'RegistrarContenidoClorofilaScreen' },
    ModifyChlorophyllContent: { screenName: 'ModificarContenidoClorofilaScreen' },

    NumberOfPlantsList: { screenName: 'ListaCantidadDePlantasScreen' },
    InsertNumberOfPlantsContent: { screenName: 'RegistrarCantidadDePlantasScreen' },
    ModifyNumberOfPlantsContent: { screenName: 'ModificarCantidadDePlantasScreen' },


    WaterContentList: { screenName: 'ListaContenidoAguaScreen' },
    InsertWaterContent: { screenName: 'RegistrarContenidoAguaScreen' },
    ModifyWaterContent: { screenName: 'ModificarContenidoAguaScreen' },

    //ContenidoVegetal
    VegetationcoverList: { screenName: 'ListaCoberturaVegetalScreen' },
    InsertVegetationcover: { screenName: 'InsertarCoberturaVegetalScreen' },
    ModifyVegetationcover: { screenName: 'ModificarCoberturaVegetalScreen' },

    NitrogenContentList: { screenName: 'ListaContenidoNitrogenoScreen'},
    InsertNitrogenContent: { screenName: 'RegistrarContenidoNitrogenoScreen' },
    ModifyNitrogenContent: { screenName: 'ModificarContenidoNitrogenoScreen' },

    ListCatalogoActividades: { screenName: 'ListaCatalogoActividadesPTScreen' },
    RegisterCatalogoActividad: { screenName: 'RegistrarCatalogoActividadPTScreen' },
    ModifyCatalogoActividad: { screenName: 'ModificarCatalogoActividadPTScreen' },

    CropMeasurementsList: { screenName: 'ListaMedidasCultivosScreen'},
    InsertCropMeasurements: { screenName: 'RegistrarMedidasCultivosScreen' },
    ModifyCropMeasurements: { screenName: 'ModificarMedidasCultivosScreen' },

};

// Esta es la IP que uno debe cambiar en local por la IP de cada uno

export const IP_API = '192.168.18.9';

export const API_URL = `http://${IP_API}:5271`

// Se definen las constantes de las imagenes y texto que va en los cuadros de la pantalla Empresa
export const Company_Props = [
    //Usuarios
    { id: 1, iconImage: require('./assets/images/icons/suelos.png'), text: 'Suelos', screen: ScreenProps.MenuFloor.screenName },
    { id: 2, iconImage: require('./assets/images/icons/cultivos.png'), text: 'Cultivos', screen: ScreenProps.AdminCrops.screenName },
    { id: 3, iconImage: require('./assets/images/icons/hidrico.png'), text: 'Hídrico', screen: ScreenProps.HidricMenu.screenName },
    { id: 4, iconImage: require('./assets/images/icons/clima.png'), text: 'Clima', screen: ScreenProps.AdminWeather.screenName },
    { id: 5, iconImage: require('./assets/images/icons/plagas.png'), text: 'Plagas', screen: ScreenProps.MenuPests.screenName },
    { id: 6, iconImage: require('./assets/images/icons/administracion.png'), text: 'Administración', screen: '' },
    { id: 7, iconImage: require('./assets/images/icons/agricultura-precision.png'), text: 'Agricultura de precisión', screen: ScreenProps.MenuPrecisionAgriculture.screenName  },
    { id: 8, iconImage: require('./assets/images/icons/comunidad.png'), text: 'Comunidad', screen: '' },
    { id: 9, iconImage: require('./assets/images/icons/recomendacion.png'), text: 'Recomendación', screen: '' },
    { id: 10, iconImage: require('./assets/images/icons/calidad.png'), text: ' Control de Calidad', screen: '' },
    { id: 11, iconImage: require('./assets/images/icons/preferencias.png'), text: 'Preferencias', screen: '' },

    //Administrador
    { id: 50, iconImage: require('./assets/images/icons/lista-usuarios-habilitados.png'), text: 'Lista usuarios habilitados', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '0' },
    //{ id: 51, iconImage: require('./assets/images/icons/asignar-usuario.png'), text: 'Habilitar usuarios', screen: ScreenProps.ListUsersRol4.screenName },
    { id: 52, iconImage: require('./assets/images/icons/editar-usuario.png'), text: 'Panel de usuarios', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '1' },
    { id: 53, iconImage: require('./assets/images/icons/campo.png'), text: 'Lista de Fincas', screen: ScreenProps.ListEstate.screenName, datoValidacion: '1' },
    { id: 54, iconImage: require('./assets/images/icons/parcela.png'), text: 'Lista de Parcelas', screen: ScreenProps.ListPlot.screenName, datoValidacion: '1' },
    { id: 56, iconImage: require('./assets/images/icons/sensores.png'), text: 'Sensores', screen: ScreenProps.AdminSensors.screenName, datoValidacion: '1' },
    { id: 57, iconImage: require('./assets/images/icons/administracion.png'), text: 'Administración', screen: ScreenProps.AdminAdminstration.screenName },
    { id: 58, iconImage: require('./assets/images/icons/reporte.png'), text: 'Reportes', screen: ScreenProps.AdminReports.screenName, datoValidacion: '1' },
    { id: 59, iconImage: require('./assets/images/icons/historial.png'), text: 'Catalogo de actividades de preparación de terreno', screen: ScreenProps.ListCatalogoActividades.screenName, datoValidacion: '1' },
    //SuperAdmin
    { id: 101, iconImage: require('./assets/images/icons/lista-companias.png'), text: 'Panel de empresas', screen: ScreenProps.CompanyList.screenName },
    { id: 103, iconImage: require('./assets/images/icons/panel-usuarios-administradores.png'), text: 'Panel usuarios administradores', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '0' },
    { id: 104, iconImage: require('./assets/images/icons/grafico-de-barras.png'), text: 'Mediciones de Sensor', screen: ScreenProps.ListMeasureSensor.screenName, datoValidacion: '0' },
    { id: 105, iconImage: require('./assets/images/icons/medida-cultivo.png'), text: 'Mediciones de Cultivos', screen: ScreenProps.CropMeasurementsList.screenName, datoValidacion: '0' },
]

export const Admin_cultivation = [
    { id: 1, iconImage: require('./assets/images/icons/rotacion-cultivos.png'), text: 'Rotación de cultivos según estacionalidad', screen: ScreenProps.CropRotationList.screenName },
    { id: 2, iconImage: require('./assets/images/icons/productividad.png'), text: 'Productividad de cultivo', screen: ScreenProps.ListProductivity.screenName },
    { id: 3, iconImage: require('./assets/images/icons/montana.png'), text: 'Preparación del terreno y prácticas de conservación', screen: ScreenProps.ListLandPreparation.screenName },
    { id: 4, iconImage: require('./assets/images/icons/historial.png'), text: 'Historial de manejo  de residuos de la finca', screen: ScreenProps.ResidueList.screenName },
]

export const Admin_suelo = [
    { id: 1, iconImage: require('./assets/images/icons/fertilizante.png'), text: 'Manejo de Fertilizantes', screen: ScreenProps.ListFertilizer.screenName },
    { id: 2, iconImage: require('./assets/images/icons/suelo.png'), text: 'Calidad de suelo', screen: ScreenProps.ListQualityFloorScreen.screenName },
    { id: 3, iconImage: require('./assets/images/icons/analisis.png'), text: 'Tipo de aplicación', screen: ScreenProps.ListApplicationType.screenName },
]


export const Admin_hidrico = [
    { id: 1, iconImage: require('./assets/images/icons/fertilizante.png'), text: 'Seguimiento del agua', screen: ScreenProps.WatchListWaterScreen.screenName },
    { id: 2, iconImage: require('./assets/images/icons/eficiencia-riego.png'), text: 'Monitoreo de la eficiencia de riego', screen: ScreenProps.ListIrrigationEfficiency.screenName },
    { id: 3, iconImage: require('./assets/images/icons/estres-hidrico.png'), text: 'Estrés hídrico', screen: ScreenProps.ListSoilElectricalConductivity.screenName },
    // { id: 4, iconImage: require('./assets/images/icons/analisis.png'), text: 'Recopilacion de la información por análisis' },
]

export const Admin_clima = [
    { id: 1, iconImage: require('./assets/images/icons/weather.png'), text: 'Pronóstico Meteorológico', screen: ScreenProps.WatchWeather.screenName },
    { id: 2, iconImage: require('./assets/images/icons/condiciones-climaticas.png'), text: 'Condiciones meteorológicas y climáticas', screen: ScreenProps.ListWeatherClimateConditions.screenName },
    { id: 3, iconImage: require('./assets/images/icons/calentamiento-global.png'), text: 'Riesgos Naturales', screen: ScreenProps.RiskNaturalList.screenName },
]

export const Admin_Agricultura_Precision = [
    { id: 1, iconImage: require('./assets/images/icons/salud-planta.png'), text: 'Salud de la Planta', screen: ScreenProps.PlantHealthList.screenName },
    { id: 2, iconImage: require('./assets/images/icons/clorofila.png'), text: 'Contenido Clorofila', screen: ScreenProps.ChlorophyllContentList.screenName },
    { id: 3, iconImage: require('./assets/images/icons/cantidad-plantas.png'), text: 'Cantidad de Plantas', screen: ScreenProps.NumberOfPlantsList.screenName },
    { id: 4, iconImage: require('./assets/images/icons/contenidodeagua.png'), text: 'Contenido de Agua', screen: ScreenProps.WaterContentList.screenName },
    { id: 5, iconImage: require('./assets/images/icons/clorofila.png'), text: 'Cobertura Vegetal', screen: ScreenProps.VegetationcoverList.screenName },
    { id: 6, iconImage: require('./assets/images/icons/nitrogen.png'), text: 'Contenido Nitrógeno', screen: ScreenProps.NitrogenContentList.screenName },
]


export const Admin_plagas = [
    { id: 1, iconImage: require('./assets/images/icons/plagas&enfermedades.png'), text: 'Problemas asociados a plagas y enfermedades', screen: ScreenProps.ListPestsDiseases.screenName },
]

export const Admin_sensor = [
    { id: 1, iconImage: require('./assets/images/icons/sensor.png'), text: 'Sensores', screen: ScreenProps.ListSensors.screenName },
    { id: 2, iconImage: require('./assets/images/icons/punto-medicion.png'), text: 'Punto Medición', screen: ScreenProps.ListMeasurementPoint.screenName },
]

export const Admin_ordenCompra = [
    { id: 1, iconImage: require('./assets/images/icons/ordenCompra.png'), text: 'Orden de compra', screen: ScreenProps.ListPurchaseOrder.screenName },
    { id: 2, iconImage: require('./assets/images/icons/arriba-y-abajo.png'), text: 'Entradas y salidas', screen: ScreenProps.ListInflowsOutflows.screenName },
    { id: 3, iconImage: require('./assets/images/icons/mano-obra.png'), text: 'Mano de obra', screen: ScreenProps.ListManoObra.screenName},
]


export const Admin_Reports = [
    { id: 1, iconImage: require('./assets/images/icons/arriba-y-abajo.png'), text: 'Reporte Entrada Salida Total', screen: ScreenProps.ReportEntradaSalidaTotal.screenName },
    { id: 2, iconImage: require('./assets/images/icons/entrada.png'), text: 'Reporte Entrada Total', screen: ScreenProps.ReportEntradaTotal.screenName },
    { id: 3, iconImage: require('./assets/images/icons/salida.png'), text: 'Reporte Salida Total', screen: ScreenProps.ReportSalidaTotal.screenName },
    { id: 4, iconImage: require('./assets/images/icons/orden-compra.png'), text: 'Reporte Orden De Compra', screen: ScreenProps.ReportOrdenDeCompra.screenName },
    { id: 5, iconImage: require('./assets/images/icons/mano-obra.png'), text: 'Reporte Planilla', screen: ScreenProps.ReportPlanilla.screenName },
]
