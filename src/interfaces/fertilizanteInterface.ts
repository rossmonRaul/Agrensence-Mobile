export interface FertilizerDataInterface {
    idManejoFertilizante: number;
    idFinca: number;
    idParcela: number;
    fecha: string;
    fertilizante: string;
    aplicacion: string;
    dosis: string;
    cultivotratado: string;
    accionesAdicionales: string;
    condicionesAmbientales: string;
    observaciones: string;
    estado: boolean;
}