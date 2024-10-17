import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './src/locales/en/translation.json';
import es from './src/locales/es/translation.json';
import de from './src/locales/de/translation.json';

i18n
  .use(initReactI18next) // Integrar con react-i18next
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      de: { translation: de },
    },
    lng:'en', // Usar el idioma del dispositivo
    fallbackLng: 'en', // Idioma por defecto si no hay traducción disponible
    interpolation: {
      escapeValue: false, // No es necesario escapar en React Native
    },
  });

export default i18n;