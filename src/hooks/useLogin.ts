import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { ValidarUsuario } from '../servicios/ServicioUsuario';
import { UserContext } from '../context/UserProvider';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../constants';

// Se define el hook que gestionará la lógica de inicio de sesión
const useLogin = () => {
    const navigation = useNavigation();
    const { userData, setUserData } = useContext(UserContext);
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    let estado = false;
    // Se define la función para manejar el proceso de inicio de sesión
    const handleLogin = async () => {
        //Se utilizan algunas validaciones 
        if (!username || !password) {
            alert('Por favor, rellene todos los campos.');
            return;
        }
        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const formData = {
            identificacion: username,
            contrasena: password,
        };

        const userFound = await ValidarUsuario(formData)
        if (userFound.indicador === 500) {
            alert(userFound.mensaje);
        } else {

            if (userFound.usuario.mensaje === "Usuario no encontrado.") {
                alert('Este usuario no se ha encontrado.');
                return;
            }
            if (userFound.usuario.mensaje === 'Credenciales incorrectas.') {
                alert('Credenciales incorrectas.');
                return;
            }
            if (userFound.usuario.mensaje === 'Usuario o empresa inactivos.') {
                alert('¡Hola! Parece que aún no hemos activado tu cuenta.');
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
                Alert.alert('¡Inicio sesión correctamente!', '', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(ScreenProps.Menu.screenName as never);
                        },
                    },
                ]);
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
        userData
    }
}

export default useLogin;