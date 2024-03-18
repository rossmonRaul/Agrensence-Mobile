export interface UserDataInterface {
    identificacion: string;
    nombre: string;
    correo: string;
    idEmpresa: number;
    idFinca: number;
    idParcela: number;
    idRol: number;
    estado: boolean;
}

export interface RelacionFincaParcela {
    identificacion: string;
    idFinca: number;
    idParcela: number;
    idUsuarioFincaParcela: number;
    estado: number;
    nombreFinca?: string;
    nombreParcela: string;
}