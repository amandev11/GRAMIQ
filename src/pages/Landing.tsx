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
import Aurora from "@/components/reactbits/Aurora";
import SpecularButton from "@/components/reactbits/SpecularButton";
import DepthCarousel from "@/components/reactbits/DepthCarousel";
import AccordionGallery from "@/components/reactbits/AccordionGallery";
import ProfileCard from "@/components/reactbits/ProfileCard";
import { artTile, artAvatar } from "@/lib/data/art";

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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/** One slide per journey stage — mirrors the in-app rail. */
const TOUR = [
  { stage: "Idea", sub: "Speak or type your idea", glyph: "✦", from: "#4f46e5", to: "#1e1b4b" },
  { stage: "Understand", sub: "AI reads your situation", glyph: "◎", from: "#3b82f6", to: "#172554" },
  { stage: "Analyze", sub: "Local market intelligence", glyph: "▦", from: "#6366f1", to: "#1e1b4b" },
  { stage: "Simulate", sub: "Live what-if scenarios", glyph: "≋", from: "#8b5cf6", to: "#4c1d95" },
  { stage: "Optimize", sub: "Risk-aware adjustments", glyph: "⚙", from: "#06b6d4", to: "#164e63" },
  { stage: "Fund", sub: "Scheme matching with sources", glyph: "₹", from: "#818cf8", to: "#3730a3" },
  { stage: "Act", sub: "Your 12-month roadmap", glyph: "➤", from: "#22d3ee", to: "#0e7490" },
];

