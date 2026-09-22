import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CarteParcelles } from "@/components/carte-parcelles";
import { EnteteSection, BadgeStatut } from "@/components/ui-metier";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREFECTURES, STATUTS_PARCELLE, formaterSuperficie } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/carte")({
  head: () => ({
    meta: [
      { title: "Carte des parcelles — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Carte interactive des parcelles géoréférencées de la région Maritime avec identification des parcelles en litige.",
      },
      { property: "og:title", content: "Carte des parcelles — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Visualisation cartographique des parcelles et de leur statut foncier.",
      },
    ],
  }),
  component: PageCarte,
});

function PageCarte() {
  const [recherche, setRecherche] = useState("");
  const [prefecture, setPrefecture] = useState("toutes");
  const [statut, setStatut] = useState("tous");
  const [active, setActive] = useState<string | null>(null);

  const { data: parcelles = [] } = useQuery({
    queryKey: ["parcelles-carte"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcelles")
        .select(
          "id, code_parcelle, reference_cadastrale, commune, prefecture, proprietaire, statut, superficie_m2, latitude, longitude, geometrie",
        )
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
        [p.code_parcelle, p.reference_cadastrale, p.commune, p.proprietaire ?? ""]
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

  return (
    <div>
      <EnteteSection
        titre="Carte des parcelles"
        description="Sélectionnez une parcelle sur la carte ou dans la liste pour consulter sa fiche."
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="order-2 lg:order-1">
          <CardContent className="space-y-3 pt-6">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Référence, code, commune, propriétaire…"
                className="pl-9"
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
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

            <p className="text-xs text-muted-foreground">
              {filtrees.length} parcelle(s) affichée(s)
            </p>

            <ScrollArea className="h-[52vh] pr-2">
              <div className="space-y-2">
                {filtrees.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      active === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{p.code_parcelle}</span>
                      <BadgeStatut valeur={p.statut} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.commune} — {p.prefecture} · {formaterSuperficie(p.superficie_m2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.proprietaire ?? "Propriétaire non renseigné"}
                    </p>
                    <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0">
                      <Link to="/parcelles/$id" params={{ id: p.id }}>
                        Ouvrir la fiche
                      </Link>
                    </Button>
                  </button>
                ))}
                {filtrees.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun résultat.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="order-1 lg:order-2">
          <CarteParcelles parcelles={filtrees} parcelleActive={active} onSelection={setActive} />
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {Object.entries(STATUTS_PARCELLE).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-sm"
                  style={{ backgroundColor: v.couleur }}
                />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
