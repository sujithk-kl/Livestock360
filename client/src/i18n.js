import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import enTranslation from './locales/en/translation.json';
import taTranslation from './locales/ta/translation.json';

// We can load translations via http backend (useful for keeping bundle size small)
// OR import them directly if we want them bundled (easier for starter).
// Given constraints, direct import is safer and faster for now.

const resources = {
    en: {
        translation: enTranslation
    },
    ta: {
        translation: taTranslation
    }
};

i18n
    // .use(Backend) // disabling backend for direct import simplicity to avoid public folder issues
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: true, // helpful for debugging
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
