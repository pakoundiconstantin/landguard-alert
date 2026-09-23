from django import forms
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.forms import ModelForm

from .models import User


class InscriptionForm(ModelForm):
    nom_complet = forms.CharField(label="Nom complet", max_length=255)
    email = forms.EmailField(label="Adresse e-mail")
    role = forms.ChoiceField(
        label="Profil",
        choices=User.ROLE_CHOICES,
        initial=User.ROLE_CONSULTATION,
    )
    prefecture = forms.ChoiceField(
        label="Préfecture",
        choices=[
            ("Golfe", "Golfe"),
            ("Agoè-Nyivé", "Agoè-Nyivé"),
            ("Bas-Mono", "Bas-Mono"),
            ("Lacs", "Lacs"),
            ("Vo", "Vo"),
            ("Yoto", "Yoto"),
            ("Avé", "Avé"),
            ("Zio", "Zio"),
        ],
    )
    class Meta:
        model = User
        fields = ("nom_complet", "role", "prefecture", "email", "password")
        labels = {
            "password": "Mot de passe",
        }

    password = forms.CharField(label="Mot de passe", widget=forms.PasswordInput)

    def clean_email(self):
        email = (self.cleaned_data.get("email") or "").strip().lower()
        if not email:
            return email

        if User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise forms.ValidationError("Un compte existe déjà pour cette adresse e-mail.")

        if User.objects.filter(username__iexact=email).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise forms.ValidationError("Un compte existe déjà pour cette adresse e-mail.")

        return email

    def clean_password(self):
        password = self.cleaned_data["password"]
        try:
            validate_password(password)
        except ValidationError as error:
            raise forms.ValidationError(error.messages)
        return password

    def save(self, commit=True):
        email = (self.cleaned_data["email"] or "").strip().lower()
        if User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk if self.instance else None).exists() or User.objects.filter(username__iexact=email).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise forms.ValidationError("Un compte existe déjà pour cette adresse e-mail.")

        user = super().save(commit=False)
        nom_complet = self.cleaned_data["nom_complet"].strip().split(maxsplit=1)
        user.first_name = nom_complet[0]
        user.last_name = nom_complet[1] if len(nom_complet) > 1 else ""
        user.username = email
        user.email = email
        user.role = self.cleaned_data["role"]
        user.prefecture = self.cleaned_data["prefecture"]
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user
