import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";
import { IP_API } from "../constants";

export const ObtenerUsuarios = async () => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarUsuario = async (data: any) => {
    const url = `http://${IP_API}:5271/api/v1.0/${controlador}/InsertarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}
