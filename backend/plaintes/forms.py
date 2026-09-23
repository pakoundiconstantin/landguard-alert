from django import forms

from .models import Plainte


class PlainteForm(forms.ModelForm):
    class Meta:
        model = Plainte
        fields = (
            "numero", "parcelle", "type_plainte", "type_litige", "description",
            "demandeur_nom", "demandeur_prenom", "demandeur_contact", "demandeur_adresse",
            "opposant_nom", "opposant_prenom", "opposant_contact", "opposant_adresse",
            "plan_parcellaire", "titre_foncier",
        )
        labels = {
            "numero": "Numéro du dossier",
            "parcelle": "Parcelle concernée",
            "type_plainte": "Type de plainte",
            "type_litige": "Type de litige",
            "description": "Description des faits",
            "demandeur_nom": "Nom du demandeur",
            "demandeur_prenom": "Prénom du demandeur",
            "demandeur_contact": "Contact du demandeur",
            "demandeur_adresse": "Adresse du demandeur",
            "opposant_nom": "Nom de l'opposant",
            "opposant_prenom": "Prénom de l'opposant",
            "opposant_contact": "Contact de l'opposant",
            "opposant_adresse": "Adresse de l'opposant",
            "plan_parcellaire": "Plan parcellaire",
            "titre_foncier": "Titre foncier",
        }
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "demandeur_adresse": forms.Textarea(attrs={"rows": 2}),
            "opposant_adresse": forms.Textarea(attrs={"rows": 2}),
        }


class TraitementLitigeForm(forms.Form):
    latitude = forms.DecimalField(label="Latitude", max_digits=9, decimal_places=6)
    longitude = forms.DecimalField(label="Longitude", max_digits=9, decimal_places=6)
    commentaire = forms.CharField(label="Observation du cadastre", widget=forms.Textarea(attrs={"rows": 3}), required=False)
