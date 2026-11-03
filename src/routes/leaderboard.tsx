import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, Crown, Loader2 } from "lucide-react";
import { AppShell, PlayerAvatar, TierBadge, Loading } from "@/components/duel";
import { Input } from "@/components/ui/input";
import { fetchLeaderboard } from "@/lib/api";
import type { Player } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Global Leaderboard — CodeDuel" },
      { name: "description", content: "The top-rated competitive programmers on CodeDuel, ranked weekly, monthly and all-time." },
      { property: "og:title", content: "Global Leaderboard — CodeDuel" },
      { property: "og:description", content: "The top-rated competitive programmers on CodeDuel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Leaderboard,
});

const PERIODS = ["Weekly", "Monthly", "All-Time"] as const;
type Period = (typeof PERIODS)[number];

function Leaderboard() {
  const [period, setPeriod] = useState<Period>("All-Time");
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLeaderboard(period, q)
      .then((data) => {
        if (active) {
          setPlayers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period, q]);

  const podium = players.length >= 3 ? [players[1]!, players[0]!, players[2]!] : players;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Global Leaderboard</h1>
            <p className="mt-1 text-muted-foreground">The sharpest minds in competitive programming.</p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {podium.length >= 3 && (
              <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
                {podium.map((p, i) => {
                  const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                  return (
                    <motion.div
                      key={p.id + period}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "relative flex flex-col items-center rounded-xl border bg-card p-4 text-center sm:p-6",
                        rank === 1 ? "border-tier-master/50 pb-10 shadow-glow sm:pb-14" : "border-border",
                      )}
                    >
                      {rank === 1 && <Crown className="absolute -top-4 h-8 w-8 text-tier-master" />}
                      <PlayerAvatar name={p.name} hue={p.hue} size={rank === 1 ? 72 : 56} />
                      <div className="mt-3 max-w-full truncate text-sm font-semibold sm:text-base">{p.handle}</div>
                      <div className="font-mono text-lg font-bold sm:text-2xl">{p.rating}</div>
                      <div className="mt-1 hidden sm:block">
                        <TierBadge rating={p.rating} />
                      </div>
                      <div
                        className={cn(
                          "mt-3 grid h-8 w-8 place-items-center rounded-full text-sm font-black",
                          rank === 1
                            ? "bg-tier-master text-background"
                            : rank === 2
                              ? "bg-muted-foreground text-background"
                              : "bg-warning/60 text-background",
                        )}
                      >
                        {rank}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search players…"
                className="h-11 bg-card pl-10"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="hidden grid-cols-[60px_1fr_120px_100px_100px_80px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <span>Rank</span>
                <span>Player</span>
                <span>Tier</span>
                <span className="text-right">Rating</span>
                <span className="text-right">Wins</span>
                <span className="text-right">Streak</span>
              </div>
              <ul className="divide-y divide-border">
                {players.map((p, index) => {
                  const rank = index + 1;
                  return (
                    <li
                      key={p.id}
                      className="grid grid-cols-[40px_1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40 md:grid-cols-[60px_1fr_120px_100px_100px_80px]"
                    >
                      <span className={cn("font-mono font-bold", rank <= 3 ? "text-tier-master" : "text-muted-foreground")}>
                        #{rank}
                      </span>
                      <div className="flex min-w-0 items-center gap-3">
                        <PlayerAvatar name={p.name} hue={p.hue} size={36} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            @{p.handle} · {p.country}
                          </div>
                        </div>
                      </div>
                      <span className="hidden md:block">
                        <TierBadge rating={p.rating} />
                      </span>
                      <span className="font-mono font-semibold md:text-right">{p.rating}</span>
                      <span className="hidden font-mono text-muted-foreground md:block md:text-right">{p.wins}</span>
                      <span className="hidden font-mono text-muted-foreground md:block md:text-right">{p.streak}</span>
                    </li>
                  );
                })}
                {players.length === 0 && (
                  <li className="p-10 text-center text-sm text-muted-foreground">No players found matching your search.</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
