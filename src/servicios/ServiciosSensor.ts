import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Sensor";
import { API_URL } from "../constants";
export const ObtenerMedicionesSensor = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerMedicionesSensor`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerEstadoSensores = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerEstadoSensores`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerSensores = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerSensores`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarMedicionesSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarMedicionesSensor`;
    return await ProcesarDatosApi('POST', url, data);
}
export const InsertarSensores = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarSensores`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarMedicionesSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarMedicionesSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoMedicionSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoMedicionSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}
export const ModificarSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoSensor = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}
