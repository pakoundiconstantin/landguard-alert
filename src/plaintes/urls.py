from django.urls import path

from .views import PlainteListView, PlainteDetailView

urlpatterns = [
    path("", PlainteListView.as_view(), name="plainte_list"),
    path("<int:pk>/", PlainteDetailView.as_view(), name="plainte_detail"),
]
