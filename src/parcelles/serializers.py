from rest_framework import serializers

from .models import Parcelle


class ParcelleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcelle
        fields = [
            "id",
            "numero",
            "commune",
            "prefecture",
            "superficie",
            "statut",
            "geom",
            "created_at",
            "created_by",
        ]
