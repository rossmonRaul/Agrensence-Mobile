import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "MedicionesSuelo";
import { API_URL } from "../constants";
export const ObtenerMedicionesSuelo = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerDatosMedicionesSuelo`;
    
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarMedicionesSuelo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarMedicionesSuelo`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarMedicionesSuelo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarMedicionesSuelo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoMedicionesSuelo = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoMedicionesSuelo`;
    return await ProcesarDatosApi('PUT', url, data);
}
