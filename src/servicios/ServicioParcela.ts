import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Parcela";
import { API_URL } from "../constants";
export const ObtenerParcelas = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerParcelas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CrearParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CrearParcela`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoParcela= async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}
