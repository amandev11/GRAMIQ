import { GlassCard, ScoreRing } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/context/BusinessProvider";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech";
import type { EntrepreneurProfile } from "@/lib/types";

import { computeScores } from "@/lib/intelligence/scores";
import { cn } from "@/lib/utils";
import OptionWheel from "@/components/reactbits/OptionWheel";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BadgeIndianRupee, Building2, CheckCircle2, Coins,
  MapPin, Mic, MicOff, Sparkles, Target, UserRound, Volume2, VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

/* ── Quick-start options ── */

const QUICK_STARTS = [
  { key: "new-business" as const, label: "Start a new business", icon: Sparkles },
  { key: "improve" as const, label: "Improve my existing business", icon: Building2 },
  { key: "funding" as const, label: "Find funding", icon: Coins },
  { key: "finances" as const, label: "Understand my finances", icon: BadgeIndianRupee },
  { key: "compare" as const, label: "Compare business ideas", icon: ArrowRight },
  { key: "schemes" as const, label: "Find suitable schemes", icon: Target },
] as const;

const GOAL_MAP: Record<string, typeof QUICK_STARTS[number]["key"]> = {
  "new-business": "new-business",
  improve: "improve",
  funding: "funding",
  finances: "finances",
  compare: "compare",
  schemes: "schemes",
};

/* ── Language config ── */

const LANG_CODES = ["hi", "en", "hinglish"] as const;
const LANG_LABELS = ["हिन्दी · Hindi", "English", "Hinglish"];

function langToCode(idx: number): typeof LANG_CODES[number] {
  return LANG_CODES[idx] ?? "en";
}
function codeToIndex(lang: string): number {
  return LANG_CODES.indexOf(lang as typeof LANG_CODES[number]);
}

/* ── Voice language map ── */

const VOICE_LANG: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  hinglish: "hi-IN",
};

/* ── Meaningful AI pipeline stages ── */

const AI_STAGES = [
  "Understanding your idea",
  "Identifying your customer",
  "Mapping local market",
  "Testing financial assumptions",
  "Evaluating differentiation",
  "Identifying key risks",
  "Building your business model",
  "Generating next steps",
];

