import { DEMO_FINANCIALS, DEMO_PROFILE } from "@/lib/data/demo";
import { buildActionPlan } from "@/lib/intelligence/action-plan";
import { deriveFinancialsFromIdea } from "@/lib/intelligence/business-model";
import type { ActionItem, EntrepreneurProfile, FinancialInputs } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface BusinessState {
  profile: EntrepreneurProfile | null;
  financials: FinancialInputs;
  actionItems: ActionItem[];
  isDemo: boolean;
  hasBusiness: boolean;
  /** Canonical entry: analyze the user's ACTUAL idea and reset all derived state atomically. */
  startBusiness: (p: EntrepreneurProfile) => void;
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
  return { profile: null, financials: NEUTRAL_FINANCIALS, actionItems: [], isDemo: false };
}

/** Placeholder model shown nowhere (pages guard on profile) — derived from a
 *  neutral idea so no demo dairy values can ever leak into a real session. */
const NEUTRAL_FINANCIALS = deriveFinancialsFromIdea("", 100000).financials;

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
    // Profile-only updates (e.g. language change from an existing session).
    setState((s) => ({ ...s, profile }));
  }, []);

  /**
   * THE source of truth for a new analysis. Derives the financial model from
   * the user's actual idea text and replaces ALL derived state atomically —
   * previous ideas can never contaminate the new analysis.
   */
  const startBusiness = useCallback((profile: EntrepreneurProfile) => {
    const { financials } = deriveFinancialsFromIdea(profile.businessIdea, profile.capital);
    setState({
      profile,
      financials,
      actionItems: buildActionPlan(profile.businessIdea, profile.language ?? "en"),
      isDemo: false,
    });
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
      // Demo is explicitly the fictional dairy entrepreneur — labeled DEMO everywhere.
      return { profile: DEMO_PROFILE, financials: DEMO_FINANCIALS, actionItems: buildActionPlan(DEMO_PROFILE.businessIdea, DEMO_PROFILE.language), isDemo: true };
    });
  }, []);

  // Exit Demo Mode and restore whatever the user had before entering it.
  // If there was nothing before (fresh visit), return to the clean state.
  const exitDemo = useCallback(() => {
    setState((s) => {
      if (!s.isDemo) return s;
      return preDemoSnapshot ?? { profile: null, financials: NEUTRAL_FINANCIALS, actionItems: [], isDemo: false };
    });
    setPreDemoSnapshot(null);
  }, [preDemoSnapshot]);

  const resetAll = useCallback(() => {
    setState({ profile: null, financials: NEUTRAL_FINANCIALS, actionItems: [], isDemo: false });
  }, []);

  const value = useMemo<BusinessState>(
    () => ({
      profile: state.profile,
      financials: state.financials,
      actionItems: state.actionItems,
      isDemo: state.isDemo,
      hasBusiness: !!state.profile,
      startBusiness,
      setProfile,
      setFinancials,
      toggleActionItem,
      launchDemo,
      exitDemo,
      resetAll,
    }),
    [state, startBusiness, setProfile, setFinancials, toggleActionItem, launchDemo, exitDemo, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBusiness() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBusiness must be used inside BusinessProvider");
  return ctx;
}
