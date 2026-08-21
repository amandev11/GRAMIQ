import { GlassCard, ScoreRing } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/context/BusinessProvider";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech";
import type { EntrepreneurProfile } from "@/lib/types";
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { computeScores } from "@/lib/intelligence/scores";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BadgeIndianRupee, Building2, CheckCircle2, Coins, Languages, Lightbulb,
  MapPin, Mic, MicOff, Sparkles, Target, UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const QUICK_STARTS = [
  { key: "new-business", label: "Start a new business", icon: Sparkles },
  { key: "improve", label: "Improve my existing business", icon: Building2 },
  { key: "funding", label: "Find funding", icon: Coins },
  { key: "finances", label: "Understand my finances", icon: BadgeIndianRupee },
  { key: "compare", label: "Compare business ideas", icon: ArrowRight },
  { key: "schemes", label: "Find suitable schemes", icon: Target },
] as const;

const GOAL_MAP: Record<string, (typeof QUICK_STARTS)[number]["key"]> = {
  "new-business": "new-business",
  improve: "improve",
  funding: "funding",
  finances: "finances",
  compare: "compare",
  schemes: "schemes",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile, launchDemo, financials } = useBusiness();
  const { isAuthenticated, signIn } = useAuth();

  async function handleDemoLaunch() {
    launchDemo();
    try {
      if (!isAuthenticated) await signIn("anonymous");
      navigate("/dashboard");
    } catch {
      navigate("/auth?returnTo=%2Fdashboard");
    }
  }
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setStateName] = useState("Rajasthan");
  const [idea, setIdea] = useState("");
  const [capital, setCapital] = useState("100000");
  const [experience, setExperience] = useState<"beginner" | "some" | "experienced">("beginner");
  const [goal, setGoal] = useState<(typeof QUICK_STARTS)[number]["key"]>("new-business");
  const [language, setLanguage] = useState<"hi" | "en" | "hinglish">("hi");
  const [generating, setGenerating] = useState(false);
  const [genSteps, setGenSteps] = useState<Array<{ label: string; detail: string }>>([]);
  const [genPhase, setGenPhase] = useState(0);
  const { listening, supported, start, stop } = useSpeechRecognition((t) => setIdea((p) => (p ? `${p} ${t}` : t)));

  /** Build the profile object exactly as it will be saved. */
  function buildProfile(): EntrepreneurProfile {
    return {
      name: name.trim() || "Entrepreneur",
      location: {
        state: state.trim() || "Rajasthan",
        district: district.trim() || "Jaipur",
        village: village.trim() || "Bassi",
      },
      businessIdea: idea.trim() || "Small dairy business — collect milk locally and sell to households",
      capital: Math.max(0, parseInt(capital.replace(/\D/g, "") || "0", 10)),
      existingBusiness: goal === "improve" ? "full" : "none",
      experience,
      resources: ["Family labor available"],
      goal: GOAL_MAP[goal],
      timelineMonths: 6,
      language,
    };
  }

  /** Cinematic generation: each stage shows genuinely computed values. */
  function finish() {
    setGenerating(true);
    const p = buildProfile();
    const fin = computeFinancials(financials);
    const scores = computeScores(p, financials);
    setGenSteps([
      { label: "Understanding your idea", detail: `${p.businessIdea.split("—")[0].trim().slice(0, 44)}… · ${p.location.village}, ${p.location.district}` },
      { label: "Structuring your financial model", detail: `Startup ${formatInr(fin.totalStartupCost)} · profit ${formatInr(fin.operatingProfit)}/mo · break-even ${Number.isFinite(fin.breakEvenMonths) ? fin.breakEvenMonths : "—"} mo` },
      { label: "Scoring feasibility & risk", detail: `Readiness ${scores.overall}/100 · ${scores.breakdown.filter((b) => b.score >= 60).length}/5 factors healthy` },
    ]);
    // Stage timings keep total under ~2.4s
    window.setTimeout(() => setGenPhase(1), 700);
    window.setTimeout(() => setGenPhase(2), 1450);
    window.setTimeout(() => {
      setGenPhase(3);
      setProfile(p);
    }, 2150);
    window.setTimeout(() => navigate("/dashboard"), 2750);
  }

  const steps = [
    // Step 0: quick start
    <div key="s0" className="space-y-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Tell us what you want to build.</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {QUICK_STARTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setGoal(key);
              setStep(1);
            }}
            className={cn(
              "glass glass-hover flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium",
              goal === key && "ring-2 ring-primary/50",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>,

    // Step 1: idea + voice
    <div key="s1" className="space-y-5">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">What is your business idea?</h2>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={3}
        placeholder="e.g. I want to start a small dairy — collect milk from farmers and sell in my village"
        className="glass w-full resize-none rounded-2xl p-4 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40"
        aria-label="Business idea"
      />
      {supported && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => (listening ? stop() : start("hi-IN"))}
            aria-label={listening ? "Stop voice input" : "Speak your idea"}
            className={cn(
              "relative flex size-16 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95",
              listening
                ? "bg-gradient-to-br from-rose-500 to-red-600"
                : "bg-gradient-to-br from-teal-500 to-sky-600",
            )}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/50" />}
            {listening ? <MicOff className="relative size-6" /> : <Mic className="relative size-6" />}
          </button>
          <p className="text-sm text-muted-foreground">
            {listening ? "Listening… speak in Hindi or English" : "Or press and speak — Hindi, English or Hinglish"}
          </p>
        </div>
      )}
    </div>,

    // Step 2: who & where
    <div key="s2" className="space-y-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">A little about you</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><UserRound className="size-3.5" /> Your name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Coins className="size-3.5" /> Capital available (₹)</span>
          <Input value={capital} onChange={(e) => setCapital(e.target.value)} inputMode="numeric" placeholder="100000" />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MapPin className="size-3.5" /> Village / town</span>
          <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Bassi" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">District</span>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Jaipur" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">State</span>
            <Input value={state} onChange={(e) => setStateName(e.target.value)} />
          </label>
        </div>
      </div>
      <div>
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Experience</span>
        <div className="flex flex-wrap gap-2">
          {(["beginner", "some", "experienced"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setExperience(e)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm capitalize transition-colors",
                experience === e ? "border-primary bg-primary/12 font-semibold text-primary" : "glass",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: language + generate
    <div key="s3" className="space-y-5">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">How should GRAMIQ talk to you?</h2>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {([["hi", "हिन्दी"], ["en", "English"], ["hinglish", "Hinglish"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setLanguage(key)}
            className={cn(
              "glass flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold",
              language === key && "ring-2 ring-primary/50",
            )}
          >
            <Languages className="size-4 text-primary" /> {label}
          </button>
        ))}
      </div>
      <GlassCard className="flex items-start gap-3 bg-white/50 p-4">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Regional-language responses and external STT/TTS services plug into the same voice pipeline.
          You can change this anytime in settings.
        </p>
      </GlassCard>
    </div>,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/")}>
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
          </button>
          <Button
            variant="outline"
            size="sm"
            className="glass rounded-full"
            onClick={handleDemoLaunch}
          >
            Launch Demo instead
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
        {/* Progress */}
        <div className="mb-8 flex gap-2" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-gradient-to-r from-teal-500 to-sky-500" : "bg-foreground/10",
              )}
            />
          ))}
        </div>

        {/* Cinematic generation sequence — every value shown is genuinely computed */}
        {generating ? (
          <GlassCard className="p-8">
            <div className="flex flex-col items-center text-center">
              {genPhase >= 3 && genSteps.length === 3 ? (() => {
                const p = buildProfile();
                const scores = computeScores(p, financials);
                return (
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
                    <ScoreRing score={scores.overall} size={128} label="Ready" />
                  </motion.div>
                );
              })() : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                  className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-lg"
                >
                  <Sparkles className="size-7" />
                </motion.div>
 )}
              <p className="mt-4 font-display text-lg font-bold">
                {genPhase >= 3 ? "Your business blueprint is ready" : "Building your blueprint…"}
              </p>
            </div>
            <ul className="mx-auto mt-6 max-w-md space-y-2.5">
              {genSteps.map((s, i) => {
                const active = genPhase >= i;
                const done = genPhase > i;
                return (
                  <li
                    key={s.label}
                    className={cn(
                      "rounded-xl px-4 py-3 transition-all duration-500",
                      active ? "bg-white/70 ring-1 ring-teal-600/20" : "bg-foreground/4 opacity-40",
                    )}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <span className="size-4 shrink-0 animate-pulse rounded-full border-2 border-teal-600 border-t-transparent" style={{ animationDuration: "0.9s" }} />
                      )}
                      {s.label}
                    </p>
                    {active && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-1 pl-6 text-xs text-muted-foreground tabular">
                        {s.detail}
                      </motion.p>
                    )}
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard className="p-6 sm:p-8">{steps[step]}</GlassCard>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step < 3 ? (
                <Button disabled={step === 0} onClick={() => setStep((s) => s + 1)} className="gap-2">
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={finish} className="gap-2">
                  Build My Business Plan <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
