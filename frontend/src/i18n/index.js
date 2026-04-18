import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fra.json';
import en from './locales/eng.json';
import ar from './locales/arb.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, en: { translation: en }, ar: { translation: ar } },
    fallbackLng: 'fr',
    lng: 'fr',
    interpolation: { escapeValue: false },
  });

<<<<<<< ours
export default i18n;
=======
export default i18n;
>>>>>>> theirs
