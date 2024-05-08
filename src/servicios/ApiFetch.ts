import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDataInterface } from '../interfaces/userDataInterface';
export const ProcesarDatosApi = async (method: string, url: string, data: any) => {
    const storedUserData = await AsyncStorage.getItem('userData');

    let token
    if (storedUserData) {
        const parsedUserData: UserDataInterface = JSON.parse(storedUserData);
        token = parsedUserData.token;
    }

    let headers: Record<string, string> = {
        "Content-type": "application/json;charset=UTF-8",
        'Accept': 'application/json',
    };
    // Agregar token al encabezado de autorización si está presente
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const myInit: RequestInit = {
        method: method,
        headers: headers,
        mode: 'cors',
        cache: 'default',
    };

    if (method !== 'GET' && method !== undefined) {
        myInit.body = JSON.stringify(data)
    }

    const myRequest = new Request(url, myInit);
    try {
        const response = await fetch(myRequest);

        if (response.ok) {
            return await response.json();
        } else {
            return { indicador: 500, mensaje: 'Ocurrió un error en el proceso!' }
        }
    } catch (error) {
        console.error(error);
    }
}
