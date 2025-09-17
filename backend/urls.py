# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# استيراد اختياري: لا يُسقِط السيرفر إذا لم يوجد LoginView
try:
    from core.auth_views import LoginView as CustomLoginView
    HAS_CUSTOM_LOGIN = True
except Exception:
    HAS_CUSTOM_LOGIN = False


def health(_request):
    return JsonResponse({"status": "ok", "app": "backend"})


urlpatterns = [
    # Health
    path("", health),
    path("api/health/", health),

    # Admin
    path("admin/", admin.site.urls),

    # روابط التطبيق
    path("api/", include("core.urls")),
    #------------------
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair_alias"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh_alias"),

    # مسارات JWT القياسية (تعمل فوريًا)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# نضيف مسار تسجيل الدخول المخصص فقط إن كان موجودًا فعلًا
if HAS_CUSTOM_LOGIN:
    urlpatterns.append(
        path("api/auth/login/", CustomLoginView.as_view(), name="custom_login")
    )

# ميديا محليًا لو DEBUG=1
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
