// frontend/src/hooks/useLanguage.js
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index.js';

export const useLanguage = () => {
  const { t } = useTranslation();

  const switchLanguage = (lang) => {
    const langMap = { 'FR': 'fr', 'EN': 'en', 'AR': 'ar' };
    const code = langMap[lang] || lang;
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    localStorage.setItem('lang', code);

    // Déclenche Google Translate pour le contenu dynamique
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    }
  };

  return { t, switchLanguage, currentLang: i18n.language };
};