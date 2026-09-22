import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUTS_LITIGE, STATUTS_PARCELLE, STATUTS_PLAINTE, PRIORITES } from "@/lib/domaine";

export function EnteteSection({
  titre,
  description,
  actions,
}: {
  titre: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">{titre}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const CLASSES: Record<string, string> = {
  neutre: "bg-muted text-muted-foreground",
  vert: "bg-success/15 text-success border-success/30",
  rouge: "bg-destructive/12 text-destructive border-destructive/30",
  ocre: "bg-warning/20 text-warning-foreground border-warning/40",
  bleu: "bg-info/12 text-info border-info/30",
};

function teinte(valeur: string) {
  if (["en_litige", "critique", "rejetee"].includes(valeur)) return "rouge";
  if (["decision_rendue", "en_attente_decision", "eleve", "en_examen"].includes(valeur))
    return "ocre";
  if (["resolu", "cloture", "actif", "mis_a_jour", "close"].includes(valeur)) return "vert";
  if (["en_cours", "nouveau", "enregistree", "decide", "moyen"].includes(valeur)) return "bleu";
  return "neutre";
}

export function BadgeStatut({
  valeur,
  type = "parcelle",
}: {
  valeur: string;
  type?: "parcelle" | "plainte" | "litige" | "priorite";
}) {
  const libelle =
    type === "parcelle"
      ? (STATUTS_PARCELLE[valeur]?.label ?? valeur)
      : type === "plainte"
        ? (STATUTS_PLAINTE[valeur] ?? valeur)
        : type === "litige"
          ? (STATUTS_LITIGE[valeur] ?? valeur)
          : (PRIORITES[valeur] ?? valeur);

  return (
    <Badge variant="outline" className={cn("border font-medium", CLASSES[teinte(valeur)])}>
      {libelle}
    </Badge>
  );
}

export function CarteIndicateur({
  libelle,
  valeur,
  icone: Icone,
  accent,
}: {
  libelle: string;
  valeur: number | string;
  icone: React.ComponentType<{ className?: string }>;
  accent?: "primaire" | "alerte" | "ocre";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-panel/40">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{libelle}</p>
        <Icone
          className={cn(
            "size-4",
            accent === "alerte"
              ? "text-destructive"
              : accent === "ocre"
                ? "text-accent"
                : "text-primary",
          )}
        />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{valeur}</p>
    </div>
  );
}
