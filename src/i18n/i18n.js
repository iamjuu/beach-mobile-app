import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import ml from './locales/ml.json';
import hi from './locales/hi.json';

const STORAGE_KEY = 'beach_app_language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ml: { translation: ml },
    hi: { translation: hi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Load stored language on startup
AsyncStorage.getItem(STORAGE_KEY).then((savedLang) => {
  if (savedLang) {
    i18n.changeLanguage(savedLang);
  }
}).catch(() => {});

export async function changeLanguage(lang) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Failed to save language to storage', e);
  }
  return i18n.changeLanguage(lang);
}

export default i18n;
