from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_CADASTRE = "cadastre"
    ROLE_TRIBUNAL = "tribunal"
    ROLE_CONSULTATION = "consultation"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Administrateur"),
        (ROLE_CADASTRE, "Agent du cadastre"),
        (ROLE_TRIBUNAL, "Agent du tribunal"),
        (ROLE_CONSULTATION, "Consultation"),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default=ROLE_CONSULTATION)
    prefecture = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.get_full_name() or self.username


class Notification(models.Model):
    destinataire = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    titre = models.CharField(max_length=180)
    message = models.TextField()
    lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
