from django.db.models import Count
from rest_framework import permissions
from accounts.permissions import IsAnyLandguardUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from alertes.models import Alerte
from litiges.models import Litige
from parcelles.models import Parcelle
from plaintes.models import Plainte


@api_view(["GET"])
@permission_classes([IsAnyLandguardUser])
def dashboard_summary(request):
    return Response(
        {
            "parcelles": Parcelle.objects.count(),
            "plaintes": Plainte.objects.count(),
            "litiges": Litige.objects.count(),
            "alertes": Alerte.objects.count(),
            "alertes_non_traitees": Alerte.objects.filter(traitee=False).count(),
            "parcelles_par_statut": list(
                Parcelle.objects.values("statut").annotate(total=Count("id")).order_by("statut")
            ),
        }
    )
