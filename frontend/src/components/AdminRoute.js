import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function isAdminFromClaims(decoded) {
  if (!decoded || typeof decoded !== 'object') return false;

  // 1) أدوار مباشرة
  const directRole =
    decoded.role ??
    decoded.user?.role ??
    (Array.isArray(decoded.roles) ? decoded.roles[0] : undefined);

  if (typeof directRole === 'string') {
    const r = directRole.toLowerCase();
    if (['admin', 'administrator', 'superadmin', 'role_admin'].includes(r)) return true;
  }

  // 2) أعلام شائعة في Django/DRF
  if (
    decoded.is_admin === true ||
    decoded.isAdmin === true ||
    decoded.is_staff === true ||
    decoded.is_superuser === true ||
    decoded.user?.is_staff === true ||
    decoded.user?.is_superuser === true
  ) {
    return true;
  }

  // 3) مجموعات/صلاحيات: قد تكون array of strings أو objects
  const arrToStrings = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => (typeof x === 'string' ? x : x?.name || x?.codename || ''))
      .filter(Boolean)
      .map((s) => s.toLowerCase());

  const groups = arrToStrings(decoded.groups || decoded.user?.groups);
  if (groups.some((g) => g.includes('admin') || g.includes('staff') || g.includes('super'))) {
    return true;
  }

  const perms = arrToStrings(decoded.permissions || decoded.user?.permissions);
  if (perms.some((p) => p.includes('admin') || p.includes('staff') || p.includes('super'))) {
    return true;
  }

  return false;
}

export default function AdminRoute({ token, children }) {
  // نقرأ التوكن من الـprop أو localStorage
  const authToken = token || localStorage.getItem('token');
  if (!authToken) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(authToken);

    // تتبع اختياري
    if (process.env.REACT_APP_ENABLE_LOGS === 'true') {
      // انتبه: لا تطبع في الإنتاج
      // eslint-disable-next-line no-console
      console.log('[AdminRoute] decoded:', decoded);
    }

    const admin = isAdminFromClaims(decoded);

    // كـ fallback: لو أحد حفظ الدور مسبقًا في localStorage
    const storedRole = (localStorage.getItem('role') || '').toLowerCase();
    const isAdmin = admin || storedRole === 'admin';

    return isAdmin ? children : <Navigate to="/menus" replace />;
  } catch {
    return <Navigate to="/" replace />;
  }
}
