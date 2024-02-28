import { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDataInterface } from '../interfaces/userDataInterface';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../constants';

export const useAuth = () => {
    const { userData, setUserData } = useContext(UserContext);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    // Verifica si el usuario está logueado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');

                if (storedUserData) {
                    //  Comprueba si los datos almacenados son vacíos
                    const parsedUserData: UserDataInterface = JSON.parse(storedUserData);

                    if (Object.values(parsedUserData).some(value => value !== '' && value !== null && value !== false && value !== 0)) {
                        //  Si hay al menos un valor no vacío, considerarlo como datos de usuario válidos
                        setUserData(parsedUserData);
                    } else {
                        //  Si todos los valores son vacíos, redirigir a la pantalla de inicio de sesión
                        navigation.navigate(ScreenProps.Login.screenName);
                    }
                } else {
                    //  Si no hay datos de usuario almacenados, redirigir a la pantalla de inicio de sesión
                    navigation.navigate(ScreenProps.Login.screenName);
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
            }
        };

        checkAuth();
    }, [navigation, setUserData]);

    return { userData, setUserData };
};
