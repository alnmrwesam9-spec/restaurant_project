"""
Django settings for backend project.

Production-ready configuration:
- Reads secrets & endpoints from environment variables
- Managed PostgreSQL via DATABASE_URL (Neon/Supabase) + SSL
- Serves static files via WhiteNoise
- Proper middleware order for Security, WhiteNoise, CORS
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

# Load .env locally (ignored in production on PaaS; they'll use real env vars)
load_dotenv()

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------
# Core flags & secrets (from env)
# ------------------------------------------------------------------
DEBUG = os.getenv("DEBUG", "0") == "1"  # set DEBUG=1 locally if needed
# IMPORTANT: set SECRET_KEY in environment on Render; fallback is only for local dev
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-key-change-me")

# Hosts & cross-origin/CSRF trust come from env to match your real domains
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]

# You can pass comma-separated origins via ENV, plus we allow any *.vercel.app by regex
CORS_ALLOWED_ORIGINS = [o.strip() for o in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\.vercel\.app$"]

# CSRF_TRUSTED_ORIGINS must be full origins (scheme+host). Wildcards are allowed like https://*.vercel.app
_csrf_from_env = [o.strip() for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()]
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(_csrf_from_env + ["https://*.vercel.app"]))

# ------------------------------------------------------------------
# Applications
# ------------------------------------------------------------------
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local
    "core",
]

# ------------------------------------------------------------------
# Middleware (order matters)
# ------------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # serve static files efficiently
    "corsheaders.middleware.CorsMiddleware",        # must be before CommonMiddleware
    "django.middleware.common.CommonMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ------------------------------------------------------------------
# Database
# - If DATABASE_URL is present, use managed Postgres (Neon) with SSL
# - Otherwise fallback to local SQLite (dev only)
# ------------------------------------------------------------------
_db_url = os.getenv("DATABASE_URL")
if _db_url:
    DATABASES = {
        "default": dj_database_url.parse(
            _db_url,
            conn_max_age=600,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------------
# i18n / tz
# (يمكنك لاحقاً ضبط TIME_ZONE لـ "Europe/Berlin" لو رغبت أن تكون المواعيد محلية)
# ------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------
# Static & Media
# ------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ------------------------------------------------------------------
# Security (fit PaaS like Render behind proxy)
# ------------------------------------------------------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# ------------------------------------------------------------------
# REST / Auth
# ------------------------------------------------------------------
AUTH_USER_MODEL = "core.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# CORS behaviour (allow credentials only if you actually use cookies/sessions from JS)
CORS_ALLOW_CREDENTIALS = True

# ------------------------------------------------------------------
# Project-specific env vars
# ------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GLOBAL_LEXICON_OWNER_ID = int(os.getenv("GLOBAL_LEXICON_OWNER_ID", "1"))

# ------------------------------------------------------------------
# Django 3.2+ default pk type
# ------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
