import React, { useContext, useState } from 'react';
import { ValidarUsuario } from '../servicios/ServicioUsuario';
import { UserContext } from '../context/UserProvider';

// Se define el hook que gestionará la lógica de inicio de sesión
const useLogin = () => {
    const { userData, setUserData } = useContext(UserContext);
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

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
            usuario: username,
            contrasena: password,
        };

        const userFound = await ValidarUsuario(formData)

        if (userFound.mensaje === "Usuario no encontrado.") {
            alert('Usuario no encontrado.');
            return;
        }
        if (userFound.mensaje === 'Credenciales incorrectas.') {
            alert('Credenciales incorrectas.');
            return;
        }
        //  Si el usuario inicia sesión agrega los datos al context
        if (userFound.mensaje === "Usuario encontrado.") {
            alert('Inicio sesión correctamente.');
            setUserData({
                usuario: userFound.usuario,
                correo: userFound.correo,
                idEmpresa: userFound.idEmpresa,
                idFinca: userFound.idFinca,
                idParcela: userFound.idParcela,
            });
            setIsLoggedIn(true)
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