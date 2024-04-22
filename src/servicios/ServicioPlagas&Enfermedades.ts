import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PlagasYEnfermedades";
import { API_URL } from "../constants";
/*Metodos GET */
export const ObtenerRegistroSeguimientoPlagasYEnfermedades = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */
export const InsertarRegistroSeguimientoPlagasYEnfermedades = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarRegistroSeguimientoPlagasYEnfermedades = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroSeguimientoPlagasYEnfermedades = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('PUT', url, data);
}


