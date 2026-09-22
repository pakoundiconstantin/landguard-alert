import { createFileRoute, Link } from "@tanstack/react-router";
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
import { STATUTS_LITIGE, formaterDate, genererNumero } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/litiges")({
  head: () => ({
    meta: [
      { title: "Litiges — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Ouverture et suivi des dossiers de litiges fonciers, du statut nouveau jusqu'à la clôture.",
      },
      { property: "og:title", content: "Litiges — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Dossiers de litiges rattachés aux parcelles de la région Maritime.",
      },
    ],
  }),
  component: PageLitiges,
});

const schema = z.object({
  parcelle_id: z.string().uuid({ message: "Sélectionnez une parcelle" }),
  objet: z.string().trim().min(3).max(200),
  parties: z.string().trim().max(200).optional(),
});

function PageLitiges() {
  const { peutEcrireTribunal, user } = useAuth();
  const queryClient = useQueryClient();
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("tous");
  const [ouvert, setOuvert] = useState(false);
  const [parcelleId, setParcelleId] = useState("");
  const [plainteId, setPlainteId] = useState("aucune");
  const [enCours, setEnCours] = useState(false);

  const { data: litiges = [] } = useQuery({
    queryKey: ["litiges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("litiges")
        .select("*, parcelles(id, code_parcelle, commune, prefecture), plaintes(numero)")
        .order("date_ouverture", { ascending: false });
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

  const { data: plaintes = [] } = useQuery({
    queryKey: ["plaintes-liste"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plaintes")
        .select("id, numero, motif, parcelle_id")
        .order("date_depot", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return litiges.filter((l) => {
      const correspond =
        !q ||
        [l.numero, l.objet, l.parties ?? "", l.parcelles?.code_parcelle ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return correspond && (statut === "tous" || l.statut === statut);
    });
  }, [litiges, recherche, statut]);

  async function creer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      parcelle_id: parcelleId,
      objet: String(fd.get("objet") ?? ""),
      parties: String(fd.get("parties") ?? "") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.from("litiges").insert({
      ...parsed.data,
      plainte_id: plainteId === "aucune" ? null : plainteId,
      numero: genererNumero("LIT"),
      created_by: user?.id ?? null,
    });
    setEnCours(false);
    if (error) return toast.error("Création impossible.");
    toast.success("Litige ouvert — la parcelle est signalée en litige.");
    setOuvert(false);
    setParcelleId("");
    setPlainteId("aucune");
    ["litiges", "parcelles", "parcelles-carte", "alertes", "notifications", "tableau-de-bord"].forEach(
      (k) => queryClient.invalidateQueries({ queryKey: [k] }),
    );
  }

  async function changerStatut(id: string, valeur: string) {
    const maj: Record<string, unknown> = { statut: valeur };
    if (["resolu", "cloture"].includes(valeur)) maj.date_cloture = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("litiges").update(maj).eq("id", id);
    if (error) return toast.error("Modification impossible.");
    toast.success("Statut du litige mis à jour — alerte générée.");
    ["litiges", "parcelles", "parcelles-carte", "alertes", "notifications", "tableau-de-bord"].forEach(
      (k) => queryClient.invalidateQueries({ queryKey: [k] }),
    );
  }

  return (
    <div>
      <EnteteSection
        titre="Litiges"
        description="Dossiers de litiges : nouveau → en cours → en attente de décision → décidé → résolu / clôturé."
        actions={
          peutEcrireTribunal ? (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Ouvrir un litige
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau dossier de litige</DialogTitle>
                  <DialogDescription>
                    Le dossier est rattaché à une parcelle et peut provenir d'une plainte existante.
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
                    <Label>Plainte à l'origine (facultatif)</Label>
                    <Select value={plainteId} onValueChange={setPlainteId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aucune">Aucune</SelectItem>
                        {plaintes
                          .filter((p) => !parcelleId || p.parcelle_id === parcelleId)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.numero} — {p.motif}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objet">Objet du litige</Label>
                    <Input id="objet" name="objet" required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parties">Parties concernées</Label>
                    <Input id="parties" name="parties" placeholder="Partie A / Partie B" maxLength={200} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enCours}>
                      Ouvrir le dossier
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
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Numéro, objet, parties, parcelle…"
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
                {Object.entries(STATUTS_LITIGE).map(([k, v]) => (
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
                  <TableHead>Dossier</TableHead>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Ouverture</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtres.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-sm">
                      {l.numero}
                      {l.plaintes?.numero && (
                        <span className="block text-xs text-muted-foreground">
                          plainte {l.plaintes.numero}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {l.parcelles ? (
                        <Link
                          to="/parcelles/$id"
                          params={{ id: l.parcelles.id }}
                          className="text-primary underline"
                        >
                          {l.parcelles.code_parcelle}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-80">
                      {l.objet}
                      <span className="block text-xs text-muted-foreground">{l.parties ?? ""}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formaterDate(l.date_ouverture)}
                      {l.date_cloture && (
                        <span className="block text-xs text-muted-foreground">
                          clôturé le {formaterDate(l.date_cloture)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {peutEcrireTribunal ? (
                        <Select value={l.statut} onValueChange={(v) => changerStatut(l.id, v)}>
                          <SelectTrigger className="w-56">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUTS_LITIGE).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <BadgeStatut valeur={l.statut} type="litige" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtres.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      Aucun dossier de litige.
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
