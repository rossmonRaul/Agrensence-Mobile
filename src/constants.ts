
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
};

// Esta es la IP que uno debe cambiar en local por la IP de cada uno
export const IP_API = '192.168.1.35';

export const API_URL = `http://${IP_API}:5271`

// Se definen las constantes de las imagenes y texto que va en los cuadros de la pantalla Empresa
export const Company_Props = [
    //Usuarios
    { id: 1, iconImage: require('./assets/images/icons/suelos.png'), text: 'Suelos', screen: ScreenProps.MenuFloor.screenName},
    { id: 2, iconImage: require('./assets/images/icons/cultivos.png'), text: 'Cultivos', screen: ScreenProps.AdminCrops.screenName },
    { id: 3, iconImage: require('./assets/images/icons/hidrico.png'), text: 'Hídrico', screen: '' },
    { id: 4, iconImage: require('./assets/images/icons/clima.png'), text: 'Clima', screen: '' },
    { id: 5, iconImage: require('./assets/images/icons/plagas.png'), text: 'Plagas', screen: '' },
    { id: 6, iconImage: require('./assets/images/icons/administracion.png'), text: 'Administración', screen: '' },
    { id: 7, iconImage: require('./assets/images/icons/comunidad.png'), text: 'Comunidad', screen: '' },
    { id: 8, iconImage: require('./assets/images/icons/recomendacion.png'), text: 'Recomendación', screen: '' },
    { id: 9, iconImage: require('./assets/images/icons/calidad.png'), text: ' Control de Calidad', screen: '' },
    { id: 10, iconImage: require('./assets/images/icons/preferencias.png'), text: 'Preferencias', screen: '' },

    //Administrador
    { id: 50, iconImage: require('./assets/images/icons/lista-usuarios-habilitados.png'), text: 'Lista usuarios habilitados', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '0' },
    //{ id: 51, iconImage: require('./assets/images/icons/asignar-usuario.png'), text: 'Habilitar usuarios', screen: ScreenProps.ListUsersRol4.screenName },
    { id: 52, iconImage: require('./assets/images/icons/editar-usuario.png'), text: 'Panel de usuarios', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '1' },
    { id: 53, iconImage: require('./assets/images/icons/campo.png'), text: 'Lista de Fincas', screen: ScreenProps.ListEstate.screenName, datoValidacion: '1' },
    { id: 54, iconImage: require('./assets/images/icons/parcela.png'), text: 'Lista de Parcelas', screen: ScreenProps.ListPlot.screenName, datoValidacion: '1' },

    //SuperAdmin
    { id: 101, iconImage: require('./assets/images/icons/lista-companias.png'), text: 'Panel de empresas', screen: ScreenProps.CompanyList.screenName },
    { id: 103, iconImage: require('./assets/images/icons/panel-usuarios-administradores.png'), text: 'Panel usuarios administradores', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '0' },
    { id: 200, iconImage: '', text: '', screen: '' }
]

export const Admin_cultivation = [
    { id: 1, iconImage: require('./assets/images/icons/rotacion-cultivos.png'), text: 'Rotación de cultivos según estacionalidad' },
    { id: 2, iconImage: require('./assets/images/icons/productividad.png'), text: 'Productividad de cultivo' },
    { id: 3, iconImage: require('./assets/images/icons/montana.png'), text: 'Preparación del terreno y prácticas de conservación' },
    { id: 4, iconImage: require('./assets/images/icons/historial.png'), text: 'Historial de manejo  de residuos de la finca' },
]

export const Admin_suelo = [
    { id: 1, iconImage: require('./assets/images/icons/rotacion-cultivos.png'), text: 'Rotación de cultivos según estacionalidad' },
    { id: 2, iconImage: require('./assets/images/icons/productividad.png'), text: 'Productividad de cultivo' },
    { id: 3, iconImage: require('./assets/images/icons/montana.png'), text: 'Preparación del terreno y prácticas de conservación' },
    { id: 4, iconImage: require('./assets/images/icons/historial.png'), text: 'Historial de manejo  de residuos de la finca' },
]