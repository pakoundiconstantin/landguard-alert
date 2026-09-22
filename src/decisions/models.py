from django.conf import settings
from django.db import models

from litiges.models import Litige


class Decision(models.Model):
    numero = models.CharField(max_length=80, unique=True)
    litige = models.ForeignKey(Litige, on_delete=models.CASCADE, related_name="decisions")
    tribunal = models.CharField(max_length=120)
    resume = models.TextField()
    statut = models.CharField(max_length=50, default="en_attente")
    date_decision = models.DateTimeField(auto_now_add=True)
    date_transmission = models.DateTimeField(blank=True, null=True)
    document_url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="decisions_crees")

    class Meta:
        db_table = "decisions"

    def __str__(self):
        return self.numero
