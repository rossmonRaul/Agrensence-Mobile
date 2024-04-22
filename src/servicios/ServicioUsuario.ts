import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";
import { API_URL } from "../constants";
/*Metodos GET */
export const ObtenerUsuarios = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerUsuariosPorRol2 = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuariosPorRol2`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerUsuariosPorRol4 = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuariosPorRol4`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */

export const GuardarUsuarioPorSuperUsuario = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/GuardarUsuarioPorSuperUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}
export const GuardarUsuario = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/GuardarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ValidarUsuario = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ObtenerUsuariosPorRol3 = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuariosPorRol3`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ObtenerUsuariosPorIdEmpresa = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuariosPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos 
/*Metodos PUT */
export const ActualizarDatosUsuario = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarDatosUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}
export const ActualizarUsuarioAdministrador = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarUsuarioAdministrador`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const AsignarFincaParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/AsignarFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}
export const AsignarEmpresaFincaYParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/AsignarEmpresaFincaYParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const AsignarNuevaFincaParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/AsignarNuevaFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}
export const CambiarEstadoUsuarioFincaParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoUsuarioFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoUsuario = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}



export const ObtenerUsuariosAsignadosPorIdentificacion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsuariosAsignadosPorIdentificacion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerFincasUbicacionPorIdEmpresa = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerFincasUbicacionPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

