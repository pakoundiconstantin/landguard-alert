from rest_framework import generics, permissions
from accounts.permissions import IsCadastreOrAdmin, IsStaffWorkflow

from .models import Parcelle
from .serializers import ParcelleSerializer


class ParcelleListView(generics.ListCreateAPIView):
    queryset = Parcelle.objects.all().order_by("-created_at")
    serializer_class = ParcelleSerializer
    def get_permissions(self):
        return [IsCadastreOrAdmin()] if self.request.method == "POST" else [IsStaffWorkflow()]


class ParcelleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Parcelle.objects.all()
    serializer_class = ParcelleSerializer
    def get_permissions(self):
        return [IsCadastreOrAdmin()] if self.request.method in ("PUT", "PATCH", "DELETE") else [IsStaffWorkflow()]
