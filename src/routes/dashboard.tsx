import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Swords, Trophy, XCircle, Percent, Radar, Flame, ArrowRight } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Loading, Panel, PlayerAvatar, StatCard, TierBadge } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { useUser, statsOf } from "@/lib/store";
import { PLAYERS, getPlayer, getProblem, formatDuration } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CodeDuel" },
      { name: "description", content: "Your CodeDuel rating, stats, weekly activity and recent battles." },
      { property: "og:title", content: "Dashboard — CodeDuel" },
      { property: "og:description", content: "Your CodeDuel rating, stats and recent battles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const WEEK = [
  { day: "Mon", wins: 3, losses: 1 },
  { day: "Tue", wins: 2, losses: 2 },
  { day: "Wed", wins: 5, losses: 1 },
  { day: "Thu", wins: 1, losses: 3 },
  { day: "Fri", wins: 4, losses: 2 },
  { day: "Sat", wins: 6, losses: 2 },
  { day: "Sun", wins: 3, losses: 1 },
];

function Dashboard() {
  const { user } = useUser();
  if (!user) return <AppShell><Loading /></AppShell>;
  const s = statsOf(user);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-muted-foreground">Ready to defend your rating today?</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <PlayerAvatar name={user.name} hue={280} size={56} />
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">@{user.handle}</div>
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Rating</div>
                <div className="text-4xl font-black text-gradient-brand">{user.rating}</div>
              </div>
              <TierBadge rating={user.rating} />
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Win rate <span className="font-semibold text-foreground">{s.winRate}%</span></span>
              <span className="flex items-center gap-1 text-muted-foreground"><Flame className="h-4 w-4 text-warning" /> {s.streak} streak</span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} className="relative overflow-hidden rounded-xl border border-primary/40 bg-card p-6 shadow-glow lg:col-span-2">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> 2,847 players in queue</span>
                <h2 className="mt-3 text-3xl font-black">Find a Match</h2>
                <p className="mt-2 max-w-sm text-muted-foreground">Get paired with an opponent within ±100 of your rating. Average wait: 42s.</p>
              </div>
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-glow">
                <Link to="/matchmaking"><Radar className="mr-1 h-5 w-5" /> Start Battling</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Matches" value={s.total} icon={Swords} />
          <StatCard label="Wins" value={s.wins} icon={Trophy} tone="success" />
          <StatCard label="Losses" value={s.losses} icon={XCircle} tone="destructive" />
          <StatCard label="Win Rate" value={`${s.winRate}%`} icon={Percent} tone="accent" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Weekly Activity" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK}>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={24} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="wins" stackId="a" fill="var(--primary)" />
                  <Bar dataKey="losses" stackId="a" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Top Players" action={<Link to="/leaderboard" className="text-xs text-primary hover:underline">View all</Link>}>
            <ul className="space-y-3">
              {PLAYERS.slice(0, 5).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className={cn("w-5 text-center font-mono text-sm", i < 3 ? "text-warning" : "text-muted-foreground")}>{i + 1}</span>
                  <PlayerAvatar name={p.name} hue={p.hue} size={32} />
                  <span className="flex-1 truncate text-sm font-medium">{p.handle}</span>
                  <span className="font-mono text-sm">{p.rating}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Recent Matches" action={<Link to="/history" className="flex items-center gap-1 text-xs text-primary hover:underline">Full history <ArrowRight className="h-3 w-3" /></Link>}>
          <ul className="divide-y divide-border">
            {user.matches.slice(0, 5).map((m) => {
              const opp = getPlayer(m.opponentId);
              return (
                <li key={m.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className={cn("w-12 rounded px-2 py-1 text-center text-xs font-bold", m.result === "win" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                    {m.result === "win" ? "WIN" : "LOSS"}
                  </span>
                  <PlayerAvatar name={opp?.name ?? "?"} hue={opp?.hue} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">vs {opp?.handle}</div>
                    <div className="truncate text-xs text-muted-foreground">{getProblem(m.problemId).title}</div>
                  </div>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{formatDuration(m.duration)}</span>
                  <span className={cn("w-12 text-right font-mono text-sm font-semibold", m.delta > 0 ? "text-success" : "text-destructive")}>{m.delta > 0 ? "+" : ""}{m.delta}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
