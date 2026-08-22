import { AppShell } from "@/components/app/AppShell";
import { DataBadge, GlassCard } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { computeFinancials, formatInr, project12Months } from "@/lib/finance/engine";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { generateBlueprint } from "@/lib/intelligence/blueprint";
import { computeRisks } from "@/lib/intelligence/scores";
import { matchSchemes } from "@/lib/intelligence/schemes";
import { L, REPORT_SECTIONS, pick, type Lang } from "@/lib/i18n/strings";
import { useReportPlayer, type ReportSection } from "@/hooks/use-report-player";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Download, FileText, Pause, Play, Printer, Square } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section wrapper that registers its ref for scroll-into-view during Listen. */
function PlanSection({
  n, title, sectionKey, activeKey, registerRef, children,
}: {
  n: number; title: string; sectionKey: string;
  activeKey: string | null; registerRef: (key: string, el: HTMLElement | null) => void;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const isActive = activeKey === sectionKey;
  return (
    <motion.section
      ref={(el) => registerRef(sectionKey, el)}
      className={cn(
        "print-page mt-8 break-inside-avoid rounded-lg transition-all duration-300",
        isActive && "ring-2 ring-indigo-500/40 bg-indigo-500/[0.04]",
      )}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 1.5 + n * 0.09, duration: 0.4 }}
    >
      <h2 className="flex items-baseline gap-3 font-display text-xl font-bold">
        <span className="text-sm text-indigo-300 tabular">{String(n).padStart(2, "0")}</span>
        {title}
        {isActive && <span className="ml-auto flex items-center gap-1 text-[10px] font-bold tracking-widest text-indigo-300 uppercase"><span className="size-1.5 animate-pulse rounded-full bg-indigo-400" /> Speaking</span>}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-foreground/85">{children}</div>
    </motion.section>
  );
}

/** Document assembly steps — shown while the plan is compiled (values are real). */
const ASSEMBLY_STEPS_EN = [
  "Compiling financial model",
  "Rendering 12-month projections",
  "Matching funding options",
  "Formatting document",
];

/* ── Print themes ──────────────────────────────────────────────────────
 * Each theme sets CSS custom properties consumed by the dedicated print
 * stylesheet (see index.css @media print block). The selected theme is
 * applied to the document root before window.print(), so the printed
 * output genuinely changes — not just the on-screen colors.
 */
type PrintTheme = "red" | "black" | "white" | "blue" | "graphite";

const PRINT_THEMES: Array<{ key: PrintTheme; label: string; dot: string }> = [
  { key: "red", label: "Red", dot: "#9b1c1c" },
  { key: "black", label: "Black", dot: "#18181b" },
  { key: "white", label: "White", dot: "#f5f5f4" },
  { key: "blue", label: "Blue", dot: "#1e3a8a" },
  { key: "graphite", label: "Graphite", dot: "#44403c" },
];