/* ── Component ── */

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setProfile, launchDemo, financials } = useBusiness();
  const { isAuthenticated, signIn } = useAuth();

  // ── URL pre-fill ──
  const urlIdea = searchParams.get("idea") ?? "";
  const urlLang = searchParams.get("lang");

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
  const [idea, setIdea] = useState(urlIdea);
  const [capital, setCapital] = useState("100000");
  const [experience, setExperience] = useState<"beginner" | "some" | "experienced">("beginner");
  const [goal, setGoal] = useState<typeof QUICK_STARTS[number]["key"]>("new-business");

  // ── Language: URL param → center of wheel (English default) ──
  const initialLangIdx = urlLang
    ? codeToIndex(urlLang)
    : 1; // English default

  const [langIdx, setLangIdx] = useState(initialLangIdx);
  const language = langToCode(langIdx);

  // ── Voice response preference: should GRAMIQ speak its responses aloud?
  // This is a TTS OUTPUT preference — NOT microphone input. No mic permission
  // is requested here; it only gates the existing SpeakButton in the copilot.
  const [voiceResponses, setVoiceResponses] = useState<boolean>(() => {
    try {
      return localStorage.getItem("gramiq-voice-responses") === "on";
    } catch {
      return false;
    }
  });

  // Persist the preference so CopilotPanel can read it.
  useEffect(() => {
    try {
      localStorage.setItem("gramiq-voice-responses", voiceResponses ? "on" : "off");
    } catch {
      /* storage unavailable — preference stays session-only */
    }
  }, [voiceResponses]);

  // ── Speech ──
  const { micState, start, stop } = useSpeechRecognition((transcript) => {
    setIdea((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });




  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);

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
      voiceResponses,
    };
  }

  /** Cinematic generation: meaningful stages from the AI pipeline. */
  function finish() {
    setGenerating(true);
    const p = buildProfile();
    setGenPhase(0);

    // Each stage lights up — total ~4s before navigation
    const stageDuration = 450;
    AI_STAGES.forEach((_, i) => {
      setTimeout(() => setGenPhase(i + 1), stageDuration * (i + 1));
    });
    // Save profile and navigate after last stage
    setTimeout(() => {
      setProfile(p);
      navigate("/dashboard");
    }, stageDuration * (AI_STAGES.length + 1));
  }

  const steps = [
    // Step 0: Quick start
    <div key="s0" className="space-y-4">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Tell us what you want to build.</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {QUICK_STARTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setGoal(key); setStep(1); }}
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

    // Step 1: Idea + voice
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

      {/* Voice input — shows all states clearly */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              if (micState === "listening") { stop(); return; }
              start(VOICE_LANG[language] ?? "en-IN");
            }}
            disabled={micState === "unavailable" || micState === "denied"}
            aria-label={
              micState === "listening" ? "Stop listening" :
              micState === "denied" ? "Microphone permission denied" :
              micState === "unavailable" ? "Microphone unavailable in this browser" :
              "Speak your idea"
            }
            className={cn(
              "relative flex size-16 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95",
              micState === "listening"
                ? "bg-red-500"
                : micState === "denied" || micState === "unavailable"
                  ? "bg-foreground/10 text-muted-foreground"
                  : "bg-indigo-500",
            )}
          >
            {micState === "listening" && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />}
            {micState === "listening" ? (
              <MicOff className="relative size-6" />
            ) : micState === "denied" || micState === "unavailable" ? (
              <MicOff className="relative size-6" />
            ) : (
              <Mic className="relative size-6" />
            )}
          </button>
        </div>
        <div className="text-sm">
          {micState === "listening" && (
            <span className="text-red-400">Listening… speak now</span>
          )}
          {micState === "processing" && (
            <span className="text-indigo-400">Processing…</span>
          )}
          {micState === "completed" && (
            <span className="text-emerald-400">Got it — edit freely below</span>
          )}
          {micState === "denied" && (
            <span className="text-amber-400">Permission denied — enable microphone in browser settings</span>
          )}
          {micState === "unavailable" && (
            <span className="text-muted-foreground">Voice not supported in this browser — type your idea instead</span>
          )}
          {micState === "error" && (
            <span className="text-amber-400">Voice error — please try again or type</span>
          )}
          {micState === "idle" && (
            <span className="text-muted-foreground">Or press and speak — {language === "hi" ? "हिन्दी" : language === "hinglish" ? "Hinglish" : "English"}</span>
          )}
        </div>
      </div>
    </div>,

    // Step 2: Who & where
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

    // Step 3: How should GRAMIQ communicate?
    // Three decisions, nothing else: language, response style, voice output.
    <div key="s3" className="space-y-5">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">How should GRAMIQ respond to you?</h2>

      {/* Language wheel — AI response language. Loops infinitely; English centered by default. */}
      <GlassCard className="flex flex-col items-center bg-foreground/4 p-4">
        <div className="relative flex h-44 w-full items-center justify-center">
          {/* Center emphasis guides */}
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
          <OptionWheel
            items={LANG_LABELS}
            defaultSelected={1} // English centered by default
            onChange={(i) => setLangIdx(i)}
            textColor="#64748b"
            activeColor="#a5b4fc"
            fontSize={1.15}
            spacing={1.5}
            curve={0.8}
            tilt={7}
            blur={1.4}
            fade={0.32}
            minOpacity={0.12}
            loop // infinite looping — Hindi above English, Hinglish below, wrapping seamlessly
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Choose the language you'd like GRAMIQ to speak in.</p>
      </GlassCard>

      {/* Voice responses toggle — TTS OUTPUT preference, NOT microphone input.
          No mic permission is requested here. */}
      <GlassCard className={cn(
        "flex items-center justify-between bg-foreground/4 p-4 transition-colors",
        voiceResponses && "ring-1 ring-indigo-500/30",
      )}>
        <div className="flex items-start gap-3">
          <span className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            voiceResponses ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25" : "bg-foreground/6 text-muted-foreground",
          )}>
            {voiceResponses ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold">Let GRAMIQ speak</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {voiceResponses
                ? "Responses are also read aloud where your browser supports it."
                : "Responses stay text-only. You can enable audio replies anytime."}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={voiceResponses}
          aria-label="Voice responses"
          onClick={() => setVoiceResponses((v) => !v)}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
            voiceResponses ? "bg-indigo-500" : "bg-foreground/15",
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn(
              "absolute top-1 size-5 rounded-full bg-white shadow-md",
              voiceResponses ? "right-1" : "left-1",
            )}
          />
        </button>
      </GlassCard>

      {/* Dynamic reflection of current choice — shows the selection is live */}
      <p className="text-center text-xs text-muted-foreground">
        GRAMIQ will respond in{" "}
        <strong className="font-semibold text-indigo-300">
          {language === "hi" ? "हिन्दी (Hindi)" : language === "hinglish" ? "Hinglish" : "English"}
        </strong>
        {voiceResponses && <> with spoken replies</>}.
      </p>
    </div>,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate("/")}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
          </button>
          <Button variant="outline" size="sm" className="glass rounded-full" onClick={handleDemoLaunch}>
            Launch Demo
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
                i <= step ? "bg-indigo-500" : "bg-foreground/10",
              )}
            />
          ))}
        </div>

        {/* AI Generation Sequence — meaningful pipeline stages */}
        {generating ? (
          <GlassCard className="p-8">
            <div className="flex flex-col items-center text-center">
              {genPhase >= AI_STAGES.length ? (
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
                  <ScoreRing score={computeScores(buildProfile(), financials).overall} size={120} label="Ready" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                  className="flex size-16 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                >
                  <Sparkles className="size-7" />
                </motion.div>
              )}
              <p className="mt-4 font-display text-lg font-bold">
                {genPhase >= AI_STAGES.length ? "Your blueprint is ready" : genPhase > 0 ? AI_STAGES[genPhase - 1] : "Starting analysis…"}
              </p>
            </div>
            <ul className="mx-auto mt-6 max-w-md space-y-1.5">
              {AI_STAGES.map((label, i) => {
                const done = genPhase > i;
                const active = genPhase === i;
                return (
                  <li
                    key={label}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm transition-all duration-300",
                      done ? "bg-foreground/6 text-foreground" : active ? "bg-foreground/8 text-foreground" : "text-muted-foreground/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <span className={cn(
                          "size-3.5 shrink-0 rounded-full border-2",
                          active ? "border-indigo-400 border-t-transparent animate-spin" : "border-foreground/15",
                        )} style={{ animationDuration: "0.8s" }} />
                      )}
                      {label}
                    </span>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                  Build My Business <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
