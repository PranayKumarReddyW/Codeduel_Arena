import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Play, Send, RotateCcw, Clock, CheckCircle2, XCircle, Loader2, Flag, Activity, Terminal, Bot, Zap, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Logo, PlayerAvatar, TierBadge, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, setPendingMatch } from "@/lib/store";
import {
  fetchProblem,
  fetchPlayer,
  executeRunCode,
  executeSubmitCode,
  recordMatch,
  fetchProblems,
  fetchPlayers,
  fetchMatchRoom,
} from "@/lib/api";
import { LANGUAGES, DIFF_CLASS, formatDuration, type Language, type Problem, type Player } from "@/lib/data";
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
type TestResult = { status: "pass" | "fail"; output: string; expected?: string; stdout?: string; time: number };
type OppEvent = { t: number; text: string; tone: "info" | "warn" | "good" | "bad" };

function Arena() {
  const { matchId } = Route.useParams();
  const { user, refresh } = useUser();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [opp, setOpp] = useState<Player | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [lang, setLang] = useState<Language>("python");
  const [codes, setCodes] = useState<Record<string, string>>({});

  // Persist and restore match start time so browser refreshes NEVER reset the countdown timer
  const getInitialStartTime = () => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`codeduel_match_${matchId}_started_at`);
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const now = Date.now();
      sessionStorage.setItem(`codeduel_match_${matchId}_started_at`, String(now));
      return now;
    }
    return Date.now();
  };

  const startedAtRef = useRef<number>(getInitialStartTime());

  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`codeduel_match_${matchId}_started_at`);
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed) && parsed > 0) {
          const elapsed = Math.floor((Date.now() - parsed) / 1000);
          return Math.max(0, MATCH_SECONDS - elapsed);
        }
      }
    }
    return MATCH_SECONDS;
  });

  const [activeCase, setActiveCase] = useState(0);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [consoleTab, setConsoleTab] = useState<"cases" | "output">("cases");
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [oppProgress, setOppProgress] = useState(0);
  const [events, setEvents] = useState<OppEvent[]>([]);
  const [connectedToWs, setConnectedToWs] = useState(false);
  const finished = useRef(false);
  const elapsedRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  const [isBotMatch, setIsBotMatch] = useState<boolean | null>(null);
  const isBot = isBotMatch ?? (user?.pending?.isBot ?? (opp ? opp.id.startsWith("p") : false));

  // Authoritatively load problem and opponent data from backend match room
  useEffect(() => {
    let active = true;
    setLoadingData(true);

    async function loadArenaData() {
      try {
        // Query the authoritative backend match room to guarantee identical problem & opponent
        const room = await fetchMatchRoom(matchId);
        if (active && room && room.problem) {
          setProblem(room.problem);
          if (room.opponent) {
            setOpp(room.opponent);
          }
          setIsBotMatch(room.isBot);

          if (room.startedAt) {
            startedAtRef.current = room.startedAt;
            sessionStorage.setItem(`codeduel_match_${matchId}_started_at`, String(room.startedAt));
            const elapsed = Math.max(0, Math.floor((Date.now() - room.startedAt) / 1000));
            elapsedRef.current = elapsed;
            setRemaining(Math.max(0, MATCH_SECONDS - elapsed));
          }
          setLoadingData(false);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch match room by id, falling back to local lookup:", err);
      }

      try {
        let probId = user?.pending?.problemId;
        let oppId = user?.pending?.opponentId;

        if (!probId || !oppId) {
          const allProblems = await fetchProblems();
          const allPlayers = await fetchPlayers();
          probId = probId || allProblems[0]?.id || "two-sum";
          oppId = oppId || allPlayers[0]?.id || "p1";
        }

        const [probData, oppData] = await Promise.all([
          fetchProblem(probId),
          fetchPlayer(oppId),
        ]);

        if (active) {
          setProblem(probData);
          setOpp(oppData);
          setLoadingData(false);
        }
      } catch (err) {
        console.error("Error loading match arena data from backend:", err);
        if (active) setLoadingData(false);
      }
    }

    loadArenaData();

    return () => {
      active = false;
    };
  }, [matchId, user?.pending]);

  // Establish WebSocket connection to backend arena
  useEffect(() => {
    if (!user || !matchId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    const isDev = typeof window !== "undefined" && window.location.port === "8080";
    const defaultWsUrl = isDev
      ? `${protocol}//${host}:8088/ws/arena`
      : `${protocol}//${window.location.host}/ws/arena`;
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || defaultWsUrl;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn("Direct WS connection failed, falling back to proxy path:", err);
      ws = new WebSocket(`${protocol}//${window.location.host}/ws/arena`);
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setConnectedToWs(true);
      ws.send(
        JSON.stringify({
          type: "JOIN",
          matchId,
          handle: user.handle,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const text = msg.text || "";
        const tone = (msg.tone as OppEvent["tone"]) || "info";

        if (msg.type === "ROOM_STATE") {
          if (typeof msg.startedAt === "number") {
            startedAtRef.current = msg.startedAt;
            sessionStorage.setItem(`codeduel_match_${matchId}_started_at`, String(msg.startedAt));
          }
          if (typeof msg.remainingSeconds === "number") {
            setRemaining(msg.remainingSeconds);
            elapsedRef.current = msg.elapsedSeconds ?? (MATCH_SECONDS - msg.remainingSeconds);
          }
        } else if (msg.type === "OPPONENT_JOINED") {
          setEvents((prev) => [{ t: elapsedRef.current, text, tone: "info" }, ...prev]);
        } else if (msg.type === "OPPONENT_PROGRESS") {
          if (typeof msg.progress === "number") {
            setOppProgress(msg.progress);
          }
          setEvents((prev) => [{ t: elapsedRef.current, text, tone }, ...prev]);
        } else if (msg.type === "OPPONENT_STATUS") {
          setEvents((prev) => [{ t: elapsedRef.current, text, tone }, ...prev]);
        } else if (msg.type === "MATCH_FINISHED") {
          setOppProgress(100);
          setEvents((prev) => [{ t: elapsedRef.current, text, tone: "bad" }, ...prev]);
          if (!finished.current) {
            finish("loss");
          }
        } else if (msg.type === "OPPONENT_FORFEITED") {
          setEvents((prev) => [{ t: elapsedRef.current, text, tone: "good" }, ...prev]);
          toast.success("Opponent forfeited! You win.");
          if (!finished.current) {
            finish("win");
          }
        }
      } catch (err) {
        console.error("Error handling WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("Arena WebSocket warning:", err);
    };

    ws.onclose = () => {
      setConnectedToWs(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [matchId, user?.handle]);

  const sendWs = useCallback(
    (payload: Record<string, any>) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            matchId,
            handle: user?.handle || "anonymous",
            ...payload,
          }),
        );
      }
    },
    [matchId, user?.handle],
  );

  // countdown using wall-clock delta so timer is always accurate and never resets on page refresh
  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
      elapsedRef.current = elapsed;
      const rem = Math.max(0, MATCH_SECONDS - elapsed);
      setRemaining(rem);
      if (rem === 0 && !finished.current) {
        finish("loss");
      }
    };

    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // simulated opponent pacing (only active if playing against bot challenger)
  useEffect(() => {
    if (!opp || !isBot) return;
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
      }, sec * 1000),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp?.id, isBot]);

  useEffect(() => {
    if (remaining === 0) finish("loss");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  async function finish(result: "win" | "loss") {
    if (finished.current || !user || !problem || !opp) return;
    finished.current = true;
    const delta = result === "win" ? 25 : -18;
    const ratingAfter = user.rating + delta;

    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`codeduel_match_${matchId}_started_at`);
      }
      await recordMatch({
        id: matchId,
        opponentId: opp.id,
        problemId: problem.id,
        difficulty: problem.difficulty,
        result,
        delta,
        duration: elapsedRef.current,
        language: lang,
        ratingAfter,
      });
      setPendingMatch(undefined);
      refresh();
    } catch (err) {
      console.error("Failed to record match on backend API:", err);
    }

    navigate({ to: "/result/$matchId", params: { matchId } });
  }

  function handleLanguageChange(nextLang: Language) {
    setLang(nextLang);
    sendWs({
      type: "STATUS_EVENT",
      text: `Started coding in ${LANGUAGES.find((l) => l.id === nextLang)?.label || nextLang}`,
      tone: "info",
    });
  }

  function handleForfeit() {
    if (confirm("Forfeit this match? This will count as a loss.")) {
      sendWs({
        type: "FORFEIT",
      });
      finish("loss");
    }
  }

  const code = problem ? (codes[lang] ?? problem.starter[lang] ?? "") : "";

  async function execute(kind: "run" | "submit") {
    if (!problem) return;
    setRunning(kind);
    setConsoleTab("output");
    setLog([`> Connecting to Judge0 engine via backend...`]);

    try {
      if (kind === "run") {
        const response = await executeRunCode({
          problemId: problem.id,
          language: lang,
          code,
        });

        setLog(response.logs);
        const mappedResults: TestResult[] = response.results.map((r: any) => ({
          status: r.status,
          output: r.output,
          expected: r.expected,
          stdout: r.stdout,
          time: r.time,
        }));
        setResults(mappedResults);

        const passed = response.results.filter((r) => r.status === "pass").length;
        const total = response.results.length;
        const pct = total > 0 ? Math.round((passed / total) * 75) : 0;

        sendWs({
          type: "PROGRESS",
          progress: pct,
          testsPassed: passed,
          totalTests: total,
          text: `Ran sample tests — ${passed}/${total} passed`,
          tone: passed === total ? "good" : "warn",
        });

        if (response.success) {
          toast.success("Sample tests passed!");
        } else {
          toast.error("Some tests failed");
        }
      } else {
        const response = await executeSubmitCode({
          matchId,
          problemId: problem.id,
          language: lang,
          code,
        });

        setLog(response.logs);
        const mappedResults: TestResult[] = response.results.map((r: any) => ({
          status: r.status,
          output: r.output,
          expected: r.expected,
          stdout: r.stdout,
          time: r.time,
        }));
        setResults(mappedResults);

        if (response.accepted) {
          sendWs({
            type: "SOLUTION_SUBMITTED",
            accepted: true,
          });
          toast.success("Accepted! You solved it first.");
          setTimeout(() => finish("win"), 900);
        } else {
          const passed = response.passedTests;
          const total = Math.max(1, response.totalTests);
          const pct = Math.round((passed / total) * 85);

          sendWs({
            type: "PROGRESS",
            progress: pct,
            testsPassed: passed,
            totalTests: total,
            text: `Submitted — Wrong Answer (${passed}/${total} passed)`,
            tone: "bad",
          });
          toast.error("Wrong Answer");
        }
      }
    } catch (err: any) {
      console.error("Code execution error:", err);
      setLog((l) => [...l, `✗ Execution Error: ${err.message || err}`]);
      toast.error("Execution error. Check console output.");
    } finally {
      setRunning(null);
    }
  }

  if (!user || loadingData || !problem || !opp) return <Loading />;
  const low = remaining < 120;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-sidebar px-4 py-2.5">
        <Logo />
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-1.5 font-mono text-lg font-bold shadow-sm",
            low ? "border-destructive/50 text-destructive bg-destructive/10" : "border-border bg-card",
          )}
        >
          <Clock className="h-4 w-4" /> {formatDuration(remaining)}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {isBot ? (
            <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/30">
              <Bot className="h-3.5 w-3.5" /> Practice Challenger
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success border border-success/30">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <Zap className="h-3 w-3" /> Live Duel
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleForfeit}
          >
            <Flag className="mr-1 h-4 w-4" /> Forfeit
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.6fr)_300px] lg:overflow-hidden">
        {/* Problem */}
        <section className="overflow-y-auto border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", DIFF_CLASS[problem.difficulty])}>
              {problem.difficulty}
            </span>
            {problem.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-xl font-bold">{problem.title}</h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {problem.statement.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Input Format</h3>
          <p className="mt-1 text-sm text-muted-foreground">{problem.inputFormat}</p>
          <h3 className="mt-4 text-sm font-semibold">Output Format</h3>
          <p className="mt-1 text-sm text-muted-foreground">{problem.outputFormat}</p>
          {problem.examples.map((ex, i) => (
            <div key={i} className="mt-5">
              <h3 className="text-sm font-semibold">Example {i + 1}</h3>
              <div className="mt-2 space-y-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  {ex.input}
                </div>
                <div>
                  <span className="text-muted-foreground">Output: </span>
                  {ex.output}
                </div>
                {ex.explanation && <div className="font-sans text-muted-foreground">Explanation: {ex.explanation}</div>}
              </div>
            </div>
          ))}
          <h3 className="mt-6 text-sm font-semibold">Constraints</h3>
          <ul className="mt-2 space-y-1">
            {problem.constraints.map((c) => (
              <li key={c} className="w-fit rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Editor */}
        <section className="flex min-h-[600px] flex-col border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <Select value={lang} onValueChange={(v) => handleLanguageChange(v as Language)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCodes((c) => ({ ...c, [lang]: problem.starter[lang] || "" }))}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <CodeEditor value={code} onChange={(v) => setCodes((c) => ({ ...c, [lang]: v }))} />
          <div className="flex h-60 shrink-0 flex-col border-t border-border">
            <div className="flex items-center justify-between border-b border-border px-3">
              <div className="flex">
                {(["cases", "output"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setConsoleTab(t)}
                    className={cn(
                      "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium",
                      consoleTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
                    )}
                  >
                    {t === "cases" ? (
                      <>
                        <Activity className="h-3.5 w-3.5" /> Test Cases
                      </>
                    ) : (
                      <>
                        <Terminal className="h-3.5 w-3.5" /> Console
                      </>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 py-1.5">
                <Button size="sm" variant="secondary" disabled={!!running} onClick={() => execute("run")}>
                  {running === "run" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}{" "}
                  Run Code
                </Button>
                <Button
                  size="sm"
                  disabled={!!running}
                  onClick={() => execute("submit")}
                  className="bg-success text-primary-foreground hover:bg-success/90"
                >
                  {running === "submit" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}{" "}
                  Submit Solution
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
              {consoleTab === "cases" ? (
                <>
                  <div className="flex gap-2">
                    {problem.tests.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCase(i)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1 font-medium",
                          activeCase === i ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
                        )}
                      >
                        {results && results[i] && (
                          results[i]!.status === "pass" ? (
                            <CheckCircle2 className="h-3 w-3 text-success" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive" />
                          )
                        )}
                        Case {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 font-mono sm:grid-cols-2">
                    <IO label="Input" value={problem.tests[activeCase]?.input || ""} />
                    <IO label="Expected" value={problem.tests[activeCase]?.expected || ""} />
                    {results && results[activeCase] && (
                      <IO
                        label={`Output · ${results[activeCase]!.time}ms`}
                        value={results[activeCase]!.output || "(empty)"}
                        tone={results[activeCase]!.status}
                      />
                    )}
                    {results && results[activeCase] && results[activeCase]!.stdout ? (
                      <div className="sm:col-span-2">
                        <IO
                          label="Stdout / Print Output"
                          value={results[activeCase]!.stdout!}
                        />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="space-y-1 font-mono">
                  {log.length === 0 && <div className="text-muted-foreground">Run your code to see output here.</div>}
                  {log.map((l, i) => (
                    <div
                      key={i}
                      className={cn(
                        l.startsWith("✓")
                          ? "text-success"
                          : l.startsWith("✗")
                            ? "text-destructive"
                            : "text-muted-foreground",
                      )}
                    >
                      {l}
                    </div>
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
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold">{opp.handle}</span>
                  {isBot ? (
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">BOT</span>
                  ) : (
                    <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success animate-pulse">PVP</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {opp.rating} <TierBadge rating={opp.rating} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono">{oppProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-accent" animate={{ width: `${oppProgress}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Status: <span className="text-foreground">{events[0]?.text ?? "Reading problem…"}</span>
            </div>
          </div>

          <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Feed</div>
          <ul className="mt-3 space-y-2">
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.li
                  key={e.t}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 rounded-lg bg-muted/50 p-2.5 text-xs"
                >
                  <span
                    className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      {
                        info: "bg-muted-foreground",
                        warn: "bg-warning",
                        good: "bg-success",
                        bad: "bg-destructive",
                      }[e.tone],
                    )}
                  />
                  <div>
                    <div>{e.text}</div>
                    <div className="mt-0.5 font-mono text-muted-foreground">{formatDuration(e.t)}</div>
                  </div>
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
      <pre
        className={cn(
          "whitespace-pre-wrap rounded-md border bg-muted/50 p-2",
          tone === "pass" ? "border-success/40 text-success" : tone === "fail" ? "border-destructive/40 text-destructive" : "border-border",
        )}
      >
        {value}
      </pre>
    </div>
  );
}

function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = value.split("\n").length;
  const gutter = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background font-mono text-[13px] leading-6">
      <div ref={gutter} className="select-none overflow-hidden border-r border-border px-3 py-3 text-right text-muted-foreground/60">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const { selectionStart: s, selectionEnd: en } = el;
            onChange(value.slice(0, s) + "    " + value.slice(en));
            requestAnimationFrame(() => {
              el.selectionStart = el.selectionEnd = s + 4;
            });
          }
        }}
        className="flex-1 resize-none bg-transparent px-4 py-3 text-foreground caret-primary outline-none"
        aria-label="Code editor"
      />
    </div>
  );
}
