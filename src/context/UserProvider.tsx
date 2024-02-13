import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';

// Se define la interfaz para los datos del usuario
interface UserData {
    identificacion: string;
    correo: string;
    idEmpresa: number;
    idFinca: number;
    idParcela: number;
}

// Se define la interfaz para el contexto
interface UserContextProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

// Se crea el contexto con las interfaces definidas
export const UserContext = createContext<UserContextProps>({
    userData: {
        identificacion: "",
        correo: "",
        idEmpresa: 0,
        idFinca: 0,
        idParcela: 0
    },
    setUserData: () => { }
});

// Se define el tipo de props para el componente
interface UserContextProviderProps {
    children: ReactNode;
}

// Se crea un componente proveedor
export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
    const [userData, setUserData] = useState<UserData>({
        identificacion: "",
        correo: "",
        idEmpresa: 0,
        idFinca: 0,
        idParcela: 0
    });

    // Cargar datos almacenados al iniciar la aplicación
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('userData');
                if (storedData) {
                    setUserData(JSON.parse(storedData));
                }
            } catch (error) {
                console.error('Error al cargar datos almacenados:', error);
            }
        };

        loadUserData();
    }, []);

    // Guardar datos cuando se actualiza el contexto
    useEffect(() => {
        const saveUserData = async () => {
            try {
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
            } catch (error) {
                console.error('Error al guardar datos:', error);
            }
        };

        saveUserData();
    }, [userData]);

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};