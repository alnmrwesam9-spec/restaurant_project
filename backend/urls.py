# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView  # للمرجع/الاختبار
from django.conf import settings
from django.conf.urls.static import static

# الـ Login المخصص (username أو email)
from core.auth_views import LoginView


def health(_request):
    """نقطة فحص بسيطة على الروت."""
    return JsonResponse({"status": "ok", "app": "backend"})


urlpatterns = [
    # Health
    path("", health),

    # Django admin
    path("admin/", admin.site.urls),

    # روابط التطبيق الأساسية
    path("api/", include("core.urls")),

    # JWT الرسمية (احتفظنا بها للشفافية/الاختبار)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # مسار تسجيل الدخول المعتمد من الواجهة الأمامية
    path("api/auth/login/", LoginView.as_view(), name="custom_login"),

    # (اختياري) aliases شائعة إن احتجتها لاحقًا
    # path("api/login/", LoginView.as_view()),
    # path("api/auth/jwt/create/", LoginView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
