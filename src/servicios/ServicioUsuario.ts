import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";
import { IP_API } from "../constants";

export const ObtenerUsuarios = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('GET', url, '');
}
export const AdminInsertarUsuario = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/GuardarUsuarioPorSuperUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosRolNoAsignado = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerUsuariosPorRol4`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarUsuario = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/InsertarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuario = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ActualizarUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}


export const ValidarUsuario = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}