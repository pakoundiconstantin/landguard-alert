from django.conf import settings
from django.db import models

from parcelles.models import Parcelle


class Plainte(models.Model):
    STATUT_EN_COURS = "en_cours"
    STATUT_TRAITEE = "traitee"
    STATUT_REJETEE = "rejetee"
    STATUT_TRANSMISE = "transmise_cadastre"

    STATUT_CHOICES = [
        (STATUT_EN_COURS, "En cours"),
        (STATUT_TRAITEE, "Traitée"),
        (STATUT_REJETEE, "Rejetée"),
        (STATUT_TRANSMISE, "Transmise au cadastre"),
    ]

    numero = models.CharField(max_length=80, unique=True)
    parcelle = models.ForeignKey(Parcelle, on_delete=models.CASCADE, related_name="plaintes")
    description = models.TextField()
    type_plainte = models.CharField(max_length=80)
    type_litige = models.CharField(max_length=120, default="Autre")
    demandeur_nom = models.CharField(max_length=120, default="")
    demandeur_prenom = models.CharField(max_length=120, default="")
    demandeur_contact = models.CharField(max_length=80, default="")
    demandeur_adresse = models.TextField(default="")
    opposant_nom = models.CharField(max_length=120, default="")
    opposant_prenom = models.CharField(max_length=120, default="")
    opposant_contact = models.CharField(max_length=80, default="")
    opposant_adresse = models.TextField(default="")
    plan_parcellaire = models.FileField(upload_to="pieces/plans/", blank=True, null=True)
    titre_foncier = models.FileField(upload_to="pieces/titres/", blank=True, null=True)
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default=STATUT_EN_COURS)
    reponse_admin = models.TextField(blank=True, default="")
    reponse_admin_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="plaintes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "plaintes"

    def creer_litige(self):
        from litiges.models import Litige

        litige, created = Litige.objects.get_or_create(
            numero=self.numero,
            defaults={
                "objet": self.type_litige or self.type_plainte or "Litige foncier",
                "parcelle": self.parcelle,
                "plainte": self,
                "parties": f"Demandeur: {self.demandeur_nom} {self.demandeur_prenom} / Opposant: {self.opposant_nom} {self.opposant_prenom}",
                "statut": "en_cours_cadastre",
                "created_by": self.created_by,
            },
        )
        if not created:
            litige.objet = self.type_litige or self.type_plainte or litige.objet
            litige.parcelle = self.parcelle
            litige.plainte = self
            litige.parties = f"Demandeur: {self.demandeur_nom} {self.demandeur_prenom} / Opposant: {self.opposant_nom} {self.opposant_prenom}"
            litige.created_by = self.created_by
            litige.statut = "en_cours_cadastre"
            litige.save(update_fields=["objet", "parcelle", "plainte", "parties", "created_by", "statut"])
        return litige

    def __str__(self):
        return self.numero
