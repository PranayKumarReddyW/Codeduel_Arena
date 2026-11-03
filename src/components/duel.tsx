import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Swords, LayoutDashboard, Trophy, User, History, Radar, Menu, X, LogOut, LogIn, Code2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getTier, TIER_CLASS, type Tier } from "@/lib/data";
import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-extrabold tracking-tight", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand shadow-glow">
        <Swords className="h-4 w-4 text-primary-foreground" />
      </span>
      <span className="text-lg">
        Code<span className="text-gradient-brand">Duel</span>
      </span>
    </Link>
  );
}

export function PlayerAvatar({ name, hue = 270, size = 40, className }: { name: string; hue?: number | undefined; size?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-foreground ring-2 ring-border", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, oklch(0.55 0.2 ${hue}), oklch(0.35 0.15 ${(hue + 60) % 360}))`,
      }}
    >
      {initials}
    </div>
  );
}

export function TierBadge({ rating, tier, className }: { rating?: number; tier?: Tier; className?: string }) {
  const t = tier ?? getTier(rating ?? 0);
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider", TIER_CLASS[t], className)}>
      {t}
    </span>
  );
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/problems", label: "Problems", icon: Code2 },
  { to: "/matchmaking", label: "Find Match", icon: Radar },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/history", label: "Match History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useUser();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    toast.success("Signed out successfully");
    navigate({ to: "/login" });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-foreground ring-1 ring-primary/30" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <n.icon className={cn("h-4 w-4", active && "text-primary")} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const userCard = (isLoading || (!user && isAuthenticated)) ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  ) : (user && isAuthenticated) ? (
    <div className="flex flex-col gap-2">
      <Link to="/profile" className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors">
        <PlayerAvatar name={user.name} hue={280} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.rating} · {getTier(user.rating)}</div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-center"
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
      </Button>
    </div>
  ) : (
    <Button asChild size="sm" className="w-full shadow-glow">
      <Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Sign In</Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <div className="space-y-8">
          <Logo className="px-2 pt-1" />
          {nav}
        </div>
        {userCard}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          <button onClick={() => setOpen(!open)} className="rounded-md p-2 hover:bg-muted" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[57px] z-20 space-y-4 border-b border-border bg-sidebar p-4 lg:hidden">
          {nav}
          {userCard}
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "primary", sub }: { label: string; value: ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "accent" | "success" | "destructive"; sub?: string }) {
  const tones = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-[400px] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">Loading arena…</span>
      </div>
    </div>
  );
}
