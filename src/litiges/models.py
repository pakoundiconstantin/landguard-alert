from django.conf import settings
from django.db import models

from parcelles.models import Parcelle
from plaintes.models import Plainte


class Litige(models.Model):
    numero = models.CharField(max_length=80, unique=True)
    objet = models.CharField(max_length=200)
    parcelle = models.ForeignKey(Parcelle, on_delete=models.CASCADE, related_name="litiges")
    plainte = models.ForeignKey(Plainte, on_delete=models.SET_NULL, null=True, blank=True, related_name="litiges")
    parties = models.TextField(blank=True, null=True)
    date_ouverture = models.DateTimeField(auto_now_add=True)
    date_cloture = models.DateTimeField(blank=True, null=True)
    STATUT_CHOICES = [
        ("ouvert", "Ouvert"),
        ("en_cours_cadastre", "En cours au cadastre"),
        ("bloque", "Parcelle bloquée"),
        ("en_attente_validation", "En attente de validation"),
        ("valide", "Validé"),
        ("resolu", "Résolu"),
    ]
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default="ouvert")
    parcelle_bloquee = models.BooleanField(default=False)
    position_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    position_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    valide_par_admin = models.BooleanField(default=False)
    commentaire_validation = models.TextField(blank=True)
    traite_par_cadastre = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="litiges_cadastre")
    valide_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="litiges_valides")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="litiges_crees")

    class Meta:
        db_table = "litiges"

    def __str__(self):
        return self.numero
