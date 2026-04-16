import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Namespaces FR ──────────────────────────────────────────────
import frCommon   from './locales/fr/common.json';
import frNavbar   from './locales/fr/navbar.json';
import frFooter   from './locales/fr/footer.json';
import frContact  from './locales/fr/contact.json';
import frCircuits from './locales/fr/circuits.json';
import frBooking  from './locales/fr/booking.json';
import frOmra     from './locales/fr/omra.json';
import frDestinations from './locales/fr/destinations.json';
//import frVoyages  from './locales/fr/voyages.json';

// ── Namespaces EN ──────────────────────────────────────────────
import enCommon   from './locales/en/common.json';
import enNavbar   from './locales/en/navbar.json';
import enFooter   from './locales/en/footer.json';
import enContact  from './locales/en/contact.json';
import enCircuits from './locales/en/circuits.json';
import enBooking  from './locales/en/booking.json';
import enOmra     from './locales/en/omra.json';
import enVoyages  from './locales/en/voyages.json';

// ── Namespaces AR ──────────────────────────────────────────────
import arCommon   from './locales/ar/common.json';
import arNavbar   from './locales/ar/navbar.json';
import arFooter   from './locales/ar/footer.json';
//import arContact  from './locales/ar/contact.json';
import arCircuits from './locales/ar/circuits.json';
//import arBooking  from './locales/ar/booking.json';
import arOmra     from './locales/ar/omra.json';
import arVoyages  from './locales/ar/voyages.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon, navbar: frNavbar, footer: frFooter, contact: frContact, circuits: frCircuits, booking: frBooking, omra: frOmra,  destinations: frDestinations },
      en: { common: enCommon, navbar: enNavbar, footer: enFooter, contact: enContact, circuits: enCircuits, booking: enBooking, omra: enOmra, voyages: enVoyages },
      ar: { common: arCommon, navbar: arNavbar, footer: arFooter, circuits: arCircuits, omra: arOmra, voyages: arVoyages },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'navbar', 'footer', 'contact', 'circuits', 'booking', 'omra', 'voyages'],
    supportedLngs: ['fr', 'en', 'ar'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;