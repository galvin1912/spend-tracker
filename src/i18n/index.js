import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en';
import viTranslation from './locales/vi';
import antdVi from 'antd/locale/vi_VN';
import antdEn from 'antd/locale/en_US';

// Antd locales for DatePicker and other components
export const antdLocales = {
  en: antdEn,
  vi: antdVi
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      vi: {
        translation: viTranslation
      }
    },
    fallbackLng: 'vi', // Default is Vietnamese
    debug: false,
    interpolation: {
      escapeValue: false, // React already handles escaping
    }
  });

export default i18n;