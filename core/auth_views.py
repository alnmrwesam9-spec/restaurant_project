# core/auth_views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import EmailOrUsernameTokenObtainPairSerializer


class LoginView(TokenObtainPairView):
    """
    View لتسجيل الدخول عبر username أو email ويضيف Claims داخل JWT.
    المسار الاختياري: /api/auth/login/
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


# اسم View بديل/مكافئ لو كنت تستخدمه في core/urls.py على المسار /api/token/
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
