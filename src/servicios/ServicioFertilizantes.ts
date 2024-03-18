import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Fertilizante";
import { API_URL } from "../constants";
export const ObtenerFertilizantes = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerManejoFertilizantes`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarManejoFertilizantes = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarManejoFertilizantes`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ActualizarManejoFertilizantes = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarManejoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoManejoFertilizantes = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoManejoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}
