import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { UserDataInterface } from '../interfaces/userDataInterface';

// Se define la interfaz para el contexto
interface UserContextProps {
    userData: UserDataInterface;
    setUserData: React.Dispatch<React.SetStateAction<UserDataInterface>>;
}

// Se crea el contexto con las interfaces definidas
export const UserContext = createContext<UserContextProps>({
    userData: {
        identificacion: "",
        nombre: "",
        correo: "",
        idEmpresa: 0,
        idFinca: 0,
        idParcela: 0,
        idRol: 0,
        estado: false
    },
    setUserData: () => { }
});

// Se define el tipo de props para el componente
interface UserContextProviderProps {
    children: ReactNode;
}

// Se crea un componente proveedor
export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
    const [userData, setUserData] = useState<UserDataInterface>({
        identificacion: "",
        nombre: "",
        correo: "",
        idEmpresa: 0,
        idFinca: 0,
        idParcela: 0,
        idRol: 0,
        estado: false
    });


    // Guardar datos cuando se actualiza el contexto
    useEffect(() => {
        const saveUserData = async () => {
            try {
                //await AsyncStorage.clear();

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