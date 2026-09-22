import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MapPinned, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREFECTURES, ROLES } from "@/lib/domaine";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — SIG Foncier Maritime" },
      {
        name: "description",
        content:
          "Espace sécurisé des agents du cadastre, du tribunal et des administrateurs du système d'alerte foncier.",
      },
      { property: "og:title", content: "Connexion — SIG Foncier Maritime" },
      {
        property: "og:description",
        content: "Accès réservé aux acteurs autorisés de la gestion foncière du Sud-Togo.",
      },
    ],
  }),
  component: PageAuth,
});

const schemaConnexion = z.object({
  email: z.string().trim().email({ message: "Adresse e-mail invalide" }).max(255),
  motDePasse: z.string().min(8, { message: "8 caractères minimum" }).max(72),
});

const schemaInscription = schemaConnexion.extend({
  nomComplet: z.string().trim().min(3, { message: "Nom complet requis" }).max(120),
  fonction: z.string().trim().max(120).optional(),
});

function PageAuth() {
  const navigate = useNavigate();
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/tableau-de-bord", replace: true });
    });
  }, [navigate]);

  async function connexion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schemaConnexion.safeParse({
      email: fd.get("email"),
      motDePasse: fd.get("motDePasse"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.motDePasse,
    });
    setEnCours(false);
    if (error) {
      toast.error("Identifiants incorrects ou compte inexistant.");
      return;
    }
    toast.success("Connexion réussie");
    navigate({ to: "/tableau-de-bord" });
  }

  async function inscription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schemaInscription.safeParse({
      email: fd.get("email"),
      motDePasse: fd.get("motDePasse"),
      nomComplet: fd.get("nomComplet"),
      fonction: fd.get("fonction") ?? undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    const role = String(fd.get("role") ?? "consultation");
    const prefecture = String(fd.get("prefecture") ?? "");

    setEnCours(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.motDePasse,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error || !data.user) {
      setEnCours(false);
      toast.error(error?.message ?? "Création du compte impossible");
      return;
    }

    await supabase.from("profiles").insert({
      id: data.user.id,
      nom_complet: parsed.data.nomComplet,
      email: parsed.data.email,
      fonction: parsed.data.fonction ?? null,
      prefecture: prefecture || null,
    });
    await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: role as "administrateur" | "cadastre" | "tribunal" | "consultation",
    });

    setEnCours(false);
    toast.success("Compte créé. Bienvenue sur la plateforme.");
    navigate({ to: "/tableau-de-bord" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="bg-grid-cadastre absolute inset-0 opacity-30" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold">
            <MapPinned className="size-6 text-sidebar-primary" />
            SIG Foncier Maritime
          </Link>
        </div>
        <div className="relative max-w-md space-y-4">
          <h2 className="font-display text-3xl font-semibold text-balance-title">
            Centraliser les parcelles, tracer les litiges, alerter les acteurs.
          </h2>
          <p className="text-sm text-sidebar-foreground/80">
            Système d'alerte SIG Web pour la gestion des litiges fonciers en lien avec le cadastre —
            région Maritime du Sud-Togo.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-sidebar-foreground/70">
          <ShieldCheck className="size-4" />
          Accès contrôlé par rôle : administrateur, cadastre, tribunal, consultation.
        </p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-panel">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Espace professionnel</CardTitle>
            <CardDescription>
              Connectez-vous avec vos identifiants institutionnels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="connexion">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connexion">Connexion</TabsTrigger>
                <TabsTrigger value="inscription">Créer un compte</TabsTrigger>
              </TabsList>

              <TabsContent value="connexion">
                <form onSubmit={connexion} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motDePasse">Mot de passe</Label>
                    <Input
                      id="motDePasse"
                      name="motDePasse"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={enCours}>
                    {enCours && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="inscription">
                <form onSubmit={inscription} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomComplet">Nom complet</Label>
                    <Input id="nomComplet" name="nomComplet" required maxLength={120} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Profil</Label>
                      <Select name="role" defaultValue="consultation">
                        <SelectTrigger id="role">
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prefecture">Préfecture</Label>
                      <Select name="prefecture" defaultValue="Golfe">
                        <SelectTrigger id="prefecture">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fonction">Fonction (facultatif)</Label>
                    <Input id="fonction" name="fonction" maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-i">Adresse e-mail</Label>
                    <Input id="email-i" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mdp-i">Mot de passe</Label>
                    <Input id="mdp-i" name="motDePasse" type="password" required minLength={8} />
                  </div>
                  <Button type="submit" className="w-full" disabled={enCours}>
                    {enCours && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Créer le compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
