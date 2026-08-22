/**
 * GRAMIQ Journey — the "From idea to business plan" section.
 *
 * One coherent visual story: a large stage visualization with a quiet,
 * precise stage selector. Miniature previews of the ACTUAL product surfaces
 * (idea console, market intel, insight graph, simulator, plan report) —
 * not decorative illustrations.
 *
 * Motion: restrained opacity/transform/blur reveals. Autoplay pauses on
 * hover, stops permanently once the user takes over, and never runs when
 * prefers-reduced-motion is set.
 */
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, LineChart, Mic, Sparkles, TrendingUp,
} from "lucide-react";
import {
  useCallback, useEffect, useRef, useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { cn } from "@/lib/utils";

/* ── Stage visuals — miniature GRAMIQ product previews ────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared panel chrome: dark interior + faint grid. */
function StagePanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[oklch(0.16_0.02_258/0.85)] ring-1 ring-white/6">
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.02 260 / 5%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.02 260 / 5%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />
      <div className="relative flex h-full flex-col p-5 sm:p-8">{children}</div>
    </div>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-300/80 uppercase">{children}</p>
  );
}

/* 01 · IDEA — the live idea console */
function IdeaVisual() {
  const ideas = [
    "Dairy collection route — 40 households…",
    "Poultry unit — 500 broiler birds…",
    "Vegetable farming on 1500 sq ft…",
  ];
  const [shown, setShown] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const target = ideas[idx];
    let i = 0;
    let advance: ReturnType<typeof setTimeout> | undefined;
    const type = setInterval(() => {
      i += 1;
      setShown(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(type);
        advance = setTimeout(() => setIdx((v) => (v + 1) % ideas.length), 1600);
      }
    }, 42);
    return () => {
      clearInterval(type);
      if (advance) clearTimeout(advance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <StagePanel>
      <MiniLabel>Idea Console</MiniLabel>
      <div className="mx-auto mt-auto w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/30 backdrop-blur-sm">
          <div className="border-b border-white/8 px-4 py-2 text-[11px] text-muted-foreground/70">
            Language · English
          </div>
          <p className="min-h-14 px-4 py-3 font-display text-base leading-relaxed text-indigo-100 sm:text-lg">
            {shown}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[2px] animate-pulse bg-indigo-400" />
          </p>
          <div className="flex items-center gap-3 border-t border-white/8 px-4 py-2.5">
            <span className="relative flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
              <Mic className="size-3.5" />
              <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white">
              Analyze <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/50">
          Type it or say it — in your language.
        </p>
      </div>
    </StagePanel>
  );
}

/* 02 · RESEARCH — hyper-local market signals */
function ResearchVisual() {
  const signals = [
    { label: "Household demand", value: "~180 homes", pct: 72 },
    { label: "Weekly haat footfall", value: "high", pct: 84 },
    { label: "Nearest supplier", value: "2.1 km", pct: 90 },
    { label: "Local competitor price", value: "₹47–48/L", pct: 46 },
  ];
  return (
    <StagePanel>
      <MiniLabel>Local Market Scan</MiniLabel>
      <div className="mt-auto space-y-2.5">
        {signals.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE }}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-indigo-100/90">{s.label}</span>
              <span className="tabular text-muted-foreground">{s.value}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: EASE }}
                className={cn(
                  "h-full rounded-full",
                  s.pct > 60 ? "bg-emerald-400/80" : "bg-amber-400/80",
                )}
              />
            </div>
          </motion.div>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-1 text-right text-[10px] tracking-wide text-muted-foreground/50 uppercase"
        >
          DEMO DATA · stylized geography
        </motion.p>
      </div>
    </StagePanel>
  );
}

/* 03 · INTELLIGENCE — connected insights */
function IntelligenceVisual() {
  const nodes = [
    { x: 22, y: 30, label: "Demand", tone: "#34d399" },
    { x: 62, y: 18, label: "Price", tone: "#818cf8" },
    { x: 78, y: 58, label: "Risk", tone: "#fbbf24" },
    { x: 38, y: 66, label: "Costs", tone: "#22d3ee" },
    { x: 52, y: 42, label: "Margin", tone: "#a78bfa" },
  ];
  const edges: Array<[number, number]> = [[0, 4], [1, 4], [2, 4], [3, 4], [1, 2], [0, 3]];

  return (
    <StagePanel>
      <MiniLabel>Structured Analysis</MiniLabel>
      <div className="relative mx-auto mt-auto min-h-0 w-full max-w-lg flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {edges.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke="oklch(0.75 0.06 265 / 28%)"
              strokeWidth="0.4"
              strokeDasharray="2 1.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.14, duration: 0.7, ease: EASE }}
            />
          ))}
        </svg>
        {nodes.map((n, i) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.13, type: "spring", stiffness: 220, damping: 18 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <span
              className="block size-2.5 rounded-full"
              style={{ background: n.tone, boxShadow: `0 0 12px ${n.tone}55` }}
            />
            <span className="mt-1 block -translate-x-1 whitespace-nowrap text-[10px] font-medium text-indigo-100/80">
              {n.label}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
        className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-4 py-3"
      >
        <Sparkles className="size-4 shrink-0 text-indigo-300" />
        <p className="text-xs leading-relaxed text-indigo-100/90">
          Daily cash collection fits your capital and family labor — modeled margin{" "}
          <span className="font-semibold text-indigo-200">23%</span>.
        </p>
      </motion.div>
    </StagePanel>
  );
}

