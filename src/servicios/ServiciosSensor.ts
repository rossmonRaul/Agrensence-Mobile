import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Sensor";
import { API_URL } from "../constants";
export const ObtenerMedicionesSensor = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerMedicionesSensor`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarMedicionesSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarMedicionesSensor`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarMedicionesSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarMedicionesSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoMedicionSensor= async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoMedicionSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}
