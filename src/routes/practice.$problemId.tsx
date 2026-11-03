import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Play, Send, RotateCcw, Activity, Terminal, CheckCircle2, XCircle, Loader2, ArrowLeft, Swords } from "lucide-react";
import { toast } from "sonner";
import { Logo, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchProblem, executeRunCode, executeSubmitCode, type Problem } from "@/lib/api";
import { LANGUAGES, DIFF_CLASS, type Language } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice/$problemId")({
  head: ({ params }) => ({
    meta: [
      { title: `Practice ${params.problemId} — CodeDuel` },
      { name: "description", content: "Solo practice coding sandbox." },
    ],
  }),
  component: PracticePage,
});

type TestResult = { status: "pass" | "fail"; output: string; expected?: string; stdout?: string; time: number };

function PracticePage() {
  const { problemId } = Route.useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState<Language>("python");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [activeCase, setActiveCase] = useState(0);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [consoleTab, setConsoleTab] = useState<"cases" | "output">("cases");
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    fetchProblem(problemId)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load problem for practice:", err);
        setLoading(false);
      });
  }, [problemId]);

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

        if (response.success) {
          toast.success("Sample tests passed!");
        } else {
          toast.error("Some test cases failed.");
        }
      } else {
        const response = await executeSubmitCode({
          matchId: "practice",
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
          toast.success("Accepted! All test cases passed!");
        } else {
          toast.error(`Wrong Answer (${response.passedTests}/${response.totalTests} passed)`);
        }
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      setLog((l) => [...l, `✗ Execution Error: ${err.message || err}`]);
      toast.error("Execution error. Check console output.");
    } finally {
      setRunning(null);
    }
  }

  if (loading || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-sidebar px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
            <Link to="/problems">
              <ArrowLeft className="h-4 w-4 mr-1" /> Problems
            </Link>
          </Button>
          <Logo />
          <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Solo Practice
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8">
            <Link to="/matchmaking">
              <Swords className="mr-1.5 h-3.5 w-3.5" /> Duel on This Problem
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Grid: Problem on left, Editor + Console on right */}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(340px,1fr)_minmax(0,1.8fr)] lg:overflow-hidden">
        {/* Left: Problem Description */}
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

          <h1 className="mt-3 text-2xl font-bold">{problem.title}</h1>

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
                {ex.explanation && <div className="font-sans text-muted-foreground mt-1">Explanation: {ex.explanation}</div>}
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

        {/* Right: Code Editor & Execution Console */}
        <section className="flex min-h-[600px] flex-col lg:min-h-0">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
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
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset Code
            </Button>
          </div>

          <CodeEditor value={code} onChange={(v) => setCodes((c) => ({ ...c, [lang]: v }))} />

          {/* Test Cases & Console Tabs */}
          <div className="flex h-64 shrink-0 flex-col border-t border-border">
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
                  {log.length === 0 && <div className="text-muted-foreground">Run your code to see compiler logs here.</div>}
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

