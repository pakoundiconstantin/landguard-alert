from rest_framework import serializers

from .models import Alerte


class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = [
            "id",
            "type_evenement",
            "message",
            "priorite",
            "parcelle",
            "plainte",
            "litige",
            "traitee",
            "traitee_par",
            "created_at",
        ]
