from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from alertes.models import Alerte
from decisions.models import Decision
from litiges.models import Litige
from parcelles.models import Parcelle
from plaintes.models import Plainte
from accounts.models import Notification, User
from litiges.forms import TraitementLitigeForm, ValidationLitigeForm
from plaintes.forms import PlainteForm


def _page_context(titre, **extra):
    return {
        "titre": titre,
        "stats": {
            "parcelles": Parcelle.objects.count(),
            "plaintes": Plainte.objects.count(),
            "litiges": Litige.objects.count(),
            "alertes": Alerte.objects.filter(traitee=False).count(),
        },
        "notifications": Notification.objects.filter(destinataire=extra["request"].user)[:8] if extra.get("request") else [],
        **extra,
    }


@login_required(login_url="connexion")
def home(request):
    return render(request, "dashboard.html", _page_context("Tableau de bord", request=request))


@login_required(login_url="connexion")
def parcelles(request):
    objets = Parcelle.objects.all().order_by("-created_at")
    return render(request, "list.html", _page_context("Parcelles", objets=objets, type_objet="parcelles"))


@login_required(login_url="connexion")
def plaintes(request):
    objets = Plainte.objects.select_related("parcelle").all().order_by("-created_at")
    return render(request, "list.html", _page_context("Plaintes", objets=objets, type_objet="plaintes"))


@login_required(login_url="connexion")
def plainte_nouvelle(request):
    if request.user.role not in (User.ROLE_TRIBUNAL, User.ROLE_ADMIN):
        messages.error(request, "Seul un agent judiciaire peut enregistrer une plainte.")
        return redirect("plaintes")
    formulaire = PlainteForm(request.POST or None, request.FILES or None)
    if request.method == "POST" and formulaire.is_valid():
        plainte = formulaire.save(commit=False)
        plainte.created_by = request.user
        plainte.statut = Plainte.STATUT_TRANSMISE
        plainte.save()
        litre = plainte.creer_litige()
        for user in User.objects.filter(role__in=[User.ROLE_CADASTRE, User.ROLE_ADMIN]):
            Notification.objects.create(destinataire=user, titre="Nouvelle plainte à traiter", message=f"Le dossier {plainte.numero} a été transmis au cadastre et le litige {litre.numero} a été créé.")
        messages.success(request, "La plainte a été enregistrée, le litige a été créé et transmis au cadastre.")
        return redirect("plaintes")
    return render(request, "formulaire.html", _page_context("Nouvelle plainte", formulaire=formulaire, type_formulaire="plainte"))


@login_required(login_url="connexion")
def litiges(request):
    objets = Litige.objects.select_related("parcelle").all().order_by("-date_ouverture")
    return render(request, "list.html", _page_context("Litiges", objets=objets, type_objet="litiges"))


@login_required(login_url="connexion")
def traiter_litige(request, litige_id):
    if request.user.role not in (User.ROLE_CADASTRE, User.ROLE_ADMIN):
        messages.error(request, "Cette étape est réservée au cadastre.")
        return redirect("litiges")
    litige = get_object_or_404(Litige, pk=litige_id)
    parcelle_geom = litige.parcelle.geom or {}
    formulaire = TraitementLitigeForm(request.POST or None, initial={"latitude": litige.position_latitude or parcelle_geom.get("lat", ""), "longitude": litige.position_longitude or parcelle_geom.get("lng", "")})
    if request.method == "POST" and formulaire.is_valid():
        litige.position_latitude = formulaire.cleaned_data["latitude"]
        litige.position_longitude = formulaire.cleaned_data["longitude"]
        litige.parcelle_bloquee = True
        litige.statut = "en_attente_validation"
        litige.traite_par_cadastre = request.user
        litige.save()
        litige.parcelle.statut = "en_litige"
        litige.parcelle.geom = {"lat": float(litige.position_latitude), "lng": float(litige.position_longitude)}
        litige.parcelle.save(update_fields=["statut", "geom"])
        for user in User.objects.filter(role__in=[User.ROLE_ADMIN]):
            Notification.objects.create(destinataire=user, titre="Litige à valider", message=f"Le cadastre a positionné et bloqué le dossier {litige.numero}.")
        messages.success(request, "La parcelle est positionnée et bloquée. Le dossier est envoyé à l'administrateur.")
        return redirect("litiges")
    return render(request, "formulaire.html", _page_context("Traitement cadastral", formulaire=formulaire, type_formulaire="litige", objet=litige))


@login_required(login_url="connexion")
def valider_litige(request, litige_id):
    if request.user.role not in (User.ROLE_ADMIN,):
        messages.error(request, "Seul l'administrateur peut valider un dossier.")
        return redirect("litiges")
    litige = get_object_or_404(Litige, pk=litige_id)
    formulaire = ValidationLitigeForm(request.POST or None, initial={"reponse": litige.commentaire_validation or "Le dossier a été validé. Le litige est traité."})
    if request.method == "POST" and formulaire.is_valid():
        reponse = formulaire.cleaned_data["reponse"].strip()
        litige.commentaire_validation = reponse
        litige.valide_par_admin = True
        litige.valide_par = request.user
        litige.statut = "valide"
        litige.save(update_fields=["commentaire_validation", "valide_par_admin", "valide_par", "statut"])

        if litige.plainte:
            litige.plainte.statut = Plainte.STATUT_TRAITEE
            litige.plainte.reponse_admin = reponse
            litige.plainte.reponse_admin_at = timezone.now()
            litige.plainte.save(update_fields=["statut", "reponse_admin", "reponse_admin_at"])

        destinataires = []
        if litige.created_by:
            destinataires.append(litige.created_by)
        if litige.plainte and litige.plainte.created_by:
            destinataires.append(litige.plainte.created_by)
        destinataires += list(User.objects.filter(role=User.ROLE_CONSULTATION))
        for user in {user for user in destinataires if user}:
            Notification.objects.create(destinataire=user, titre="Dossier validé", message=f"Le dossier {litige.numero} a été validé par l'administrateur. Réponse: {reponse}")
        messages.success(request, "La validation a été enregistrée et la réponse est visible par l’agent judiciaire et les utilisateurs concernés.")
        return redirect("litiges")

    return render(request, "formulaire.html", _page_context("Validation administrative", formulaire=formulaire, type_formulaire="validation", objet=litige))


@login_required(login_url="connexion")
def decisions(request):
    objets = Decision.objects.select_related("litige").all().order_by("-date_decision")
    return render(request, "list.html", _page_context("Décisions judiciaires", objets=objets, type_objet="decisions"))


@login_required(login_url="connexion")
def alertes(request):
    objets = Alerte.objects.select_related("parcelle", "litige").all().order_by("traitee", "-created_at")
    return render(request, "list.html", _page_context("Alertes", objets=objets, type_objet="alertes"))


@login_required(login_url="connexion")
def carte(request):
    objets = Parcelle.objects.all().order_by("numero")
    return render(request, "map.html", _page_context("Carte des parcelles", objets=objets))