/* 04 · VALIDATION — stress-tested assumptions */
function ValidationVisual() {
  const scenarios = [
    { name: "Optimistic", profit: "+₹18.4k/mo", pct: 88, tone: "bg-emerald-400/80" },
    { name: "Base case", profit: "+₹11.2k/mo", pct: 58, tone: "bg-indigo-400/80" },
    { name: "Stress test", profit: "+₹2.1k/mo", pct: 14, tone: "bg-amber-400/80" },
  ];
  return (
    <StagePanel>
      <MiniLabel>Scenario Engine</MiniLabel>
      <div className="mt-auto space-y-3">
        {scenarios.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.14, duration: 0.5, ease: EASE }}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-indigo-100/90">{s.name}</span>
              <span className="tabular font-semibold text-indigo-100">{s.profit}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ delay: 0.3 + i * 0.14, duration: 1, ease: EASE }}
                className={cn("h-full rounded-full", s.tone)}
              />
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="flex items-center justify-between pt-1 text-[10px] tracking-wide uppercase"
        >
          <span className="flex items-center gap-1.5 text-emerald-300/90">
            <CheckCircle2 className="size-3" /> survives stress case
          </span>
          <span className="text-muted-foreground/50">AI ESTIMATE · deterministic engine</span>
        </motion.div>
      </div>
    </StagePanel>
  );
}

