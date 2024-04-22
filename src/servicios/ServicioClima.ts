import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Clima";
import { API_URL } from "../constants";

/*Metodos GET */
export const ObtenerRegistroCondicionesMeteorologica = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerRegistroCondicionesMeteorologica`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarRegistroCondicionesMeteorologicas = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroCondicionesMeteorologicas`;
    return await ProcesarDatosApi('POST', url, data);
}


/*Metodos PUT */
export const ModificarRegistroSeguimientoCondicionesMeteorologicas = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroSeguimientoCondicionesMeteorologicas`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroCondicionesMeteorologicas = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroCondicionesMeteorologicas`;
    return await ProcesarDatosApi('PUT', url, data);
}
