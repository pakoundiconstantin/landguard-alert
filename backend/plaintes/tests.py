from django.test import TestCase

from accounts.models import User
from litiges.models import Litige
from parcelles.models import Parcelle
from plaintes.models import Plainte


class PlainteWorkflowTest(TestCase):
    def test_plainte_creates_related_litige(self):
        parcelle = Parcelle.objects.create(
            numero="P-001",
            commune="Lome",
            prefecture="Maritime",
            superficie=1200,
        )
        user = User.objects.create_user(
            username="agent-judiciaire",
            password="secret123",
            role=User.ROLE_TRIBUNAL,
        )

        plainte = Plainte.objects.create(
            numero="D-2026-001",
            parcelle=parcelle,
            description="Conflit de bornage",
            type_plainte="plainte",
            type_litige="Bornage",
            demandeur_nom="Afi",
            demandeur_prenom="Kossi",
            demandeur_contact="99000000",
            demandeur_adresse="Lomé",
            opposant_nom="Togbe",
            opposant_prenom="Jean",
            opposant_contact="99111111",
            opposant_adresse="Adakpame",
            created_by=user,
        )

        litige = plainte.creer_litige()

        self.assertIsNotNone(litige)
        self.assertTrue(Litige.objects.filter(plainte=plainte).exists())
        self.assertEqual(litige.statut, "en_cours_cadastre")
        self.assertEqual(litige.parcelle, parcelle)
