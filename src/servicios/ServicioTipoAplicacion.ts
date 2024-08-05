import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoAplicacion";
import { API_URL } from "../constants";
export const ObtenerTipoAplicacion = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerTipoAplicacion`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarTipoAplicacion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarTipoAplicacion`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ActualizarTipoAplicacion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarTipoAplicacion`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoTipoAplicacion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoTipoAplicacion`;
    return await ProcesarDatosApi('PUT', url, data);
}
