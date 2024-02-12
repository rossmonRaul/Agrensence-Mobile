import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Finca";
import { IP_API } from "../constants";
export const ObtenerFincas = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerFincas`;
    return await ProcesarDatosApi('GET', url, '');
}
