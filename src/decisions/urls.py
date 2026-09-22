from django.urls import path

from .views import DecisionListView, DecisionDetailView

urlpatterns = [
    path("", DecisionListView.as_view(), name="decision_list"),
    path("<int:pk>/", DecisionDetailView.as_view(), name="decision_detail"),
]
