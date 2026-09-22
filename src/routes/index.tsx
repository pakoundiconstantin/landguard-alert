import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  FileSearch,
  Gavel,
  History,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PREFECTURES } from "@/lib/domaine";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIG Foncier Maritime — Système d'alerte des litiges fonciers" },
      {
        name: "description",
        content:
          "Web-GIS de centralisation du cadastre, des plaintes, des litiges et des décisions judiciaires de la région Maritime du Sud-Togo, avec alertes automatiques.",
      },
      { property: "og:title", content: "SIG Foncier Maritime — Sud-Togo" },
      {
        property: "og:description",
        content:
          "Carte interactive des parcelles, suivi des litiges fonciers et alertes automatiques pour le cadastre et les tribunaux.",
      },
    ],
  }),
  component: Accueil,
});

const fonctionnalites = [
  {
    icone: MapPinned,
    titre: "Cartographie interactive",
    texte:
      "Visualisez les parcelles géoréférencées, zoomez, sélectionnez et repérez immédiatement celles en litige.",
  },
  {
    icone: FileSearch,
    titre: "Recherche multicritère",
    texte:
      "Référence cadastrale, propriétaire, commune, préfecture, statut ou numéro de dossier.",
  },
  {
    icone: Gavel,
    titre: "Plaintes et litiges",
    texte:
      "Enregistrement des plaintes, ouverture des dossiers, suivi des statuts jusqu'à la clôture.",
  },
  {
    icone: AlertTriangle,
    titre: "Alertes automatiques",
    texte:
      "Chaque événement important sur une parcelle déclenche une alerte et notifie les acteurs concernés.",
  },
  {
    icone: History,
    titre: "Historique des parcelles",
    texte: "Traçabilité complète : création, plainte, décision, mise à jour.",
  },
  {
    icone: ShieldCheck,
    titre: "Accès par rôle",
    texte:
      "Administrateur, agent du cadastre, agent du tribunal et consultation : chacun ses droits.",
  },
];

function Accueil() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="inline-flex items-center gap-2 font-display text-base font-semibold">
            <MapPinned className="size-5 text-primary" />
            SIG Foncier Maritime
          </span>
          <nav className="flex items-center gap-3">
            {session ? (
              <Button asChild size="sm">
                <Link to="/tableau-de-bord">
                  <LayoutDashboard className="size-4" /> Mon espace
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Se connecter</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="bg-grid-cadastre absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            Région Maritime · Sud-Togo
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight font-semibold text-balance-title sm:text-5xl">
            Système d'alerte SIG Web pour la gestion des litiges fonciers
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Une base unique reliant données cadastrales, domaniales et géospatiales : visualisation
            des parcelles, enregistrement des plaintes, suivi des litiges, alertes automatiques et
            transmission des décisions judiciaires au cadastre.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={session ? "/tableau-de-bord" : "/auth"}>
                Accéder à la plateforme <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={session ? "/carte" : "/auth"}>Voir la carte des parcelles</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-2">
            {PREFECTURES.map((p) => (
              <span
                key={p}
                className="rounded-md border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold">Ce que fait la plateforme</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fonctionnalites.map((f) => (
            <Card key={f.titre} className="border-border/70 transition-shadow hover:shadow-panel">
              <CardHeader>
                <f.icone className="size-5 text-primary" />
                <CardTitle className="mt-2 text-base">{f.titre}</CardTitle>
                <CardDescription>{f.texte}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold">Processus métier</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["1. Plainte", "L'agent du tribunal enregistre la plainte et identifie la parcelle."],
              ["2. Litige", "Un dossier est ouvert et rattaché à la parcelle concernée."],
              ["3. Alerte", "Le système alerte automatiquement les acteurs habilités."],
              ["4. Instruction", "Le dossier évolue : en cours, en attente de décision."],
              ["5. Décision", "La décision judiciaire est enregistrée et transmise au cadastre."],
              ["6. Clôture", "La parcelle est mise à jour et le dossier clôturé."],
            ].map(([titre, texte]) => (
              <li key={titre} className="rounded-lg border border-border bg-card p-5">
                <p className="font-display text-sm font-semibold text-primary">{titre}</p>
                <p className="mt-2 text-sm text-muted-foreground">{texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-muted-foreground">
          SIG Foncier Maritime — Projet de mémoire, gestion des litiges fonciers en lien avec le
          cadastre, région Maritime du Sud-Togo.
        </div>
      </footer>
    </div>
  );
}
