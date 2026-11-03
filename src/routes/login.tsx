import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Lock, User, Mail, ArrowRight, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/duel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { useUser } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In / Register — CodeDuel" },
      { name: "description", content: "Sign in to your CodeDuel account or create a new one to compete." },
      { property: "og:title", content: "Sign In — CodeDuel" },
      { property: "og:description", content: "Sign in to your CodeDuel account or create a new one to compete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useUser();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated || isLoading) {
    return <DashboardSkeleton />;
  }

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regHandle, setRegHandle] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast.error("Please enter both username/email and password");
      return;
    }
    setLoading(true);
    try {
      await login(loginIdentifier, loginPassword);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName || !regHandle || !regEmail || !regPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(regName, regHandle, regEmail, regPassword);
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function quickDemoLogin(handle: string) {
    setLoading(true);
    try {
      await login(handle, "password123");
      toast.success(`Logged in as @${handle}!`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error("Demo login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />

      <header className="relative flex items-center justify-between px-6 py-4">
        <Logo />
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Back to Home</Link>
        </Button>
      </header>

      <div className="relative mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-glow sm:p-8">
          <div className="flex rounded-lg border border-border bg-muted/50 p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="alexr or alex@codeduel.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-glow mt-2">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Sign In to Arena
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="reg-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Handle (Username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">@</span>
                    <Input
                      type="text"
                      placeholder="coder_pro"
                      value={regHandle}
                      onChange={(e) => setRegHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      className="pl-8 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="alex@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-glow mt-2">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Create Account
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative my-6 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-2">or quick start with demo accounts</span>
            <div className="absolute inset-0 top-1/2 border-t border-border" />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => quickDemoLogin("alexr")}
              className="w-full text-xs justify-between hover:border-primary/50"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-3.5 w-3.5 text-warning" />
                Sign in as <strong>@alexr</strong>
              </span>
              <span className="font-mono text-muted-foreground">Rating 1180</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => quickDemoLogin("demo")}
              className="w-full text-xs justify-between hover:border-accent/50"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Sign in as <strong>@demo</strong>
              </span>
              <span className="font-mono text-muted-foreground">Rating 1250</span>
            </Button>
          </div>
        </div>
      </div>

      <footer className="relative px-6 py-4 text-center text-xs text-muted-foreground">
        CodeDuel Arena · Real-time 1v1 Competitive Coding & Matchmaking Engine
      </footer>
    </div>
  );
}

