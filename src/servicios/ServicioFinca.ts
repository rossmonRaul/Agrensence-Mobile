import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Finca";
import { API_URL } from "../constants";
export const ObtenerFincas = async () => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerFincas`;
    return await ProcesarDatosApi('GET', url, '');
}
