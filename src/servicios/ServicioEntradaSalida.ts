import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RegistroEntradaSalida";
import { API_URL } from "../constants";

/*Metodos GET */
export const ObtenerDatosRegistroEntradaSalida = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerDatosRegistroEntradaSalida`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */
export const InsertarRegistroEntradaSalida = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroEntradaSalida`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarRegistroEntradaSalida = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroEntradaSalida`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroEntradaSalida = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroEntradaSalida`;
    return await ProcesarDatosApi('PUT', url, data);
}
