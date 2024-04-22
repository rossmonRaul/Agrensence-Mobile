import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";
import { API_URL } from "../constants";

export const ObtenerUsoAgua = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerUsoAgua`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerEficienciaRiego = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerEficienciaRiego`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerConductividadElectricaEstresHidrico = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerConductividadElectricaEstresHidrico`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CrearRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CrearRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CrearRegistroEficienciaRiego = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CrearRegistroEficienciaRiego`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const EditarRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ActualizarRegistroEficienciaRiego = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ActualizarRegistroEficienciaRiego`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroEficienciaRiego = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroEficienciaRiego`;
    return await ProcesarDatosApi('PUT', url, data);
}