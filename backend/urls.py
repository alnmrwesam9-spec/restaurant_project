# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# نحاول استيراد LoginView بشكل اختياري فقط
try:
    from core.auth_views import LoginView as CustomLoginView
    HAS_CUSTOM_LOGIN = True
except Exception:
    HAS_CUSTOM_LOGIN = False


def health(_request):
    return JsonResponse({"status": "ok", "app": "backend"})


urlpatterns = [
    path("", health),
    path("api/health/", health),

    path("admin/", admin.site.urls),

    # روابط تطبيقك
    path("api/", include("core.urls")),

    # مسارات SimpleJWT القياسية
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# نضيف مسار تسجيل الدخول المخصص فقط إذا كان متوفرًا فعلاً
if HAS_CUSTOM_LOGIN:
    urlpatterns.append(
        path("api/auth/login/", CustomLoginView.as_view(), name="custom_login")
    )

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
