import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Swords, Trophy, XCircle, Percent, Radar, Flame, ArrowRight, Code2, LogIn, Sparkles, Terminal } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { AppShell, Loading, Panel, PlayerAvatar, StatCard, TierBadge } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { useUser, statsOf } from "@/lib/store";
import { fetchPlatformStats, fetchPlayers, fetchProblems, type PlatformStats } from "@/lib/api";
import { DIFF_CLASS, formatDuration, type Player, type Problem } from "@/lib/data";
import { cn } from "@/lib/utils";

export { DashboardSkeleton };

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

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [playersMap, setPlayersMap] = useState<Map<string, Player>>(new Map());
  const [problemsMap, setProblemsMap] = useState<Map<string, Problem>>(new Map());
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      fetchPlatformStats().then(setPlatformStats).catch(console.error),
      fetchPlayers()
        .then((players) => setPlayersMap(new Map(players.map((p) => [p.id, p]))))
        .catch(console.error),
      fetchProblems()
        .then((problems) => setProblemsMap(new Map(problems.map((p) => [p.id, p]))))
        .catch(console.error),
    ]).finally(() => {
      setDataLoaded(true);
    });
  }, []);

  // During SSR, or while client auth is checking or user profile or page data is loading from API:
  if (!mounted || isLoading || (isAuthenticated && (!user || !dataLoaded)) || (!isAuthenticated && !dataLoaded)) {
    return <DashboardSkeleton />;
  }

  // Only show guest hero if definitively unauthenticated
  if (!user && !isAuthenticated) {
    const featuredProblems = Array.from(problemsMap.values()).slice(0, 4);

    return (
      <AppShell>
        <div className="flex flex-col gap-8">
          {/* Guest Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Real-time Competitive Coding
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Code Fast. Duel Live. <span className="text-gradient-brand">Win Big.</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Challenge developers in 1v1 algorithmic duels or practice solo in our Judge0-powered sandbox. Both players receive the exact same problem, synchronized countdowns, and live test execution.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="shadow-glow">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In to Duel
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/problems">
                    <Code2 className="mr-2 h-4 w-4" /> Practice Solo Sandbox
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Platform Quick Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Online Battlers"
              value={platformStats?.activeBattlers?.toLocaleString() || "1,420"}
              icon={Radar}
              tone="accent"
            />
            <StatCard
              label="Problems Available"
              value={problemsMap.size || "12"}
              icon={Code2}
              tone="default"
            />
            <StatCard
              label="Execution Engine"
              value="Judge0"
              icon={Terminal}
              tone="success"
            />
            <StatCard
              label="Battles Today"
              value={platformStats?.matchesToday?.toLocaleString() || "3,890"}
              icon={Swords}
              tone="warning"
            />
          </div>

          {/* Featured Problems for Immediate Solo Practice */}
          <Panel
            title="Featured Problems — Try Practice Mode Now"
            action={
              <Link to="/problems" className="inline-flex items-center text-xs text-primary hover:underline">
                View all ({problemsMap.size}) <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-background/50 p-4 transition-colors hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{prob.title}</span>
                      <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase", DIFF_CLASS[prob.difficulty])}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{prob.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{prob.tags.slice(0, 2).join(", ")}</span>
                    <Button asChild size="sm" variant="secondary" className="h-8 text-xs">
                      <Link to="/practice/$problemId" params={{ problemId: prob.id }}>
                        <Terminal className="mr-1.5 h-3.5 w-3.5" /> Practice Solo
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const s = statsOf(user);
  const recent = user.matches ? user.matches.slice(0, 5) : [];
  const weekly = user.weeklyActivity || [];

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
              <span className="text-muted-foreground">
                Win rate <span className="font-semibold text-foreground">{s.winRate}%</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Flame className="h-4 w-4 text-warning" /> {s.streak} streak
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} className="relative overflow-hidden rounded-xl border border-primary/40 bg-card p-6 shadow-glow lg:col-span-2">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  {platformStats?.activeBattlers ? `${platformStats.activeBattlers.toLocaleString()} players online` : "Live Matchmaking Queue"}
                </span>
                <h2 className="mt-3 text-3xl font-black">Ready for Battle?</h2>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Match with an opponent within ±100 of your rating, or practice solo with real-time test verification.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 px-6 text-sm shadow-glow">
                  <Link to="/matchmaking">
                    <Radar className="mr-2 h-4 w-4" /> Find Match
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm border-border bg-background/60 hover:bg-background">
                  <Link to="/problems">
                    <Code2 className="mr-2 h-4 w-4" /> Practice Solo
                  </Link>
                </Button>
              </div>
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
                <BarChart data={weekly}>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={24} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="wins" fill="var(--success)" radius={[4, 4, 0, 0]} name="Wins" />
                  <Bar dataKey="losses" fill="var(--destructive)" radius={[4, 4, 0, 0]} name="Losses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Recent Battles"
            action={
              <Link to="/history" className="inline-flex items-center text-xs text-primary hover:underline">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            }
          >
            <ul className="divide-y divide-border text-sm">
              {recent.map((m) => {
                const opp = playersMap.get(m.opponentId);
                const prob = problemsMap.get(m.problemId);
                return (
                  <li key={m.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          m.result === "win" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {m.result}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{prob?.title || m.problemId}</div>
                        <div className="truncate text-xs text-muted-foreground">vs @{opp?.handle || m.opponentId}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn("font-mono font-semibold", m.delta > 0 ? "text-success" : "text-destructive")}>
                        {m.delta > 0 ? "+" : ""}
                        {m.delta}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDuration(m.duration)}</div>
                    </div>
                  </li>
                );
              })}
              {recent.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">No matches played yet.</li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
