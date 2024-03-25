import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Residuo";
import { API_URL } from "../constants";

/*Metodos GET */
export const ObtenerManejoResiduos = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerManejoResiduos`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarManejoResiduos = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarManejoResiduos`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarManejoResiduos= async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarManejoResiduos`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoManejoResiduos = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoManejoResiduos`;
    return await ProcesarDatosApi('PUT', url, data);
}