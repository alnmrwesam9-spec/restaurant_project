# core/management/commands/ensure_admin.py
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

class Command(BaseCommand):
    help = "Create a superuser from env vars if missing (idempotent)."

    def handle(self, *args, **options):
        User = get_user_model()
        username_field = getattr(User, "USERNAME_FIELD", "username")

        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        # تهيئة قيم افتراضية حسب نوع الـ USERNAME_FIELD
        if username_field == "email":
            if not email:
                email = username or "admin@example.com"
        else:
            if not username:
                username = "admin"

        if not password:
            self.stdout.write(self.style.WARNING(
                "DJANGO_SUPERUSER_PASSWORD not set; skipping ensure_admin."
            ))
            return

        ident_value = email if username_field == "email" else username
        ident_kwargs = {username_field: ident_value}

        with transaction.atomic():
            user, created = User._default_manager.get_or_create(
                **ident_kwargs,
                defaults={"email": email or ""}
            )
            if created:
                user.is_superuser = True
                user.is_staff = True
                user.set_password(password)
                if email and hasattr(user, "email"):
                    user.email = email
                user.save()
                self.stdout.write(self.style.SUCCESS(
                    f"Superuser created: {username_field}={ident_value}"
                ))
            else:
                self.stdout.write("Superuser already exists; nothing to do.")
