from rest_framework import serializers

from .models import Litige


class LitigeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Litige
        fields = [
            "id",
            "numero",
            "objet",
            "parcelle",
            "plainte",
            "parties",
            "date_ouverture",
            "date_cloture",
            "statut",
            "created_by",
        ]
