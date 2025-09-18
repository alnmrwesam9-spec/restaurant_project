// src/App.js
// -----------------------------------------------
// راوتر رئيسي بنسخة مُحسّنة:
// - قراءة التوكن من sessionStorage فقط (تماشيًا مع axios.js).
// - ضبط Authorization عند الإقلاع.
// - onUnauthorized عالمي: تنظيف + رجوع للدخول.
// - تحويل تلقائي بعد التوثيق: أدمن → /admin/users ، غير ذلك → /menus.
// - إزالة تكرار /register وإضافة Redirect لـ /admin.
// - جعل /reports خلف PrivateRoute.
// -----------------------------------------------

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api, { setOnUnauthorized } from './services/axios';
import { jwtDecode } from 'jwt-decode';

// صفحات المستخدم
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import MenusPage from './pages/MenusPage';
import SectionPage from './pages/SectionPage';
import DishPage from './pages/DishPage';
import ReportsDashboard from './pages/ReportsDashboard';

// صفحات الأدمن
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserMenusPage from './pages/AdminUserMenusPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import AdminEditUserPage from './pages/AdminEditUserPage';
import AdminMenuEditorPage from './pages/AdminMenuEditorPage';

// الحماية والملاحة المشتركة
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import UserNavbar from './components/UserNavbar';
import AdminNavbar from './components/AdminNavbar';

// إعدادات القوائم
import MenuPublicSettings from './pages/MenuPublicSettings';

// الصفحات العامة
import PublicMenuPage from './pages/PublicMenuPage';

// ========= Helpers
function parseClaims(token) {
  try {
    const d = jwtDecode(token);
    const role = String(d?.role || d?.user?.role || '').toLowerCase();
    const isStaff = !!(d?.is_staff || d?.user?.is_staff);
    const isSuper = !!(d?.is_superuser || d?.user?.is_superuser);
    return { role, isStaff, isSuper };
  } catch {
    return { role: '', isStaff: false, isSuper: false };
  }
}

function targetAfterAuthFrom(token) {
  if (!token) return null;
  const { role, isStaff, isSuper } = parseClaims(token);
  const isAdmin = isSuper || isStaff || role === 'admin';
  return isAdmin ? '/admin/users' : '/menus';
}

export default function App() {
  const [token, setToken] = useState(null);

  // عند تحميل التطبيق: اقرأ التوكن من sessionStorage فقط واضبط Authorization
  useEffect(() => {
    // تنظيف قديم (نترك session فقط ليتماشى مع axios.js)
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    const tokenFromSession = sessionStorage.getItem('token');

    const isValid = tokenFromSession
      ? (() => {
          try {
            const { exp } = jwtDecode(tokenFromSession);
            return !exp || exp * 1000 > Date.now();
          } catch {
            return false;
          }
        })()
      : false;

    if (isValid) {
      setToken(tokenFromSession);
      api.defaults.headers.common.Authorization = `Bearer ${tokenFromSession}`;
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      delete api.defaults.headers.common.Authorization;
      setToken(null);
    }

    // 401 عالميًا → تنظيف Session والعودة للدخول
    setOnUnauthorized(() => {
      try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        delete api.defaults.headers.common.Authorization;
        setToken(null);
      } finally {
        window.location.replace('/');
      }
    });
  }, []);

  // يُستدعى بعد نجاح الدخول/التسجيل من صفحات Login/Register
  const handleLogin = (accessToken) => {
    setToken(accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // ملاحظة: التخزين تتم داخل صفحة اللوجين نفسها على sessionStorage
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      delete api.defaults.headers.common.Authorization;
    } finally {
      setToken(null);
    }
  };

  const targetAfterAuth = targetAfterAuthFrom(token);

  return (
    <Router>
      <Routes>
        {/* 📌 الصفحة الرئيسية = شاشة الدخول أو تحويل حسب الدور */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to={targetAfterAuth} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* تسجيل حساب جديد */}
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to={targetAfterAuth} replace />
            ) : (
              <Register onLogin={handleLogin} />
            )
          }
        />

        {/* 👤 مسارات لوحة المستخدم (محميّة) */}
        <Route
          path="/menus"
          element={
            <PrivateRoute token={token}>
              <>
                <UserNavbar onLogout={handleLogout} />
                <MenusPage token={token} />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/menus/:menuId"
          element={
            <PrivateRoute token={token}>
              <>
                <UserNavbar onLogout={handleLogout} />
                <SectionPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/sections/:sectionId/dishes"
          element={
            <PrivateRoute token={token}>
              <>
                <UserNavbar onLogout={handleLogout} />
                <DishPage />
              </>
            </PrivateRoute>
          }
        />

        {/* ⚙️ إعدادات نشر/عرض قائمة معيّنة */}
        <Route
          path="/menus/:menuId/public-settings"
          element={
            <PrivateRoute token={token}>
              <>
                <UserNavbar onLogout={handleLogout} />
                <MenuPublicSettings />
              </>
            </PrivateRoute>
          }
        />

        {/* 🔒 تقارير وراء الحماية */}
        <Route
          path="/reports"
          element={
            <PrivateRoute token={token}>
              <>
                <UserNavbar onLogout={handleLogout} />
                <ReportsDashboard />
              </>
            </PrivateRoute>
          }
        />

        {/* 🛡️ مسارات لوحة الأدمن */}
        {/* Redirect أساسي لأي دخول على /admin بدون تحديد */}
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

        <Route
          path="/admin/users"
          element={
            <AdminRoute token={token}>
              <>
                <AdminNavbar onLogout={handleLogout} />
                <AdminUsersPage />
              </>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/menus"
          element={
            <AdminRoute token={token}>
              <>
                <AdminNavbar onLogout={handleLogout} />
                <AdminUserMenusPage />
              </>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/details"
          element={
            <AdminRoute token={token}>
              <>
                <AdminNavbar onLogout={handleLogout} />
                <AdminUserDetailsPage />
              </>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <AdminRoute token={token}>
              <>
                <AdminNavbar onLogout={handleLogout} />
                <AdminEditUserPage />
              </>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/menus/:menuId/edit"
          element={
            <AdminRoute token={token}>
              <>
                <AdminNavbar onLogout={handleLogout} />
                <AdminMenuEditorPage />
              </>
            </AdminRoute>
          }
        />

        {/* 🌐 صفحات العرض العامة */}
        <Route path="/show/menu/:publicSlug" element={<PublicMenuPage />} />

        {/* ❓ أي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
