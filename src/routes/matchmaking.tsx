import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Check, Swords, Clock } from "lucide-react";
import { Logo, PlayerAvatar, TierBadge, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { useUser, statsOf, newMatchId } from "@/lib/store";
import { PLAYERS, PROBLEMS, formatDuration, getProblem, DIFF_CLASS, type Player } from "@/lib/data";
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
  const { user, update } = useUser();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("searching");
  const [elapsed, setElapsed] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [match, setMatch] = useState<{ id: string; opp: Player; problemId: string } | null>(null);
  const [count, setCount] = useState(3);
  const [searchFor] = useState(() => 4 + Math.floor(Math.random() * 4));

  useEffect(() => {
    if (phase !== "searching" || !user) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    const c = setInterval(() => setCycle((c) => c + 1), 350);
    return () => { clearInterval(t); clearInterval(c); };
  }, [phase, user]);

  useEffect(() => {
    if (!user || phase !== "searching" || elapsed < searchFor) return;
    const near = [...PLAYERS].sort((a, b) => Math.abs(a.rating - user.rating) - Math.abs(b.rating - user.rating)).slice(0, 4);
    const opp = near[Math.floor(Math.random() * near.length)]!;
    const problem = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]!;
    setMatch({ id: newMatchId(), opp: { ...opp, rating: user.rating + Math.round((Math.random() - 0.5) * 120) }, problemId: problem.id });
    setPhase("found");
  }, [elapsed, phase, user, searchFor]);

  useEffect(() => {
    if (phase !== "countdown" || !match) return;
    if (count === 0) {
      update((u) => ({ ...u, pending: { matchId: match.id, opponentId: match.opp.id, problemId: match.problemId } }));
      navigate({ to: "/arena/$matchId", params: { matchId: match.id } });
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [phase, count, match, navigate, update]);

  if (!user) return <Loading />;
  const s = statsOf(user);
  const cyc = PLAYERS[cycle % PLAYERS.length]!;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      <header className="relative flex items-center justify-between px-6 py-4">
        <Logo />
        <span className="text-sm text-muted-foreground">Ranked · 1v1</span>
      </header>

      <AnimatePresence mode="wait">
        {phase === "searching" && (
          <motion.div key="search" exit={{ opacity: 0, scale: 0.9 }} className="relative flex flex-col items-center px-4 pt-8 text-center">
            <div className="relative grid h-80 w-80 place-items-center sm:h-96 sm:w-96">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="absolute inset-0 rounded-full border border-primary/40"
                  initial={{ scale: 0.3, opacity: 0.8 }} animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, delay: i, ease: "easeOut" }} />
              ))}
              <div className="absolute inset-6 rounded-full border border-border" />
              <div className="absolute inset-16 rounded-full border border-border" />
              <div className="absolute inset-28 rounded-full border border-border" />
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--primary) 45%, transparent) 50deg, transparent 60deg)" }}
                animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} />
              {[[20, 30], [70, 22], [78, 68], [28, 75]].map(([x, y], i) => (
                <motion.span key={i} className="absolute h-2 w-2 rounded-full bg-accent shadow-glow-accent" style={{ left: `${x}%`, top: `${y}%` }}
                  animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }} />
              ))}
              <div className="relative">
                <PlayerAvatar name={cyc.name} hue={cyc.hue} size={88} className="ring-4 ring-primary/50" />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-black sm:text-4xl">Finding Your Opponent<span className="animate-pulse">...</span></h1>
            <p className="mt-2 text-muted-foreground">Scanning players near your skill level</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Chip label="Your rating" value={String(user.rating)} />
              <Chip label="Range" value={`${user.rating - 100} – ${user.rating + 100}`} />
              <Chip label="Elapsed" value={formatDuration(elapsed)} icon />
            </div>
            <Button asChild variant="outline" size="lg" className="mt-10 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Link to="/dashboard"><X className="mr-1 h-4 w-4" /> Cancel Search</Link>
            </Button>
          </motion.div>
        )}

        {phase !== "searching" && match && (
          <motion.div key="found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-6 text-center">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm font-bold uppercase tracking-[0.3em] text-success">Match Found</motion.div>
            <div className="mt-8 grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <Fighter side="left" name={user.name} handle={user.handle} hue={280} rating={user.rating} winRate={s.winRate} />
              <div className="relative mx-auto grid h-28 w-28 place-items-center">
                <motion.span className="absolute inset-0 rounded-full bg-gradient-brand blur-2xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.span initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.4 }} className="relative text-6xl font-black italic text-gradient-brand">VS</motion.span>
              </div>
              <Fighter side="right" name={match.opp.name} handle={match.opp.handle} hue={match.opp.hue} rating={match.opp.rating} winRate={Math.round((match.opp.wins / (match.opp.wins + match.opp.losses)) * 100)} />
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm">
              <span className="text-muted-foreground">Problem difficulty</span>
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", DIFF_CLASS[getProblem(match.problemId).difficulty])}>{getProblem(match.problemId).difficulty}</span>
              <span className="text-muted-foreground">· ±20 rating at stake</span>
            </div>

            {phase === "found" ? (
              <div className="mt-10 flex gap-3">
                <Button size="lg" variant="outline" onClick={() => navigate({ to: "/dashboard" })}><X className="mr-1 h-4 w-4" /> Decline</Button>
                <Button size="lg" className="shadow-glow" onClick={() => setPhase("countdown")}><Check className="mr-1 h-4 w-4" /> Accept & Enter Battle</Button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center">
                <AnimatePresence mode="popLayout">
                  <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-8xl font-black text-gradient-brand">
                    {count || <Swords className="h-20 w-20 text-primary" />}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-2 text-sm text-muted-foreground">Entering the arena…</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1.5 font-mono text-lg font-semibold">{icon && <Clock className="h-4 w-4 text-accent" />}{value}</div>
    </div>
  );
}

function Fighter({ side, name, handle, hue, rating, winRate }: { side: "left" | "right"; name: string; handle: string; hue: number; rating: number; winRate: number }) {
  return (
    <motion.div initial={{ x: side === "left" ? -80 : 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 80 }}
      className={cn("rounded-2xl border bg-card p-6", side === "left" ? "border-primary/40 shadow-glow" : "border-accent/40 shadow-glow-accent")}>
      <PlayerAvatar name={name} hue={hue} size={96} className="mx-auto ring-4" />
      <div className="mt-4 text-xl font-bold">{name}</div>
      <div className="text-sm text-muted-foreground">@{handle}</div>
      <div className="mt-3"><TierBadge rating={rating} /></div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted p-2"><div className="text-xs text-muted-foreground">Rating</div><div className="font-mono font-bold">{rating}</div></div>
        <div className="rounded-lg bg-muted p-2"><div className="text-xs text-muted-foreground">Win rate</div><div className="font-mono font-bold">{winRate}%</div></div>
      </div>
    </motion.div>
  );
}
