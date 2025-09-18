// src/pages/RegisterPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Button, TextField, Typography, Avatar, Stack, Divider, Paper, Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import api from "../services/axios"; // ✅ استخدم عميلنا الموحّد

export default function RegisterPage({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // RTL
  const isRTL = useMemo(() => i18n.language === "ar", [i18n.language]);
  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);
  const changeLang = (lang) => i18n.changeLanguage(lang);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // تحقق بسيط محلي
    if (!formData.password || formData.password !== formData.password2) {
      setSubmitting(false);
      setError(t("passwords_not_match") || "Passwords do not match.");
      return;
    }

    try {
      // ✅ استدعاء عام: /api/register/ (بدون Authorization تلقائيًا)
      await api.post("/register/", {
        ...formData,
        role: "owner",
      });

      // ✅ دخول مباشر بعد التسجيل باستخدام نفس عميل api
      const loginRes = await api.post("/auth/token/", {
        username: formData.username,
        password: formData.password,
      });

      const accessToken = loginRes?.data?.access;
      if (!accessToken) throw new Error("Missing access token");

      // خزّن بالـ session (متوافق مع App.js)
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("role", "user"); // أو دع App.js يحدد الدور من الـ JWT
      onLogin?.(accessToken);

      // التوجيه حسب الدور سيصير داخل App.js، ولكن نرسل للمستخدم الصفحة الافتراضية
      navigate("/menus", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          t("register_error") ||
          "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const layoutDirection = { xs: "column", md: isRTL ? "row-reverse" : "row" };

  return (
    <Box component="main" sx={{ minHeight: "100svh", display: "flex", flexDirection: layoutDirection, bgcolor: "#f3f4f6" }}>
      {/* Left = Form */}
      <Box sx={{ flex: { xs: "1 1 auto", md: "5 1 0" }, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, md: 6 }, py: { xs: 4, md: 6 } }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Avatar variant="rounded" sx={{ bgcolor: "#111", color: "#fff", fontWeight: 800, width: 36, height: 36, borderRadius: 2 }}>IB</Avatar>
            <Typography fontWeight={700}>IBLA</Typography>
          </Stack>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            {t("register") || "Register"}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button size="small" variant="outlined" onClick={() => changeLang("ar")}>AR</Button>
            <Button size="small" variant="outlined" onClick={() => changeLang("de")}>DE</Button>
            <Button size="small" variant="outlined" onClick={() => changeLang("en")}>EN</Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleRegister} noValidate>
            <TextField fullWidth margin="normal" label={t("username") || "Username"} name="username" value={formData.username} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label={t("email") || "Email"} type="email" name="email" value={formData.email} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label={t("first_name") || "First Name"} name="first_name" value={formData.first_name} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label={t("last_name") || "Last Name"} name="last_name" value={formData.last_name} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label={t("password") || "Password"} type="password" name="password" value={formData.password} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label={t("confirm_password") || "Confirm Password"} type="password" name="password2" value={formData.password2} onChange={handleChange} required />

            <Button fullWidth type="submit" variant="contained" disabled={submitting}
              sx={{ mt: 2.5, py: 1.2, textTransform: "none", fontWeight: 800, borderRadius: 2, bgcolor: "#111", "&:hover": { bgcolor: "#000" } }}>
              {submitting ? (t("loading") || "Loading…") : (t("register") || "Register")}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {(t("have_account") || "Already have an account?")}{" "}
            <Link to="/">{t("sign_in") || "Sign in"}</Link>
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {t("fast_register") || "Fast register soon…"}
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Stack>
        </Box>
      </Box>

      {/* Right = Dark card */}
      <Box sx={{ flex: { xs: "0 0 44vh", md: "7 1 0" }, minHeight: { xs: 320, md: "100svh" }, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ position: "relative", width: "100%", height: { xs: "100%", md: "90%" }, maxWidth: 720, bgcolor: "#000", color: "#fff",
          borderRadius: { xs: 6, md: 8 }, p: { xs: 3, md: 6 }, overflow: "hidden" }}>
          <Typography aria-hidden sx={{ position: "absolute", inset: 0, fontSize: { xs: 200, md: 360 }, fontWeight: 900,
            letterSpacing: -6, color: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none" }}>
            IBLA
          </Typography>

          <Stack spacing={2} sx={{ position: "relative" }}>
            <Typography variant="overline" sx={{ opacity: 0.7 }}>IBLATECH</Typography>
            <Typography variant="h4" fontWeight={800}>{t("create_account") || "Create your account"}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 520 }}>
              {t("register_intro") || "One dashboard to manage your menus, dishes, prices and languages."}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {t("join_now") || "Join restaurants already using our digital menus."}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