const SHOWCASE = [
  {
    label: "Business Blueprint",
    image: artTile({ from: "#4f46e5", to: "#0f172a", glyph: "◈", label: "BLUEPRINT", sub: "11-section plan of record" }),
  },
  {
    label: "Live Financial Simulator",
    image: artTile({ from: "#3b82f6", to: "#1e1b4b", glyph: "≋", label: "SIMULATOR", sub: "what-if in real time" }),
  },
  {
    label: "Hyper-local Market Map",
    image: artTile({ from: "#6366f1", to: "#0f172a", glyph: "◉", label: "LOCAL MAP", sub: "markets · suppliers · risk" }),
  },
  {
    label: "Scheme Matching",
    image: artTile({ from: "#8b5cf6", to: "#312e81", glyph: "₹", label: "SCHEMES", sub: "eligibility with receipts" }),
  },
  {
    label: "Bank-ready Plan PDF",
    image: artTile({ from: "#06b6d4", to: "#0f172a", glyph: "▤", label: "PLAN PDF", sub: "one click, ten sections" }),
  },
];

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
      {/* ── Nav ── */}
      <header className="glass-strong sticky top-0 z-50 border-x-0 border-t-0 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
            <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">From Idea to Business.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/judges")} className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Judges Mode
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
              onClick={() => navigate(hasBusiness ? "/dashboard" : "/onboarding")}
            >
              {hasBusiness ? "Open Dashboard" : "Build My Business"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-8 sm:pt-24">
        {/* Aurora backdrop — restrained, dark-native */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-16 h-[560px] opacity-40 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_20%,black,transparent)]"
        >
          <Aurora colorStops={["#6366f1", "#3b82f6", "#8b5cf6"]} amplitude={0.7} blend={0.45} speed={0.28} />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-300">
              <ShieldCheck className="size-3.5" />
              SIH 2026 · AI for Rural Prosperity
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mt-7 font-display text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-[3.4rem]"
          >
            Turn an idea into a{" "}
            <span className="text-gradient">viable business.</span>
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
            <SpecularButton
              size="lg"
              onClick={() => navigate("/onboarding")}
              tint="#6366f1"
              tintOpacity={0.4}
              blur={0.5}
              textColor="#e0e7ff"
              lineColor="#818cf8"
              baseColor="#1e1b4b"
              intensity={1.1}
              autoAnimate
            >
              <span className="inline-flex items-center gap-2 px-5">Build My Business <ArrowRight className="size-4" /></span>
            </SpecularButton>
            <Button size="lg" variant="outline" className="glass gap-2 rounded-full px-7 text-base transition-all hover:bg-white/5" onClick={handleDemo}>
              <Play className="size-4" /> Launch Demo
            </Button>
          </motion.div>

          <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="mt-3 text-xs text-muted-foreground/70">
            Demo loads a sample entrepreneur instantly — no sign-up needed.
          </motion.p>
        </div>

        {/* Animated pipeline — the narrative arc */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }} className="mt-16 sm:mt-20">
          <GlassCard className="ambient-glow mx-auto max-w-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
              {PIPELINE.map(({ label, icon: Icon }, i) => (
                <div key={label} className="flex items-center">
                  <motion.div
                    className="flex flex-col items-center gap-2 px-2 sm:px-5"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.16, duration: 0.35 }}
                  >
                    <motion.span
                      className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/90 to-violet-600/90 text-white shadow-lg shadow-indigo-500/20 sm:size-12"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
                    >
                      <Icon className="size-5" />
                    </motion.span>
                    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
                  </motion.div>
                  {i < PIPELINE.length - 1 && (
                    <div className="relative mx-1 mb-6 hidden h-px w-6 bg-border sm:block sm:w-10">
                      <motion.span
                        className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_2px_oklch(0.6_0.14_258/50%)]"
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

      {/* ── Features — asymmetric bento ── */}
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
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-foreground/5">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Product tour — depth carousel through the seven stages */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-20">
          <div className="mb-6 text-center">
            <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">The journey, one screen at a time</h3>
            <p className="mt-2 text-sm text-muted-foreground">Drag, scroll or just watch — each stage is a real screen in the app.</p>
          </div>
          <div className="relative h-[380px] w-full">
            <DepthCarousel
              items={TOUR.map((t) => ({
                image: artTile({ from: t.from, to: t.to, glyph: t.glyph, label: t.stage.toUpperCase(), sub: t.sub }),
                alt: t.stage,
              }))}
              cardWidth={260}
              cardHeight={330}
              radius={22}
              tint="#1e1b4b"
              depth={190}
              spread={78}
              tilt={17}
              blur={5}
              autoplay
              autoplayDelay={2800}
              loop
            />
          </div>
        </motion.div>

        {/* What GRAMIQ builds — accordion showcase */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-20">
          <div className="mb-6 text-center">
            <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Five deliverables from one idea</h3>
          </div>
          <AccordionGallery
            items={SHOWCASE}
            defaultIndex={1}
            height={340}
            radius={18}
            expandRatio={0.48}
            accentColor="#818cf8"
            overlayColor="#0f172a"
            textColor="#e0e7ff"
            trigger="hover"
          />
        </motion.div>

        {/* Provenance legend */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-6">
          <GlassCard className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Every number is labeled</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" /> VERIFIED SOURCE
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <span className="size-2 rounded-full bg-indigo-400" /> AI ESTIMATE
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <span className="size-2 rounded-full bg-amber-400" /> DEMO DATA
            </span>
            <button onClick={() => navigate("/trust")} className="text-xs font-semibold text-indigo-300 underline-offset-2 hover:underline">
              How we handle trust →
            </button>
          </GlassCard>
        </motion.div>
      </section>

      {/* ── Trust strip ── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <motion.div {...fadeUp}>
          <GlassCard className="ambient-glow p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">Trust by design</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Every number carries its provenance — <strong className="text-emerald-300">VERIFIED SOURCE</strong>,{" "}
                  <strong className="text-indigo-300">AI ESTIMATE</strong>, or{" "}
                  <strong className="text-amber-300">DEMO DATA</strong>. Financial results come from
                  deterministic formulas you can inspect, never hidden AI arithmetic. GRAMIQ never
                  guarantees business success or scheme eligibility.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Meet the demo entrepreneur + final CTA */}
        <motion.div {...fadeUp} className="mt-16 grid items-center gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="mx-auto w-full max-w-[340px]">
            <ProfileCard
              name="Ramesh Kumar"
              title="Aspiring dairy entrepreneur · Jaipur, RJ"
              handle="demo-profile"
              status="DEMO DATA"
              contactText="Launch Demo"
              avatarUrl={artAvatar("RK")}
              miniAvatarUrl={artAvatar("RK")}
              innerGradient="linear-gradient(145deg,#312e8170 0%,#8b5cf630 100%)"
              behindGlowColor="#6366f1"
              onContactClick={handleDemo}
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Meet Ramesh — and watch his idea become a business.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground lg:mx-0">
              ₹1,00,000 capital, beginner experience, Hindi-first. The entire demo journey — blueprint,
              simulator, scheme matches and a bank-ready plan — runs on his profile instantly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button size="lg" variant="outline" className="glass gap-2 rounded-full px-7 transition-all hover:bg-white/5" onClick={handleDemo}>
                <Play className="size-4" /> Launch Demo
              </Button>
              <span className="text-xs text-muted-foreground/70">No sign-up · loads in one click</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Your AI Business Copilot for Rural India.</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-7 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
              onClick={() => navigate("/onboarding")}
            >
              Build My Business <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 px-4 py-8 text-center text-xs text-muted-foreground/60 sm:px-8">
        GRAMIQ · Smart India Hackathon 2026 prototype · All scheme entries and market data in this
        demo are clearly labeled DEMO DATA — not real government schemes.
      </footer>
    </div>
  );
}
