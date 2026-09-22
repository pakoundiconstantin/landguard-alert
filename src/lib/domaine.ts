/** Libellés, couleurs et constantes métier du système SIG foncier. */

export const PREFECTURES = [
  "Golfe",
  "Agoè-Nyivé",
  "Bas-Mono",
  "Lacs",
  "Vo",
  "Yoto",
  "Avé",
  "Zio",
] as const;

export const ROLES = [
  { value: "administrateur", label: "Administrateur" },
  { value: "cadastre", label: "Agent du cadastre" },
  { value: "tribunal", label: "Agent du tribunal" },
  { value: "consultation", label: "Utilisateur en consultation" },
] as const;

export type RoleValue = (typeof ROLES)[number]["value"];

export const STATUTS_PARCELLE: Record<string, { label: string; couleur: string }> = {
  actif: { label: "Actif", couleur: "#2f6f52" },
  en_litige: { label: "En litige", couleur: "#c0392b" },
  decision_rendue: { label: "Décision rendue", couleur: "#c98a1e" },
  mis_a_jour: { label: "Mis à jour", couleur: "#2f6f52" },
  suspendu: { label: "Suspendu", couleur: "#6b7280" },
};

export const STATUTS_PLAINTE: Record<string, string> = {
  enregistree: "Enregistrée",
  en_examen: "En examen",
  transformee_en_litige: "Transformée en litige",
  rejetee: "Rejetée",
  close: "Close",
};

export const STATUTS_LITIGE: Record<string, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  en_attente_decision: "En attente de décision",
  decide: "Décidé",
  resolu: "Résolu",
  cloture: "Clôturé",
};

export const ORDRE_LITIGE = [
  "nouveau",
  "en_cours",
  "en_attente_decision",
  "decide",
  "resolu",
  "cloture",
] as const;

export const PRIORITES: Record<string, string> = {
  faible: "Faible",
  moyen: "Moyen",
  eleve: "Élevé",
  critique: "Critique",
};

export function formaterDate(valeur?: string | null) {
  if (!valeur) return "—";
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formaterDateHeure(valeur?: string | null) {
  if (!valeur) return "—";
  return new Date(valeur).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formaterSuperficie(m2: number | null | undefined) {
  if (m2 == null) return "—";
  return `${new Intl.NumberFormat("fr-FR").format(m2)} m²`;
}

/** Génère un numéro de dossier lisible, ex. PL-2026-A1B2. */
export function genererNumero(prefixe: string) {
  const annee = new Date().getFullYear();
  const suffixe = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefixe}-${annee}-${suffixe}`;
}
