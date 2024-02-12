import { useState } from 'react';


// Se define la interfaz que describe la estructura de un usuario
interface User {
    username: string;
    password: string;
}

// Se define el hook que gestionará la lógica de inicio de sesión
const useLogin = (initialUsers: User[]) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Se define la función para manejar el proceso de inicio de sesión
    const handleLogin = () => {
        //Se utilizan algunas validaciones 
        if (!username || !password) {
            alert('Por favor, rellene todos los campos.');
            return;
        }
        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        const userFound = initialUsers.find(
            (usuario) => usuario.username === username && usuario.password === password
        );

        if (!userFound) {
            alert('Usuario o contraseña incorrectos.');
            return;
        }
        if (userFound) {
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
        handleLogin
    }
}

export default useLogin;