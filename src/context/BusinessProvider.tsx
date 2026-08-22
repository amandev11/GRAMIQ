import { DEFAULT_ACTION_PLAN, DEMO_FINANCIALS, DEMO_PROFILE } from "@/lib/data/demo";
import type { ActionItem, EntrepreneurProfile, FinancialInputs } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface BusinessState {
  profile: EntrepreneurProfile | null;
  financials: FinancialInputs;
  actionItems: ActionItem[];
  isDemo: boolean;
  hasBusiness: boolean;
  setProfile: (p: EntrepreneurProfile) => void;
  setFinancials: (f: Partial<FinancialInputs>) => void;
  toggleActionItem: (id: string) => void;
  launchDemo: () => void;
  exitDemo: () => void;
  resetAll: () => void;
}

const Ctx = createContext<BusinessState | null>(null);

const STORAGE_KEY = "gramiq-state-v1";

interface Persisted {
  profile: EntrepreneurProfile | null;
  financials: FinancialInputs;
  actionItems: ActionItem[];
  isDemo: boolean;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {
    /* corrupted storage — start fresh */
  }
  return { profile: null, financials: DEMO_FINANCIALS, actionItems: DEFAULT_ACTION_PLAN, isDemo: false };
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  // Snapshot of the user's real session taken before Demo Mode launched, so
  // exiting restores it instead of wiping their work.
  const [preDemoSnapshot, setPreDemoSnapshot] = useState<Persisted | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full/unavailable — non-fatal */
    }
  }, [state]);

  const setProfile = useCallback((profile: EntrepreneurProfile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const setFinancials = useCallback((f: Partial<FinancialInputs>) => {
    setState((s) => ({ ...s, financials: { ...s.financials, ...f } }));
  }, []);

  const toggleActionItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      actionItems: s.actionItems.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    }));
  }, []);

  const launchDemo = useCallback(() => {
    setState((s) => {
      if (!s.isDemo) setPreDemoSnapshot(s);
      return { profile: DEMO_PROFILE, financials: DEMO_FINANCIALS, actionItems: DEFAULT_ACTION_PLAN, isDemo: true };
    });
  }, []);

  // Exit Demo Mode and restore whatever the user had before entering it.
  // If there was nothing before (fresh visit), return to the clean state.
  const exitDemo = useCallback(() => {
    setState((s) => {
      if (!s.isDemo) return s;
      return preDemoSnapshot ?? { profile: null, financials: DEMO_FINANCIALS, actionItems: DEFAULT_ACTION_PLAN, isDemo: false };
    });
    setPreDemoSnapshot(null);
  }, [preDemoSnapshot]);

  const resetAll = useCallback(() => {
    setState({ profile: null, financials: DEMO_FINANCIALS, actionItems: DEFAULT_ACTION_PLAN, isDemo: false });
  }, []);

  const value = useMemo<BusinessState>(
    () => ({
      profile: state.profile,
      financials: state.financials,
      actionItems: state.actionItems,
      isDemo: state.isDemo,
      hasBusiness: !!state.profile,
      setProfile,
      setFinancials,
      toggleActionItem,
      launchDemo,
      exitDemo,
      resetAll,
    }),
    [state, setProfile, setFinancials, toggleActionItem, launchDemo, exitDemo, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBusiness() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBusiness must be used inside BusinessProvider");
  return ctx;
}
