import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "OrdenDeCompra";
import { API_URL } from "../constants";
/*Metodos GET */
export const ObtenerDatosOrdenDeCompra = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerDatosOrdenDeCompra`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */
export const InsertarOrdenDeCompra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarOrdenDeCompra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoOrdenDeCompra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}