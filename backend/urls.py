# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

# نجرب استيراد LoginView بشكل اختياري حتى لا يسقط السيرفر إن لم تكن موجودة/معطوبة
try:
    from core.auth_views import LoginView as CustomLoginView
    HAS_CUSTOM_LOGIN = True
except Exception:
    HAS_CUSTOM_LOGIN = False


def health(_request):
    """نقطة فحص صحّة بسيطة."""
    return JsonResponse({"status": "ok", "app": "backend"})


urlpatterns = [
    # Health checks
    path("", health),
    path("api/health/", health),

    # Django admin
    path("admin/", admin.site.urls),

    # روابط التطبيق الأساسية
    path("api/", include("core.urls")),

    # مسارات JWT الرسمية (متوافقة مع الواجهة الأمامية الحالية)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# نضيف مسار تسجيل الدخول المخصص فقط إذا كان متوفرًا بشكل صحيح
if HAS_CUSTOM_LOGIN:
    urlpatterns.append(
        path("api/auth/login/", CustomLoginView.as_view(), name="custom_login")
    )

# تقديم الميديا محليًا أثناء التطوير
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
