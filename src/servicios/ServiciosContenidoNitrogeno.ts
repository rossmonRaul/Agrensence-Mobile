import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "ContenidoDeNitrogeno";
import { API_URL } from "../constants";

export const ObtenerRegistroContenidoNitrogeno = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerContenidoDeNitrogeno`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarRegistroContenidoNitrogeno = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarContenidoDeNitrogeno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroContenidoNitrogeno = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarContenidoDeNitrogeno`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoRegistroContenidoNitrogeno = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoContenidoDeNitrogeno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}
