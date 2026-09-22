from django import forms


class TraitementLitigeForm(forms.Form):
    latitude = forms.DecimalField(label="Latitude", max_digits=9, decimal_places=6)
    longitude = forms.DecimalField(label="Longitude", max_digits=9, decimal_places=6)
    commentaire = forms.CharField(label="Observation du cadastre", widget=forms.Textarea(attrs={"rows": 3}), required=False)


class ValidationLitigeForm(forms.Form):
    reponse = forms.CharField(label="Réponse de l'administration", widget=forms.Textarea(attrs={"rows": 4}), initial="Le dossier a été validé. Le litige est traité.")
