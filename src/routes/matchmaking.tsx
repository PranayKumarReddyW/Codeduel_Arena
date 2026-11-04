import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X, Check, Clock, Zap } from "lucide-react";
import { Logo, PlayerAvatar, TierBadge, Loading, AppShell } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { useUser, statsOf, setPendingMatch } from "@/lib/store";
import { findMatch, cancelMatchmakingQueue, type MatchmakingResult } from "@/lib/api";
import { formatDuration, DIFF_CLASS } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matchmaking")({
  head: () => ({
    meta: [
      { title: "Finding Opponent — CodeDuel" },
      { name: "description", content: "Searching the CodeDuel queue for an opponent at your rating." },
      { property: "og:title", content: "Matchmaking — CodeDuel" },
      { property: "og:description", content: "Searching for an opponent at your rating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Matchmaking,
});

type Phase = "searching" | "found" | "countdown";

function Matchmaking() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("searching");
  const [elapsed, setElapsed] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const [count, setCount] = useState(3);
  const isCancelledRef = useRef(false);

  // Cleanup queue when unmounting
  useEffect(() => {
    return () => {
      if (!isCancelledRef.current) {
        cancelMatchmakingQueue().catch(() => {});
      }
    };
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (phase !== "searching" || !user) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase, user]);

  // Matchmaking poll effect
  useEffect(() => {
    if (!user || phase !== "searching") return;

    let timer: NodeJS.Timeout;

    const executeFind = async () => {
      try {
        const res = await findMatch(user.rating, false);

        if (res && res.matchId && res.opponent && res.problem) {
          setMatchResult(res);
          setPhase("found");
        }
      } catch (err) {
        console.error("Matchmaking poll error:", err);
      }
    };

    executeFind();
    timer = setInterval(executeFind, 1500);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, user]);

  // Auto-accept countdown after 5s in "found"
  useEffect(() => {
    if (phase !== "found") return;
    const autoAcceptTimer = setTimeout(() => {
      setPhase("countdown");
    }, 5000);
    return () => clearTimeout(autoAcceptTimer);
  }, [phase]);

  // Fight countdown
  useEffect(() => {
    if (phase !== "countdown" || !matchResult || !matchResult.matchId || !matchResult.opponent || !matchResult.problem) return;
    if (count === 0) {
      setPendingMatch({
        matchId: matchResult.matchId,
        opponentId: matchResult.opponent.id,
        problemId: matchResult.problem.id,
        isBot: false,
        opponentName: matchResult.opponent.name,
        opponentHandle: matchResult.opponent.handle,
      });
      navigate({ to: "/arena/$matchId", params: { matchId: matchResult.matchId } });
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [phase, count, matchResult, navigate]);

  function handleCancel() {
    isCancelledRef.current = true;
    cancelMatchmakingQueue().catch(console.error);
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sign In to Enter Ranked Duels</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked 1v1 matchmaking requires a signed-in account to compute rating updates, win streaks, and save match history.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
            <Button asChild size="lg" className="flex-1 shadow-glow">
              <Link to="/login">Sign In / Register</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link to="/problems">Practice Solo</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }
  const s = statsOf(user);

  return (
    <AppShell>
      <div className="relative flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
        {phase === "searching" && (
          <motion.div key="search" exit={{ opacity: 0, scale: 0.95 }} className="relative flex flex-col items-center px-4 pt-10 text-center">
            {/* Clean Radar Pulse Animation */}
            <div className="relative grid h-72 w-72 place-items-center sm:h-80 sm:w-80">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/30"
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                />
              ))}
              <div className="absolute inset-8 rounded-full border border-border" />
              <div className="absolute inset-20 rounded-full border border-border/60" />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--primary) 35%, transparent) 45deg, transparent 55deg)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative">
                <PlayerAvatar name={user.name} hue={280} size={76} className="ring-4 ring-primary/40 shadow-glow" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
              Searching for Opponent<span className="animate-pulse">...</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Looking for a competitor near {user.rating} rating in the live multiplayer arena.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Chip label="Rating" value={String(user.rating)} />
              <Chip label="Time" value={formatDuration(elapsed)} icon />
            </div>

            {elapsed >= 10 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">Waiting for another challenger to join...</span>
              </motion.div>
            )}

            <Button
              asChild
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="mt-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Link to="/dashboard">
                <X className="mr-1 h-4 w-4" /> Cancel Search
              </Link>
            </Button>
          </motion.div>
        )}

        {phase !== "searching" && matchResult && matchResult.opponent && matchResult.problem && (
          <motion.div key="found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-6 text-center">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30 shadow-glow">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                Live 1v1 Duel
              </span>
            </motion.div>

            <div className="mt-8 grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <Fighter side="left" name={user.name} handle={user.handle} hue={280} rating={user.rating} winRate={s.winRate} />
              <div className="relative mx-auto grid h-28 w-28 place-items-center">
                <motion.span className="absolute inset-0 rounded-full bg-gradient-brand blur-2xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.span initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.4 }} className="relative text-6xl font-black italic text-gradient-brand">
                  VS
                </motion.span>
              </div>
              <Fighter
                side="right"
                name={matchResult.opponent.name}
                handle={matchResult.opponent.handle}
                hue={matchResult.opponent.hue}
                rating={matchResult.opponent.rating}
                winRate={
                  matchResult.opponent.wins + matchResult.opponent.losses > 0
                    ? Math.round(
                        (matchResult.opponent.wins / (matchResult.opponent.wins + matchResult.opponent.losses)) * 100,
                      )
                    : 50
                }
              />
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 rounded-xl border border-border bg-card p-5 max-w-md w-full">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Selected Challenge</div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-semibold text-lg">{matchResult.problem.title}</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", DIFF_CLASS[matchResult.problem.difficulty])}>
                  {matchResult.problem.difficulty}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {matchResult.problem.tags.map((t) => (
                  <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {phase === "found" ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 flex flex-col items-center gap-3">
                <Button size="lg" className="h-14 px-10 text-lg shadow-glow" onClick={() => setPhase("countdown")}>
                  <Check className="mr-2 h-5 w-5" /> Accept Battle
                </Button>
                <span className="text-xs text-muted-foreground">Entering arena automatically...</span>
              </motion.div>
            ) : (
              <div className="mt-8 flex flex-col items-center">
                <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-7xl font-black text-gradient-brand">
                  {count === 0 ? "FIGHT!" : count}
                </motion.div>
                <div className="mt-2 text-sm text-muted-foreground">Entering the coding arena...</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Chip({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs">
      {icon && <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function Fighter({
  side,
  name,
  handle,
  hue,
  rating,
  winRate,
}: {
  side: "left" | "right";
  name: string;
  handle: string;
  hue: number;
  rating: number;
  winRate: number;
}) {
  return (
    <motion.div
      initial={{ x: side === "left" ? -40 : 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-glow"
    >
      <PlayerAvatar name={name} hue={hue} size={84} />
      <div className="mt-4 font-bold text-lg">{name}</div>
      <div className="text-sm text-muted-foreground">@{handle}</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono font-bold text-xl">{rating}</span>
        <TierBadge rating={rating} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">Win rate: {winRate}%</div>
    </motion.div>
  );
}
