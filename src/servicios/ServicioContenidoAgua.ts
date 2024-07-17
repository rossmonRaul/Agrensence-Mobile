import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "ContenidoDeAgua";
import { API_URL } from "../constants";

export const ObtenerRegistroContenidoDeAgua = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerContenidoDeAgua`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarRegistroContenidoDeAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarContenidoDeAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroContenidoDeAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarContenidoDeAgua`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoRegistroContenidoDeAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoContenidoDeAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}


