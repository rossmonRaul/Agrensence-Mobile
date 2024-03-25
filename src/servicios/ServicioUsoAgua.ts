import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";
import { API_URL } from "../constants";

export const ObtenerUsoAgua = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsoAgua`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CrearRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CrearRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const EditarRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}