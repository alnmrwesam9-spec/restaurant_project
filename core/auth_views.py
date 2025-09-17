# core/auth_views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import EmailOrUsernameTokenObtainPairSerializer


class LoginView(TokenObtainPairView):
    """
    View لتسجيل الدخول عبر username أو email.
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
