import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { EnteteSection, BadgeStatut } from "@/components/ui-metier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUTS_PLAINTE, formaterDate, genererNumero } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/plaintes")({
  head: () => ({
    meta: [
      { title: "Plaintes — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Enregistrement et suivi des plaintes foncières associées aux parcelles de la région Maritime.",
      },
      { property: "og:title", content: "Plaintes — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Gestion des plaintes déposées auprès du tribunal et rattachées au cadastre.",
      },
    ],
  }),
  component: PagePlaintes,
});

const schema = z.object({
  parcelle_id: z.string().uuid({ message: "Sélectionnez une parcelle" }),
  plaignant: z.string().trim().min(3).max(120),
  partie_adverse: z.string().trim().max(120).optional(),
  motif: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1000).optional(),
});

function PagePlaintes() {
  const { peutEcrireTribunal, user } = useAuth();
  const queryClient = useQueryClient();
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("tous");
  const [ouvert, setOuvert] = useState(false);
  const [parcelleId, setParcelleId] = useState("");
  const [enCours, setEnCours] = useState(false);

  const { data: plaintes = [] } = useQuery({
    queryKey: ["plaintes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plaintes")
        .select("*, parcelles(code_parcelle, commune, prefecture)")
        .order("date_depot", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: parcelles = [] } = useQuery({
    queryKey: ["parcelles-liste"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcelles")
        .select("id, code_parcelle, commune")
        .order("code_parcelle");
      if (error) throw error;
      return data;
    },
  });

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return plaintes.filter((p) => {
      const correspond =
        !q ||
        [p.numero, p.plaignant, p.partie_adverse ?? "", p.motif, p.parcelles?.code_parcelle ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return correspond && (statut === "tous" || p.statut === statut);
    });
  }, [plaintes, recherche, statut]);

  async function creer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      parcelle_id: parcelleId,
      plaignant: String(fd.get("plaignant") ?? ""),
      partie_adverse: String(fd.get("partie_adverse") ?? "") || undefined,
      motif: String(fd.get("motif") ?? ""),
      description: String(fd.get("description") ?? "") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.from("plaintes").insert({
      parcelle_id: parsed.data.parcelle_id,
      plaignant: parsed.data.plaignant,
      motif: parsed.data.motif,
      partie_adverse: parsed.data.partie_adverse ?? null,
      description: parsed.data.description ?? null,
      numero: genererNumero("PL"),
      created_by: user?.id ?? null,
    });
    setEnCours(false);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    toast.success("Plainte enregistrée — une alerte a été générée.");
    setOuvert(false);
    setParcelleId("");
    ["plaintes", "alertes", "notifications", "tableau-de-bord"].forEach((k) =>
      queryClient.invalidateQueries({ queryKey: [k] }),
    );
  }

  async function changerStatut(id: string, valeur: string) {
    const { error } = await supabase
      .from("plaintes")
      .update({ statut: valeur as "enregistree" })
      .eq("id", id);
    if (error) {
      toast.error("Modification impossible.");
      return;
    }
    toast.success("Statut mis à jour");
    void queryClient.invalidateQueries({ queryKey: ["plaintes"] });
  }

  return (
    <div>
      <EnteteSection
        titre="Plaintes"
        description="Plaintes foncières enregistrées et rattachées à une parcelle."
        actions={
          peutEcrireTribunal ? (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Enregistrer une plainte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle plainte</DialogTitle>
                  <DialogDescription>
                    L'enregistrement génère automatiquement une alerte et une entrée dans
                    l'historique de la parcelle.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={creer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Parcelle concernée</Label>
                    <Select value={parcelleId} onValueChange={setParcelleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une parcelle" />
                      </SelectTrigger>
                      <SelectContent>
                        {parcelles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code_parcelle} — {p.commune}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaignant">Plaignant</Label>
                    <Input id="plaignant" name="plaignant" required maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partie_adverse">Partie adverse</Label>
                    <Input id="partie_adverse" name="partie_adverse" maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motif">Motif</Label>
                    <Input id="motif" name="motif" required maxLength={160} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={4} maxLength={1000} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enCours}>
                      Enregistrer la plainte
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Numéro, plaignant, parcelle…"
                className="pl-9"
                maxLength={100}
              />
            </div>
            <Select value={statut} onValueChange={setStatut}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous statuts</SelectItem>
                {Object.entries(STATUTS_PLAINTE).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Plaignant / Partie adverse</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Dépôt</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrees.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.numero}</TableCell>
                    <TableCell>{p.parcelles?.code_parcelle ?? "—"}</TableCell>
                    <TableCell>
                      {p.plaignant}
                      <span className="block text-xs text-muted-foreground">
                        contre {p.partie_adverse ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-72">{p.motif}</TableCell>
                    <TableCell className="whitespace-nowrap">{formaterDate(p.date_depot)}</TableCell>
                    <TableCell>
                      {peutEcrireTribunal ? (
                        <Select value={p.statut} onValueChange={(v) => changerStatut(p.id, v)}>
                          <SelectTrigger className="w-52">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUTS_PLAINTE).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <BadgeStatut valeur={p.statut} type="plainte" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtrees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Aucune plainte enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
