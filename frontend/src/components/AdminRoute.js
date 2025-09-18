// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function readClaims(token) {
  try {
    const d = jwtDecode(token);
    const role = String(d?.role || d?.user?.role || '').toLowerCase();
    const is_staff = !!(d?.is_staff || d?.user?.is_staff);
    const is_superuser = !!(d?.is_superuser || d?.user?.is_superuser);
    const exp = d?.exp;
    const expired = !!(exp && exp * 1000 <= Date.now());
    return { role, is_staff, is_superuser, expired };
  } catch {
    return { role: '', is_staff: false, is_superuser: false, expired: true };
  }
}

export default function AdminRoute({ token, children }) {
  const loc = useLocation();
  const t = token || sessionStorage.getItem('token');

  if (!t) return <Navigate to="/" replace state={{ from: loc }} />;

  const c = readClaims(t);
  if (c.expired) {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    } catch {}
    return <Navigate to="/" replace state={{ from: loc }} />;
  }

  const isAdmin = c.is_superuser || c.is_staff || c.role === 'admin';
  return isAdmin ? children : <Navigate to="/menus" replace />;
}
