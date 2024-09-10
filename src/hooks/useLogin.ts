import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { ValidarUsuario } from '../servicios/ServicioUsuario';
import { UserContext } from '../context/UserProvider';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../constants';



interface Button {
    text: string;
    onPress: () => void;
  }


// Se define el hook que gestionará la lógica de inicio de sesión
const useLogin = () => {
    const navigation = useNavigation();
    const { userData, setUserData } = useContext(UserContext);
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    let estado = false;


    const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.Menu.screenName as never);
              },
            },
          ],
        });
        setAlertVisible(true);
        
      };
    
      const showErrorAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                
              },
            },
          ],
        });
        setAlertVisible(true);
      };

      const showInfoAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
             
              },
            },
          ],
        });
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };

    // Se define la función para manejar el proceso de inicio de sesión
    const handleLogin = async () => {
        //Se utilizan algunas validaciones 
        if (!username || !password) {
            showInfoAlert('Por favor, rellene todos los campos.');
            return;
        }
        if (password.length < 8) {
            showInfoAlert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const formData = {
            identificacion: username,
            contrasena: password,
        };

        const userFound = await ValidarUsuario(formData)
        if (userFound.indicador === 500) {
            showErrorAlert(userFound.mensaje);
        } else {

            if (userFound.usuario.mensaje === "Usuario no encontrado.") {
                showInfoAlert('Este usuario no se ha encontrado.');
                return;
            }
            if (userFound.usuario.mensaje === 'Credenciales incorrectas.') {
                showInfoAlert('Credenciales incorrectas.');
                return;
            }
            if (userFound.usuario.mensaje === 'Usuario o empresa inactivos.') {
                showInfoAlert('¡Hola! Parece que aún no hemos activado tu cuenta.');
                return;
            }
            if (userFound.usuario.estado === 1) estado = true


            //  Si el usuario inicia sesión agrega los datos al context
            if (userFound.usuario.mensaje === "Usuario encontrado.") {
                setUserData({
                    identificacion: userFound.usuario.identificacion,
                    nombre: userFound.usuario.nombre,
                    correo: userFound.usuario.correo,
                    idEmpresa: userFound.usuario.idEmpresa,
                    idFinca: userFound.usuario.idFinca,
                    idParcela: userFound.usuario.idParcela,
                    idRol: userFound.usuario.idRol,
                    estado: estado,
                    token: userFound.token
                });
                setIsLoggedIn(true)
                showSuccessAlert('¡Inicio sesión correctamente!')
            }

        }
    }



    // Devuelve un objeto con los estados y funciones necesarios para el inicio de sesión
    return {
        username,
        setUsername,
        password,
        setPassword,
        isLoggedIn,
        handleLogin,
        userData,
        isAlertVisible,
        alertProps,
        hideAlert
    }
}

export default useLogin;