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
import frVoyages  from './locales/fr/voyages.json';
import frHotels   from './locales/fr/hotels.json';
import frAuth     from './locales/fr/auth.json';

// ── Namespaces EN ──────────────────────────────────────────────
import enCommon   from './locales/en/common.json';
import enNavbar   from './locales/en/navbar.json';
import enFooter   from './locales/en/footer.json';
import enContact  from './locales/en/contact.json';
import enCircuits from './locales/en/circuits.json';
import enBooking  from './locales/en/booking.json';
import enOmra     from './locales/en/omra.json';
import enVoyages  from './locales/en/voyages.json';
import enDestinations from './locales/en/destinations.json';
import enHotels   from './locales/en/hotels.json';
import enAuth     from './locales/en/auth.json';

import arCommon   from './locales/ar/common.json';
import arNavbar   from './locales/ar/navbar.json';
import arFooter   from './locales/ar/footer.json';
import arContact  from './locales/ar/contact.json';
import arCircuits from './locales/ar/circuits.json';
import arBooking  from './locales/ar/booking.json';
import arOmra     from './locales/ar/omra.json';
import arVoyages  from './locales/ar/voyages.json';
import arDestinations from './locales/ar/destinations.json';
import arHotels   from './locales/ar/hotels.json';
import arAuth     from './locales/ar/auth.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon, navbar: frNavbar, footer: frFooter, contact: frContact, circuits: frCircuits, booking: frBooking, omra: frOmra, voyages: frVoyages, destinations: frDestinations, hotels: frHotels, auth: frAuth },
      en: { common: enCommon, navbar: enNavbar, footer: enFooter, contact: enContact, circuits: enCircuits, booking: enBooking, omra: enOmra, voyages: enVoyages, destinations: enDestinations, hotels: enHotels, auth: enAuth },
      ar: { common: arCommon, navbar: arNavbar, footer: arFooter, contact: arContact, circuits: arCircuits, booking: arBooking, omra: arOmra, voyages: arVoyages, destinations: arDestinations, hotels: arHotels, auth: arAuth },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'navbar', 'footer', 'contact', 'circuits', 'booking', 'omra', 'voyages', 'destinations', 'hotels', 'auth'],
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
