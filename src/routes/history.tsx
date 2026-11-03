import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History as HistoryIcon, LogIn } from "lucide-react";
import { AppShell, Loading, PlayerAvatar } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import { fetchMatches, fetchPlayers, fetchProblems, type MatchRecord } from "@/lib/api";
import { DIFF_CLASS, formatDuration, type Difficulty, type Player, type Problem } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Match History — CodeDuel" },
      { name: "description", content: "Every CodeDuel battle you've played, filterable by outcome and difficulty." },
      { property: "og:title", content: "Match History — CodeDuel" },
      { property: "og:description", content: "Every battle, filterable by outcome and difficulty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

function Seg<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function History() {
  const { user } = useUser();
  const [outcome, setOutcome] = useState<"All" | "Win" | "Loss">("All");
  const [diff, setDiff] = useState<"All" | Difficulty>("All");
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [playersMap, setPlayersMap] = useState<Map<string, Player>>(new Map());
  const [problemsMap, setProblemsMap] = useState<Map<string, Problem>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers()
      .then((players) => setPlayersMap(new Map(players.map((p) => [p.id, p]))))
      .catch(console.error);

    fetchProblems()
      .then((problems) => setProblemsMap(new Map(problems.map((p) => [p.id, p]))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchMatches(outcome, diff)
      .then((data) => {
        if (active) {
          setMatches(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [outcome, diff]);

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <HistoryIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sign In to View Match History</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your past competitive duels, rating changes, and solution durations.
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

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Match History</h1>
          <p className="mt-1 text-muted-foreground">{matches.length} battles retrieved from CodeDuel records</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Seg value={outcome} options={["All", "Win", "Loss"]} onChange={setOutcome} />
          <Seg value={diff} options={["All", "Easy", "Medium", "Hard"]} onChange={setDiff} />
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Result</th>
                <th className="px-5 py-3 font-semibold">Opponent</th>
                <th className="px-5 py-3 font-semibold">Problem</th>
                <th className="px-5 py-3 text-right font-semibold">Δ Rating</th>
                <th className="px-5 py-3 text-right font-semibold">Duration</th>
                <th className="px-5 py-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matches.map((m) => {
                const opp = playersMap.get(m.opponentId);
                const prob = problemsMap.get(m.problemId);
                return (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link
                        to="/result/$matchId"
                        params={{ matchId: m.id }}
                        className={cn(
                          "rounded px-2 py-1 text-xs font-bold",
                          m.result === "win" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {m.result === "win" ? "WIN" : "LOSS"}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <PlayerAvatar name={opp?.name ?? "?"} hue={opp?.hue} size={28} />
                        <div>
                          <div className="font-medium">{opp?.handle || m.opponentId}</div>
                          <div className="text-xs text-muted-foreground">{opp?.rating}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{prob?.title || m.problemId}</span>
                        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold", DIFF_CLASS[m.difficulty])}>
                          {m.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className={cn("px-5 py-3 text-right font-mono font-semibold", m.delta > 0 ? "text-success" : "text-destructive")}>
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-muted-foreground">{formatDuration(m.duration)}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {matches.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    No matches found for these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
