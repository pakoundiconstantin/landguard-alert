from django.urls import path

from .views import ParcelleListView, ParcelleDetailView

urlpatterns = [
    path("", ParcelleListView.as_view(), name="parcelle_list"),
    path("<int:pk>/", ParcelleDetailView.as_view(), name="parcelle_detail"),
]
