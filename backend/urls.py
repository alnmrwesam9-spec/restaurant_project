from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

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

    # روابط JWT الرسمية
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ألياسات شائعة (لو واجهتك تتوقع أسماء أخرى)
    path("api/login/", TokenObtainPairView.as_view()),               # /api/login/
    path("api/auth/login/", TokenObtainPairView.as_view()),          # /api/auth/login/
    path("api/auth/jwt/create/", TokenObtainPairView.as_view()),     # /api/auth/jwt/create/
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
