import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './inicio.styles';
import { useNavigation } from '@react-navigation/native';
import useLogin from '../../hooks/useLogin';

const Usuario = [
  { username: 'usuario21', password: 'password22' },
  { username: 'usuario2', password: 'password22' },
];

export const IncioScreen: React.FC = () => {
  const navigation = useNavigation();

  const { username, setUsername, password, setPassword, isLoggedIn, handleLogin } = useLogin(Usuario);


  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/siembros_imagen.jpg')}
        style={styles.upperContainer}
      >
      </ImageBackground>

      <View style={styles.lowerContainer}>
        <View>
          <Text style={styles.loginText} >Inicio de sesión</Text>
          <Text style={styles.underLoginText}>Inicia sesión con tu cuenta</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formText} >Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Text style={styles.formText} >Contraseña</Text>
          <TextInput style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <View style={styles.buttonContainer} >
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createAccountContainer} >
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={styles.createAccountText} >Crear una cuenta</Text>
            </TouchableOpacity>

            {isLoggedIn && <Text>Iniciado la sesion</Text>}
          </View>
        </View>

      </View>
    </View>
  );
};


