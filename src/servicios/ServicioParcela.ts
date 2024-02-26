import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Parcela";
import { API_URL } from "../constants";
export const ObtenerParcelas = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerParcelas`;
    return await ProcesarDatosApi('GET', url, '');
}
