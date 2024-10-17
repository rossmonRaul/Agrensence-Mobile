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
import { useTranslation } from 'react-i18next';
import DropdownComponent from '../../components/Dropdown/Dropwdown';

export const IncioSesionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { username, setUsername, password, setPassword, isLoggedIn, handleLogin, isAlertVisible,alertProps, hideAlert } = useLogin();
  const { t, i18n  } = useTranslation();

  // Opciones de idiomas
  const languageOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },  // Añadir alemán
  ];
  //const [selectedLanguage, setSelectedLanguage] = React.useState<string>(i18n.language);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('en');
    // Cambia el idioma cuando se selecciona
    const handleLanguageChange = (item: unknown) => {
      // Convertir el valor del item a string (por ejemplo, de { label: 'English', value: 'en' } a 'en')
      const language = (item as { value: string }).value;
      setSelectedLanguage(language);
      i18n.changeLanguage(language); // Cambia el idioma
    };

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
              <Text style={styles.loginText} >{t('login.title')}</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome name="user" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 5 }}>{t('login.user')}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('login.placeholder_user')}
                value={username}
                onChangeText={(text) => setUsername(text)}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome name="lock" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 5 }}>{t('login.password')}</Text>
              </View>
              <TextInput style={styles.input}
                secureTextEntry={true}
                placeholder={t('login.placeholder_password')}
                value={password}
                onChangeText={(text) => setPassword(text)}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome name="language" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 5 }}>{t('login.language')}</Text>
              </View>
                <DropdownComponent
                placeholder={t('login.language')}
                data={languageOptions}
                value={selectedLanguage}
                iconName="globe"
                onChange={handleLanguageChange}  
                
              />
              
              <View style={styles.buttonContainer} >
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                >
                  <View style={styles.buttonContent}>
                  <MaterialIcons name="login" size={20} color="white" style={styles.iconStyle} />
                  <Text style={styles.buttonText}>{t('login.submit_button')}</Text>
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


