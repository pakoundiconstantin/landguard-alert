from django.urls import path

from .views import AlerteListView, AlerteDetailView

urlpatterns = [
    path("", AlerteListView.as_view(), name="alerte_list"),
    path("<int:pk>/", AlerteDetailView.as_view(), name="alerte_detail"),
]
