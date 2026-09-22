import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EnteteSection, BadgeStatut } from "@/components/ui-metier";
import { CarteParcelles } from "@/components/carte-parcelles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formaterDate, formaterDateHeure, formaterSuperficie } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/parcelles/$id")({
  head: () => ({
    meta: [
      { title: "Fiche parcelle — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Informations cadastrales, localisation, plaintes, litiges, décisions et historique d'une parcelle.",
      },
      { property: "og:title", content: "Fiche parcelle — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Détail complet d'une parcelle foncière et de ses procédures.",
      },
    ],
  }),
  component: FicheParcelle,
});

function Ligne({ libelle, valeur }: { libelle: string; valeur: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{libelle}</span>
      <span className="text-right font-medium">{valeur}</span>
    </div>
  );
}

function FicheParcelle() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["parcelle", id],
    queryFn: async () => {
      const [parcelle, plaintes, litiges, historique] = await Promise.all([
        supabase.from("parcelles").select("*").eq("id", id).maybeSingle(),
        supabase.from("plaintes").select("*").eq("parcelle_id", id).order("date_depot", { ascending: false }),
        supabase.from("litiges").select("*").eq("parcelle_id", id).order("date_ouverture", { ascending: false }),
        supabase
          .from("historique_parcelle")
          .select("*")
          .eq("parcelle_id", id)
          .order("date_evenement", { ascending: false }),
      ]);
      const idsLitiges = (litiges.data ?? []).map((l) => l.id);
      const decisions = idsLitiges.length
        ? await supabase.from("decisions").select("*").in("litige_id", idsLitiges)
        : { data: [] };
      return {
        parcelle: parcelle.data,
        plaintes: plaintes.data ?? [],
        litiges: litiges.data ?? [],
        decisions: decisions.data ?? [],
        historique: historique.data ?? [],
      };
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement de la fiche…</p>;
  if (!data?.parcelle) return <p className="text-sm text-muted-foreground">Parcelle introuvable.</p>;

  const p = data.parcelle;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3">
        <Link to="/parcelles">
          <ArrowLeft className="size-4" /> Retour aux parcelles
        </Link>
      </Button>

      <EnteteSection
        titre={p.code_parcelle}
        description={`${p.reference_cadastrale} · ${p.commune} — ${p.prefecture}`}
        actions={<BadgeStatut valeur={p.statut} />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <Ligne libelle="Référence cadastrale" valeur={p.reference_cadastrale} />
            <Ligne libelle="Préfecture" valeur={p.prefecture} />
            <Ligne libelle="Commune" valeur={p.commune} />
            <Ligne libelle="Localité" valeur={p.localite ?? "—"} />
            <Ligne libelle="Superficie" valeur={formaterSuperficie(p.superficie_m2)} />
            <Ligne libelle="Propriétaire / titulaire" valeur={p.proprietaire ?? "—"} />
            <Ligne libelle="Type de titre" valeur={p.type_titre ?? "—"} />
            <Ligne
              libelle="Coordonnées"
              valeur={`${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`}
            />
            <Ligne libelle="Dernière mise à jour" valeur={formaterDateHeure(p.updated_at)} />
            {p.observations && <Ligne libelle="Observations" valeur={p.observations} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Localisation</CardTitle>
          </CardHeader>
          <CardContent>
            <CarteParcelles parcelles={[p]} parcelleActive={p.id} hauteur="380px" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="historique" className="mt-6">
        <TabsList>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="plaintes">Plaintes ({data.plaintes.length})</TabsTrigger>
          <TabsTrigger value="litiges">Litiges ({data.litiges.length})</TabsTrigger>
          <TabsTrigger value="decisions">Décisions ({data.decisions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="historique">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Acteur</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.historique.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="whitespace-nowrap">{formaterDate(h.date_evenement)}</TableCell>
                      <TableCell>
                        {h.evenement}
                        {h.details && (
                          <span className="block text-xs text-muted-foreground">{h.details}</span>
                        )}
                      </TableCell>
                      <TableCell>{h.acteur}</TableCell>
                      <TableCell>{h.statut ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {data.historique.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Aucun événement.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plaintes">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {data.plaintes.map((pl) => (
                <div key={pl.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm">{pl.numero}</span>
                    <BadgeStatut valeur={pl.statut} type="plainte" />
                  </div>
                  <p className="mt-1 text-sm font-medium">{pl.motif}</p>
                  <p className="text-sm text-muted-foreground">{pl.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pl.plaignant} contre {pl.partie_adverse ?? "—"} · déposée le{" "}
                    {formaterDate(pl.date_depot)}
                  </p>
                </div>
              ))}
              {data.plaintes.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune plainte sur cette parcelle.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="litiges">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {data.litiges.map((l) => (
                <div key={l.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm">{l.numero}</span>
                    <BadgeStatut valeur={l.statut} type="litige" />
                  </div>
                  <p className="mt-1 text-sm font-medium">{l.objet}</p>
                  <p className="text-xs text-muted-foreground">
                    Parties : {l.parties ?? "—"} · ouvert le {formaterDate(l.date_ouverture)}
                  </p>
                </div>
              ))}
              {data.litiges.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun litige sur cette parcelle.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {data.decisions.map((d) => (
                <div key={d.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm">{d.numero}</span>
                    <span className="text-xs text-muted-foreground">{formaterDate(d.date_decision)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{d.tribunal}</p>
                  <p className="text-sm text-muted-foreground">{d.resume}</p>
                </div>
              ))}
              {data.decisions.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune décision enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
