// frontend/src/hooks/useLanguage.js
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

const applyGoogleTranslate = (lang) => {
  const code = String(lang || 'fr').slice(0, 2).toLowerCase();
  const cookieValue = `/fr/${code}`;

  document.cookie = `googtrans=${cookieValue}; path=/`;

  const changeCombo = (attempt = 0) => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (attempt < 20) {
      setTimeout(() => changeCombo(attempt + 1), 250);
    }
  };

  changeCombo();
};

export const useLanguage = () => {
  const { t } = useTranslation();

  const switchLanguage = (lang) => {
    const code = String(lang || 'fr').slice(0, 2).toLowerCase();
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    localStorage.setItem('lang', code);
    localStorage.setItem('i18nextLng', code);
    applyGoogleTranslate(code);
  };

  return { t, switchLanguage, currentLang: i18n.language };
};
