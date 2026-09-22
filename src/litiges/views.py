from rest_framework import generics, permissions
from accounts.permissions import IsAnyLandguardUser, IsCadastreOrAdmin

from .models import Litige
from .serializers import LitigeSerializer


class LitigeListView(generics.ListCreateAPIView):
    queryset = Litige.objects.all().order_by("-date_ouverture")
    serializer_class = LitigeSerializer
    def get_permissions(self):
        return [IsCadastreOrAdmin()] if self.request.method == "POST" else [IsAnyLandguardUser()]


class LitigeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Litige.objects.all()
    serializer_class = LitigeSerializer
    def get_permissions(self):
        return [IsCadastreOrAdmin()] if self.request.method in ("PUT", "PATCH", "DELETE") else [IsAnyLandguardUser()]
