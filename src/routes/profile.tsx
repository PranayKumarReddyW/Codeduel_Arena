import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Check, Swords, Trophy, Flame, Target } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Loading, Panel, PlayerAvatar, StatCard, TierBadge } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, statsOf } from "@/lib/store";
import { LANGUAGES, getPlayer, getProblem, type Language } from "@/lib/data";
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
  const { user, update } = useUser();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  if (!user) return <AppShell><Loading /></AppShell>;
  const s = statsOf(user);
  const chart = [...user.matches].reverse().map((m, i) => ({ n: i + 1, rating: m.ratingAfter, date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }));
  const peak = Math.max(...chart.map((c) => c.rating), user.rating);
  const langCount = (l: Language) => user.matches.filter((m) => m.language === l).length;

  const toggleLang = (l: Language) =>
    update((u) => ({ ...u, languages: u.languages.includes(l) ? u.languages.filter((x) => x !== l) : [...u.languages, l] }));

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-28 bg-gradient-brand opacity-60" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <PlayerAvatar name={user.name} hue={280} size={96} className="-mt-12 ring-4 ring-card" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
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
                <Button size="icon" onClick={() => { update((u) => ({ ...u, bio })); setEditing(false); }} aria-label="Save bio"><Check className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground">{user.bio}</p>
                <Button size="sm" variant="ghost" onClick={() => { setBio(user.bio); setEditing(true); }}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
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
                const on = user.languages.includes(l.id);
                return (
                  <button key={l.id} onClick={() => toggleLang(l.id)} className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors", on ? "border-primary/40 bg-primary/10" : "border-border hover:bg-muted")}>
                    <span className="font-medium">{l.label}</span>
                    <span className="text-xs text-muted-foreground">{langCount(l.id)} matches</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Tap to toggle your preferred languages.</p>
          </Panel>
        </div>

        <Panel title="Recent Matches" action={<Link to="/history" className="text-xs text-primary hover:underline">View all</Link>}>
          <ul className="divide-y divide-border">
            {user.matches.slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                <span className={cn("h-2 w-2 rounded-full", m.result === "win" ? "bg-success" : "bg-destructive")} />
                <span className="flex-1 truncate">{getProblem(m.problemId).title}</span>
                <span className="hidden text-muted-foreground sm:inline">vs {getPlayer(m.opponentId)?.handle}</span>
                <span className={cn("w-10 text-right font-mono", m.delta > 0 ? "text-success" : "text-destructive")}>{m.delta > 0 ? "+" : ""}{m.delta}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
