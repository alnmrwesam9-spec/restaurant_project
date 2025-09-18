# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import re_path
from django.views.static import serve as media_serv

# ✅ استخدم الـView المخصص الذي يضيف claims داخل JWT
from core.auth_views import MyTokenObtainPairView

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

    # روابط التطبيق (باقي الـ APIs)
    path("api/", include("core.urls")),

    # ✅ مسارات JWT (تستخدم السيريلـايزر المخصص عبر MyTokenObtainPairView)
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # (اختياري) aliases قديمة/بديلة إن احتجتها
    path("api/auth/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair_alias"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh_alias"),
]

# مسار تسجيل الدخول المخصص (إن وُجد)
if HAS_CUSTOM_LOGIN:
    urlpatterns.append(
        path("api/auth/login/", CustomLoginView.as_view(), name="custom_login")
    )

# ميديا محليًا لو DEBUG=1
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # إنتاج: قدّم /media/ عبر Django (سهل لكنه أقل كفاءة)
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$',
                media_serve,
                {'document_root': settings.MEDIA_ROOT}),
    ]