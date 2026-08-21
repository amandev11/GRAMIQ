import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/context/BusinessProvider";
import { answerQuestion } from "@/lib/intelligence/copilot";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CopilotMessage } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/use-speech";

const OPENING: CopilotMessage = {
  id: "opening",
  role: "assistant",
  text: "Namaste! I'm your GRAMIQ copilot. I can see your live business model — ask me about profit, risks, break-even, schemes, or ask me to simulate a decision.",
  chips: ["What is my biggest risk?", "What if I invest ₹1.5 lakh?", "Show my break-even", "Any schemes for me?"],
  source: "AI ESTIMATE",
};

export function CopilotPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { profile, financials } = useBusiness();
  const [messages, setMessages] = useState<CopilotMessage[]>([OPENING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { listening, supported, start, stop } = useSpeechRecognition((transcript) => {
    setInput(transcript);
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function ask(q: string) {
    const question = q.trim();
    if (!question || !profile) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: question }]);
    setThinking(true);
    // Simulated orchestration latency for the structured answer pipeline
    window.setTimeout(() => {
      const ans = answerQuestion(question, profile, financials);
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: ans.text, chips: ans.chips, source: ans.source },
      ]);
      setThinking(false);
    }, 650);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="AI Copilot">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="glass-strong absolute inset-y-0 right-0 flex w-full flex-col sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Business Copilot</p>
              <p className="text-[11px] text-muted-foreground">Grounded in your live financial model</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close copilot" onClick={() => onOpenChange(false)}>
            <X className="size-5" />
          </Button>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col gap-1.5", m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "glass rounded-bl-md",
                )}
              >
                {m.text}
              </div>
              {m.chips && m.chips.length > 0 && (
                <div className="flex max-w-full flex-wrap gap-1.5">
                  {m.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => ask(chip)}
                      className="rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
              aria-label={listening ? "Stop listening" : "Speak your question"}
              onClick={() => (listening ? stop() : start("en-IN"))}
              className={cn("shrink-0 rounded-full", listening && "animate-pulse")}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          ) : (
            <Button type="button" size="icon" variant="outline" disabled aria-label="Voice input unavailable" className="shrink-0 rounded-full">
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
          Answers are AI ESTIMATES computed from your financial model — not guarantees.
        </p>
      </div>
    </div>
  );
}
