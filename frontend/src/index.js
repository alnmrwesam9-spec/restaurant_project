import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import i18n from './i18n'; // هذا يجب أن يكون قبل أي مكون يستخدم الترجمة
import reportWebVitals from './reportWebVitals';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { makeAppTheme } from './theme';
import './styles/fonts.css';
import { applyFontForLocale } from './utils/localeFonts';

// اضبط الاتجاه والخط وفق اللغة الحالية
const isArabic = i18n.language === 'ar';
document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
applyFontForLocale(i18n.language);

// اختياري: راقب تغيير اللغة لتحديث الخط (و/أو الاتجاه)
// ملاحظة: تغيير الاتجاه ديناميكيًا قد يتطلب إعادة تحميل للتطبيق كي تنعكس على كل مكونات MUI.
// إن احتجت ذلك، يمكنك إلغاء التعليق على window.location.reload().
i18n.on('languageChanged', (lng) => {
  applyFontForLocale(lng);
  const rtl = lng === 'ar';
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  // window.location.reload(); // اختياري عند الحاجة لتطبيق الاتجاه على كامل الثيم
});

// أنشئ الثيم مرة على أساس اللغة الحالية
const theme = makeAppTheme('light', isArabic ? 'rtl' : 'ltr');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
