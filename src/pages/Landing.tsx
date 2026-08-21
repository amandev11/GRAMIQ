import { useBusiness } from "@/context/BusinessProvider";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, FileText, LayoutDashboard, LineChart, MapPinned, Mic, Play,
  Ribbon, Scale, ShieldCheck, Sparkles, Target,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/primitives";

/** Mirrors the in-app journey rail — one narrative everywhere. */
const PIPELINE = [
  { label: "Idea", icon: Sparkles },
  { label: "Understand", icon: LayoutDashboard },
  { label: "Analyze", icon: MapPinned },
  { label: "Simulate", icon: LineChart },
  { label: "Optimize", icon: Scale },
  { label: "Fund", icon: Ribbon },
  { label: "Act", icon: Target },
];

const FEATURES = [
  {
    icon: LineChart,
    title: "A financial engine, not a guess",
    desc: "EMI, break-even, ROI and 12-month projections come from open formulas you can inspect line by line. The AI explains the math — it never performs it.",
    span: "lg:col-span-2",
  },
  {
    icon: Bot,
    title: "Seven specialists, one copilot",
    desc: "Business, financial, market, risk, scheme and planning analysts produce structured answers grounded in your live model.",
    span: "",
  },
  {
    icon: MapPinned,
    title: "Hyper-local, not generic",
    desc: "Markets, suppliers, competitors and opportunity zones for your village — scores that move when your plan moves.",
    span: "",
  },
  {
    icon: Ribbon,
    title: "Scheme discovery with receipts",
    desc: "A deterministic eligibility filter shows every criterion, document, source and verification date before the AI says a word.",
    span: "",
  },
  {
    icon: Mic,
    title: "Voice-first",
    desc: "Speak your idea in Hindi, English or Hinglish — GRAMIQ extracts the numbers and asks only what's missing.",
    span: "",
  },
  {
    icon: FileText,
    title: "Idea in, bank-ready plan out",
    desc: "A professional 10-section business plan PDF with projections, risks and funding options — generated in one click from your live model.",
    span: "lg:col-span-2",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Landing() {
  const navigate = useNavigate();
  const { launchDemo, hasBusiness } = useBusiness();
  const { isAuthenticated, signIn } = useAuth();

  async function handleDemo() {
    launchDemo();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      try {
        await signIn("anonymous");
        navigate("/dashboard");
      } catch {
        navigate("/auth?returnTo=%2Fdashboard");
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="glass-strong sticky top-0 z-40 border-x-0 border-t-0 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
            <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">From Idea to Business.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/judges")} className="hidden sm:inline-flex">
              Judges Mode
            </Button>
            <Button size="sm" onClick={() => navigate(hasBusiness ? "/dashboard" : "/onboarding")}>
              {hasBusiness ? "Open Dashboard" : "Build My Business"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-700">
              <ShieldCheck className="size-3.5" />
              SIH 2026 · AI for Rural Prosperity
            </span>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mt-6 font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl"
          >
            Turn an idea into a <span className="text-gradient">viable business.</span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            AI-powered business intelligence, financial planning and local opportunity
            insights — built for India's micro-entrepreneurs.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" className="gap-2 rounded-full px-7 text-base" onClick={() => navigate("/onboarding")}>
              Build My Business <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="glass gap-2 rounded-full px-7 text-base" onClick={handleDemo}>
              <Play className="size-4" /> Launch Demo
            </Button>
          </motion.div>
          <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="mt-3 text-xs text-muted-foreground">
            Demo loads a sample entrepreneur instantly — no sign-up needed.
          </motion.p>
        </div>

        {/* Animated pipeline */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }} className="mt-16 sm:mt-20">
          <GlassCard className="mx-auto max-w-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
              {PIPELINE.map(({ label, icon: Icon }, i) => (
                <div key={label} className="flex items-center">
                  <motion.div
                    className="flex flex-col items-center gap-2 px-2 sm:px-5"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.18, duration: 0.4 }}
                  >
                    <motion.span
                      className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/90 to-sky-600/90 text-white shadow-lg sm:size-13"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
                    >
                      <Icon className="size-5" />
                    </motion.span>
                    <span className="text-xs font-semibold tracking-wide text-foreground/80 uppercase">{label}</span>
                  </motion.div>
                  {i < PIPELINE.length - 1 && (
                    <div className="relative mx-1 mb-6 hidden h-px w-6 bg-border sm:block sm:w-10">
                      <motion.span
                        className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-teal-500 shadow-[0_0_8px_2px_oklch(0.7_0.12_190/60%)]"
                        animate={{ left: ["0%", "92%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 + i * 0.35, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Features — asymmetric bento */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Why GRAMIQ</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Not a chatbot — a decision-support system that takes you from
            "I want to start a business" to a funded, planned venture.
          </p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, span }, i) => (
            <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className={span}>
              <GlassCard hover className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-sky-600/15 text-teal-700 ring-1 ring-teal-600/20">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-foreground/6">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Provenance legend */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-6">
          <GlassCard className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Every number is labeled</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" /> VERIFIED SOURCE
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              <span className="size-2 rounded-full bg-sky-500" /> AI ESTIMATE
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span className="size-2 rounded-full bg-amber-500" /> DEMO DATA
            </span>
            <button onClick={() => navigate("/trust")} className="text-xs font-semibold text-teal-700 underline-offset-2 hover:underline">
              How we handle trust →
            </button>
          </GlassCard>
        </motion.div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <motion.div {...fadeUp}>
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-600/20">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Trust by design</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Every number carries its provenance — <strong>VERIFIED SOURCE</strong>,{" "}
                  <strong>AI ESTIMATE</strong>, or <strong>DEMO DATA</strong>. Financial results come from
                  deterministic formulas you can inspect, never hidden AI arithmetic. GRAMIQ never
                  guarantees business success or scheme eligibility.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Your AI Business Copilot for Rural India.</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2 rounded-full px-7" onClick={() => navigate("/onboarding")}>
              Build My Business <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="glass rounded-full px-7" onClick={handleDemo}>
              <Play className="size-4" /> Explore Demo
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 px-4 py-8 text-center text-xs text-muted-foreground sm:px-8">
        GRAMIQ · Smart India Hackathon 2026 prototype · All scheme entries and market data in this
        demo are clearly labeled DEMO DATA — not real government schemes.
      </footer>
    </div>
  );
}
