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
import { PREFECTURES, STATUTS_PARCELLE, formaterSuperficie } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/parcelles/")({
  head: () => ({
    meta: [
      { title: "Parcelles — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Registre centralisé des parcelles cadastrales de la région Maritime : référence, propriétaire, superficie et statut.",
      },
      { property: "og:title", content: "Parcelles — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Recherche et gestion des informations cadastrales des parcelles.",
      },
    ],
  }),
  component: PageParcelles,
});

const schema = z.object({
  code_parcelle: z.string().trim().min(3).max(40),
  reference_cadastrale: z.string().trim().min(3).max(60),
  prefecture: z.string().trim().min(2),
  commune: z.string().trim().min(2).max(80),
  localite: z.string().trim().max(80).optional(),
  proprietaire: z.string().trim().max(120).optional(),
  type_titre: z.string().trim().max(80).optional(),
  superficie_m2: z.number().nonnegative().max(100000000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observations: z.string().trim().max(600).optional(),
});

function PageParcelles() {
  const { peutEcrireCadastre, user } = useAuth();
  const queryClient = useQueryClient();
  const [recherche, setRecherche] = useState("");
  const [prefecture, setPrefecture] = useState("toutes");
  const [statut, setStatut] = useState("tous");
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const { data: parcelles = [], isLoading } = useQuery({
    queryKey: ["parcelles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcelles")
        .select("*")
        .order("code_parcelle");
      if (error) throw error;
      return data;
    },
  });

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return parcelles.filter((p) => {
      const correspond =
        !q ||
        [p.code_parcelle, p.reference_cadastrale, p.commune, p.localite ?? "", p.proprietaire ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        correspond &&
        (prefecture === "toutes" || p.prefecture === prefecture) &&
        (statut === "tous" || p.statut === statut)
      );
    });
  }, [parcelles, recherche, prefecture, statut]);

  async function creer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const brut = {
      code_parcelle: String(fd.get("code_parcelle") ?? ""),
      reference_cadastrale: String(fd.get("reference_cadastrale") ?? ""),
      prefecture: String(fd.get("prefecture") ?? ""),
      commune: String(fd.get("commune") ?? ""),
      localite: String(fd.get("localite") ?? "") || undefined,
      proprietaire: String(fd.get("proprietaire") ?? "") || undefined,
      type_titre: String(fd.get("type_titre") ?? "") || undefined,
      superficie_m2: Number(fd.get("superficie_m2") ?? 0),
      latitude: Number(fd.get("latitude") ?? 0),
      longitude: Number(fd.get("longitude") ?? 0),
      observations: String(fd.get("observations") ?? "") || undefined,
    };
    const parsed = schema.safeParse(brut);
    if (!parsed.success) {
      toast.error("Vérifiez les champs : " + (parsed.error.issues[0]?.path.join(".") ?? ""));
      return;
    }
    setEnCours(true);
    const { error } = await supabase.from("parcelles").insert({
      ...parsed.data,
      created_by: user?.id ?? null,
    });
    setEnCours(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Ce code de parcelle existe déjà." : "Enregistrement impossible.");
      return;
    }
    toast.success("Parcelle enregistrée");
    setOuvert(false);
    void queryClient.invalidateQueries({ queryKey: ["parcelles"] });
    void queryClient.invalidateQueries({ queryKey: ["parcelles-carte"] });
  }

  return (
    <div>
      <EnteteSection
        titre="Parcelles"
        description="Registre cadastral centralisé de la région Maritime."
        actions={
          peutEcrireCadastre ? (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Nouvelle parcelle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enregistrer une parcelle</DialogTitle>
                  <DialogDescription>
                    Les coordonnées permettent de localiser la parcelle sur la carte.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={creer} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code_parcelle">Code parcelle</Label>
                    <Input id="code_parcelle" name="code_parcelle" placeholder="PAR-GLF-010" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_cadastrale">Référence cadastrale</Label>
                    <Input id="reference_cadastrale" name="reference_cadastrale" placeholder="TF-1400/GLF" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefecture-n">Préfecture</Label>
                    <Select name="prefecture" defaultValue="Golfe">
                      <SelectTrigger id="prefecture-n">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PREFECTURES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commune">Commune</Label>
                    <Input id="commune" name="commune" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localite">Localité</Label>
                    <Input id="localite" name="localite" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="superficie_m2">Superficie (m²)</Label>
                    <Input id="superficie_m2" name="superficie_m2" type="number" min={0} step="1" defaultValue={500} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proprietaire">Propriétaire / titulaire</Label>
                    <Input id="proprietaire" name="proprietaire" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type_titre">Type de titre</Label>
                    <Input id="type_titre" name="type_titre" placeholder="Titre foncier" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" name="latitude" type="number" step="0.0001" defaultValue={6.17} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" name="longitude" type="number" step="0.0001" defaultValue={1.23} required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="observations">Observations</Label>
                    <Textarea id="observations" name="observations" rows={3} maxLength={600} />
                  </div>
                  <DialogFooter className="sm:col-span-2">
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
        <CardContent className="pt-6">
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_200px_200px]">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une parcelle…"
                className="pl-9"
                maxLength={100}
              />
            </div>
            <Select value={prefecture} onValueChange={setPrefecture}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes préfectures</SelectItem>
                {PREFECTURES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statut} onValueChange={setStatut}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous statuts</SelectItem>
                {Object.entries(STATUTS_PARCELLE).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Commune / Préfecture</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}>Chargement…</TableCell>
                  </TableRow>
                )}
                {filtrees.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.code_parcelle}</TableCell>
                    <TableCell>{p.reference_cadastrale}</TableCell>
                    <TableCell>
                      {p.commune} <span className="text-muted-foreground">/ {p.prefecture}</span>
                    </TableCell>
                    <TableCell>{p.proprietaire ?? "—"}</TableCell>
                    <TableCell>{formaterSuperficie(p.superficie_m2)}</TableCell>
                    <TableCell>
                      <BadgeStatut valeur={p.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/parcelles/$id" params={{ id: p.id }}>
                          Fiche
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtrees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Aucune parcelle ne correspond à la recherche.
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
