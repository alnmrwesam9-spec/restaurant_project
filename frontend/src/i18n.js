import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // تحميل الترجمة من ملفات JSON
  .use(LanguageDetector) // اكتشاف اللغة تلقائيًا من المتصفح
  .use(initReactI18next) // ربط مع React
  .init({
    fallbackLng: 'ar', // اللغة الافتراضية
    supportedLngs: ['ar', 'en', 'de'], // اللغات المدعومة
    debug: true, // يمكنك تعطيله لاحقًا
    interpolation: {
      escapeValue: false, // لـ React لا حاجة للهروب من القيم
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
 // مسار ملفات الترجمة
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
