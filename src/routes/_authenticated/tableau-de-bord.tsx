import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Gavel,
  LandPlot,
  Scale,
  ScrollText,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { CarteIndicateur, EnteteSection, BadgeStatut } from "@/components/ui-metier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formaterDate, formaterDateHeure, STATUTS_LITIGE } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Indicateurs du foncier : parcelles, parcelles en litige, plaintes, litiges en cours, décisions et alertes actives.",
      },
      { property: "og:title", content: "Tableau de bord — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Suivi statistique des litiges fonciers de la région Maritime.",
      },
    ],
  }),
  component: TableauDeBord,
});

const COULEURS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function TableauDeBord() {
  const { data, isLoading } = useQuery({
    queryKey: ["tableau-de-bord"],
    queryFn: async () => {
      const [parcelles, plaintes, litiges, decisions, alertes] = await Promise.all([
        supabase.from("parcelles").select("id, statut, prefecture"),
        supabase.from("plaintes").select("id, statut, created_at, numero, motif"),
        supabase
          .from("litiges")
          .select("id, numero, statut, objet, date_ouverture")
          .order("created_at", { ascending: false }),
        supabase.from("decisions").select("id, numero, tribunal, date_decision"),
        supabase
          .from("alertes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      return {
        parcelles: parcelles.data ?? [],
        plaintes: plaintes.data ?? [],
        litiges: litiges.data ?? [],
        decisions: decisions.data ?? [],
        alertes: alertes.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Chargement des indicateurs…</p>;
  }

  const enLitige = data.parcelles.filter((p) => p.statut === "en_litige").length;
  const litigesEnCours = data.litiges.filter(
    (l) => !["resolu", "cloture"].includes(l.statut),
  ).length;
  const litigesResolus = data.litiges.filter((l) =>
    ["resolu", "cloture"].includes(l.statut),
  ).length;
  const alertesActives = data.alertes.filter((a) => !a.traitee).length;

  const parPrefecture = Object.entries(
    data.parcelles.reduce<Record<string, number>>((acc, p) => {
      acc[p.prefecture] = (acc[p.prefecture] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([prefecture, total]) => ({ prefecture, total }));

  const parStatutLitige = Object.entries(
    data.litiges.reduce<Record<string, number>>((acc, l) => {
      acc[l.statut] = (acc[l.statut] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([statut, total]) => ({ statut: STATUTS_LITIGE[statut] ?? statut, total }));

  return (
    <div>
      <EnteteSection
        titre="Tableau de bord"
        description="Vue synthétique du foncier et des procédures en cours dans la région Maritime."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteIndicateur libelle="Parcelles" valeur={data.parcelles.length} icone={LandPlot} />
        <CarteIndicateur
          libelle="Parcelles en litige"
          valeur={enLitige}
          icone={ShieldAlert}
          accent="alerte"
        />
        <CarteIndicateur libelle="Plaintes" valeur={data.plaintes.length} icone={ScrollText} />
        <CarteIndicateur
          libelle="Litiges en cours"
          valeur={litigesEnCours}
          icone={Gavel}
          accent="ocre"
        />
        <CarteIndicateur
          libelle="Litiges résolus"
          valeur={litigesResolus}
          icone={CheckCircle2}
        />
        <CarteIndicateur libelle="Décisions" valeur={data.decisions.length} icone={Scale} />
        <CarteIndicateur
          libelle="Alertes actives"
          valeur={alertesActives}
          icone={AlertTriangle}
          accent="alerte"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parcelles par préfecture</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parPrefecture}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="prefecture" fontSize={11} interval={0} angle={-20} height={50} dy={10} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des litiges par statut</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {parStatutLitige.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun litige enregistré.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parStatutLitige}
                    dataKey="total"
                    nameKey="statut"
                    outerRadius={95}
                    label
                  >
                    {parStatutLitige.map((_, i) => (
                      <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertes récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.alertes.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{a.type_evenement}</p>
                  <BadgeStatut valeur={a.priorite} type="priorite" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {formaterDateHeure(a.created_at)}
                </p>
              </div>
            ))}
            {data.alertes.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune alerte.</p>
            )}
            <Link to="/alertes" className="inline-block text-sm text-primary underline">
              Voir toutes les alertes
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Litiges récents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.litiges.slice(0, 6).map((l) => (
              <div key={l.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm">{l.numero}</p>
                  <BadgeStatut valeur={l.statut} type="litige" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{l.objet}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ouvert le {formaterDate(l.date_ouverture)}
                </p>
              </div>
            ))}
            {data.litiges.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun litige.</p>
            )}
            <Link to="/litiges" className="inline-block text-sm text-primary underline">
              Voir tous les litiges
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
