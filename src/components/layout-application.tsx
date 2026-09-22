import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Gavel,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  Menu,
  ScrollText,
  Scale,
  Settings,
  Table2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formaterDateHeure, ROLES } from "@/lib/domaine";
import { cn } from "@/lib/utils";

const NAVIGATION = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icone: LayoutDashboard },
  { to: "/carte", label: "Carte des parcelles", icone: Map },
  { to: "/parcelles", label: "Parcelles", icone: Table2 },
  { to: "/plaintes", label: "Plaintes", icone: ScrollText },
  { to: "/litiges", label: "Litiges", icone: Gavel },
  { to: "/decisions", label: "Décisions judiciaires", icone: Scale },
  { to: "/alertes", label: "Alertes", icone: AlertTriangle },
] as const;

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { estAdmin, profil, roles } = useAuth();
  const chemin = useRouterState({ select: (s) => s.location.pathname });

  const liens = estAdmin
    ? [...NAVIGATION, { to: "/administration", label: "Administration", icone: Settings } as const]
    : NAVIGATION;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link
          to="/tableau-de-bord"
          onClick={onNavigate}
          className="flex items-center gap-2 font-display text-sm font-semibold"
        >
          <MapPinned className="size-5 text-sidebar-primary" />
          SIG Foncier Maritime
        </Link>
        <p className="mt-1 text-xs text-sidebar-foreground/70">Région Maritime · Sud-Togo</p>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {liens.map((l) => {
            const actif = chemin.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  actif
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
              >
                <l.icone className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border px-5 py-4 text-xs">
        <p className="font-medium text-sidebar-foreground">{profil?.nom_complet || "Utilisateur"}</p>
        <p className="mt-0.5 text-sidebar-foreground/70">
          {roles.map((r) => ROLES.find((x) => x.value === r)?.label ?? r).join(", ") || "Sans rôle"}
        </p>
      </div>
    </div>
  );
}

function ClocheNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });

  const nonLues = notifications.filter((n) => !n.lu).length;

  async function toutMarquerLu() {
    await supabase.from("notifications").update({ lu: true }).eq("lu", false);
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          {nonLues > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {nonLues}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          <Button variant="ghost" size="sm" onClick={toutMarquerLu}>
            Tout marquer comme lu
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Aucune notification.</p>
          )}
          {notifications.map((n) => (
            <div key={n.id} className="border-b px-4 py-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{n.titre}</p>
                {!n.lu && <Badge variant="secondary">Nouveau</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formaterDateHeure(n.created_at)}
              </p>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function LayoutApplication({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOuvert, setMenuOuvert] = useState(false);

  async function deconnexion() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Navigation />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:px-8">
          <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Navigation onNavigate={() => setMenuOuvert(false)} />
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <ClocheNotifications />
            <Button variant="outline" size="sm" onClick={deconnexion}>
              <LogOut className="size-4" /> Déconnexion
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
