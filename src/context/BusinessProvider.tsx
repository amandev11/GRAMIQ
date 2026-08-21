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
    setState({ profile: DEMO_PROFILE, financials: DEMO_FINANCIALS, actionItems: DEFAULT_ACTION_PLAN, isDemo: true });
  }, []);

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
      resetAll,
    }),
    [state, setProfile, setFinancials, toggleActionItem, launchDemo, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBusiness() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBusiness must be used inside BusinessProvider");
  return ctx;
}
