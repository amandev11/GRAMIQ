import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/context/BusinessProvider";
import { answerQuestion, buildCopilotSuggestions, type CalcStep, type CopilotMetric } from "@/lib/intelligence/copilot";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { L, pick, type Lang } from "@/lib/i18n/strings";
import { cn } from "@/lib/utils";
import type { CopilotChip, CopilotMessage, EntrepreneurProfile } from "@/lib/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, Mic, MicOff, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSpeechRecognition } from "@/hooks/use-speech";

/** Opening message is built from the user's ACTUAL business — never a fixed script. */
function buildOpening(profile: EntrepreneurProfile): CopilotMessage {
  const lang: Lang = profile.language ?? "en";
  const t = L.copilot;
  const model = detectBusinessModel(profile.businessIdea);
  const modelName: Record<Lang, string> = {
    en: model.label,
    hi: model.label,
    hinglish: model.label,
  };
  const text: Record<Lang, string> = {
    en: `I've built a live model of your ${modelName[lang].toLowerCase()} plan and I can see every number in it. Ask about profit, risks or schemes — or say "what if I only have ₹80,000?" and I'll simulate it.`,
    hi: `मैंने आपकी ${modelName[lang]} योजना का लाइव मॉडल बना लिया है और उसका हर आँकड़ा देख सकता हूँ। लाभ, जोखिम या योजनाओं के बारे में पूछें — या कहें "अगर मेरे पास केवल ₹80,000 हों?" और मैं सिम्युलेट करूँगा।`,
    hinglish: `Maine aapki ${modelName[lang]} plan ka live model bana liya hai aur uski har value dekh sakta hoon. Profit, risks ya schemes ke baare mein poocho — ya bolo "agar mere paas sirf ₹80,000 hon?" aur main simulate karunga.`,
  };
  return {
    id: "opening",
    role: "assistant",
    headline: pick(t.openingHeadline, lang),
    text: pick(text, lang),
    chips: buildCopilotSuggestions(profile),
    source: "AI ESTIMATE",
  };
}

