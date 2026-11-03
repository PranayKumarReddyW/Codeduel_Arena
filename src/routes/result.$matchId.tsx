import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Skull, Clock, Code2, RotateCw, LayoutDashboard } from "lucide-react";
import { Logo, PlayerAvatar, TierBadge, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import { fetchMatch, fetchPlayer, fetchProblem, type MatchRecord } from "@/lib/api";
import { DIFF_CLASS, formatDuration, LANGUAGES, type Player, type Problem } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result/$matchId")({
  head: () => ({
    meta: [
      { title: "Match Result — CodeDuel" },
      { name: "description", content: "Your CodeDuel battle result and rating change." },
      { property: "og:title", content: "Match Result — CodeDuel" },
      { property: "og:description", content: "Battle result and rating change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Result,
});

function Result() {
  const { matchId } = Route.useParams();
  const { user } = useUser();
  const [match, setMatch] = useState<MatchRecord | null>(null);
  const [opp, setOpp] = useState<Player | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function loadResult() {
      try {
        let m = (user?.matches || []).find((x) => x.id === matchId) || null;
        if (!m) {
          m = await fetchMatch(matchId);
        }
        if (!m) {
          if (active) setLoading(false);
          return;
        }

        const [oppData, probData] = await Promise.all([
          fetchPlayer(m.opponentId),
          fetchProblem(m.problemId),
        ]);

        if (active) {
          setMatch(m);
          setOpp(oppData);
          setProblem(probData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load match result:", err);
        if (active) setLoading(false);
      }
    }

    loadResult();

    return () => {
      active = false;
    };
  }, [matchId, user?.matches]);

  if (loading || !user) return <Loading />;

  if (!match || !opp || !problem) {
    return (
      <div className="grid min-h-screen place-items-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Match not found</h1>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const win = match.result === "win";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]",
          win ? "bg-primary/30" : "bg-destructive/20",
        )}
      />
      <header className="relative px-6 py-4">
        <Logo />
      </header>
      <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className={cn(
            "mx-auto grid h-24 w-24 place-items-center rounded-full",
            win ? "bg-gradient-brand shadow-glow" : "bg-destructive/20",
          )}
        >
          {win ? <Trophy className="h-12 w-12 text-primary-foreground" /> : <Skull className="h-12 w-12 text-destructive" />}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn("mt-6 text-6xl font-black tracking-tight sm:text-7xl", win ? "text-gradient-brand" : "text-destructive")}
        >
          {win ? "VICTORY" : "DEFEAT"}
        </motion.h1>
        <p className="mt-2 text-muted-foreground">
          {win ? "You solved it first with verified test cases. Well played." : `${opp.handle} got there first. Run it back?`}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-8 inline-flex items-center gap-4 rounded-2xl border border-border bg-card px-8 py-4"
        >
          <div>
            <div className="text-xs text-muted-foreground">Rating</div>
            <div className="font-mono text-3xl font-bold">{match.ratingAfter}</div>
          </div>
          <div className={cn("font-mono text-3xl font-black", win ? "text-success" : "text-destructive")}>
            {win ? "+" : ""}
            {match.delta}
          </div>
          <TierBadge rating={match.ratingAfter} />
        </motion.div>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem</div>
            <div className="mt-2 font-semibold">{problem.title}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={cn("rounded-full border px-2 py-0.5 font-semibold", DIFF_CLASS[problem.difficulty])}>
                {problem.difficulty}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                <Clock className="h-3 w-3" /> {formatDuration(match.duration)}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                <Code2 className="h-3 w-3" /> {LANGUAGES.find((l) => l.id === match.language)?.label || match.language}
              </span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {win ? "48/48 hidden tests passed via Judge0" : "Solution not accepted in time"}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opponent</div>
            <div className="mt-2 flex items-center gap-3">
              <PlayerAvatar name={opp.name} hue={opp.hue} size={44} />
              <div>
                <div className="font-semibold">{opp.name}</div>
                <div className="text-xs text-muted-foreground">@{opp.handle}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-muted p-2">
                <div className="text-muted-foreground">Rating</div>
                <div className="font-mono font-bold">{opp.rating}</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-muted-foreground">Wins</div>
                <div className="font-mono font-bold">{opp.wins}</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-muted-foreground">Change</div>
                <div className={cn("font-mono font-bold", win ? "text-destructive" : "text-success")}>
                  {win ? "-" : "+"}
                  {Math.abs(match.delta)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="shadow-glow">
            <Link to="/matchmaking">
              <RotateCw className="mr-1 h-4 w-4" /> Play Again
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">
              <LayoutDashboard className="mr-1 h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
