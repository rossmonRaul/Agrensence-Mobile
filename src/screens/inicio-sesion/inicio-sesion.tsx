import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './inicio-sesion.styles';
import { useNavigation } from '@react-navigation/native';
import useLogin from '../../hooks/useLogin';
import { ScreenProps } from '../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'
import CustomAlert from '../../components/CustomAlert/CustomAlert';

export const IncioSesionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { username, setUsername, password, setPassword, isLoggedIn, handleLogin, isAlertVisible,alertProps, hideAlert } = useLogin();



  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}

      >
        <ImageBackground
          source={require('../../assets/images/siembros_imagen.jpg')}
          style={styles.upperContainer}
        >
        </ImageBackground>

        <View style={styles.lowerContainer}>
          <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
            <View>
              <Text style={styles.loginText} >Inicio de sesión</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome name="user" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 5 }}>Usuario</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Identificación o correo"
                value={username}
                onChangeText={(text) => setUsername(text)}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome name="lock" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 5 }}>Contraseña</Text>
              </View>
              <TextInput style={styles.input}
                secureTextEntry={true}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
              <View style={styles.buttonContainer} >
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                >
                  <View style={styles.buttonContent}>
                  <MaterialIcons name="login" size={20} color="white" style={styles.iconStyle} />
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                  </View>             
                </TouchableOpacity>
              </View>


            </View>
          </ScrollView>

          <CustomAlert
        isVisible={isAlertVisible}
        onClose={hideAlert}
        message={alertProps.message}
        iconType={alertProps.iconType}
        buttons={alertProps.buttons}
        navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate('Menu' as never) : undefined}
      />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


