from rest_framework import serializers

from .models import Plainte


class PlainteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plainte
        fields = [
            "id",
            "numero",
            "parcelle",
            "description",
            "type_plainte",
            "statut",
            "created_by",
            "created_at",
        ]
