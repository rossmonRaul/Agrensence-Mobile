import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Finca";
import { API_URL } from "../constants";
export const ObtenerFincas = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerFincas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CrearFinca = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CrearFinca`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarFinca = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarFinca`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoFinca = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoFinca`;
    return await ProcesarDatosApi('PUT', url, data);
}
