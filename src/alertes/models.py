from django.conf import settings
from django.db import models

from litiges.models import Litige
from parcelles.models import Parcelle
from plaintes.models import Plainte


class Alerte(models.Model):
    PRIORITE_BASSE = "basse"
    PRIORITE_MOYENNE = "moyenne"
    PRIORITE_HAUTE = "haute"

    PRIORITE_CHOICES = [
        (PRIORITE_BASSE, "Basse"),
        (PRIORITE_MOYENNE, "Moyenne"),
        (PRIORITE_HAUTE, "Haute"),
    ]

    type_evenement = models.CharField(max_length=80)
    message = models.TextField()
    priorite = models.CharField(max_length=20, choices=PRIORITE_CHOICES, default=PRIORITE_MOYENNE)
    parcelle = models.ForeignKey(Parcelle, on_delete=models.SET_NULL, blank=True, null=True, related_name="alertes")
    plainte = models.ForeignKey(Plainte, on_delete=models.SET_NULL, blank=True, null=True, related_name="alertes")
    litige = models.ForeignKey(Litige, on_delete=models.SET_NULL, blank=True, null=True, related_name="alertes")
    traitee = models.BooleanField(default=False)
    traitee_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="alertes_traitees")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "alertes"

    def __str__(self):
        return self.type_evenement
