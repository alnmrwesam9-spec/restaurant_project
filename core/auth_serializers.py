# core/auth_serializers.py
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    يسمح بتسجيل الدخول عبر email أو username.
    لو وصل email سنحوّله تلقائيًا إلى username المطلوب داخليًا من SimpleJWT.
    """
    def validate(self, attrs):
        # يدعم كلا الحقلين:
        login_value = attrs.get("username") or attrs.get("email")
        if login_value and "username" not in attrs:
            attrs["username"] = login_value

        # لو أرسل email صريحًا نحاول إيجاد اسم المستخدم الموافق له
        if "email" in attrs:
            try:
                user = User.objects.get(email__iexact=attrs["email"])
                attrs["username"] = user.username
            except User.DoesNotExist:
                pass

        # الآن SimpleJWT سيعمل على attrs["username"] و attrs["password"]
        return super().validate(attrs)
