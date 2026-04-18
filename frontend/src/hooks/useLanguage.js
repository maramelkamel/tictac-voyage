// frontend/src/hooks/useLanguage.js
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

export const useLanguage = () => {
  const { t } = useTranslation();

  const switchLanguage = (lang) => {
    const langMap = { FR: 'fr', EN: 'en' };
    const code = langMap[lang] || lang;
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    localStorage.setItem('lang', code);
  };

  return { t, switchLanguage, currentLang: i18n.language };
};
