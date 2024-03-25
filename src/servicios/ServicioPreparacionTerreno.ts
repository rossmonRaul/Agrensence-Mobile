import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PreparacionTerreno";
import { API_URL } from "../constants";
export const ObtenerDatosPreparacionTerreno = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerDatosPreparacionTerreno`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarPreparacionTerrenos = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/InsertarPreparacionTerreno`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarPreparacionTerreno = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ModificarPreparacionTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoPreparacionTerreno = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoPreparacionTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}
