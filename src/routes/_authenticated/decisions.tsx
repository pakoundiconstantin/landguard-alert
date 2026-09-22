import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { EnteteSection } from "@/components/ui-metier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { formaterDate, formaterDateHeure, genererNumero } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/decisions")({
  head: () => ({
    meta: [
      { title: "Décisions judiciaires — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Enregistrement des décisions judiciaires, rattachement aux dossiers de litiges et transmission au cadastre.",
      },
      { property: "og:title", content: "Décisions judiciaires — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Décisions rendues par les tribunaux sur les litiges fonciers du Sud-Togo.",
      },
    ],
  }),
  component: PageDecisions,
});

const schema = z.object({
  litige_id: z.string().uuid({ message: "Sélectionnez un dossier de litige" }),
  tribunal: z.string().trim().min(3).max(120),
  resume: z.string().trim().min(5).max(1500),
  document_url: z.string().trim().url({ message: "Lien du document invalide" }).max(500).optional(),
});

function PageDecisions() {
  const { peutEcrireTribunal, user } = useAuth();
  const queryClient = useQueryClient();
  const [ouvert, setOuvert] = useState(false);
  const [litigeId, setLitigeId] = useState("");
  const [enCours, setEnCours] = useState(false);

  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decisions")
        .select("*, litiges(numero, objet, parcelles(code_parcelle))")
        .order("date_decision", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: litiges = [] } = useQuery({
    queryKey: ["litiges-liste"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("litiges")
        .select("id, numero, objet")
        .order("date_ouverture", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function creer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const lien = String(fd.get("document_url") ?? "").trim();
    const parsed = schema.safeParse({
      litige_id: litigeId,
      tribunal: String(fd.get("tribunal") ?? ""),
      resume: String(fd.get("resume") ?? ""),
      document_url: lien || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.from("decisions").insert({
      ...parsed.data,
      numero: genererNumero("DEC"),
      created_by: user?.id ?? null,
    });
    setEnCours(false);
    if (error) return toast.error("Enregistrement impossible.");
    toast.success("Décision enregistrée — le litige et la parcelle sont mis à jour.");
    setOuvert(false);
    setLitigeId("");
    ["decisions", "litiges", "parcelles", "parcelles-carte", "alertes", "notifications", "tableau-de-bord"].forEach(
      (k) => queryClient.invalidateQueries({ queryKey: [k] }),
    );
  }

  async function transmettre(id: string) {
    const { error } = await supabase
      .from("decisions")
      .update({ statut: "transmise", date_transmission: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Transmission impossible.");
    toast.success("Décision transmise au cadastre.");
    void queryClient.invalidateQueries({ queryKey: ["decisions"] });
  }

  return (
    <div>
      <EnteteSection
        titre="Décisions judiciaires"
        description="Décisions rendues, rattachées à un dossier et transmises aux acteurs concernés."
        actions={
          peutEcrireTribunal ? (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Enregistrer une décision
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle décision</DialogTitle>
                  <DialogDescription>
                    L'enregistrement fait passer le litige au statut « décidé » et alerte le
                    cadastre.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={creer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dossier de litige</Label>
                    <Select value={litigeId} onValueChange={setLitigeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un dossier" />
                      </SelectTrigger>
                      <SelectContent>
                        {litiges.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.numero} — {l.objet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tribunal">Tribunal</Label>
                    <Input
                      id="tribunal"
                      name="tribunal"
                      placeholder="Tribunal de première instance de Lomé"
                      required
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume">Résumé de la décision</Label>
                    <Textarea id="resume" name="resume" rows={4} required maxLength={1500} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document_url">Lien du document (facultatif)</Label>
                    <Input id="document_url" name="document_url" type="url" maxLength={500} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={enCours}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Décision</TableHead>
                <TableHead>Dossier / Parcelle</TableHead>
                <TableHead>Tribunal</TableHead>
                <TableHead>Résumé</TableHead>
                <TableHead>Transmission</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm">
                    {d.numero}
                    <span className="block text-xs text-muted-foreground">
                      {formaterDate(d.date_decision)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {d.litiges?.numero ?? "—"}
                    <span className="block text-xs text-muted-foreground">
                      {d.litiges?.parcelles?.code_parcelle ?? ""}
                    </span>
                  </TableCell>
                  <TableCell>{d.tribunal}</TableCell>
                  <TableCell className="max-w-80 text-sm">{d.resume}</TableCell>
                  <TableCell>
                    {d.date_transmission ? (
                      <Badge variant="outline">{formaterDateHeure(d.date_transmission)}</Badge>
                    ) : (
                      <Badge variant="secondary">Non transmise</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {peutEcrireTribunal && !d.date_transmission && (
                      <Button variant="outline" size="sm" onClick={() => transmettre(d.id)}>
                        <Send className="size-4" /> Transmettre
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {decisions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Aucune décision enregistrée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
