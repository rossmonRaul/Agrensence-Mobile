
// Se definen las constantes de los nombres de las pantallas y los componentes de cada uno
export const ScreenProps = {
    Login: { screenName: 'Login' },
    Register: { screenName: 'Register' },
    Menu: { screenName: 'Menu' },
    AdminRegisterUser: { screenName: 'AdminRegisterUser' },
    AssignCompany: { screenName: 'AssignCompany' },
    CompanyList: { screenName: 'CompanyList' },
    AdminModifyCompany: { screenName: 'AdminModifyCompany' },
    AdminRegisterCompany: { screenName: 'AdminRegisterCompany' },
    ListUsersRol4: { screenName: 'ListUsersRol4' },
    AdminModifyUser: { screenName: 'AdminModifyUser' },
    AdminModifyAdminUser: { screenName: 'AdminModifyAdminUser' },
    AdminUserList: { screenName: 'AdminUserList' },
};

// Esta es la IP que uno debe cambiar en local por la IP de cada uno
export const IP_API = '192.168.0.2';

// Se definen las constantes de las imagenes y texto que va en los cuadros de la pantalla Empresa
export const Company_Props = [
    { id: 1, iconImage: require('./assets/images/icons/suelos.png'), text: 'Suelos', screen: '' },
    { id: 2, iconImage: require('./assets/images/icons/cultivos.png'), text: 'Cultivos', screen: '' },
    { id: 3, iconImage: require('./assets/images/icons/hidrico.png'), text: 'Hídrico', screen: '' },
    { id: 4, iconImage: require('./assets/images/icons/clima.png'), text: 'Clima', screen: '' },
    { id: 5, iconImage: require('./assets/images/icons/plagas.png'), text: 'Plagas', screen: '' },
    { id: 6, iconImage: require('./assets/images/icons/administracion.png'), text: 'Administración', screen: '' },
    { id: 7, iconImage: require('./assets/images/icons/comunidad.png'), text: 'Comunidad', screen: '' },
    { id: 8, iconImage: require('./assets/images/icons/recomendacion.png'), text: 'Recomendación', screen: '' },
    { id: 9, iconImage: require('./assets/images/icons/calidad.png'), text: ' Control de Calidad', screen: '' },
    { id: 10, iconImage: require('./assets/images/icons/preferencias.png'), text: 'Preferencias', screen: '' },
    { id: 11, iconImage: require('./assets/images/icons/editar-usuario.png'), text: 'Asignar finca y parcela', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '0' },
    { id: 12, iconImage: require('./assets/images/icons/asignar-usuario.png'), text: 'Asignar usuarios', screen: ScreenProps.ListUsersRol4.screenName },
    { id: 13, iconImage: require('./assets/images/icons/editar-usuario.png'), text: 'Panel de usuarios', screen: ScreenProps.AdminUserList.screenName, datoValidacion: '1' },
    { id: 14, iconImage: require('./assets/images/icons/crear-usuario.png'), text: 'Crear usuario administrador', screen: ScreenProps.AdminRegisterUser.screenName },
    { id: 15, iconImage: require('./assets/images/icons/lista-companias.png'), text: 'Lista de compañias', screen: ScreenProps.CompanyList.screenName },
    { id: 16, iconImage: '', text: '', screen: '' }
]
export const Admin_cultivation = [
    { id: 1, iconImage: require('./assets/images/icons/rotacion-cultivos.png'), text: 'Rotación de cultivos según estacionalidad' },
    { id: 2, iconImage: require('./assets/images/icons/productividad.png'), text: 'Productividad de cultivo' },
    { id: 3, iconImage: require('./assets/images/icons/montana.png'), text: 'Preparación del terreno y prácticas de conservación' },
    { id: 4, iconImage: require('./assets/images/icons/historial.png'), text: 'Historial de manejo  de residuos de la finca' },
]