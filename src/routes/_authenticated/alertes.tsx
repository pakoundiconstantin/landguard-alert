import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { EnteteSection, BadgeStatut } from "@/components/ui-metier";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formaterDateHeure } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/alertes")({
  head: () => ({
    meta: [
      { title: "Alertes — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Alertes automatiques générées par les événements fonciers : plaintes, litiges, décisions et mises à jour de parcelles.",
      },
      { property: "og:title", content: "Alertes — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Suivi des alertes actives et traitées du système d'alerte foncier.",
      },
    ],
  }),
  component: PageAlertes,
});

function PageAlertes() {
  const { user, aRole } = useAuth();
  const peutTraiter = !aRole("consultation") || aRole("administrateur");
  const queryClient = useQueryClient();

  const { data: alertes = [] } = useQuery({
    queryKey: ["alertes"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertes")
        .select("*, parcelles(code_parcelle, commune)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function traiter(id: string) {
    const { error } = await supabase
      .from("alertes")
      .update({ traitee: true, traitee_par: user?.id ?? null, traitee_le: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Traitement impossible.");
    toast.success("Alerte marquée comme traitée");
    void queryClient.invalidateQueries({ queryKey: ["alertes"] });
    void queryClient.invalidateQueries({ queryKey: ["tableau-de-bord"] });
  }

  const actives = alertes.filter((a) => !a.traitee);
  const traitees = alertes.filter((a) => a.traitee);

  const Liste = ({ items }: { items: typeof alertes }) => (
    <div className="space-y-3">
      {items.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{a.type_evenement}</p>
                <BadgeStatut valeur={a.priorite} type="priorite" />
                {a.parcelles && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {a.parcelles.code_parcelle} — {a.parcelles.commune}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formaterDateHeure(a.created_at)}
                {a.traitee_le && ` · traitée le ${formaterDateHeure(a.traitee_le)}`}
              </p>
            </div>
            {!a.traitee && peutTraiter && (
              <Button variant="outline" size="sm" onClick={() => traiter(a.id)}>
                <CheckCircle2 className="size-4" /> Marquer traitée
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">Aucune alerte.</p>}
    </div>
  );

  return (
    <div>
      <EnteteSection
        titre="Alertes"
        description="Alertes générées automatiquement par les événements concernant les parcelles."
      />
      <Tabs defaultValue="actives">
        <TabsList>
          <TabsTrigger value="actives">Actives ({actives.length})</TabsTrigger>
          <TabsTrigger value="traitees">Traitées ({traitees.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="actives">
          <Liste items={actives} />
        </TabsContent>
        <TabsContent value="traitees">
          <Liste items={traitees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
