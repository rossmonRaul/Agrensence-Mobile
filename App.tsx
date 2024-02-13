import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';

import { IncioScreen } from './src/screens/inicio/inicio';
import { RegistrarScreen } from './src/screens/registrar/registrar';
import { EmpresaScreen } from './src/screens/empresa/empresa';

import { Screen_Names } from './src/constants';
import { useFontsLoader } from './src/hooks/useFontsLoader';
import { styles } from './src/screens/inicio/inicio.styles';

import { UserContextProvider } from './src/context/UserProvider';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  let { fontsLoaded, fontLoadingError } = useFontsLoader();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (fontLoadingError) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Error al cargar las fuentes</Text>
      </View>
    );
  }

  if (!fontsLoaded && !timeoutReached) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.loadingText}>Cargando las fuentes de letra</Text>
        <ActivityIndicator size="large" color="#548256" />
      </View>
    );
  }

  return (
    <UserContextProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={Screen_Names.Login} screenOptions={{ headerShown: false }}>
          <Stack.Screen name={Screen_Names.Login} component={IncioScreen} />
          <Stack.Screen name={Screen_Names.Register} component={RegistrarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;