import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { EnteteSection } from "@/components/ui-metier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, formaterDateHeure, type RoleValue } from "@/lib/domaine";

export const Route = createFileRoute("/_authenticated/administration")({
  head: () => ({
    meta: [
      { title: "Administration — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Gestion des utilisateurs, des rôles et des droits d'accès du système d'alerte foncier.",
      },
      { property: "og:title", content: "Administration — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Supervision des comptes et des habilitations de la plateforme.",
      },
    ],
  }),
  component: PageAdministration,
});

function PageAdministration() {
  const { estAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["utilisateurs"],
    enabled: estAdmin,
    queryFn: async () => {
      const [{ data: profils }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("*"),
      ]);
      return (profils ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });

  const { data: journal = [] } = useQuery({
    queryKey: ["journal"],
    enabled: estAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("alertes")
        .select("id, type_evenement, message, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  if (!estAdmin) {
    return (
      <p className="text-sm text-muted-foreground">
        Cette section est réservée aux administrateurs.
      </p>
    );
  }

  async function changerRole(userId: string, role: RoleValue) {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error("Modification du rôle impossible.");
    toast.success("Rôle mis à jour");
    void queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
  }

  async function basculerActif(userId: string, actif: boolean) {
    const { error } = await supabase.from("profiles").update({ actif }).eq("id", userId);
    if (error) return toast.error("Modification impossible.");
    toast.success(actif ? "Compte activé" : "Compte désactivé");
    void queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
  }

  return (
    <div>
      <EnteteSection
        titre="Administration"
        description="Utilisateurs, rôles, droits d'accès et supervision du système."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utilisateurs ({utilisateurs.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Préfecture</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Compte actif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilisateurs.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.nom_complet || "—"}
                    {u.fonction && (
                      <span className="block text-xs text-muted-foreground">{u.fonction}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>{u.prefecture ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={u.roles[0] ?? "consultation"}
                      onValueChange={(v) => changerRole(u.id, v as RoleValue)}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.actif}
                        onCheckedChange={(v) => basculerActif(u.id, v)}
                      />
                      <Badge variant={u.actif ? "outline" : "secondary"}>
                        {u.actif ? "Actif" : "Désactivé"}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {utilisateurs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Aucun utilisateur enregistré.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Journal des événements système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {journal.map((j) => (
            <div key={j.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <span className="font-medium">{j.type_evenement}</span> — {j.message}
              <span className="block font-mono text-[11px] text-muted-foreground">
                {formaterDateHeure(j.created_at)}
              </span>
            </div>
          ))}
          {journal.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun événement.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
