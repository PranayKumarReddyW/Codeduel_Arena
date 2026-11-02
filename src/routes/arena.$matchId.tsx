import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Send, RotateCcw, Clock, CheckCircle2, XCircle, Loader2, Flag, Activity, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Logo, PlayerAvatar, TierBadge, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/lib/store";
import { PLAYERS, PROBLEMS, LANGUAGES, DIFF_CLASS, formatDuration, getPlayer, getProblem, type Language } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena/$matchId")({
  head: ({ params }) => ({
    meta: [
      { title: `Arena ${params.matchId} — CodeDuel` },
      { name: "description", content: "Live 1v1 coding battle arena." },
      { property: "og:title", content: "Coding Arena — CodeDuel" },
      { property: "og:description", content: "Live 1v1 coding battle arena." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Arena,
});

const MATCH_SECONDS = 20 * 60;
type TestResult = { status: "pass" | "fail"; output: string; time: number };
type OppEvent = { t: number; text: string; tone: "info" | "warn" | "good" | "bad" };

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function looksImplemented(code: string, starter: string) {
  const stripped = code.replace(/\/\/.*|#.*/g, "").replace(/\s+/g, "");
  const base = starter.replace(/\/\/.*|#.*/g, "").replace(/\s+/g, "");
  return stripped.length > base.length + 25 && !/\bpass\b\s*$/.test(code.trim());
}

function Arena() {
  const { matchId } = Route.useParams();
  const { user, update } = useUser();
  const navigate = useNavigate();

  const setup = useMemo(() => {
    if (user?.pending?.matchId === matchId) return user.pending;
    const h = hash(matchId);
    return { matchId, opponentId: PLAYERS[h % PLAYERS.length].id, problemId: PROBLEMS[h % PROBLEMS.length].id };
  }, [user, matchId]);

  const problem = getProblem(setup.problemId);
  const opp = getPlayer(setup.opponentId) ?? PLAYERS[0];

  const [lang, setLang] = useState<Language>("python");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const code = codes[lang] ?? problem.starter[lang];
  const [remaining, setRemaining] = useState(MATCH_SECONDS);
  const [activeCase, setActiveCase] = useState(0);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [consoleTab, setConsoleTab] = useState<"cases" | "output">("cases");
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [oppProgress, setOppProgress] = useState(0);
  const [events, setEvents] = useState<OppEvent[]>([]);
  const finished = useRef(false);
  const elapsedRef = useRef(0);

  // countdown
  useEffect(() => {
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  elapsedRef.current = MATCH_SECONDS - remaining;

  // simulated opponent
  useEffect(() => {
    const script: [number, OppEvent["text"], OppEvent["tone"], number][] = [
      [4, "Opened the problem", "info", 5],
      [12, "Started coding in C++", "info", 15],
      [28, "Ran sample tests — 1/3 passed", "warn", 33],
      [45, "Ran sample tests — 2/3 passed", "warn", 55],
      [70, "Submitted — Wrong Answer on test 7", "bad", 62],
      [100, "Ran sample tests — 3/3 passed", "good", 80],
      [140, "Submitted — Accepted", "good", 100],
    ];
    const timers = script.map(([sec, text, tone, prog]) =>
      setTimeout(() => {
        if (finished.current) return;
        setEvents((e) => [{ t: sec, text, tone }, ...e]);
        setOppProgress(prog);
        if (prog === 100) finish("loss");
        else if (tone !== "info") toast(`${opp.handle}: ${text}`);
      }, sec * 1000),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp.id]);

  useEffect(() => {
    if (remaining === 0) finish("loss");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function finish(result: "win" | "loss") {
    if (finished.current || !user) return;
    finished.current = true;
    const delta = result === "win" ? 25 : -18;
    const id = matchId;
    update((u) => ({
      ...u,
      rating: u.rating + delta,
      pending: undefined,
      matches: [
        { id, opponentId: opp.id, problemId: problem.id, difficulty: problem.difficulty, result, delta, duration: elapsedRef.current, date: new Date().toISOString(), language: lang, ratingAfter: u.rating + delta },
        ...u.matches.filter((m) => m.id !== id),
      ],
    }));
    navigate({ to: "/result/$matchId", params: { matchId: id } });
  }

  async function execute(kind: "run" | "submit") {
    setRunning(kind);
    setConsoleTab("output");
    setLog([`> Compiling ${LANGUAGES.find((l) => l.id === lang)?.label}...`]);
    await new Promise((r) => setTimeout(r, 500));
    setLog((l) => [...l, kind === "run" ? "> Running sample tests..." : "> Running 48 hidden tests..."]);
    await new Promise((r) => setTimeout(r, 900));
    const ok = looksImplemented(code, problem.starter[lang]);
    const res: TestResult[] = problem.tests.map((tc, i) => ({
      status: ok ? "pass" : "fail",
      output: ok ? tc.expected : lang === "python" ? "None" : i === 0 ? "undefined" : "",
      time: 8 + ((hash(code) + i * 13) % 40),
    }));
    setResults(res);
    setRunning(null);
    if (kind === "run") {
      setLog((l) => [...l, ok ? `✓ ${res.length}/${res.length} sample tests passed` : `✗ 0/${res.length} sample tests passed`]);
    } else if (ok) {
      setLog((l) => [...l, "✓ Accepted — 48/48 tests passed", `Runtime: ${res[0].time}ms · Memory: 14.2MB`]);
      toast.success("Accepted! You solved it first.");
      setTimeout(() => finish("win"), 900);
    } else {
      setLog((l) => [...l, "✗ Wrong Answer on test 1", "Expected output did not match."]);
      toast.error("Wrong Answer");
    }
  }

  if (!user) return <Loading />;
  const low = remaining < 120;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-sidebar px-4 py-2.5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground sm:inline">#{matchId}</span>
        </div>
        <div className={cn("flex items-center gap-2 rounded-lg border px-4 py-1.5 font-mono text-lg font-bold", low ? "border-destructive/50 text-destructive" : "border-border")}>
          <Clock className="h-4 w-4" /> {formatDuration(remaining)}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden md:inline text-muted-foreground">Stakes <span className="font-mono text-success">+25</span> / <span className="font-mono text-destructive">-18</span></span>
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> LIVE</span>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { if (confirm("Forfeit this match?")) finish("loss"); }}><Flag className="mr-1 h-4 w-4" /> Forfeit</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.6fr)_300px] lg:overflow-hidden">
        {/* Problem */}
        <section className="overflow-y-auto border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", DIFF_CLASS[problem.difficulty])}>{problem.difficulty}</span>
            {problem.tags.map((t) => <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>)}
          </div>
          <h1 className="mt-3 text-xl font-bold">{problem.title}</h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {problem.statement.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Input Format</h3>
          <p className="mt-1 text-sm text-muted-foreground">{problem.inputFormat}</p>
          <h3 className="mt-4 text-sm font-semibold">Output Format</h3>
          <p className="mt-1 text-sm text-muted-foreground">{problem.outputFormat}</p>
          {problem.examples.map((ex, i) => (
            <div key={i} className="mt-5">
              <h3 className="text-sm font-semibold">Example {i + 1}</h3>
              <div className="mt-2 space-y-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs">
                <div><span className="text-muted-foreground">Input: </span>{ex.input}</div>
                <div><span className="text-muted-foreground">Output: </span>{ex.output}</div>
                {ex.explanation && <div className="font-sans text-muted-foreground">Explanation: {ex.explanation}</div>}
              </div>
            </div>
          ))}
          <h3 className="mt-6 text-sm font-semibold">Constraints</h3>
          <ul className="mt-2 space-y-1">
            {problem.constraints.map((c) => <li key={c} className="w-fit rounded bg-muted px-2 py-0.5 font-mono text-xs">{c}</li>)}
          </ul>
        </section>

        {/* Editor */}
        <section className="flex min-h-[600px] flex-col border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => setCodes((c) => ({ ...c, [lang]: problem.starter[lang] }))}><RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset</Button>
          </div>
          <CodeEditor value={code} onChange={(v) => setCodes((c) => ({ ...c, [lang]: v }))} />
          <div className="flex h-60 shrink-0 flex-col border-t border-border">
            <div className="flex items-center justify-between border-b border-border px-3">
              <div className="flex">
                {(["cases", "output"] as const).map((t) => (
                  <button key={t} onClick={() => setConsoleTab(t)} className={cn("flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium", consoleTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
                    {t === "cases" ? <><Activity className="h-3.5 w-3.5" /> Test Cases</> : <><Terminal className="h-3.5 w-3.5" /> Console</>}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 py-1.5">
                <Button size="sm" variant="secondary" disabled={!!running} onClick={() => execute("run")}>
                  {running === "run" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />} Run Code
                </Button>
                <Button size="sm" disabled={!!running} onClick={() => execute("submit")} className="bg-success text-primary-foreground hover:bg-success/90">
                  {running === "submit" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />} Submit Solution
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
              {consoleTab === "cases" ? (
                <>
                  <div className="flex gap-2">
                    {problem.tests.map((_, i) => (
                      <button key={i} onClick={() => setActiveCase(i)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 font-medium", activeCase === i ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                        {results && (results[i].status === "pass" ? <CheckCircle2 className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />)}
                        Case {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 font-mono sm:grid-cols-2">
                    <IO label="Input" value={problem.tests[activeCase].input} />
                    <IO label="Expected" value={problem.tests[activeCase].expected} />
                    {results && <IO label={`Your output · ${results[activeCase].time}ms`} value={results[activeCase].output || "(empty)"} tone={results[activeCase].status} />}
                  </div>
                </>
              ) : (
                <div className="space-y-1 font-mono">
                  {log.length === 0 && <div className="text-muted-foreground">Run your code to see output here.</div>}
                  {log.map((l, i) => (
                    <div key={i} className={cn(l.startsWith("✓") ? "text-success" : l.startsWith("✗") ? "text-destructive" : "text-muted-foreground")}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Opponent */}
        <aside className="overflow-y-auto p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Match Status</div>
          <div className="mt-4 rounded-xl border border-accent/40 bg-card p-4 shadow-glow-accent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <PlayerAvatar name={opp.name} hue={opp.hue} size={44} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{opp.handle}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">{opp.rating} <TierBadge rating={opp.rating} /></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-mono">{oppProgress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-accent" animate={{ width: `${oppProgress}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Status: <span className="text-foreground">{events[0]?.text ?? "Reading problem…"}</span></div>
          </div>

          <div className="mt-4 rounded-xl border border-primary/40 bg-card p-4">
            <div className="flex items-center gap-3">
              <PlayerAvatar name={user.name} hue={280} size={36} />
              <div><div className="text-sm font-semibold">You</div><div className="text-xs text-muted-foreground">{user.rating}</div></div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Tests: <span className="font-mono text-foreground">{results ? results.filter((r) => r.status === "pass").length : 0}/{problem.tests.length}</span></div>
          </div>

          <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Feed</div>
          <ul className="mt-3 space-y-2">
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.li key={e.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", { info: "bg-muted-foreground", warn: "bg-warning", good: "bg-success", bad: "bg-destructive" }[e.tone])} />
                  <div><div>{e.text}</div><div className="mt-0.5 font-mono text-muted-foreground">{formatDuration(e.t)}</div></div>
                </motion.li>
              ))}
            </AnimatePresence>
            {events.length === 0 && <li className="text-xs text-muted-foreground">Waiting for opponent activity…</li>}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function IO({ label, value, tone }: { label: string; value: string; tone?: "pass" | "fail" }) {
  return (
    <div>
      <div className="mb-1 font-sans text-muted-foreground">{label}</div>
      <pre className={cn("whitespace-pre-wrap rounded-md border bg-muted/50 p-2", tone === "pass" ? "border-success/40 text-success" : tone === "fail" ? "border-destructive/40 text-destructive" : "border-border")}>{value}</pre>
    </div>
  );
}

function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = value.split("\n").length;
  const gutter = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background font-mono text-[13px] leading-6">
      <div ref={gutter} className="select-none overflow-hidden border-r border-border px-3 py-3 text-right text-muted-foreground/60">
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const { selectionStart: s, selectionEnd: en } = el;
            onChange(value.slice(0, s) + "    " + value.slice(en));
            requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
          }
        }}
        className="flex-1 resize-none bg-transparent px-4 py-3 text-foreground caret-primary outline-none"
        aria-label="Code editor"
      />
    </div>
  );
}
