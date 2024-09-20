import { useContext, useEffect, useState, } from 'react';
import { Alert } from 'react-native';
import { UserContext } from '../context/UserProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDataInterface } from '../interfaces/userDataInterface';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../constants';
import jwt from 'expo-jwt';

interface ButtonAlert{
    text: string;
    onPress: () => void;
  }
  interface AlertProps {
    message: string;
    buttons: ButtonAlert[];
    iconType: 'success' | 'error' | 'warning' | 'info';
  }

export const useAuth = () => {
    const { userData, setUserData } = useContext(UserContext);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isAlertVisibleAuth, setAlertVisibleAuth] = useState<boolean>(false);
    const [alertPropsAuth, setAlertPropsAuth] = useState<AlertProps>({
      message: '',
      buttons: [],
      iconType: 'success',
    });
    const initialUserData: UserDataInterface = {
      identificacion: "",
      nombre: "",
      correo: "",
      idEmpresa: 0,
      idFinca: 0,
      idParcela: 0,
      idRol: 0,
      estado: false,
      token: ""
      };

    const showSuccessAlert = (message: string) => {
        setAlertPropsAuth({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
              },
            },
          ],
        });
        setAlertVisibleAuth(true);
      };
    
      const showErrorAlert = (message: string) => {
        setAlertPropsAuth({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                // Lógica para manejar el cierre de la alerta
              },
            },
          ],
        });
        setAlertVisibleAuth(true);
      };
    
      const showInfoAlert = (message: string) => {
        setAlertPropsAuth({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                // Lógica para manejar el cierre de la alerta
              },
            },
          ],
        });
        setAlertVisibleAuth(true);
      };
    
      const hideAlertAuth = () => {
        setAlertVisibleAuth(false);
      };


    // Verifica si el usuario está logueado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');

                if (storedUserData) {
                    //  Comprueba si los datos almacenados son vacíos
                    const parsedUserData: UserDataInterface = JSON.parse(storedUserData);
                    const storedToken = parsedUserData.token;
                    const decodedToken = jwt.decode(storedToken, null);
                    if (decodedToken && typeof decodedToken === 'object' && decodedToken.exp) {
                        // Obtener la fecha de expiración del token
                        const expirationTime = decodedToken.exp;

                        // Convertir la fecha de expiración a un objeto Date
                        const expirationDate = new Date(expirationTime * 1000);

                        // Obtener la fecha y hora actual
                        const currentDate = new Date();

                        // Verificar si el token ha expirado
                        if (currentDate.getTime() > expirationDate.getTime()) {
                            // El token ha expirado
                            // Muestra un mensaje de alerta informativo al usuario
                            showInfoAlert('Atención, tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');

                            // Elimina los datos del usuario
                            setUserData(initialUserData);
                            await AsyncStorage.clear();

                            // Redirige a la pantalla de inicio de sesión
                            navigation.navigate(ScreenProps.Login.screenName);
                        }
                    }
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
            } catch (error: any) {
                if (error.message === "Token has expired") {
                    // Muestra un mensaje de alerta al usuario
                    showInfoAlert('Atención, tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');

                    // Elimina los datos del usuario
                    await AsyncStorage.clear();

                    // Redirige a la pantalla de inicio de sesión
                    navigation.navigate(ScreenProps.Login.screenName);
                } else {
                    console.error('Error al verificar autenticación:', error);
                }
            }
        };

        checkAuth();
    }, [navigation, setUserData]);


    return {
      userData,
      setUserData,
      isAlertVisibleAuth,
      alertPropsAuth,
      hideAlertAuth,
      // showSuccessAlert,
      // showErrorAlert,
      // showInfoAlert,
    };

    //return { userData, setUserData };
    
};

export default useAuth;