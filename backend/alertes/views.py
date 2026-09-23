from rest_framework import generics, permissions
from accounts.permissions import IsAdmin, IsAnyLandguardUser, IsCadastreOrAdmin

from .models import Alerte
from .serializers import AlerteSerializer


class AlerteListView(generics.ListCreateAPIView):
    queryset = Alerte.objects.all().order_by("-created_at")
    serializer_class = AlerteSerializer
    def get_permissions(self):
        return [IsCadastreOrAdmin()] if self.request.method == "POST" else [IsAnyLandguardUser()]


class AlerteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer
    def get_permissions(self):
        return [IsAdmin()] if self.request.method in ("PUT", "PATCH", "DELETE") else [IsAnyLandguardUser()]
