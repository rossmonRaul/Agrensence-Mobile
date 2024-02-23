import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Empresa";
import { IP_API } from "../constants";
/*Metodos GET */
export const ObtenerEmpresas = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerEmpresas`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos POST */
export const InsertarEmpresa = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/CrearEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const ModificarEmpresa = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ActualizarEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoEmpresa = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/CambiarEstadoEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}