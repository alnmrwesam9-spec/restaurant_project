# core/auth_serializers.py
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    يسمح بتسجيل الدخول إمّا بـ username أو email.
    إن أُرسِل email نحوله لاسم المستخدم الحقيقي ثم نكمل تدقيق JWT الطبيعي.
    المدخل المقبول:
      - {"username": "wesam", "password": "..."}  أو
      - {"username": "user@example.com", "password": "..."}  أو
      - {"email": "user@example.com", "password": "..."}  (اختياري)
    """

    def validate(self, attrs):
        User = get_user_model()

        # استخرج قيمة الدخول من username أو email
        login_value = attrs.get("username") or attrs.get("email")

        if login_value:
            # إن كانت القيمة تبدو كـ email جرّب جلب المستخدم وتحويلها لusername الحقيقي
            candidate = None
            if "@" in login_value:
                try:
                    candidate = User.objects.get(email__iexact=login_value)
                except User.DoesNotExist:
                    candidate = None

            # أو إن تم تمريرها في مفتاح email حتى لو بلا @
            if candidate is None and attrs.get("email"):
                try:
                    candidate = User.objects.get(email__iexact=attrs["email"])
                except User.DoesNotExist:
                    candidate = None

            if candidate is not None:
                # عدّل attrs ليستخدم username الفعلي لهذا المستخدم
                attrs["username"] = candidate.get_username()

        # أكمل تحقّق JWT الافتراضي (سيفشل تلقائيًا لو كانت البيانات خاطئة)
        return super().validate(attrs)
