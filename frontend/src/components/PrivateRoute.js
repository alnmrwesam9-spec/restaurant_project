// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token) {
  try {
    const { exp } = jwtDecode(token);
    // لو ما في exp نعتبره صالح (بعض السيرفرات ممكن ما ترسله)
    return !exp || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function PrivateRoute({ token, children }) {
  const loc = useLocation();
  const t = token || sessionStorage.getItem('token');

  if (!t || !isTokenValid(t)) {
    // تنظيف بسيط في حال الانتهاء/الغياب
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    } catch {}
    return <Navigate to="/" replace state={{ from: loc }} />;
  }

  return children;
}
