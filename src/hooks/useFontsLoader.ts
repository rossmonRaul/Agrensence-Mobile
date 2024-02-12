import { useFonts } from 'expo-font';

// Se crea una función para cargar las fuentes necesarias dentro de la App
export const useFontsLoader = () => {
    const [fontsLoaded, fontLoadingError] = useFonts({
        'CatamaranBold': require('../assets/fonts/Catamaran/Catamaran-Bold.ttf'),
        'CatamaranLight': require('../assets/fonts/Catamaran/Catamaran-Light.ttf'),
        'CatamaranMedium': require('../assets/fonts/Catamaran/Catamaran-Medium.ttf'),
        'CatamaranRegular': require('../assets/fonts/Catamaran/Catamaran-Regular.ttf'),
        'CatamaranSemiBold': require('../assets/fonts/Catamaran/Catamaran-SemiBold.ttf'),
    });

    return { fontsLoaded, fontLoadingError };
};