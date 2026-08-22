import { GlassCard, ScoreRing } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { compareBusinesses } from "@/lib/intelligence/blueprint";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { cn } from "@/lib/utils";
import LineSidebar from "@/components/reactbits/LineSidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Bot, FileText, LineChart, MapPinned, Play, Ribbon,
  ShieldAlert, Sparkles, Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const STEPS = [
  {
    key: "problem",
    icon: Sparkles,
    kicker: "The Problem",
    stage: "IDEA",
    title: "Millions of micro-entrepreneurs plan blind",
    body: "A rural entrepreneur with ₹1 lakh has no access to consultants, no financial model, no scheme knowledge and no local market data. Most small ventures fail not from lack of effort — but from lack of a plan.",
  },
  {
    key: "solution",
    icon: Bot,
    kicker: "The Solution",
    stage: "UNDERSTAND",
    title: "GRAMIQ: a business operating system, not a chatbot",
    body: "Seven specialist AI analysts — business, financial, market, risk, scheme, planning and copilot — produce structured, schema-validated output. The chat is just one window into the intelligence engine.",
  },
  {
    key: "finance",
    icon: LineChart,
    kicker: "Financial Engine",
    stage: "SIMULATE",
    title: "Deterministic math you can audit",
    body: `EMI = P·r·(1+r)ⁿ/((1+r)ⁿ−1). Break-even = fixed costs ÷ contribution per unit. The AI never does arithmetic — it explains engine output. Change one input and every page recalculates instantly.`,
  },
  {
    key: "simulator",
    icon: Target,
    kicker: "Risk Simulation",
    stage: "SIMULATE",
    title: "Live what-if on your real model",
    body: "The simulator shows before/after for revenue, profit, margin and break-even in real time, plus base/optimistic/conservative/stress presets — each answer labeled as an AI ESTIMATE.",
  },
  {
    key: "local",
    icon: MapPinned,
    kicker: "Hyper-Local Intelligence",
    stage: "ANALYZE",
    title: "Your village, your market",
    body: "Nearby markets, supplier points, competitors and opportunity zones on an interactive map — with demand signals and a location score. Synthetic points are always labeled DEMO DATA.",
  },
  {
    key: "schemes",
    icon: Ribbon,
    kicker: "Scheme Discovery",
    stage: "FUND",
    title: "Transparent eligibility matching",
    body: "A deterministic filter checks each criterion first (location ✓ sector ✓ investment ✓), then the AI explains the result with source, excerpt and last-verified date. No fabricated schemes. Ever.",
  },
  {
    key: "risk",
    icon: ShieldAlert,
    kicker: "Business Health & Risk",
    stage: "ANALYZE",
    title: "A readiness score with receipts",
    body: "Five scored factors — financial viability, market, risk resilience, funding readiness, operations — each clickable to reveal why it scored that way and how to improve it.",
  },
  {
    key: "plan",
    icon: FileText,
    kicker: "Actionable Output",
    stage: "ACT",
    title: "From idea to a bank-ready plan in minutes",
    body: "A 10-section professional business-plan PDF, a 7/30/90/365-day action roadmap, and a copilot that answers questions against the live model.",
  },
] as const;

const STEP_LABELS = [
  "The Problem",
  "The Solution",
  "Financial Engine",
  "Risk Simulation",
  "Hyper-local AI",
  "Scheme Matching",
  "Health & Risk",
  "Business Plan",
];

