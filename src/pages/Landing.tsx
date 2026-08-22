import { useCallback, useEffect, useRef, useState } from "react";
import { useBusiness } from "@/context/BusinessProvider";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { motion } from "framer-motion";
import {
  ArrowRight, Mic, MicOff, ShieldCheck, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/reactbits/Aurora";
import SpecularButton from "@/components/reactbits/SpecularButton";
import OptionWheel from "@/components/reactbits/OptionWheel";
import JourneySection from "@/components/app/JourneySection";
import { cn } from "@/lib/utils";

/* ── Data ── */

const LANG_CODES = ["hi", "en", "hinglish"] as const;
const LANG_LABELS = ["हिन्दी · Hindi", "English", "Hinglish"];

const EXAMPLES = [
  "Start a small dairy collection business",
  "Open a tea stall on the highway",
  "Begin poultry farming — broiler unit",
  "Start a mobile repair shop in my village",
  "Explore food processing — paneer and ghee",
];

/* ── Micro-language labels for the wheel ── */

function langToCode(idx: number): "hi" | "en" | "hinglish" {
  return LANG_CODES[idx] ?? "en";
}

/* ── Main ── */

export default function Landing() {
  const navigate = useNavigate();
  const { launchDemo, hasBusiness } = useBusiness();
  const { isAuthenticated, signIn } = useAuth();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── State ──
  const [idea, setIdea] = useState("");
  const [language, setLanguage] = useState<"hi" | "en" | "hinglish">("en");
  const [focused, setFocused] = useState(false);

  const isTyping = focused || idea.length > 0;

  // ── Speech ──
  const { micState, supported, start, stop } = useSpeechRecognition((transcript) => {
    setIdea((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  // ── Demo launch ──
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

  // ── Idea submission → navigate to onboarding with idea pre-filled ──
  const submitIdea = useCallback(() => {
    const trimmed = idea.trim();
    if (!trimmed) {
      // Focus input if empty
      inputRef.current?.focus();
      return;
    }
    // Navigate to onboarding with idea pre-filled
    setTimeout(() => {
      navigate(`/onboarding?idea=${encodeURIComponent(trimmed)}&lang=${language}`);
    }, 300);
  }, [idea, language, navigate]);

  // ── Keyboard shortcut: Cmd/Ctrl + Enter to submit ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && idea.trim()) {
        e.preventDefault();
        submitIdea();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idea, submitIdea]);

  // ── Mic language should follow the wheel ──
  const micLangMap: Record<string, string> = { hi: "hi-IN", en: "en-IN", hinglish: "hi-IN" };

  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/judges")} className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Judges
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-indigo-500 px-4 text-white shadow-md shadow-indigo-500/25 transition-all hover:brightness-110"
              onClick={() => navigate(hasBusiness ? "/dashboard" : "/onboarding")}
            >
              {hasBusiness ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero + Idea Console ── */}
      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-8 sm:pt-28">
        {/* Aurora — very restrained */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-[480px] opacity-30 [mask-image:radial-gradient(ellipse_55%_50%_at_50%_15%,black,transparent)]"
        >
          <Aurora colorStops={["#6366f1", "#3b82f6", "#818cf8"]} amplitude={0.6} blend={0.4} speed={0.25} />
        </div>

        <div className="relative mx-auto max-w-2xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-xs font-semibold tracking-wide text-indigo-400"
          >
            SIH 2026 · AI for Rural Prosperity
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-center font-display text-3xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl"
          >
            What are you thinking of{" "}
            <span className="text-gradient">building?</span>
          </motion.h1>

          {/* Idea Console — the core interaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mt-8 rounded-2xl border transition-all duration-300",
              isTyping
                ? "border-indigo-500/40 bg-foreground/[0.06] shadow-lg shadow-indigo-500/5"
                : "border-border/50 bg-foreground/[0.03]",
            )}
          >
            {/* Language selector — only visible when console is active */}
            <div className="flex items-center gap-3 border-b border-border/30 px-4 py-2">
              <span className="text-[11px] font-medium text-muted-foreground">Language</span>
              <div className="flex h-8 items-center">
                <OptionWheel
                  items={LANG_LABELS}
                  defaultSelected={1}
                  onChange={(i) => setLanguage(langToCode(i))}
                  textColor="#64748b"
                  activeColor="#818cf8"
                  fontSize={0.85}
                  side="right"
                  spacing={2}
                  curve={0}
                  tilt={0}
                />
              </div>
              <span className="ml-auto text-[11px] text-muted-foreground/60">
                {language === "hi" ? "हिन्दी" : language === "hinglish" ? "Hinglish" : "English"}
              </span>
            </div>

            {/* Input area */}
            <div className="relative px-4 pt-3 pb-2">
              <textarea
                ref={inputRef}
                id="idea-console"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={2}
                placeholder={focused ? "Describe your business idea…" : "Start a dairy business, open a tea stall, begin poultry farming…"}
                className="w-full resize-none bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-lg"
                aria-label="Your business idea"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    submitIdea();
                  }
                }}
              />
            </div>

            {/* Bottom bar: examples, mic, CTA */}
            <div className="flex items-center gap-2 border-t border-border/30 px-4 py-2.5">
              {/* Example chips */}
              {!isTyping && (
                <div className="hidden flex-1 flex-wrap gap-1.5 sm:flex">
                  {EXAMPLES.slice(0, 3).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIdea(ex);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-border/40 bg-foreground/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-indigo-500/30 hover:text-foreground"
                    >
                      {ex.length > 36 ? `${ex.slice(0, 34)}…` : ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Mic */}
              {supported ? (
                <button
                  type="button"
                  onClick={() => {
                    if (micState === "listening") { stop(); return; }
                    start(micLangMap[language] ?? "en-IN");
                  }}
                  aria-label={
                    micState === "listening" ? "Stop listening" :
                    micState === "denied" ? "Microphone permission denied" :
                    micState === "unavailable" ? "Microphone unavailable" :
                    "Speak your idea"
                  }
                  disabled={micState === "denied" || micState === "unavailable"}
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
                    micState === "listening"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-foreground/[0.06] text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  {micState === "listening" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />
                  )}
                  {micState === "listening" ? <MicOff className="relative size-4" /> : <Mic className="relative size-4" />}
                </button>
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground/40">
                  <MicOff className="size-4" />
                </span>
              )}

              {/* Mic state label */}
              {micState === "listening" && (
                <span className="hidden text-xs text-red-400 sm:inline">Listening…</span>
              )}
              {micState === "denied" && (
                <span className="hidden text-xs text-amber-400 sm:inline">Permission denied — enable in browser settings</span>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Keyboard hint */}
              <span className="hidden items-center gap-1 text-[10px] text-muted-foreground/50 sm:flex">
                <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5 font-mono text-[9px]">⌘</kbd>
                <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5 font-mono text-[9px]">↵</kbd>
              </span>

              {/* Analyze CTA */}
              <SpecularButton
                size="sm"
                onClick={submitIdea}
                tint="#6366f1"
                tintOpacity={0.3}
                textColor="#e0e7ff"
                lineColor="#818cf8"
                baseColor="#312e81"
                intensity={idea.trim() ? 1.2 : 0.5}
                disabled={!idea.trim()}
                className="rounded-full"
              >
                <span className="inline-flex items-center gap-1.5 px-4 text-sm font-semibold">
                  Analyze <ArrowRight className="size-3.5" />
                </span>
              </SpecularButton>
            </div>
          </motion.div>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-center text-xs text-muted-foreground/60"
          >
            Or{" "}
            <button onClick={handleDemo} className="font-medium text-indigo-400 underline-offset-2 hover:underline">
              launch a demo
            </button>{" "}
            with a sample entrepreneur — no sign-up.
          </motion.p>
        </div>
      </section>

      {/* ── How GRAMIQ works — one coherent visual journey ── */}
      <JourneySection />

      {/* ── Provenance ── */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-border/30 bg-foreground/[0.03] px-6 py-4">
          <span className="text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase">Every number is labeled</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" /> VERIFIED SOURCE
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <span className="size-1.5 rounded-full bg-indigo-400" /> AI ESTIMATE
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-400" /> DEMO DATA
          </span>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-8">
        <div className="flex items-start gap-4 rounded-xl border border-border/30 bg-foreground/[0.03] p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
          <div>
            <h3 className="font-display text-sm font-bold">Trust by design</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Financial results come from deterministic formulas — never hidden AI arithmetic.
              Government scheme data is clearly labeled DEMO DATA and never fabricated.
              GRAMIQ never guarantees business success or scheme eligibility.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative px-4 pt-4 pb-24 text-center sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, oklch(0.45 0.12 275 / 9%), transparent 70%)" }}
        />
        <div className="relative">
          <p className="text-[11px] font-bold tracking-[0.3em] text-indigo-400 uppercase">Gramiq · Start</p>
          <h2 className="mt-5 font-display text-3xl leading-tight tracking-tight sm:text-5xl">
            <span className="text-muted-foreground/70">Your AI copilot for</span>{" "}
            <span className="text-gradient font-extrabold">rural India.</span>
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              className="gap-2 rounded-full bg-indigo-500 px-7 text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110"
              onClick={() => navigate("/onboarding")}
            >
              Build My Business <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 px-4 py-6 text-center text-[11px] text-muted-foreground/50 sm:px-8">
        GRAMIQ · Smart India Hackathon 2026 · All scheme and market data labeled DEMO DATA
      </footer>
    </div>
  );
}
