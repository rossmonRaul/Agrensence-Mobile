export interface EmpresaInterface {
    nombre: string;
    idEmpresa: number;
}

export interface FincaInterface {
    idFinca: number;
    nombre: string;
    idEmpresa: number;
}
export interface ParcelaInterface {
    nombre: string;
    idParcela: number;
    idFinca: number;
}