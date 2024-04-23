import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PuntoMedicion";
import { API_URL } from "../constants";
export const ObtenerRegistroPuntoMedicion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerRegistroPuntoMedicion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarRegistroPuntoMedicion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroPuntoMedicion`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarRegistroPuntoMedicion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroPuntoMedicion`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroPuntoMedicion = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroPuntoMedicion`;
    return await ProcesarDatosApi('PUT', url, data);
}