/** Typewriter reveal for assistant answers (skipped under reduced motion). */
function StreamedText({ text, speakLang, autoSpeak }: { text: string; speakLang?: string; autoSpeak?: boolean }) {
  const reduced = useReducedMotion();
  const [len, setLen] = useState(reduced ? text.length : 0);
  const done = len >= text.length;

  useEffect(() => {
    if (reduced || done) return;
    const iv = window.setInterval(() => {
      setLen((l) => {
        if (l >= text.length) {
          window.clearInterval(iv);
          return l;
        }
        return Math.min(l + 4, text.length);
      });
    }, 14);
    return () => window.clearInterval(iv);
  }, [text, reduced, done]);

  return (
    <>
      <span className="whitespace-pre-line">
        {text.slice(0, len)}
        {!done && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-primary align-middle" />}
      </span>
      {done && speakLang && <SpeakButton text={text} lang={speakLang} autoSpeak={autoSpeak} />}
    </>
  );
}

function SpeakButton({ text, lang, autoSpeak }: { text: string; lang: string; autoSpeak?: boolean }) {
  const [speaking, setSpeaking] = useState(false);
  function toggle() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speakNow();
  }

  function speakNow() {
    if (!("speechSynthesis" in window)) return;
    // Strip bullet/number prefixes for cleaner speech
    const clean = text.replace(/^[•\-\d.\s]+/gm, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  // If the user enabled voice responses in onboarding, auto-speak new answers.
  const spokeRef = useRef("");
  useEffect(() => {
    if (autoSpeak && text && spokeRef.current !== text && "speechSynthesis" in window) {
      spokeRef.current = text;
      requestAnimationFrame(() => speakNow());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoSpeak]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop reading aloud" : "Read answer aloud"}
      className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground"
    >
      {speaking ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}

function MetricDeltas({ metrics }: { metrics: CopilotMetric[] }) {
  return (
    <div className={cn("grid gap-1.5", metrics.length >= 4 ? "grid-cols-2" : "grid-cols-3")}>
      {metrics.map((m) => {
        const changed = m.before !== m.after && m.before !== "—";
        return (
          <div key={m.label} className="rounded-xl bg-foreground/8 p-2.5 ring-1 ring-white/5">
            <p className="text-[10px] leading-tight tracking-wide text-muted-foreground uppercase">{m.label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              {changed && <span className="text-[11px] text-muted-foreground">{m.before}</span>}
              {changed && <ArrowDownToLine className="size-3 -translate-y-0.5 rotate-[-90deg] text-muted-foreground/60" />}
              <motion.span
                key={m.after}
                initial={changed ? { opacity: 0.3, y: -2 } : false}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold tabular"
              >
                {m.after}
              </motion.span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalculationSteps({ steps }: { steps: CalcStep[] }) {
  return (
    <div className="space-y-1.5 rounded-xl bg-slate-900/95 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
      {steps.map((s, i) => (
        <div key={i}>
          <p>{s.expression}</p>
          <p className="pl-3 text-[10px] text-white/40">// {s.note}</p>
        </div>
      ))}
    </div>
  );
}

export function CopilotPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { profile, financials, actionItems } = useBusiness();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { micState, supported, start, stop } = useSpeechRecognition((transcript) => {
    setInput(transcript);
  });
  const listening = micState === "listening";

  // Conversation memory is scoped to the CURRENT analysis: a new business
  // idea starts a fresh session — previous analyses can never leak in.
  const sessionKey = profile ? `${profile.businessIdea}|${profile.language}` : "none";
  useEffect(() => {
    if (profile) setMessages([buildOpening(profile)]);
    else setMessages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  function runChip(chip: CopilotChip) {
    if (chip.to) {
      navigate(chip.to);
      onOpenChange(false);
      return;
    }
    ask(chip.label);
  }

  function ask(qRaw: string) {
    const question = qRaw.trim();
    if (!question || !profile) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: question }]);
    setThinking(true);
    // Orchestration pipeline latency (deterministic brain responds instantly;
    // delay preserves the conversational rhythm)
    window.setTimeout(() => {
      const ans = answerQuestion(question, profile, financials, actionItems);
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          role: "assistant",
          headline: ans.headline,
          text: ans.text,
          metrics: ans.metrics,
          calcSteps: ans.calcSteps,
          chips: ans.chips,
          source: ans.source,
        },
      ]);
      setThinking(false);
    }, 600);
  }

  const speakLang = profile?.language === "hi" ? "hi-IN" : "en-IN";
  const suggestions = profile ? buildCopilotSuggestions(profile) : [];
  const unitShort = profile ? detectBusinessModel(profile.businessIdea).unitShort : "";

  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      role="dialog"
      aria-modal="true"
      aria-label="AI Copilot"
      aria-hidden={!open}
      style={{ visibility: open ? "visible" : "hidden", transitionDelay: open ? "0ms" : "320ms" }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "glass-strong absolute inset-y-0 right-0 flex w-full flex-col transition-transform duration-300 ease-out sm:max-w-md",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Business Copilot</p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live model · {financials.unitsPerMonth.toLocaleString("en-IN")} {unitShort}/mo
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close copilot" onClick={() => onOpenChange(false)}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Contextual suggestions — derived from this business, not generic */}
        <div className="border-b border-border/40 px-4 py-2.5">
          <p className="mb-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
            {pick({ en: "Ask about this business", hi: "इस व्यवसाय के बारे में पूछें", hinglish: "Is business ke baare mein poocho" }, profile?.language ?? "en")}
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="list" aria-label="Suggested questions">
            {suggestions.map((chip) => (
              <button
                key={chip.label}
                role="listitem"
                onClick={() => runChip(chip)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-medium whitespace-nowrap text-primary transition-colors hover:bg-primary/15"
              >
                {chip.label}
                {chip.to && <ArrowUpRight className="size-3 opacity-70" />}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[94%] rounded-2xl px-3.5 py-3 text-sm",
                    m.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "glass w-full rounded-bl-md space-y-2.5",
                  )}
                >
                  {m.role === "assistant" && (
                    <>
                      {m.headline && (
                        <p className="font-display text-sm leading-snug font-bold">{m.headline}</p>
                      )}
                      {m.metrics && <MetricDeltas metrics={m.metrics} />}
                      {m.calcSteps && <CalculationSteps steps={m.calcSteps} />}
                    </>
                  )}
                  {m.role === "user" ? m.text : <StreamedText text={m.text} speakLang={speakLang} autoSpeak={profile?.voiceResponses ?? false} />}
                  {m.role === "assistant" && m.source && (
                    <span
                      className={cn(
                        "inline-block rounded-full border px-1.5 py-px text-[9px] font-bold tracking-widest uppercase",
                        m.source === "DEMO DATA"
                          ? "border-amber-500/30 bg-amber-400/12 text-amber-700"
                          : "border-violet-500/25 bg-violet-400/10 text-violet-300",
                      )}
                    >
                      {m.source}
                    </span>
                  )}
                </div>
                {m.chips && m.chips.length > 0 && (
                  <div className="flex max-w-full flex-wrap gap-1.5">
                    {m.chips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => runChip(chip)}
                        className={cn(
                          "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          chip.to
                            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                            : "border-primary/30 bg-primary/8 text-primary hover:bg-primary/15",
                        )}
                      >
                        {chip.label}
                        {chip.to && <ArrowUpRight className="size-3 opacity-70" />}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <div className="glass inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-primary/70"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          className="flex items-center gap-2 border-t border-border/60 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          {supported ? (
            <Button
              type="button"
              size="icon"
              variant={listening ? "default" : "outline"}
              aria-label={micState === "listening" ? "Stop listening" : micState === "denied" ? "Microphone permission denied" : micState === "unavailable" ? "Microphone unavailable" : "Speak your question"}
              disabled={micState === "denied" || micState === "unavailable"}
              onClick={() => {
                if (micState === "listening") { stop(); return; }
                const langMap: Record<string, string> = { hi: "hi-IN", en: "en-IN", hinglish: "hi-IN" };
                start(langMap[profile?.language ?? "en"] ?? "en-IN");
              }}
              className={cn("shrink-0 rounded-full", listening && "animate-pulse")}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          ) : (
            <Button type="button" size="icon" variant="outline" disabled aria-label="Voice input not supported in this browser" className="shrink-0 rounded-full">
              <MicOff className="size-4" />
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Ask about your business…"}
            aria-label="Ask the copilot"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={!input.trim()} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
        <p className="px-4 pb-2 text-center text-[10px] text-muted-foreground">
          Answers are AI ESTIMATES computed from your financial model — never guarantees.
        </p>
      </div>
    </div>
  );
}
