from rest_framework import generics, permissions
from accounts.permissions import IsAnyLandguardUser, IsTribunalOrAdmin

from .models import Decision
from .serializers import DecisionSerializer


class DecisionListView(generics.ListCreateAPIView):
    queryset = Decision.objects.all().order_by("-date_decision")
    serializer_class = DecisionSerializer
    def get_permissions(self):
        return [IsTribunalOrAdmin()] if self.request.method == "POST" else [IsAnyLandguardUser()]


class DecisionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Decision.objects.all()
    serializer_class = DecisionSerializer
    def get_permissions(self):
        return [IsTribunalOrAdmin()] if self.request.method in ("PUT", "PATCH", "DELETE") else [IsAnyLandguardUser()]
