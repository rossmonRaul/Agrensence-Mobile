// Se definen las constantes de los nombres de las pantallas por si luego se cambian de nombre las pantallas
export const Screen_Names = {
    Login: 'Login',
    Register: 'Register',
    Menu: 'Menu',
    AdminRegistrar: 'AdminRegistrar',
    AssignEmpresa: 'AssignEmpresa',
};

// Esta es la IP que uno debe cambiar en local por la IP de cada uno
export const IP_API = '192.168.0.15';

// Se definen las constantes de las imagenes y texto que va en los cuadros de la pantalla Empresa
export const Company_Props = [
    { id: 1, iconImage: require('./assets/images/icons/suelos.png'), text: 'Suelos', screen: Screen_Names.Menu },
    { id: 2, iconImage: require('./assets/images/icons/cultivos.png'), text: 'Cultivos', screen: '' },
    { id: 3, iconImage: require('./assets/images/icons/hidrico.png'), text: 'Hídrico', screen: '' },
    { id: 4, iconImage: require('./assets/images/icons/clima.png'), text: 'Clima', screen: '' },
    { id: 5, iconImage: require('./assets/images/icons/plagas.png'), text: 'Plagas', screen: '' },
    { id: 6, iconImage: require('./assets/images/icons/administracion.png'), text: 'Administración', screen: '' },
    { id: 7, iconImage: require('./assets/images/icons/comunidad.png'), text: 'Comunidad', screen: '' },
    { id: 8, iconImage: require('./assets/images/icons/recomendacion.png'), text: 'Recomendación', screen: '' },
    { id: 9, iconImage: require('./assets/images/icons/calidad.png'), text: ' Control de Calidad', screen: '' },
    { id: 10, iconImage: require('./assets/images/icons/preferencias.png'), text: 'Preferencias', screen: '' },
    { id: 11, iconImage: require('./assets/images/icons/editar-usuario.png'), text: 'Modificación de usuarios asignados', screen: '' },
    { id: 12, iconImage: require('./assets/images/icons/asignar-usuario.png'), text: 'Asignar usuarios', screen: '' },
    { id: 13, iconImage: require('./assets/images/icons/crear-usuario.png'), text: 'Crear usuario administrador', screen: Screen_Names.AdminRegistrar },
    { id: 14, iconImage: '', text: '', screen: '' }
]
export const Admin_cultivation = [
    { id: 1, iconImage: require('./assets/images/icons/rotacion-cultivos.png'), text: 'Rotación de cultivos según estacionalidad' },
    { id: 2, iconImage: require('./assets/images/icons/productividad.png'), text: 'Productividad de cultivo' },
    { id: 3, iconImage: require('./assets/images/icons/montana.png'), text: 'Preparación del terreno y prácticas de conservación' },
    { id: 4, iconImage: require('./assets/images/icons/historial.png'), text: 'Historial de manejo  de residuos de la finca' },
]