function PrintThemeSelector({
  theme, onChange,
}: {
  theme: PrintTheme; onChange: (t: PrintTheme) => void;
}) {
  return (
    <div className="no-print flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-foreground/[0.04] px-4 py-3">
      <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Print style</span>
      <div className="flex flex-wrap gap-2">
        {PRINT_THEMES.map(({ key, label, dot }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={theme === key}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              theme === key
                ? "border-indigo-500/50 bg-indigo-500/12 text-indigo-200"
                : "border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "size-2.5 rounded-full ring-1 ring-black/10",
                dot === "#f5f5f4" && "ring-foreground/20",
              )}
              style={{ background: dot }}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Accent color per print theme — applied as --print-accent on <html> before printing. */
const PRINT_ACCENT: Record<PrintTheme, string> = {
  red: "#9b1c1c",
  black: "#18181b",
  white: "#52525b",
  blue: "#1e3a8a",
  graphite: "#44403c",
};

export default function BusinessPlan() {
  const { profile, financials, actionItems } = useBusiness();
  const reduced = useReducedMotion();
  const [printTheme, setPrintTheme] = useState<PrintTheme>("black");

  const handlePrint = () => {
    const root = document.documentElement;
    root.style.setProperty("--print-accent", PRINT_ACCENT[printTheme]);
    root.dataset.printTheme = printTheme;
    requestAnimationFrame(() => window.print());
  };

  // Assembly sequence: real compilation steps, ~1.4s, then the document reveals.
  const [step, setStep] = useState(reduced ? ASSEMBLY_STEPS_EN.length : -1);
  useEffect(() => {
    if (reduced) return;
    const timers = ASSEMBLY_STEPS_EN.map((_, i) => window.setTimeout(() => setStep(i), i * 350));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);
  const assembling = step < ASSEMBLY_STEPS_EN.length - 1;

  // Section ref registry (declared before any early return so hooks stay in order)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const registerRef = (key: string, el: HTMLElement | null) => {
    sectionRefs.current[key] = el;
  };

  // Language + computed values (null-safe until profile exists)
  const lang: Lang = profile?.language ?? "en";
  const fin = profile ? computeFinancials(financials) : null;
  const blueprint = profile ? generateBlueprint(profile, financials) : null;
  // Units derive from the user's ACTUAL business — never a hardcoded label.
  const unitShort = profile ? detectBusinessModel(profile.businessIdea).unitShort : "";
  const risks = profile ? computeRisks(profile, financials) : [];
  const topSchemes = profile && fin ? matchSchemes(profile, fin.totalStartupCost).filter((m) => m.matchPct >= 60).slice(0, 3) : [];
  const sections = REPORT_SECTIONS[lang];
  const t = L.report;

  // ── Build report sections for the ReportPlayer (plain text for TTS) ──
  // Null-safe: returns empty array if profile/fin not ready.
  const reportSections: ReportSection[] = useMemo(() => {
    if (!profile || !fin || !blueprint) return [];
    const summaryText = pick(t.summary({
      name: profile.name, idea: profile.businessIdea, village: profile.location.village,
      startup: formatInr(fin.totalStartupCost), capital: formatInr(profile.capital),
      revenue: formatInr(fin.monthlyRevenue), be: String(fin.breakEvenMonths),
    }), lang);
    const ideaText = `${profile.businessIdea}. ${pick(t.ideaBody, lang)}`;
    const marketText = pick(t.marketBullets({ village: profile.location.village }), lang).join(". ");
    const investmentText = blueprint.investmentBreakdown
      .map((it) => `${it.label}: ${formatInr(it.amount)}`).join(". ");
    const revenueText = `${blueprint.revenueModel}. ${pick({ en: "Monthly revenue", hi: "मासिक आय", hinglish: "Monthly revenue" }, lang)}: ${formatInr(fin.monthlyRevenue)}. ${pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang)}: ${formatInr(fin.operatingProfit)}. ${pick({ en: "Break-even", hi: "ब्रेक-ईन", hinglish: "Break-even" }, lang)}: ${fin.breakEvenMonths} ${pick({ en: "months", hi: "माह", hinglish: "months" }, lang)}.`;
    const risksText = risks.map((r) => `${r.title}, ${r.level}. ${r.why} ${r.mitigation}`).join(". ");
    const fundingText = topSchemes.length > 0
      ? topSchemes.map((m) => `${m.scheme.name}, ${m.matchPct}% match`).join(". ")
      : pick({ en: "No strong scheme matches.", hi: "कोई मजबूत योजना मिलान नहीं।", hinglish: "No strong scheme matches." }, lang);
    const timelineText = actionItems.filter((a) => !a.done).slice(0, 8)
      .map((a) => `${pick(t.timelineHorizons[a.horizon], lang)}: ${a.task}`).join(". ");
    const assumptionsText = pick(t.assumptions, lang).join(". ");

    return [
      { key: "summary", text: summaryText },
      { key: "idea", text: ideaText },
      { key: "market", text: marketText },
      { key: "investment", text: investmentText },
      { key: "revenue", text: revenueText },
      { key: "risks", text: risksText },
      { key: "funding", text: fundingText },
      { key: "timeline", text: timelineText },
      { key: "assumptions", text: assumptionsText },
    ];
  }, [profile, fin, risks, topSchemes, actionItems, blueprint, lang, t]);

  const { state: playerState, activeKey, unsupportedReason, play, pause, stop } = useReportPlayer(reportSections, lang);

  // Scroll active section into view when it changes
  useEffect(() => {
    if (activeKey && sectionRefs.current[activeKey]) {
      sectionRefs.current[activeKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeKey]);

  // Early return AFTER all hooks are called
  if (!profile || !fin || !blueprint) return null;

  const projection = project12Months(financials);

  // Section labels for the report
  const sectionTitle = (key: string) => sections.find((s) => s.key === key)?.title ?? key;

  return (
    <AppShell title={pick({ en: "Business Plan PDF", hi: "व्यापार योजना PDF", hinglish: "Business Plan PDF" }, lang)}>
      <div className="mx-auto max-w-4xl">
        {/* Assembly overlay */}
        {assembling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm no-print">
            <GlassCard className="w-80 p-6">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                  className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                >
                  <FileText className="size-5" />
                </motion.span>
                <p className="font-display font-bold">{pick({ en: "Assembling your plan…", hi: "आपकी योजना बन रही है…", hinglish: "Aapki plan ban rahi hai…" }, lang)}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {ASSEMBLY_STEPS_EN.map((s, i) => (
                  <li key={s} className={i <= step ? "flex items-center gap-2 text-foreground" : "flex items-center gap-2 text-muted-foreground/50"}>
                    {i < step ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <span className={cn("size-4 shrink-0 rounded-full border-2", i === step ? "animate-pulse border-indigo-500 border-t-transparent" : "border-foreground/20")} style={{ animationDuration: "0.9s" }} />
                    )}
                    {s}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">{pick({ en: "Professional Business Plan", hi: "पेशेवर व्यापार योजना", hinglish: "Professional Business Plan" }, lang)}</h1>
            <p className="text-sm text-muted-foreground">
              {pick({ en: "Print or save as PDF — ready for banks and district offices.", hi: "प्रिंट करें या PDF सहेजें — बैंक और ज़िला कार्यालयों के लिए तैयार।", hinglish: "Print ya PDF save karo — banks aur district offices ke liye ready." }, lang)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 rounded-full" onClick={handlePrint}>
              <Printer className="size-4" /> {pick({ en: "Print", hi: "प्रिंट", hinglish: "Print" }, lang)}
            </Button>
            <Button onClick={handlePrint} className="gap-2 rounded-full">
              <Download className="size-4" /> {pick({ en: "Save as PDF", hi: "PDF सहेजें", hinglish: "Save as PDF" }, lang)}
            </Button>
          </div>
        </div>

        {/* Listen control bar — TTS OUTPUT, not microphone input */}
        <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-foreground/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25">
              {playerState === "playing" ? <Pause className="size-4" /> : <Play className="size-4" />}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {pick({ en: "Listen to this report", hi: "इस रिपोर्ट को सुनें", hinglish: "Is report ko suno" }, lang)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {playerState === "playing" && activeKey
                  ? `${pick({ en: "Speaking", hi: "बोल रहा है", hinglish: "Speaking" }, lang)}: ${sectionTitle(activeKey)}`
                  : playerState === "paused"
                    ? pick({ en: "Paused", hi: "रुका हुआ", hinglish: "Paused" }, lang)
                    : playerState === "unsupported"
                      ? pick({ en: "Audio not supported", hi: "ऑडियो समर्थित नहीं", hinglish: "Audio not supported" }, lang)
                      : pick({ en: "Reads the report aloud in your language", hi: "रिपोर्ट आपकी भाषा में पढ़ता है", hinglish: "Report ko aapki bhasha mein padhta hai" }, lang)}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {unsupportedReason && (
              <span className="text-[11px] text-amber-400">{unsupportedReason}</span>
            )}
            {playerState === "idle" || playerState === "paused" ? (
              <Button size="sm" className="gap-1.5 rounded-full" onClick={play}>
                <Play className="size-3.5" />
                {playerState === "paused" ? pick({ en: "Resume", hi: "जारी रखें", hinglish: "Resume" }, lang) : pick({ en: "Play", hi: "चलाएँ", hinglish: "Play" }, lang)}
              </Button>
            ) : playerState === "playing" ? (
              <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={pause}>
                <Pause className="size-3.5" /> {pick({ en: "Pause", hi: "रोकें", hinglish: "Pause" }, lang)}
              </Button>
            ) : null}
            {(playerState === "playing" || playerState === "paused") && (
              <Button size="sm" variant="ghost" className="gap-1.5 rounded-full" onClick={stop}>
                <Square className="size-3.5" /> {pick({ en: "Stop", hi: "रोकें", hinglish: "Stop" }, lang)}
              </Button>
            )}
          </div>
        </div>

        <PrintThemeSelector theme={printTheme} onChange={setPrintTheme} />

        <GlassCard className="p-6 sm:p-10">
          {/* Cover / header */}
          <header className="border-b-2 border-indigo-500/30 pb-6 text-center print-page">
            <p className="text-xs font-bold tracking-[0.3em] text-indigo-300 uppercase">{pick(t.coverLabel, lang)}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{blueprint.businessName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.name} · {profile.location.village}, {profile.location.district}, {profile.location.state}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {pick(t.preparedBy, lang)} · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </header>

          <PlanSection n={1} title={sectionTitle("summary")} sectionKey="summary" activeKey={activeKey} registerRef={registerRef}>
            <p>{pick(t.summary({
              name: profile.name, idea: profile.businessIdea, village: profile.location.village,
              startup: formatInr(fin.totalStartupCost), capital: formatInr(profile.capital),
              revenue: formatInr(fin.monthlyRevenue), be: String(fin.breakEvenMonths),
            }), lang)}</p>
          </PlanSection>

          <PlanSection n={2} title={sectionTitle("profile")} sectionKey="profile" activeKey={activeKey} registerRef={registerRef}>
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              <li><strong>{pick({ en: "Name", hi: "नाम", hinglish: "Name" }, lang)}:</strong> {profile.name}</li>
              <li><strong>{pick({ en: "Experience", hi: "अनुभव", hinglish: "Experience" }, lang)}:</strong> {profile.experience}</li>
              <li><strong>{pick({ en: "Location", hi: "स्थान", hinglish: "Location" }, lang)}:</strong> {profile.location.village}, {profile.location.district}</li>
              <li><strong>{pick({ en: "Available capital", hi: "उपलब्ध पूँजी", hinglish: "Available capital" }, lang)}:</strong> {formatInr(profile.capital)}</li>
              <li><strong>{pick({ en: "Existing business", hi: "मौजूदा व्यवसाय", hinglish: "Existing business" }, lang)}:</strong> {profile.existingBusiness === "none" ? pick({ en: "First venture", hi: "पहला उद्यम", hinglish: "First venture" }, lang) : profile.existingBusiness}</li>
              <li><strong>{pick({ en: "Resources", hi: "संसाधन", hinglish: "Resources" }, lang)}:</strong> {profile.resources.join(", ") || "—"}</li>
            </ul>
          </PlanSection>

          <PlanSection n={3} title={sectionTitle("idea")} sectionKey="idea" activeKey={activeKey} registerRef={registerRef}>
            <p>{profile.businessIdea}.</p>
            <p className="mt-2">{pick(t.ideaBody, lang)}</p>
          </PlanSection>

          <PlanSection n={4} title={sectionTitle("market")} sectionKey="market" activeKey={activeKey} registerRef={registerRef}>
            <ul className="list-inside list-disc space-y-1">
              {pick(t.marketBullets({ village: profile.location.village }), lang).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </PlanSection>

          <PlanSection n={5} title={sectionTitle("investment")} sectionKey="investment" activeKey={activeKey} registerRef={registerRef}>
            <div className="grid gap-6 sm:grid-cols-2">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"><th className="py-1.5">{pick({ en: "Item", hi: "मद", hinglish: "Item" }, lang)}</th><th className="py-1.5 text-right">{pick({ en: "Amount", hi: "राशि", hinglish: "Amount" }, lang)}</th></tr></thead>
                <tbody className="tabular">
                  {blueprint.investmentBreakdown.map((it) => (
                    <tr key={it.label} className="border-b border-border/50"><td className="py-1.5">{it.label}</td><td className="py-1.5 text-right">{formatInr(it.amount)}</td></tr>
                  ))}
                  <tr className="font-semibold"><td className="py-1.5">{pick({ en: "Total startup", hi: "कुल स्टार्टअप", hinglish: "Total startup" }, lang)}</td><td className="py-1.5 text-right">{formatInr(fin.totalStartupCost)}</td></tr>
                </tbody>
              </table>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"><th className="py-1.5">{pick({ en: "Monthly", hi: "मासिक", hinglish: "Monthly" }, lang)}</th><th className="py-1.5 text-right">{pick({ en: "Amount", hi: "राशि", hinglish: "Amount" }, lang)}</th></tr></thead>
                <tbody className="tabular">
                  {blueprint.monthlyExpenses.map((it) => (
                    <tr key={it.label} className="border-b border-border/50"><td className="py-1.5">{it.label}</td><td className="py-1.5 text-right">{formatInr(it.amount)}</td></tr>
                  ))}
                  <tr className="font-semibold"><td className="py-1.5">{pick({ en: "Total fixed", hi: "कुल निश्चित", hinglish: "Total fixed" }, lang)}</td><td className="py-1.5 text-right">{formatInr(fin.monthlyFixedCost)}</td></tr>
                </tbody>
              </table>
            </div>
          </PlanSection>

          <PlanSection n={6} title={sectionTitle("revenue")} sectionKey="revenue" activeKey={activeKey} registerRef={registerRef}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [pick({ en: "Monthly revenue", hi: "मासिक आय", hinglish: "Monthly revenue" }, lang), formatInr(fin.monthlyRevenue)],
                [pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), formatInr(fin.operatingProfit)],
                [pick({ en: "Annual revenue", hi: "वार्षिक आय", hinglish: "Annual revenue" }, lang), formatInr(fin.annualRevenue)],
                [pick({ en: "Annual profit", hi: "वार्षिक लाभ", hinglish: "Annual profit" }, lang), formatInr(fin.annualProfit)],
                [pick({ en: "Profit margin", hi: "लाभ मार्जिन", hinglish: "Profit margin" }, lang), `${fin.profitMarginPct}%`],
                [pick({ en: "ROI (annual)", hi: "ROI (वार्षिक)", hinglish: "ROI (annual)" }, lang), `${fin.roiPct}%`],
                [pick({ en: "Break-even units", hi: "ब्रेक-ईन इकाइयाँ", hinglish: "Break-even units" }, lang), `${fin.breakEvenUnits.toLocaleString("en-IN")} ${unitShort}/mo`],
                [pick({ en: "Break-even period", hi: "ब्रेक-ईन अवधि", hinglish: "Break-even period" }, lang), Number.isFinite(fin.breakEvenMonths) ? `${fin.breakEvenMonths} ${pick({ en: "months", hi: "माह", hinglish: "months" }, lang)}` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-foreground/6 p-3 ring-1 ring-white/5">
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</p>
                  <p className="mt-0.5 font-display text-base font-bold tabular">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projection}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                  <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickFormatter={(v) => formatInr(Number(v), true)} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => formatInr(Number(v))} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="revenue" name={pick({ en: "Revenue", hi: "आय", hinglish: "Revenue" }, lang)} fill="oklch(0.58 0.12 205)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name={pick({ en: "Profit", hi: "लाभ", hinglish: "Profit" }, lang)} fill="oklch(0.68 0.13 165)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projection}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                  <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickFormatter={(v) => formatInr(Number(v), true)} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => formatInr(Number(v))} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Line type="monotone" dataKey="cash" name={pick({ en: "Cumulative cash", hi: "संचयी नकद", hinglish: "Cumulative cash" }, lang)} stroke="oklch(0.64 0.14 300)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PlanSection>

          <PlanSection n={7} title={sectionTitle("risks")} sectionKey="risks" activeKey={activeKey} registerRef={registerRef}>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-1.5">{pick({ en: "Risk", hi: "जोखिम", hinglish: "Risk" }, lang)}</th>
                <th className="py-1.5">{pick({ en: "Level", hi: "स्तर", hinglish: "Level" }, lang)}</th>
                <th className="py-1.5">{pick({ en: "Mitigation", hi: "शमन", hinglish: "Mitigation" }, lang)}</th>
              </tr></thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 align-top">
                    <td className="py-2 pr-2 font-medium">{r.title}</td>
                    <td className="py-2 pr-2">{r.level}</td>
                    <td className="py-2 text-muted-foreground">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PlanSection>

          <PlanSection n={8} title={sectionTitle("funding")} sectionKey="funding" activeKey={activeKey} registerRef={registerRef}>
            {topSchemes.length > 0 ? (
              <ul className="space-y-2">
                {topSchemes.map((m) => (
                  <li key={m.scheme.id} className="rounded-xl bg-foreground/6 p-3 ring-1 ring-white/5">
                    <p className="font-medium">{m.scheme.name} · {m.matchPct}% {pick({ en: "criteria match", hi: "मानदंड मिलान", hinglish: "criteria match" }, lang)}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.scheme.type} · {pick({ en: "Source", hi: "स्रोत", hinglish: "Source" }, lang)}: {m.scheme.source.title} · {pick({ en: "last verified", hi: "अंतिम सत्यापन", hinglish: "last verified" }, lang)} {m.scheme.source.lastVerified}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{pick({ en: "No strong scheme matches in the current demo database.", hi: "मौजूदा डेमो डेटाबेस में कोई मजबूत योजना मिलान नहीं।", hinglish: "Current demo database mein koi strong scheme match nahi." }, lang)}</p>
            )}
            <DataBadge source="DEMO DATA" className="mt-3" />
          </PlanSection>

          <PlanSection n={9} title={sectionTitle("timeline")} sectionKey="timeline" activeKey={activeKey} registerRef={registerRef}>
            <ol className="space-y-1.5">
              {actionItems.filter((a) => !a.done).slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-2 text-sm">
                  <span className="shrink-0 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                    {pick(t.timelineHorizons[a.horizon], lang)}
                  </span>
                  {a.task}
                </li>
              ))}
            </ol>
          </PlanSection>

          <PlanSection n={10} title={sectionTitle("assumptions")} sectionKey="assumptions" activeKey={activeKey} registerRef={registerRef}>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {pick(t.assumptions, lang).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </PlanSection>
        </GlassCard>
      </div>
    </AppShell>
  );
}
