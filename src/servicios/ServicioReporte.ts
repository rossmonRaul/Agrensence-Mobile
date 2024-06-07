import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Reporte";
import { API_URL } from "../constants";
/*Metodos GET */
export const ObtenerReporteEntradaSalidaTotal = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerReporteEntradaSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteIngreso= async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerReporteEntradaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteGasto = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerReporteSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteOrdenDeCompra = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerReporteOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReportePlanilla = async (data: any) => {
    const url = `${API_URL}/api/v1.0/${controlador}/ObtenerReportePlanilla`;
    return await ProcesarDatosApi('POST', url, data);
}



// /*Metodos POST */
// export const InsertarRegistroManoObra = async (data: any) => {
//     const url = `${API_URL}/api/v1.0/${controlador}/InsertarRegistroManoObra`;
//     return await ProcesarDatosApi('POST', url, data);
// }

// /*Metodos PUT */
// export const ModificarRegistroManoObra = async (data: any) => {
//     const url = `${API_URL}/api/v1.0/${controlador}/ModificarRegistroManoObra`;
//     return await ProcesarDatosApi('PUT', url, data);
// }

// export const CambiarEstadoRegistroManoObra = async (data: any) => {
//     const url = `${API_URL}/api/v1.0/${controlador}/CambiarEstadoRegistroManoObra`;
//     return await ProcesarDatosApi('PUT', url, data);
// }