export default function JudgesMode() {
  const navigate = useNavigate();
  const { profile, financials } = useBusiness();
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const comparison = profile ? compareBusinesses() : null;
  // Simulator step title uses a scenario from the user's ACTUAL business.
  const simTitle = `\u201c${profile ? detectBusinessModel(profile.businessIdea).scenarioQuestions[0] : "What if prices fall?"}\u201d`;

  const s = STEPS[step];
  const Icon = s.icon;
  const title = s.key === "simulator" ? simTitle : s.title;

  // Autoplay advances through the story
  useEffect(() => {
    if (!autoplay || step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((v) => v + 1), 4200);
    return () => clearTimeout(t);
  }, [autoplay, step]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
      {/* Stage navigator — desktop rail */}
      <aside className="hidden self-start lg:sticky lg:top-24 lg:block" aria-label="Story steps">
        <LineSidebar
          key={step}
          items={STEP_LABELS}
          defaultActive={step}
          onItemClick={(i) => {
            setAutoplay(false);
            setStep(i);
          }}
          accentColor="#0d9488"
          textColor="#64748b"
          markerColor="#cbd5e1"
          fontSize={0.95}
          itemGap={14}
        />
      </aside>

      <div className="min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="font-display text-lg font-bold">GRAMIQ · Judges Mode</p>
            <p className="text-xs text-muted-foreground">SIH26091 — the whole story, self-guided</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!profile ? (
            <Button onClick={() => { navigate("/"); }} variant="outline" className="glass rounded-full gap-2">
              <Play className="size-4" /> Load demo first
            </Button>
          ) : null}
          <Button
            variant={autoplay ? "default" : "outline"}
            className={cn("gap-2 rounded-full", !autoplay && "glass")}
            disabled={!profile}
            onClick={() => {
              setAutoplay((a) => !a);
              setStep(0);
            }}
          >
            {autoplay ? "Stop" : "Play story"} <Play className="size-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 flex gap-1.5">
        {STEPS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => setStep(i)}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              i === step ? "bg-gradient-to-r from-indigo-500 to-violet-500" : i < step ? "bg-indigo-500/35" : "bg-foreground/10",
            )}
          />
        ))}
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <GlassCard className="overflow-hidden p-7 sm:p-10">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-600/15 text-indigo-300 ring-1 ring-indigo-500/20">
              <Icon className="size-6" />
            </span>
            <div className="mt-5 flex items-center gap-2">
              <p className="text-xs font-bold tracking-[0.25em] text-indigo-300 uppercase">{s.kicker}</p>
              <span className="rounded-full bg-foreground/6 px-2 py-0.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{s.stage}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{s.body}</p>

            {/* Live evidence */}
            {profile && step === 2 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(() => {
                  const f = computeFinancials(financials);
                  return [
                    ["Monthly profit", formatInr(f.operatingProfit)],
                    ["Break-even", `${f.breakEvenMonths} mo`],
                    ["Margin", `${f.profitMarginPct}%`],
                    ["Annual ROI", `${f.roiPct}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-foreground/6 p-3 ring-1 ring-white/5">
                      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</p>
                      <p className="font-display font-bold tabular">{v}</p>
                    </div>
                  ));
                })()}
              </div>
            )}

            {profile && comparison && step === 6 && (
              <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl bg-foreground/5 p-5 ring-1 ring-white/5">
                <ScoreRing score={comparison.totals[comparison.recommendationIndex]} size={110} label="Best fit" />
                <div className="min-w-0 flex-1 text-sm leading-relaxed">
                  <p className="font-semibold">Live comparison engine output:</p>
                  <p className="text-muted-foreground">{comparison.recommendation}</p>
                </div>
                <Button variant="outline" className="glass shrink-0 rounded-full" onClick={() => navigate("/compare")}>
                  Open scoring matrix <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {(step === 3 || step === 4 || step === 5 || step === 7) && profile && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Open Simulator", to: "/finance", show: step === 3 },
                  { label: "Open Market Map", to: "/market", show: step === 4 },
                  { label: "Open Schemes", to: "/schemes", show: step === 5 },
                  { label: "Open Plan PDF", to: "/business-plan", show: step === 7 },
                ].filter((b) => b.show).map((b) => (
                  <Button key={b.label} variant="outline" className="glass rounded-full" onClick={() => navigate(b.to)}>
                    {b.label} <ArrowRight className="size-4" />
                  </Button>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => { setAutoplay(false); setStep((v) => v - 1); }}>
          <ArrowLeft className="size-4" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => { setAutoplay(false); setStep((v) => v + 1); }} className="gap-2 rounded-full">
            Next <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => navigate(profile ? "/dashboard" : "/onboarding")} className="gap-2 rounded-full">
            Explore the product <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}
