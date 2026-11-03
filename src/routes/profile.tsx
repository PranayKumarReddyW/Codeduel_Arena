import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Check, Swords, Trophy, Flame, Target, User as UserIcon, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Loading, Panel, PlayerAvatar, StatCard, TierBadge } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser, statsOf } from "@/lib/store";
import { fetchRatingProgression, type RatingProgressionPoint } from "@/lib/api";
import { LANGUAGES, type Language } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — CodeDuel" },
      { name: "description", content: "Your CodeDuel profile: rating progression, stats, languages and match history." },
      { property: "og:title", content: "Profile — CodeDuel" },
      { property: "og:description", content: "Rating progression, stats and match history." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, update, isAuthenticated, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [progression, setProgression] = useState<RatingProgressionPoint[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.rating) {
      fetchRatingProgression().then(setProgression).catch(console.error);
    }
  }, [user?.rating]);

  if (!mounted || isLoading || (isAuthenticated && !user)) {
    return (
      <AppShell>
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card p-6">
            <Skeleton className="h-32 w-full rounded-xl mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="mt-3 h-8 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user && !isAuthenticated) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sign In to View Your Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your rating progression, win streaks, favorite programming languages, and match statistics.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="shadow-glow">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/problems">Browse Problems</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }
  const s = statsOf(user);

  const chart = progression.length > 0
    ? progression
    : (user.matches || []).slice().reverse().map((m, i) => ({
        n: i + 1,
        rating: m.ratingAfter,
        date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      }));

  const peak = Math.max(...chart.map((c) => c.rating), user.rating);
  const langCount = (l: Language) => (user.matches || []).filter((m) => m.language === l).length;

  const toggleLang = (l: Language) => {
    const current = user.languages || [];
    const nextLanguages = current.includes(l) ? current.filter((x) => x !== l) : [...current, l];
    update((u) => ({ ...u, languages: nextLanguages }));
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-card via-primary/10 to-card border-b border-border/40">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <PlayerAvatar name={user.name} hue={280} size={96} className="-mt-14 ring-4 ring-card shadow-lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <TierBadge rating={user.rating} />
              </div>
              <div className="text-sm text-muted-foreground">@{user.handle}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Rating · Peak {peak}</div>
              <div className="text-4xl font-black text-gradient-brand">{user.rating}</div>
            </div>
          </div>
          <div className="border-t border-border px-6 py-4">
            {editing ? (
              <div className="flex gap-2">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[60px]" />
                <Button
                  size="icon"
                  onClick={() => {
                    update((u) => ({ ...u, bio }));
                    setEditing(false);
                  }}
                  aria-label="Save bio"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setBio(user.bio);
                    setEditing(true);
                  }}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Matches" value={s.total} icon={Swords} />
          <StatCard label="Wins" value={s.wins} icon={Trophy} tone="success" sub={`${s.losses} losses`} />
          <StatCard label="Win Rate" value={`${s.winRate}%`} icon={Target} tone="accent" />
          <StatCard label="Current Streak" value={s.streak} icon={Flame} tone="destructive" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Rating Progression" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis domain={["dataMin - 30", "dataMax + 30"]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="rating" stroke="var(--primary)" strokeWidth={2} fill="url(#rg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Languages">
            <div className="space-y-2">
              {LANGUAGES.map((l) => {
                const active = (user.languages || []).includes(l.id);
                const count = langCount(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLang(l.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                      active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border hover:bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")} />
                      <span className="text-sm font-medium">{l.label}</span>
                    </div>
                    <span className="font-mono text-xs">{count} matches</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
