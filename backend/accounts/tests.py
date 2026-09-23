from django.test import TestCase
from django.urls import reverse

from accounts.forms import InscriptionForm
from accounts.models import User


class InscriptionFormTest(TestCase):
    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="existing.user@example.com",
            email="existing.user@example.com",
            password="Secret123!",
            role=User.ROLE_CONSULTATION,
        )

        form = InscriptionForm(
            data={
                "nom_complet": "User Test",
                "role": User.ROLE_CONSULTATION,
                "prefecture": "Lacs",
                "email": "existing.user@example.com",
                "password": "SecurePassword123!",
            }
        )

        self.assertFalse(form.is_valid())
        self.assertIn("existe déjà", form.errors["email"][0])

    def test_role_visibility_is_displayed_on_dashboard(self):
        user = User.objects.create_user(
            username="tribunal.test",
            email="tribunal.test@example.com",
            password="Secret123!",
            role=User.ROLE_TRIBUNAL,
        )

        self.client.force_login(user)
        response = self.client.get(reverse("home"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Agent du tribunal")
        self.assertContains(response, "Nouvelle plainte")

    def test_consultation_user_cannot_access_complaint_form(self):
        user = User.objects.create_user(
            username="consultation.test",
            email="consultation.test@example.com",
            password="Secret123!",
            role=User.ROLE_CONSULTATION,
        )

        self.client.force_login(user)
        response = self.client.get(reverse("plainte_nouvelle"), follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Seul un agent judiciaire")
        self.assertNotContains(response, "Créer une plainte")
