import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RegistroManoObra";
import { API_URL } from "../constants";
/*Metodos GET */
export const ObtenerDatosRegistroManoObra = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerDatosRegistroManoObra`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */
export const InsertarRegistroManoObra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroManoObra`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarRegistroManoObra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroManoObra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}