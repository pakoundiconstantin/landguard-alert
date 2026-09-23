from rest_framework import serializers

from .models import Decision


class DecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decision
        fields = [
            "id",
            "numero",
            "litige",
            "tribunal",
            "resume",
            "statut",
            "date_decision",
            "date_transmission",
            "document_url",
            "created_by",
        ]
