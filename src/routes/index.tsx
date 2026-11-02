import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Radar, Users, Code2, Trophy, Zap, Shield, LineChart, Globe, ArrowRight, Swords, CheckCircle2 } from "lucide-react";
import { Logo, PlayerAvatar, TierBadge } from "@/components/duel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeDuel — Challenge Developers. Prove Your Skills." },
      { name: "description", content: "Real-time 1v1 coding battles. Get matched by rating, solve the challenge first, and climb the global leaderboard." },
      { property: "og:title", content: "CodeDuel — Challenge Developers. Prove Your Skills." },
      { property: "og:description", content: "Real-time 1v1 coding battles matched by skill rating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: Radar, title: "Enter matchmaking", text: "Hit Start Battling and join the live queue." },
  { icon: Users, title: "Matched by rating", text: "We pair you with someone at your skill level." },
  { icon: Code2, title: "Solve the challenge", text: "Same problem, same clock, your language of choice." },
  { icon: Trophy, title: "First accepted wins", text: "Pass all hidden tests first and take the rating." },
];

const FEATURES = [
  { icon: Zap, title: "Real-time duels", text: "Watch your opponent's progress live as you race to the finish." },
  { icon: Shield, title: "Fair Elo matchmaking", text: "Tight rating windows keep every match competitive." },
  { icon: LineChart, title: "Track your growth", text: "Rating history, win rates and per-language insights." },
  { icon: Globe, title: "Global leaderboard", text: "Climb from Beginner to Master and earn your spot." },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/dashboard">Sign in</Link></Button>
            <Button asChild size="sm" className="shadow-glow"><Link to="/dashboard">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> 2,847 developers battling now
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Challenge Developers.<br /><span className="text-gradient-brand">Prove Your Skills.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Real-time 1v1 coding battles. Get matched by rating, solve the same problem, and the first accepted solution takes the win.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-glow">
                <Link to="/matchmaking"><Swords className="mr-1 h-5 w-5" /> Start Battling</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/leaderboard">Explore Leaderboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
          <DuelPreview />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHead eyebrow="How it works" title="From queue to victory in four steps" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative rounded-xl border border-border bg-card p-6">
              <span className="absolute right-5 top-5 font-mono text-sm text-muted-foreground">0{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/15 text-primary"><s.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHead eyebrow="Features" title="Built for competitive developers" />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="group flex gap-5 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent transition-shadow group-hover:shadow-glow-accent"><f.icon className="h-5 w-5" /></span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          {[["120K+", "Registered developers"], ["3.4M", "Matches played"], ["850+", "Curated problems"], ["42s", "Avg. queue time"]].map(([v, l]) => (
            <div key={l} className="bg-card p-8 text-center">
              <div className="text-4xl font-black text-gradient-brand">{v}</div>
              <div className="mt-2 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-primary/10 blur-3xl" />
          <h2 className="relative text-3xl font-black sm:text-4xl">Ready for your first duel?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">Queue up now — your opponent is already warming up.</p>
          <Button asChild size="lg" className="relative mt-8 h-12 px-8 shadow-glow"><Link to="/matchmaking">Start Battling</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo />
          <div className="flex gap-6">
            <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <a href="#how" className="hover:text-foreground">How it works</a>
          </div>
          <span>© 2026 CodeDuel</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold uppercase tracking-widest text-accent">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function DuelPreview() {
  const side = (name: string, rating: number, hue: number, progress: number, delay: number, accent: boolean) => (
    <div className="flex-1 rounded-xl border border-border bg-background/60 p-4">
      <div className="flex items-center gap-3">
        <PlayerAvatar name={name} hue={hue} size={40} />
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{rating} <TierBadge rating={rating} /></div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 font-mono text-[11px] text-muted-foreground">
        {[80, 60, 90, 45].map((w, i) => (
          <motion.div key={i} className="h-2 rounded bg-muted" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: delay + i * 0.3, duration: 0.6, repeat: Infinity, repeatDelay: 4 }} />
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Tests</span><span>{Math.round(progress * 3)}/3</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div className={accent ? "h-full bg-accent" : "h-full bg-primary"} initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 2.5 }} />
        </div>
      </div>
    </div>
  );
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
      className="relative rounded-2xl border border-border bg-card p-5 shadow-glow">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-medium"><span className="h-2 w-2 animate-pulse rounded-full bg-destructive" /> LIVE · Two Sum</span>
        <span className="font-mono text-muted-foreground">12:47</span>
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {side("Alex Rivera", 1452, 280, 1, 0, false)}
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
          className="mx-auto grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-black shadow-glow">VS</motion.div>
        {side("Hana Kim", 1488, 200, 0.66, 0.4, true)}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
        <CheckCircle2 className="h-4 w-4" /> Alex Rivera — Accepted · 3/3 tests passed in 42ms
      </div>
    </motion.div>
  );
}
