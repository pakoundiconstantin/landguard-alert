from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from rest_framework import generics, permissions

from .forms import InscriptionForm
from .permissions import IsAdmin
from .serializers import UserSerializer

User = get_user_model()


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


def connexion(request):
    if request.user.is_authenticated:
        return redirect("home")

    erreur = None
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("home")
        erreur = "Nom d'utilisateur ou mot de passe incorrect."
    return render(request, "auth.html", {"titre": "Connexion", "mode": "connexion", "erreur": erreur})


def inscription(request):
    if request.user.is_authenticated:
        return redirect("home")

    formulaire = InscriptionForm(request.POST or None)
    if request.method == "POST" and formulaire.is_valid():
        user = formulaire.save()
        login(request, user)
        return redirect("home")
    return render(request, "auth.html", {"titre": "Créer un compte", "mode": "inscription", "formulaire": formulaire})


@login_required(login_url="connexion")
def deconnexion(request):
    logout(request)
    return redirect("connexion")
