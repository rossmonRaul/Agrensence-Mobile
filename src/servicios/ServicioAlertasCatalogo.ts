import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "AlertaCatalogo";
import { API_URL } from "../constants";

export const ObtenerAlertasCatalogo = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerAlertasCatalogo`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarAlertaCatalogo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarAlertaCatalogo`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarAlertaCatalogo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarAlertaCatalogo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoAlertaCatalogo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoAlertaCatalogo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerMedicionesSensorYNomenclatura = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerMedicionesSensorYNomenclatura`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerRolesPorIdentificacion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerRolesPorIdentificacion`;
    return await ProcesarDatosApi('POST', url, data);
}
