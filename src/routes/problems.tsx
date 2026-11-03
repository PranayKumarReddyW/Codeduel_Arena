import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Code2, Swords, CheckCircle2, Terminal, ArrowRight, BookOpen } from "lucide-react";
import { AppShell, Loading } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProblems, type Problem } from "@/lib/api";
import { DIFF_CLASS, type Difficulty } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/problems")({
  head: () => ({
    meta: [
      { title: "Problems Library — CodeDuel" },
      { name: "description", content: "Browse and practice competitive coding problems." },
      { property: "og:title", content: "Problems Library — CodeDuel" },
      { property: "og:description", content: "Browse and practice competitive coding problems." },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("All");

  useEffect(() => {
    fetchProblems()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load problems:", err);
        setLoading(false);
      });
  }, []);

  const filtered = problems.filter((p) => {
    const matchesDiff = difficulty === "All" || p.difficulty.toLowerCase() === difficulty.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesDiff && matchesSearch;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Problem Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Solve problems solo with our compiler, or challenge someone to a duel.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-glow">
            <Link to="/matchmaking">
              <Swords className="mr-2 h-4 w-4" /> Quick Match
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  difficulty === d
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <div className="mt-3 font-semibold">No problems found</div>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search query or difficulty filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((prob) => (
              <div
                key={prob.id}
                className="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {prob.title}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        DIFF_CLASS[prob.difficulty as Difficulty] || "border-border text-muted-foreground",
                      )}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {prob.tags.map((tag) => (
                      <span key={tag} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link to="/practice/$problemId" params={{ problemId: prob.id }}>
                      <Terminal className="mr-1.5 h-3.5 w-3.5 text-primary" /> Practice Solo
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-9">
                    <Link to="/matchmaking">
                      <Swords className="mr-1.5 h-3.5 w-3.5" /> Duel
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

