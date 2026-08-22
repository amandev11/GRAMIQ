import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n/strings";

/**
 * Sectioned text-to-speech for the Business Plan report.
 *
 * Splits the report into sections and reads them sequentially, with:
 *  - play / pause / resume / stop
 *  - active-section highlighting (so the user can read along)
 *  - language-matched voice selection (hi → hi-IN, en → en-IN, hinglish → hi-IN)
 *  - graceful fallback when the browser has no voice for the requested language
 *  - cleanup on unmount / navigation / page change (stops speech cleanly)
 *
 * Never fakes audio. If TTS is unavailable or no matching voice exists,
 * the state becomes "unsupported" and the UI shows a graceful message.
 */

export type PlayerState = "idle" | "playing" | "paused" | "unsupported";

export interface ReportSection {
  key: string;
  text: string; // plain text to speak (no markdown)
}

/** Map GRAMIQ language → BCP-47 speech tag. */
const SPEECH_LANG: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  hinglish: "hi-IN", // Hinglish has no dedicated code; use hi-IN as the closest
};

export function useReportPlayer(sections: ReportSection[], lang: Lang) {
  const [state, setState] = useState<PlayerState>("idle");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [unsupportedReason, setUnsupportedReason] = useState<string | null>(null);

  const idxRef = useRef(0); // next section index to speak
  const pausedRef = useRef(false);
  const mountedRef = useRef(true);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  /** Pick a voice that best matches the requested BCP-47 tag. */
  const pickVoice = useCallback((bcp47: string): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    // Try exact match, then language-only prefix match, then any same-language
    const exact = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase());
    if (exact) return exact;
    const prefix = bcp47.split("-")[0].toLowerCase();
    const langMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    return langMatch ?? null;
  }, [supported]);

  // Ref to hold the recursive speakSection function (avoids self-reference in useCallback)
  const speakRef = useRef<((idx: number) => void) | null>(null);

  /** Speak a single section; advances to the next on end. */
  const speakSectionImpl = useCallback((idx: number) => {
    if (!mountedRef.current || !supported) return;
    if (idx >= sections.length) {
      // Finished all sections
      setState("idle");
      setActiveKey(null);
      idxRef.current = 0;
      return;
    }

    const section = sections[idx];
    idxRef.current = idx;
    setActiveKey(section.key);

    // Cancel any in-flight utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(section.text);
    const bcp47 = SPEECH_LANG[lang] ?? "en-IN";
    utterance.lang = bcp47;
    const voice = pickVoice(bcp47);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (!mountedRef.current) return;
      if (pausedRef.current) {
        // Was paused mid-utterance — stay paused at this section
        setState("paused");
        return;
      }
      // Advance to next section via ref (avoids self-reference)
      speakRef.current?.(idx + 1);
    };

    utterance.onerror = (e) => {
      if (!mountedRef.current) return;
      // "interrupted" / "canceled" happen on pause/stop — not real errors
      const errType = (e as SpeechSynthesisErrorEvent).error;
      if (errType === "interrupted" || errType === "canceled") return;
      setState("idle");
      setActiveKey(null);
    };

    window.speechSynthesis.speak(utterance);
    setState("playing");
  }, [sections, supported, lang, pickVoice]);

  // Keep the ref updated (must be in an effect, not during render)
  useEffect(() => {
    speakRef.current = speakSectionImpl;
  }, [speakSectionImpl]);

  // Stable wrapper so callers don't need to know about the ref
  const speakSection = useCallback((idx: number) => speakRef.current?.(idx), []);

  /** Play from the beginning or resume from pause. */
  const play = useCallback(() => {
    if (!supported) {
      setState("unsupported");
      setUnsupportedReason("Speech synthesis is not supported in this browser.");
      return;
    }
    const bcp47 = SPEECH_LANG[lang] ?? "en-IN";
    const voice = pickVoice(bcp47);
    // Warn if no matching voice — but still attempt (browser may use default)
    if (!voice && window.speechSynthesis.getVoices().length > 0) {
      setUnsupportedReason(
        `No ${lang === "hi" ? "Hindi" : lang === "hinglish" ? "Hinglish (Hindi)" : "English"} voice found in your browser. It may read in the default voice.`,
      );
    } else {
      setUnsupportedReason(null);
    }

    pausedRef.current = false;
    // If resuming from pause, continue at current index; else start from 0
    if (state === "paused") {
      speakSection(idxRef.current);
    } else {
      idxRef.current = 0;
      speakSection(0);
    }
  }, [supported, lang, pickVoice, state, speakSection]);

  // Preload voices (some browsers load them asynchronously)
  useEffect(() => {
    if (supported && typeof window !== "undefined") {
      window.speechSynthesis.getVoices();
      // Trigger voice load
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, [supported]);

  /** Pause — stops the current utterance but keeps position. */
  const pause = useCallback(() => {
    if (!supported || state !== "playing") return;
    pausedRef.current = true;
    window.speechSynthesis.cancel();
    setState("paused");
  }, [supported, state]);

  /** Stop entirely — resets to beginning. */
  const stop = useCallback(() => {
    if (!supported) return;
    pausedRef.current = false;
    idxRef.current = 0;
    window.speechSynthesis.cancel();
    setState("idle");
    setActiveKey(null);
  }, [supported]);

  // Cleanup: stop speech when the component unmounts or the report changes
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  // Reset state when sections change (e.g. new report / language switch).
  // Uses refs + a microtask to reset state without cascading-render warnings.
  useEffect(() => {
    pausedRef.current = false;
    idxRef.current = 0;
    if (supported) window.speechSynthesis.cancel();
    // Defer state updates to avoid synchronous-setState-in-effect lint
    queueMicrotask(() => {
      if (!mountedRef.current) return;
      setState("idle");
      setActiveKey(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, lang]);

  // Also cancel speech when the tab is hidden (don't keep talking in background)
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && state === "playing") {
        pause();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [state, pause]);

  return {
    state,
    activeKey,
    unsupportedReason,
    play,
    pause,
    stop,
  };
}
