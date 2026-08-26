import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { describeAuthError } from "@/lib/auth-errors";
import { processAuthLinkFromUrl, readAuthLinkFromUrl } from "@/lib/auth-link";
import { ApplyPilotLogo } from "@/components/ApplyPilotLogo";
import { ArrowRight, FilePenLine, Gauge, ListTodo, MailCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ApplyPilot · Know if you’re a real fit before you apply" },
      { name: "description", content: "Analyze your CV against actual job requirements, improve your application without inventing experience, and create a tailored cover letter." },
      { property: "og:title", content: "Know if you’re a real fit before you apply · ApplyPilot" },
      { property: "og:description", content: "Evidence-grounded CV analysis, improvements, cover letters, and application tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const probe = async () => {
      const target = await processAuthLinkFromUrl();
      if (target) {
        router.navigate({ to: target });
        return;
      }

      const { type } = readAuthLinkFromUrl();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.navigate({ to: type === "recovery" ? "/reset-password" : "/" });
      }
    };

    probe().catch((e) => console.error("[auth] session probe failed:", e));
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fail = (err: unknown) => {
    const info = describeAuthError(err);
    setError(info.message);
    if (info.retryAfter) setCooldown(info.retryAfter);
    if (info.kind === "rate_limit") setCooldown(60);
    toast.error(info.message);
    return info;
  };

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError(null);
    setNotice(null);
    setSent(false);
    setPassword("");
    setConfirmPassword("");
  };

  const openAuth = (next: "signin" | "signup") => {
    switchMode(next);
    setShowAuth(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const display = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              first_name: firstName.trim() || null,
              last_name: lastName.trim() || null,
              display_name: display || null,
            },
          },
        });
        if (err) throw err;
        if (data.session) {
          toast.success("Account created");
          router.navigate({ to: "/" });
          return;
        }
        // Supabase returns a user with no identities when the email already exists.
        if (data.user && data.user.identities?.length === 0) {
          setError("That email already has an account. Sign in instead, or reset your password.");
          return;
        }
        setSent(true);
        setCooldown(60);
        toast.success("Confirmation email sent");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        toast.success("Welcome back");
        router.navigate({ to: "/" });
      }
    } catch (err) {
      const info = fail(err);
      if (info.kind === "unconfirmed") setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setCooldown(60);
      setNotice("Confirmation email sent again.");
      toast.success("Confirmation email sent");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      fail(err);
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <ApplyPilotLogo markClassName="h-9 w-9" />
          </div>
          <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Confirm your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to {email || "your inbox"}. Open it to activate your
              account, then sign in. Check your spam folder if it hasn't arrived in a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
            <Button
              className="w-full"
              onClick={resendConfirmation}
              disabled={busy || cooldown > 0 || !email.trim()}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend confirmation email"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => switchMode("signin")}>
              Back to sign in
            </Button>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <ApplyPilotLogo markClassName="h-9 w-9" />
          <nav aria-label="Landing page" className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#evidence" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Evidence standard</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openAuth("signin")}
              className="px-2 text-sm font-medium transition-colors hover:text-primary"
            >
              Sign in
            </button>
            <Button size="sm" onClick={() => openAuth("signup")} className="hidden sm:inline-flex">
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/80">
          <div aria-hidden="true" className="absolute -right-32 top-16 h-80 w-80 rounded-full border border-accent/25" />
          <div aria-hidden="true" className="absolute -right-20 top-28 h-56 w-56 rounded-full border border-primary/10" />
          <div className="relative mx-auto grid min-h-[46rem] max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.02fr)_minmax(430px,0.78fr)] lg:gap-24 lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-3 border-y border-border py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Evidence-grounded application support
              </div>
              <h1 className="max-w-3xl font-serif text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[4.35rem]">
                Know if you’re a real fit before you apply.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Compare your CV with the job description, see genuine strengths and gaps, improve your wording without inventing experience, and create a tailored cover letter.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => openAuth("signup")} className="h-12 px-7 shadow-sm">
                  Analyze My Application
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7">
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
              <div className="mt-9 grid max-w-2xl grid-cols-3 border-y border-border/80 py-4 text-xs text-muted-foreground">
                {[
                  ["01", "Upload your CV"],
                  ["02", "Paste the job"],
                  ["03", "Get your application plan"],
                ].map(([number, item], index) => (
                  <span
                    key={item}
                    className={`flex flex-col gap-1 px-3 first:pl-0 ${index > 0 ? "border-l border-border" : ""}`}
                  >
                    <span className="font-mono text-[0.62rem] text-accent">{number}</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {showAuth ? (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-background px-5 py-8">
                <div className="mx-auto w-full max-w-md">
                  <div className="mb-6 text-center">
                    <ApplyPilotLogo markClassName="h-9 w-9" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuth(false)}
                    className="mb-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ← Back to overview
                  </button>
      <Card className="w-full border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            {mode === "signup" ? "Start your analysis" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Create an account to analyze your first application."
              : "Sign in to continue to ApplyPilot."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={google} disabled={busy}>
            Continue with Google
          </Button>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              )}
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy || cooldown > 0}>
              {busy
                ? "Please wait…"
                : cooldown > 0
                  ? `Try again in ${cooldown}s`
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
            </Button>
          </form>

          {mode === "signin" && (
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => router.navigate({ to: "/forgot-password" })}
            >
              Forgot your password?
            </button>
          )}
        </CardContent>
      </Card>
                </div>
              </div>
            ) : (
              <div id="example" className="relative scroll-mt-24 lg:py-6">
                <div aria-hidden="true" className="absolute -bottom-3 -right-3 top-9 hidden w-full rounded-xl border border-accent/45 lg:block" />
                <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_rgba(31,77,61,0.12)]">
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary/35" />
                      <span className="h-2 w-2 rounded-full bg-accent/60" />
                      <span className="h-2 w-2 rounded-full bg-border" />
                    </div>
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">Application analysis</span>
                  </div>
                  <div className="border-b border-border px-5 py-4 sm:px-7">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Clinical Pharmacist · Community Care</p>
                    <p className="mt-1 text-xs text-muted-foreground">CV compared with 10 role requirements</p>
                  </div>

                  <div className="grid gap-6 px-5 py-6 sm:grid-cols-[8rem_1fr] sm:px-7">
                    <div className="flex flex-col items-center justify-center border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-primary/15 outline outline-1 outline-offset-4 outline-accent/35">
                        <div className="text-center">
                          <span className="font-serif text-4xl font-semibold leading-none text-primary">80</span>
                          <span className="block text-[0.65rem] text-muted-foreground">out of 100</span>
                        </div>
                      </div>
                      <span className="mt-5 rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold text-primary">Strong alignment</span>
                    </div>

                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Strongest evidence</p>
                      <ul className="mt-3.5 space-y-3 text-sm text-foreground">
                        {['Pharm.D matches education requirement', 'Patient counselling experience', 'Community pharmacy experience'].map((item) => (
                          <li key={item} className="flex gap-2.5"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary">✓</span><span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-border bg-[#FCF8F4] px-5 py-5 sm:px-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-sm border border-destructive/25 bg-card px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-destructive">Critical</span>
                      <span className="text-xs font-medium text-muted-foreground">Mandatory requirement</span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-foreground">“The CV does not evidence the required pharmacy license.”</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-b border-border/80 bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  One application workspace
                </p>
                <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
                  From “Should I apply?” to a stronger submission.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:justify-self-end">
                ApplyPilot connects the four decisions job seekers usually make across separate tools—fit, CV wording, cover letter, and follow-up—without losing sight of what the CV actually proves.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Gauge,
                  number: "01",
                  title: "Analyze Fit",
                  description: "See your match score, strongest evidence, and critical qualification gaps.",
                },
                {
                  icon: FilePenLine,
                  number: "02",
                  title: "Improve Your CV",
                  description: "Get clearer, ATS-aware rewrites that never add unsupported experience.",
                },
                {
                  icon: MailCheck,
                  number: "03",
                  title: "Create Cover Letter",
                  description: "Build a concise letter from real CV evidence and this job’s priorities.",
                },
                {
                  icon: ListTodo,
                  number: "04",
                  title: "Track Applications",
                  description: "Keep roles, CV versions, statuses, and next steps in one organized view.",
                },
              ].map(({ icon: Icon, number, title: featureTitle, description }, index) => (
                <article
                  key={featureTitle}
                  className={`py-8 md:px-7 lg:py-10 ${
                    index % 2 === 1 ? "md:border-l md:border-border" : ""
                  } ${index > 0 ? "border-t border-border md:border-t-0" : ""} ${
                    index > 1 ? "md:border-t md:border-border lg:border-t-0" : ""
                  } ${index > 0 ? "lg:border-l lg:border-border" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary">
                      <Icon className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                    <span className="font-mono text-[0.62rem] tracking-[0.16em] text-accent">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{featureTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="evidence" className="scroll-mt-24 border-b border-border/80 bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-24">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="h-px w-8 bg-accent" />
                Evidence, not invention
              </p>
              <h2 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-5xl">
                AI that doesn’t make you more qualified than you are.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                ApplyPilot treats your CV as the source of truth. Missing qualifications stay missing. It helps you present your real experience better—not fabricate a stronger candidate.
              </p>
              <div className="mt-10 border-l-2 border-accent pl-5">
                <p className="font-serif text-2xl font-semibold">Missing stays missing.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ApplyPilot can improve your wording. It won’t manufacture qualifications.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(31,77,61,0.09)]">
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Rewrite integrity check
                </p>
              </div>
              <div className="divide-y divide-border">
                <div className="px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Unsupported rewrite</span>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-semibold text-muted-foreground">Rejected</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground line-through decoration-muted-foreground/35">
                    “Administered immunizations and ensured compliance with vaccination protocols.”
                  </p>
                </div>
                <div className="bg-primary/[0.035] px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">ApplyPilot rewrite</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold text-primary">CV-supported</span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-foreground">
                    “Provided patient counselling and OTC guidance in a fast-paced community pharmacy setting.”
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <span className="text-sm text-foreground">Immunization training</span>
                  <span className="text-xs font-medium text-muted-foreground">Missing requirement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-8 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><span className="h-px w-8 bg-accent" />The application workflow</p>
              <h2 className="mt-5 font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
                Three focused steps. One stronger application.
              </h2>
            </div>

            <div className="mt-16 divide-y divide-border border-y border-border">
              <article className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:py-16">
                <div>
                  <span className="text-xs font-semibold tracking-[0.18em] text-primary">01</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">Analyze Fit</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Understand alignment, strengths, mandatory requirements and evidence gaps.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)]">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Requirement coverage</span><span className="font-serif text-2xl font-semibold text-primary">80%</span></div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-4/5 rounded-full bg-primary" /></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><span className="border-r border-border text-primary">7 supported</span><span className="border-r border-border text-muted-foreground">2 partial</span><span className="text-muted-foreground">1 critical</span></div>
                </div>
              </article>

              <article className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20 lg:py-16">
                <div className="order-2 rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)] lg:order-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Original</p>
                  <p className="mt-2 text-sm text-muted-foreground">Helped patients understand their medicines.</p>
                  <div className="my-4 border-t border-border" />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">Suggested rewrite</p>
                  <p className="mt-2 text-sm font-medium leading-6">Provided medication counselling to help patients understand safe and appropriate medicine use.</p>
                </div>
                <div className="order-1 lg:order-2">
                  <span className="text-xs font-semibold tracking-[0.18em] text-primary">02</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">Improve Your CV</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Get targeted rewrites grounded only in experience already supported by your CV.</p>
                </div>
              </article>

              <article className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:py-16">
                <div>
                  <span className="text-xs font-semibold tracking-[0.18em] text-primary">03</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">Create Your Cover Letter</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Turn the strongest CV-to-job connections into a concise tailored letter.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-[0_14px_35px_rgba(31,77,61,0.07)]">
                  <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-xs font-semibold text-foreground">Clinical Pharmacist</span><span className="text-[0.65rem] text-muted-foreground">Tailored draft</span></div>
                  <div className="mt-4 space-y-2.5"><div className="h-2 w-11/12 rounded bg-muted" /><div className="h-2 w-full rounded bg-muted" /><div className="h-2 w-4/5 rounded bg-muted" /><div className="h-2 w-10/12 rounded bg-primary/15" /></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="tracker" className="scroll-mt-24 border-b border-border/80 bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.68fr_1.32fr] lg:items-center lg:gap-24">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><span className="h-px w-8 bg-accent" />Application tracker</p>
              <h2 className="mt-5 font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">From analysis to application.</h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">Keep applications and CV versions organized after deciding which opportunities are worth pursuing.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_20px_50px_rgba(31,77,61,0.09)]">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><span>Application</span><span>Status</span></div>
              {[
                ["Community Pharmacist", "Saved"],
                ["Clinical Pharmacist", "Applied"],
                ["Pharmacy Resident", "Interview"],
              ].map(([role, status]) => (
                <div key={role} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                  <div><p className="text-sm font-medium">{role}</p><p className="mt-1 text-xs text-muted-foreground">CV attached</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${status === "Interview" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div aria-hidden="true" className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full border border-primary-foreground/10" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-9 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
            <h2 className="max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Know what matches. Know what doesn’t. Apply with evidence.
            </h2>
            <Button size="lg" variant="secondary" onClick={() => openAuth("signup")} className="h-11 shrink-0 px-6">
              Analyze My Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <ApplyPilotLogo markClassName="h-7 w-7" wordmarkClassName="text-base text-foreground" />
          <span>Evidence-grounded support for better job applications.</span>
        </div>
      </footer>
    </div>
  );
}
