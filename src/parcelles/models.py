from django.conf import settings
from django.db import models


class Parcelle(models.Model):
    numero = models.CharField(max_length=80, unique=True)
    commune = models.CharField(max_length=120)
    prefecture = models.CharField(max_length=120)
    superficie = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    statut = models.CharField(max_length=50, default="actif")
    geom = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="parcelles")

    class Meta:
        db_table = "parcelles"

    def __str__(self):
        return self.numero
