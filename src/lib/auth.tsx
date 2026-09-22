import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { RoleValue } from "@/lib/domaine";

export interface Profil {
  id: string;
  nom_complet: string;
  email: string;
  fonction: string | null;
  prefecture: string | null;
  actif: boolean;
}

interface EtatAuth {
  session: Session | null;
  user: User | null;
  profil: Profil | null;
  roles: RoleValue[];
  chargement: boolean;
  aRole: (...roles: RoleValue[]) => boolean;
  peutEcrireCadastre: boolean;
  peutEcrireTribunal: boolean;
  estAdmin: boolean;
  rafraichir: () => Promise<void>;
}

const AuthContext = createContext<EtatAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [roles, setRoles] = useState<RoleValue[]>([]);
  const [chargement, setChargement] = useState(true);

  const chargerDonnees = async (userId: string | undefined) => {
    if (!userId) {
      setProfil(null);
      setRoles([]);
      return;
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfil((p as Profil) ?? null);
    setRoles(((r ?? []) as { role: RoleValue }[]).map((x) => x.role));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => {
        void chargerDonnees(s?.user?.id);
      }, 0);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await chargerDonnees(data.session?.user?.id);
      setChargement(false);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  const aRole = (...r: RoleValue[]) => r.some((x) => roles.includes(x));
  const estAdmin = roles.includes("administrateur");

  const valeur: EtatAuth = {
    session,
    user: session?.user ?? null,
    profil,
    roles,
    chargement,
    aRole,
    estAdmin,
    peutEcrireCadastre: estAdmin || roles.includes("cadastre"),
    peutEcrireTribunal: estAdmin || roles.includes("tribunal"),
    rafraichir: async () => {
      const { data } = await supabase.auth.getUser();
      await chargerDonnees(data.user?.id);
    },
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
