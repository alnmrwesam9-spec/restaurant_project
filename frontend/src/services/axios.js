// src/services/axios.js
// -----------------------------------------------------------------------------
// عميل Axios موحّد للتعامل مع الـ API.
// - يضمن أن الطلبات العامة (/public/* أو /api/public/*) لا تُرسل معها Authorization.
// - يضيف Authorization لباقي الطلبات إن وُجد التوكن.
// - يرفع مهلة الطلبات (خاصة استدعاء توليد أكواد الحساسية).
// -----------------------------------------------------------------------------

import axios from 'axios';

// أصل خادم الـAPI (من متغير البيئة أو الافتراضي) مع إزالة أي سلاشات زائدة
export const API_ORIGIN =
  (process.env.REACT_APP_API_ORIGIN || 'http://localhost:8000').replace(/\/+$/, '');

// الأساس القياسي للـ API (ينتهي بـ /api)
export const API_BASE = `${API_ORIGIN}/api`;

// إنشاء نسخة Axios خاصة بنا مع baseURL والـ timeout
const instance = axios.create({
  baseURL: API_BASE,     // كل المسارات النسبية تُركّب على هذا الأساس
  timeout: 45000,        // 🔵 مهلة افتراضية 90 ثانية بدل 15
  headers: {
    'Content-Type': 'application/json',
  },
});

// قراءة التوكن من التخزين (نفضّل sessionStorage)
function getToken() {
  return (
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('access_token') ||
    ''
  );
}

// تحديد إن كان الطلب عامًا (لا يحتاج توكن)
function isPublicRequest(config) {
  const raw = config?.url || '';
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      const p = u.pathname || '';
      return p.startsWith('/api/public/') || p.startsWith('/public/');
    }
    const full = new URL(raw, config.baseURL || API_BASE);
    const p = full.pathname || '';
    return p.startsWith('/api/public/') || p.startsWith('/public/');
  } catch {
    return typeof raw === 'string' && (raw.startsWith('/public/') || raw.startsWith('/api/public/'));
  }
}

// إزالة أي رؤوس Authorization من كونفيغ الطلب
function stripAuth(config) {
  if (!config) return config;
  config.headers = config.headers || {};
  delete config.headers.Authorization;
  delete config.headers.authorization;
  if (config.headers.common) {
    delete config.headers.common.Authorization;
    delete config.headers.common.authorization;
  }
  return config;
}

// Interceptor للطلبات: أضف التوكن لغير العام، واحذف الهيدر للعام
instance.interceptors.request.use((config) => {
  const token = getToken();
  const pub = isPublicRequest(config);
  config.__isPublic = pub;

  if (pub) {
    stripAuth(config);
  } else if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔵 مهلة أطول تلقائيًا لاستدعاء توليد أكواد الحساسية (Rules + LLM)
  try {
    const full = new URL(config.url || '', config.baseURL || API_BASE);
    const path = full.pathname || '';
    if (path.endsWith('/dishes/batch-generate-allergen-codes/') || path.includes('/dishes/batch-generate-allergen-codes')) {
      const LONG_TIMEOUT = 120000; // 120 ثانية
      config.timeout = Math.max(config.timeout || 0, LONG_TIMEOUT);
    }
  } catch {
    // تجاهل أي خطأ في تحليل الرابط
  }

  return config;
});

// hook اختياري عند 401 لطلبات غير عامة
let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : null;
}

// Interceptor للردود: استدعِ onUnauthorized عند 401 لغير العام
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const cfg = err?.config || {};

    // لوج مفيد عند انقضاء المهلة
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message || '')) {
      // eslint-disable-next-line no-console
      console.warn('Axios timeout:', {
        url: cfg?.url,
        timeout: cfg?.timeout,
        baseURL: cfg?.baseURL,
        message: err?.message,
      });
    }

    if (status === 401 && onUnauthorized && !cfg.__isPublic) {
      try { onUnauthorized(); } catch { /* تجاهل */ }
    }
    return Promise.reject(err);
  }
);

// تحويل أي مسار نسبي إلى رابط مطلق على أصل الـAPI (لصور مثلاً)
export const toAbsolute = (url) =>
  url ? (url.startsWith('http') ? url : `${API_ORIGIN}${url}`) : '';

// نقاط نهاية إصدار/تحديث التوكن (توافق)
export const TOKEN_ENDPOINTS = {
  obtain: [`${API_BASE}/auth/token/`, `${API_ORIGIN}/api/token/`],
  refresh: [`${API_BASE}/auth/token/refresh/`, `${API_ORIGIN}/api/token/refresh/`],
};

// التصدير الافتراضي
export default instance;
