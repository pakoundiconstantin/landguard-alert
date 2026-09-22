from rest_framework import generics, permissions
from accounts.permissions import IsTribunalOrAdmin, IsStaffWorkflow

from .models import Plainte
from .serializers import PlainteSerializer


class PlainteListView(generics.ListCreateAPIView):
    queryset = Plainte.objects.all().order_by("-created_at")
    serializer_class = PlainteSerializer
    def get_permissions(self):
        return [IsTribunalOrAdmin()] if self.request.method == "POST" else [IsStaffWorkflow()]


class PlainteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Plainte.objects.all()
    serializer_class = PlainteSerializer
    def get_permissions(self):
        return [IsTribunalOrAdmin()] if self.request.method in ("PUT", "PATCH", "DELETE") else [IsStaffWorkflow()]