/* 05 · PLAN — the bank-ready report */
function PlanVisual() {
  const rows = [
    { k: "Monthly revenue", v: "₹69,000" },
    { k: "Operating profit", v: "₹11,240" },
    { k: "Break-even", v: "month 6.4" },
  ];
  const actions = ["Soil & water test at KVK", "Mandi price survey", "Line up 2 buyers"];
  return (
    <StagePanel>
      <MiniLabel>Business Plan · PDF</MiniLabel>
      <div className="mx-auto mt-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="rounded-xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          <p className="font-display text-sm font-bold text-indigo-100">Farming & Crop Cultivation</p>
          <p className="mt-0.5 text-[10px] tracking-widest text-muted-foreground/60 uppercase">
            Executive Summary · Bassi, Jaipur
          </p>
          <div className="mt-3 divide-y divide-white/6">
            {rows.map((r, i) => (
              <motion.div
                key={r.k}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.12 }}
                className="flex items-center justify-between py-2 text-xs"
              >
                <span className="text-muted-foreground">{r.k}</span>
                <span className="tabular font-semibold text-indigo-100">{r.v}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-white/6 pt-3">
            {actions.map((a, i) => (
              <motion.p
                key={a}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2 text-[11px] text-indigo-100/80"
              >
                <CheckCircle2 className="size-3 shrink-0 text-emerald-400/80" /> {a}
              </motion.p>
            ))}
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/50"
        >
          <LineChart className="size-3" /> One click → professional plan for banks & offices
        </motion.p>
      </div>
    </StagePanel>
  );
}

/* ── Stage data ─────────────────────────────────────────────────────────── */

interface Stage {
  num: string;
  key: string;
  label: string;
  title: string;
  desc: string;
  Visual: () => ReactNode;
}

const STAGES: Stage[] = [
  {
    num: "01", key: "idea", label: "Idea",
    title: "Say the idea in one line.",
    desc: "Type or speak it in your language. GRAMIQ listens for the business, the capital you have, and the land or skills you bring.",
    Visual: IdeaVisual,
  },
  {
    num: "02", key: "research", label: "Research",
    title: "See your local market clearly.",
    desc: "Demand around your village, supplier distances, competitor pricing — mapped and labeled, so every signal has a source.",
    Visual: ResearchVisual,
  },
  {
    num: "03", key: "intelligence", label: "Intelligence",
    title: "Watch scattered facts become insight.",
    desc: "Demand, price, cost and risk connect into one structured model — with a clear recommendation and the reasoning behind it.",
    Visual: IntelligenceVisual,
  },
  {
    num: "04", key: "validation", label: "Validation",
    title: "Stress-test before you spend a rupee.",
    desc: "Optimistic, base and severe scenarios recalculated instantly from a deterministic engine — know your break-even under pressure.",
    Visual: ValidationVisual,
  },
  {
    num: "05", key: "plan", label: "Plan",
    title: "Leave with a plan, not just answers.",
    desc: "A complete business plan — financial summary, risks, scheme matches and a 12-month action list — ready to print or take to a bank.",
    Visual: PlanVisual,
  },
];

/* ── Component ──────────────────────────────────────────────────────────── */

export default function JourneySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [takenOver, setTakenOver] = useState(false); // stops autoplay after manual nav
  const [reducedMotion, setReducedMotion] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Respect prefers-reduced-motion (no autoplay, instant-feeling transitions).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Autoplay: slow cycle, paused on hover, stopped after user interaction.
  useEffect(() => {
    if (reducedMotion || paused || takenOver) return;
    const t = setInterval(() => setActive((v) => (v + 1) % STAGES.length), 5500);
    return () => clearInterval(t);
  }, [paused, takenOver, reducedMotion]);

  const goTo = useCallback((i: number) => {
    setTakenOver(true);
    setActive(((i % STAGES.length) + STAGES.length) % STAGES.length);
  }, []);

  // Pointer-aware lighting inside the main visual.
  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  // Touch swipe between stages (mobile).
  const onTouchStart = (e: ReactTouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 48) goTo(active + (dx < 0 ? 1 : -1));
  };

  // Keyboard navigation while focus is within the section's controls.
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  };

  const stage = STAGES[active];
  const Visual = stage.Visual;

  return (
    <section aria-label="How GRAMIQ works" className="relative overflow-hidden py-24 sm:py-32">
      {/* Atmosphere — near-invisible until lit by content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "radial-gradient(ellipse 45% 32% at 50% 8%, oklch(0.45 0.12 275 / 10%), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
        {/* ── Editorial header ── */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-indigo-400 uppercase">The Gramiq Method</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-muted-foreground/70">FROM IDEA</span>
            <br />
            <span className="text-gradient font-extrabold">TO BUSINESS PLAN</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            One input. Five stages. One intelligent system that turns a sentence into a decision-ready business.
          </p>
        </div>

        {/* ── Stage selector (desktop) ── */}
        <div
          role="tablist"
          aria-label="Journey stages"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-14 hidden justify-between gap-2 md:flex"
        >
          {STAGES.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => goTo(i)}
                className="group relative flex-1 pb-4 text-left outline-none"
              >
                <span
                  className={cn(
                    "block font-mono text-[11px] tabular transition-colors duration-300",
                    isActive ? "text-indigo-300" : "text-muted-foreground/40 group-hover:text-muted-foreground/70",
                  )}
                >
                  {s.num}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-sm font-semibold tracking-wide transition-all duration-300",
                    isActive
                      ? "translate-y-[-1px] text-foreground"
                      : "text-muted-foreground/55 group-hover:text-muted-foreground",
                  )}
                >
                  {s.label.toUpperCase()}
                </span>
                {/* accent rail */}
                <span className="absolute inset-x-0 bottom-0 h-px bg-white/8" />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px transition-all duration-500",
                    isActive
                      ? "w-full bg-gradient-to-r from-indigo-400 via-violet-400 to-transparent shadow-[0_0_10px_oklch(0.65_0.15_270/0.5)]"
                      : "w-0 bg-indigo-400/60 group-hover:w-1/3",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* ── Mobile selector ── */}
        <div className="mt-10 flex items-center justify-between md:hidden">
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Previous stage"
            className="flex size-10 items-center justify-center rounded-full border border-border/40 text-muted-foreground active:scale-95"
          >
            ←
          </button>
          <div className="text-center">
            <p className="font-mono text-[11px] tabular text-indigo-300">{stage.num} / 05</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={stage.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="font-display text-sm font-bold tracking-widest uppercase"
              >
                {stage.label}
              </motion.p>
            </AnimatePresence>
          </div>
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Next stage"
            className="flex size-10 items-center justify-center rounded-full border border-border/40 text-muted-foreground active:scale-95"
          >
            →
          </button>
        </div>

        {/* ── Main visual ── */}
        <div
          ref={panelRef}
          onPointerMove={onPointerMove}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="group relative mt-8 md:mt-12"
        >
          <div className="relative h-[400px] w-full sm:h-[440px]" style={{ perspective: "1200px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.key}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: reducedMotion ? 0.15 : 0.55, ease: EASE }}
                className="absolute inset-0"
              >
                <Visual />
              </motion.div>
            </AnimatePresence>

            {/* pointer-aware lighting */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), oklch(0.7 0.12 270 / 7%), transparent 70%)",
              }}
            />
          </div>

          {/* progress dots (mobile) */}
          <div className="mt-5 flex justify-center gap-1.5 md:hidden">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                onClick={() => goTo(i)}
                aria-label={`Go to stage ${s.num}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-indigo-400" : "w-1.5 bg-foreground/20",
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Stage narrative ── */}
        <div className="mx-auto mt-10 max-w-xl text-center sm:mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.key}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: EASE }}
            >
              <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{stage.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.desc}</p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => document.querySelector<HTMLElement>("#idea-console")?.focus()}
            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
          >
            Start with your idea
            <TrendingUp className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
