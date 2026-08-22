import { useBusiness } from "@/context/BusinessProvider";
import { cn } from "@/lib/utils";
import {
  Bot, Building2, FileText, LayoutDashboard, LineChart, LogOut, MapPinned, Menu, Ribbon,
  Scale, ShieldAlert, ShieldCheck, Sparkles, Target, X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, NavLink, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { CopilotPanel } from "./CopilotPanel";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/blueprint", label: "Blueprint", icon: Building2 },
  { to: "/finance", label: "Finance & Simulator", icon: LineChart },
  { to: "/compare", label: "Compare Ideas", icon: Scale },
  { to: "/market", label: "Local Market", icon: MapPinned },
  { to: "/schemes", label: "Funding & Schemes", icon: Ribbon },
  { to: "/risks", label: "Risk Radar", icon: ShieldAlert },
  { to: "/plan", label: "Action Plan", icon: Target },
  { to: "/business-plan", label: "Business Plan PDF", icon: FileText },
];

/** The product narrative — every screen lives on one of these stages. */
const STAGES: Array<{ key: string; icon: typeof LayoutDashboard; paths: string[] }> = [
  { key: "UNDERSTAND", icon: LayoutDashboard, paths: ["/dashboard"] },
  { key: "ANALYZE", icon: MapPinned, paths: ["/blueprint", "/market", "/risks"] },
  { key: "SIMULATE", icon: LineChart, paths: ["/finance"] },
  { key: "OPTIMIZE", icon: Scale, paths: ["/compare"] },
  { key: "FUND", icon: Ribbon, paths: ["/schemes"] },
  { key: "ACT", icon: Target, paths: ["/plan", "/business-plan"] },
];

/** Slim narrative rail shown under the header — makes the app one story. */
function JourneyRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIdx = STAGES.findIndex((s) => s.paths.includes(location.pathname));

  return (
    <nav aria-label="Business journey" className="no-print mb-4 flex items-center gap-1 overflow-x-auto">
      {STAGES.map(({ key, icon: Icon }, i) => {
        const active = i === activeIdx;
        return (
          <div key={key} className="flex shrink-0 items-center">
            <button
              onClick={() => navigate(STAGES[i].paths[0])}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {key}
            </button>
            {i < STAGES.length - 1 && (
              <span
                className={cn(
                  "mx-0.5 h-px w-4 transition-colors duration-300 sm:w-6",
                  i < activeIdx ? "bg-indigo-500/70" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { profile, hasBusiness, isDemo, exitDemo } = useBusiness();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Demo Mode is never a trap: Esc exits it. Other screens leave Esc alone so
  // it can't destroy unsaved user data.
  useEffect(() => {
    if (!isDemo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exitDemo();
        navigate("/dashboard", { replace: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDemo, exitDemo, navigate]);

  if (!hasBusiness) {
    return <Navigate to="/onboarding" replace />;
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-indigo-500/12 text-indigo-300 shadow-[inset_0_1px_0_oklch(1_0_0/8%)]"
                : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="glass-strong no-print sticky top-0 z-40 flex items-center justify-between gap-3 border-x-0 border-t-0 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <button className="flex items-center gap-2" onClick={() => navigate("/dashboard")} aria-label="GRAMIQ home">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">GRAMIQ</span>
          </button>
          {title && <span className="hidden text-sm text-muted-foreground sm:block">/ {title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="hidden rounded-full border border-amber-500/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold tracking-widest text-amber-300 uppercase sm:inline-flex">
              Demo Mode
            </span>
          )}
          {isDemo && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-full border-amber-500/40 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              onClick={() => {
                exitDemo();
                navigate("/dashboard", { replace: true });
              }}
            >
              <LogOut className="size-3.5" />
              Exit Demo
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
            onClick={() => setCopilotOpen(true)}
          >
            <Bot className="size-4" />
            <span className="hidden sm:inline">Ask Copilot</span>
            <span className="sm:hidden">AI</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <aside className="glass no-print sticky top-20 hidden h-fit w-60 shrink-0 rounded-2xl p-3 lg:block">
          {profile && (
            <div className="mb-3 rounded-xl bg-foreground/4 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Entrepreneur</p>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.location.village}, {profile.location.district}
              </p>
            </div>
          )}
          {nav}
          <div className="mt-4 border-t border-border/60 pt-3">
            <NavLink
              to="/judges"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
            >
              <Ribbon className="size-4" />
              Judges Mode
            </NavLink>
            <NavLink
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
            >
              <FileText className="size-4" />
              Knowledge Admin
            </NavLink>
            <NavLink
              to="/trust"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-300/70 transition-colors duration-200 hover:bg-emerald-500/8 hover:text-emerald-300"
            >
              <ShieldCheck className="size-4" />
              Trust Center
            </NavLink>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="glass-strong absolute inset-y-0 left-0 w-72 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold">GRAMIQ</span>
                <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 pb-24">
          <JourneyRail />
          {children}
        </main>
      </div>

      {/* Floating copilot button (mobile) */}
      <button
        className="glass-strong fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full text-indigo-300 shadow-xl lg:hidden"
        onClick={() => setCopilotOpen(true)}
        aria-label="Open AI copilot"
      >
        <Bot className="size-6" />
      </button>

      <CopilotPanel open={copilotOpen} onOpenChange={setCopilotOpen} />
    </div>
  );
}
