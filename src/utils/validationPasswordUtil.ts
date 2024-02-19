export const validatePassword = (password) => {
    if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return false;
    }

    if (!/[A-Z]/.test(password)) {
        alert('La contraseña debe contener al menos una mayúscula');
        return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        alert('La contraseña debe contener al menos un carácter especial');
        return false;
    }

    return true;
};