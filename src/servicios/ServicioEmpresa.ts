import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Empresa";
import { IP_API } from "../constants";

export const ObtenerEmpresas = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerEmpresas`;
    return await ProcesarDatosApi('GET', url, '');
}
