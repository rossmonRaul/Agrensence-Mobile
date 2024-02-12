import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Parcela";
import { IP_API } from "../constants";
export const ObtenerParcelas = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerParcelas`;
    return await ProcesarDatosApi('GET', url, '');
}
