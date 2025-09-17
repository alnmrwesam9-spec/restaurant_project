from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView
from core.auth_views import LoginView  # ← يستخدم Serializer يدعم email أو username

def health(_request):
    # نقطة بسيطة ترجع 200 لتأكيد عمل السيرفر
    return JsonResponse({"status": "ok", "app": "backend"})

urlpatterns = [
    # صحّة على الروت
    path("", health),

    # لوحة الإدارة
    path("admin/", admin.site.urls),

    # روابط التطبيق الأساسي
    path("api/", include("core.urls")),

    # مسارات المصادقة (توليد وتحديث التوكِن)
    path("api/auth/token/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ألياسات شائعة (كلها تشير لنفس LoginView)
    path("api/login/", LoginView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/jwt/create/", LoginView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
