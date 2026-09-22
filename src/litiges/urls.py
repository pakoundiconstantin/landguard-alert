from django.urls import path

from .views import LitigeListView, LitigeDetailView

urlpatterns = [
    path("", LitigeListView.as_view(), name="litige_list"),
    path("<int:pk>/", LitigeDetailView.as_view(), name="litige_detail"),
]
