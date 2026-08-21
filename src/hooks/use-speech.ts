import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Microphone status state machine.
 * Never shows a control that does nothing.
 */
export type MicState = "idle" | "listening" | "processing" | "completed" | "unavailable" | "denied" | "error";

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string; // "no-speech" | "audio-capture" | "not-allowed" | "network" | "aborted" | "service-not-available"
}

type SRConstructor = (new () => SpeechRecognitionLike) | undefined;

function getSRConstructor(): SRConstructor {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SRConstructor;
}

/**
 * Robust voice input via Web Speech API.
 *
 * State machine:
 *  - idle → listening (user taps mic)
 *  - listening → processing (recognition ends, transcript received)
 *  - processing → completed (transcript delivered to callback)
 *  - listening → idle (user taps stop)
 *  - * → unavailable (browser lacks API)
 *  - * → denied (permission revoked)
 *  - * → error (network, capture, etc.)
 */
export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [micState, setMicState] = useState<MicState>("idle");
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return typeof getSRConstructor() === "function";
  });

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const cbRef = useRef(onTranscript);
  const abortRef = useRef<AbortController | null>(null);
  const isListeningRef = useRef(false);

  // Keep callback ref current without re-creating the recognition object
  useEffect(() => {
    cbRef.current = onTranscript;
  }, [onTranscript]);

  // Create and configure the SpeechRecognition instance once
  useEffect(() => {
    const SR = getSRConstructor();
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Grab the final result (not interim)
      const idx = e.results.length - 1;
      if (idx < 0) return;
      const result = e.results[idx];
      if (!result || !result[0]) return;

      const transcript = result[0].transcript?.trim();
      if (!transcript) {
        // Empty transcript — return to idle silently
        setMicState("idle");
        isListeningRef.current = false;
        return;
      }

      setMicState("processing");
      // Small beat so user sees "processing" before "completed"
      requestAnimationFrame(() => {
        cbRef.current(transcript);
        setMicState("completed");
        isListeningRef.current = false;
        // Auto-dismiss "completed" after a short delay
        setTimeout(() => setMicState("idle"), 1200);
      });
    };

    rec.onend = () => {
      if (isListeningRef.current) {
        // recognition ended without result — back to idle
        isListeningRef.current = false;
        setMicState((prev) => (prev === "listening" ? "idle" : prev));
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      const err = e.error;

      if (err === "not-allowed" || err === "service-not-available") {
        // Permission denied or service not available
        setMicState("denied");
      } else if (err === "no-speech") {
        // User was silent — harmless, go back to idle
        setMicState("idle");
      } else if (err === "audio-capture") {
        // No microphone found
        setMicState("unavailable");
      } else if (err === "aborted") {
        // User or system aborted — go to idle
        setMicState("idle");
      } else {
        // Network error or unknown
        setMicState("error");
      }
    };

    recRef.current = rec;

    return () => {
      isListeningRef.current = false;
      try {
        if (rec.abort) rec.abort(); else rec.stop();
      } catch {
        /* already stopped */
      }
      recRef.current = null;
    };
  }, []);

  // Handle visibility change — stop recognition when tab hidden
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden && isListeningRef.current) {
        try {
          recRef.current?.stop();
        } catch {
          /* noop */
        }
        isListeningRef.current = false;
        setMicState("idle");
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  const start = useCallback((lang = "en-IN") => {
    const rec = recRef.current;
    if (!rec) {
      setMicState("unavailable");
      return;
    }
    // Prevent duplicate starts
    if (isListeningRef.current) return;

    try {
      rec.lang = lang;
      rec.start();
      isListeningRef.current = true;
      setMicState("listening");
      abortRef.current = new AbortController();
    } catch (err) {
      // "InvalidStateError" = already started; or other
      isListeningRef.current = false;
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setMicState("denied");
      } else {
        setMicState("error");
      }
    }
  }, []);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* noop — already stopped */
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setMicState((prev) => (prev === "listening" ? "idle" : prev));
  }, []);

  const reset = useCallback(() => {
    setMicState("idle");
  }, []);

  return {
    micState,
    listening: micState === "listening",
    supported,
    start,
    stop,
    reset,
  };
}
