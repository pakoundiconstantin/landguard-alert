from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from home import alertes, carte, decisions, home, litiges, parcelles, plaintes, plainte_nouvelle, traiter_litige, valider_litige
from accounts.views import connexion, deconnexion, inscription

urlpatterns = [
    path("", home, name="home"),
    path("connexion/", connexion, name="connexion"),
    path("inscription/", inscription, name="inscription"),
    path("deconnexion/", deconnexion, name="deconnexion"),
    path("carte/", carte, name="carte"),
    path("parcelles/", parcelles, name="parcelles"),
    path("plaintes/", plaintes, name="plaintes"),
    path("plaintes/nouvelle/", plainte_nouvelle, name="plainte_nouvelle"),
    path("litiges/", litiges, name="litiges"),
    path("litiges/<int:litige_id>/traiter/", traiter_litige, name="traiter_litige"),
    path("litiges/<int:litige_id>/valider/", valider_litige, name="valider_litige"),
    path("decisions/", decisions, name="decisions"),
    path("alertes/", alertes, name="alertes"),
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/parcelles/", include("parcelles.urls")),
    path("api/plaintes/", include("plaintes.urls")),
    path("api/litiges/", include("litiges.urls")),
    path("api/decisions/", include("decisions.urls")),
    path("api/alertes/", include("alertes.urls")),
    path("api/dashboard/", include("dashboard.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
