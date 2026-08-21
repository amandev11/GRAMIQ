import { AppShell } from "@/components/app/AppShell";
import { AnimatedNumber, DataBadge, DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useBusiness } from "@/context/BusinessProvider";
import {
  applyScenario, computeFinancials, formatInr, project12Months, SCENARIOS,
} from "@/lib/finance/engine";
import { cn } from "@/lib/utils";
import type { FinancialInputs } from "@/lib/types";
import { motion } from "framer-motion";
import { Calculator, FlaskConical, Info } from "lucide-react";
import { useState } from "react";
import {
  Area, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

const tooltipStyle = { borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)", fontSize: 12 };

function SimulatorControl({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular font-display font-bold text-primary">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}

function MetricRow({ label, before, after, format, invert = false }: {
  label: string; before: number; after: number; format: (n: number) => string; invert?: boolean;
}) {
  const diff = after - before;
  const good = invert ? diff < 0 : diff > 0;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/55 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3 tabular">
        <span className="text-sm text-muted-foreground line-through decoration-foreground/30">{format(before)}</span>
        <motion.span
          key={after}
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("font-display text-base font-bold", diff === 0 ? "" : good ? "text-emerald-600" : "text-rose-600")}
        >
          {format(after)}
        </motion.span>
      </div>
    </div>
  );
}

/** Standalone model editor (top-level to keep input focus stable). */
function ModelEditor({
  financials,
  onChange,
}: {
  financials: FinancialInputs;
  onChange: (f: Partial<FinancialInputs>) => void;
}) {
  const fields: Array<{ key: keyof FinancialInputs; label: string }> = [
    { key: "workingCapital", label: "Working capital (₹)" },
    { key: "equipmentCost", label: "Equipment cost (₹)" },
    { key: "inventoryCost", label: "Initial stock (₹)" },
    { key: "otherSetupCost", label: "Setup & licenses (₹)" },
    { key: "labor", label: "Labor / month (₹)" },
    { key: "utilities", label: "Utilities / month (₹)" },
    { key: "rawMaterialPerUnit", label: "Buy price per L (₹)" },
    { key: "sellingPricePerUnit", label: "Sell price per L (₹)" },
    { key: "unitsPerMonth", label: "Volume (L / month)" },
    { key: "otherMonthlyCost", label: "Other monthly cost (₹)" },
  ];
  return (
    <GlassCard className="p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold">Edit your financial model</h3>
      <p className="text-xs text-muted-foreground">Change any input — every page updates instantly.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
            <input
              type="number"
              value={String(financials[key])}
              onChange={(e) => onChange({ [key]: Number(e.target.value) || 0 })}
              className="glass w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={label}
            />
          </label>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Finance() {
  const { profile, financials, setFinancials, isDemo } = useBusiness();
  const [sim, setSim] = useState({
    priceFactor: 1,
    volumeFactor: 1,
    materialFactor: 1,
    laborDelta: 0,
    investmentDelta: 0,
  });
  if (!profile) return null;

  const base = computeFinancials(financials);

  // Cheap deterministic recomputation — no need for memoization.
  const simulatedInputs: FinancialInputs = {
    ...financials,
    sellingPricePerUnit: financials.sellingPricePerUnit * sim.priceFactor,
    unitsPerMonth: Math.round(financials.unitsPerMonth * sim.volumeFactor),
    rawMaterialPerUnit: financials.rawMaterialPerUnit * sim.materialFactor,
    labor: Math.max(0, financials.labor + sim.laborDelta),
    equipmentCost: Math.max(0, financials.equipmentCost + sim.investmentDelta),
  };

  const simRes = computeFinancials(simulatedInputs);
  const projection = project12Months(simulatedInputs);

  const scenarioData = Object.entries(SCENARIOS).map(([key, s]) => {
    const r = computeFinancials(applyScenario(financials, s.adj));
    return { name: s.label, Revenue: r.monthlyRevenue, Profit: r.operatingProfit, BreakEven: Number.isFinite(r.breakEvenMonths) ? r.breakEvenMonths : 0, key };
  });

  const aiInsight = (() => {
    if (sim.materialFactor > 1.08)
      return "Raw material cost is up significantly — your margin is sensitive to collection price. Lock weekly rates with 2+ suppliers or add ₹1/L to household prices.";
    if (sim.priceFactor < 0.94)
      return `Your business becomes more sensitive below ₹${(financials.sellingPricePerUnit * 0.93).toFixed(0)}/L. Consider direct sales or longer-term tea-stall contracts instead of matching price cuts.`;
    if (sim.volumeFactor > 1.15)
      return "Higher volume improves profit per litre through fixed-cost absorption — but confirm supplier capacity first before committing to buyers.";
    if (sim.investmentDelta > 10000)
      return "Extra investment raises capacity, but watch break-even timing. Only scale if you can add at least " + (Number.isFinite(simRes.breakEvenUnits - base.breakEvenUnits) ? Math.max(simRes.breakEvenUnits - base.breakEvenUnits, 0).toLocaleString("en-IN") : "some") + " L of monthly sales.";
    return "Adjust any control to see how your business responds. Every number recalculates instantly from the deterministic engine.";
  })();

  return (
    <AppShell title="Finance & Simulator">
      <div className="space-y-6">
        <SectionHeading
          title="Financial Engine"
          desc="Every figure is computed by a deterministic formula engine — the AI explains results, it never invents them."
          badge={<DemoBanner isDemo={isDemo} />}
        />

        {/* Simulator */}
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Controls */}
          <GlassCard className="h-fit space-y-5 p-5">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <FlaskConical className="size-4 text-primary" /> What if…
            </h3>
            <SimulatorControl
              label="Selling price /L"
              value={Number((financials.sellingPricePerUnit * sim.priceFactor).toFixed(1))}
              min={Math.round(financials.sellingPricePerUnit * 0.8 * 10) / 10}
              max={Math.round(financials.sellingPricePerUnit * 1.3 * 10) / 10}
              step={0.5}
              format={(v) => `₹${v}`}
              onChange={(v) => setSim((s) => ({ ...s, priceFactor: v / financials.sellingPricePerUnit }))}
            />
            <SimulatorControl
              label="Monthly volume (L)"
              value={Math.round(financials.unitsPerMonth * sim.volumeFactor)}
              min={Math.round(financials.unitsPerMonth * 0.4)}
              max={Math.round(financials.unitsPerMonth * 1.8)}
              step={50}
              format={(v) => `${v.toLocaleString("en-IN")} L`}
              onChange={(v) => setSim((s) => ({ ...s, volumeFactor: v / financials.unitsPerMonth }))}
            />
            <SimulatorControl
              label="Collection cost /L"
              value={Number((financials.rawMaterialPerUnit * sim.materialFactor).toFixed(1))}
              min={Math.round(financials.rawMaterialPerUnit * 0.85 * 10) / 10}
              max={Math.round(financials.rawMaterialPerUnit * 1.25 * 10) / 10}
              step={0.5}
              format={(v) => `₹${v}`}
              onChange={(v) => setSim((s) => ({ ...s, materialFactor: v / financials.rawMaterialPerUnit }))}
            />
            <SimulatorControl
              label="Monthly labor cost"
              value={Math.max(0, financials.labor + sim.laborDelta)}
              min={0}
              max={financials.labor + 8000}
              step={500}
              format={(v) => formatInr(v, true)}
              onChange={(v) => setSim((s) => ({ ...s, laborDelta: v - financials.labor }))}
            />
            <SimulatorControl
              label="Extra investment"
              value={Math.max(0, sim.investmentDelta)}
              min={0}
              max={150000}
              step={5000}
              format={(v) => (v === 0 ? "—" : `+${formatInr(v, true)}`)}
              onChange={(v) => setSim((s) => ({ ...s, investmentDelta: v }))}
            />
            <Button
              variant="outline"
              className="glass w-full rounded-full"
              onClick={() => setSim({ priceFactor: 1, volumeFactor: 1, materialFactor: 1, laborDelta: 0, investmentDelta: 0 })}
            >
              Reset simulation
            </Button>
          </GlassCard>

          {/* Before/After */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Before</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">→ LIVE</span>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">After</span>
              </div>
              <div className="space-y-2">
                <MetricRow label="Monthly revenue" before={base.monthlyRevenue} after={simRes.monthlyRevenue} format={formatInr} />
                <MetricRow label="Monthly profit" before={base.operatingProfit} after={simRes.operatingProfit} format={formatInr} />
                <MetricRow
                  label="Break-even"
                  before={base.breakEvenMonths}
                  after={simRes.breakEvenMonths}
                  format={(n) => (Number.isFinite(n) ? `${n} mo` : "—")}
                  invert
                />
                <MetricRow label="Profit margin" before={base.profitMarginPct} after={simRes.profitMarginPct} format={(n) => `${n}%`} />
                <MetricRow label="Cash runway" before={base.cashRunwayMonths} after={simRes.cashRunwayMonths} format={(n) => (Number.isFinite(n) ? `${n} mo` : "Healthy")} invert />
              </div>
              <DataBadge source="AI ESTIMATE" className="mt-4" />
            </GlassCard>

            {/* AI insight */}
            <motion.div key={aiInsight} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="flex gap-3 p-5 ring-1 ring-teal-600/15">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white">
                  <Info className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">Copilot insight · AI ESTIMATE</p>
                  <p className="mt-1 text-sm leading-relaxed">{aiInsight}</p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* Scenario presets */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold">Scenario presets</h3>
            <DataBadge source="AI ESTIMATE" />
          </div>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} margin={{ top: 12, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => formatInr(Number(v), true)} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => formatInr(Number(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" radius={[6, 6, 0, 0]} fill="oklch(0.58 0.12 205)" animationDuration={700} />
                <Bar dataKey="Profit" radius={[6, 6, 0, 0]} fill="oklch(0.68 0.13 165)" animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {scenarioData.map((s) => (
              <div key={s.key} className="rounded-xl bg-white/55 p-3 text-sm">
                <p className="font-semibold">{s.name}</p>
                <p className="text-muted-foreground">Break-even: {s.BreakEven === 0 ? "not reached" : `${s.BreakEven} mo`}</p>
                <p className="text-[11px] text-muted-foreground/80">{SCENARIOS[s.key].note}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Projection */}
        <GlassCard className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold">12-month cash flow projection</h3>
          <p className="text-xs text-muted-foreground">Ramp-up modeled from 55% in month 1 to full volume by month 6.</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projection} margin={{ top: 12, right: 8 }}>
                <defs>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.12 205)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.58 0.12 205)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => formatInr(Number(v), true)} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => formatInr(Number(v))} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.58 0.12 205)" strokeWidth={2.5} fill="url(#cashGrad)" name="Revenue" animationDuration={900} />
                <Area type="monotone" dataKey="expenses" stroke="oklch(0.63 0.17 25)" strokeWidth={2} fill="transparent" name="Expenses" animationDuration={1100} />
                <Line type="monotone" dataKey="profit" stroke="oklch(0.68 0.13 165)" strokeWidth={2} dot={false} name="Profit" animationDuration={1300} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Annual summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Annual revenue", v: simRes.annualRevenue },
            { l: "Annual profit", v: simRes.annualProfit },
            { l: "ROI (annual)", v: simRes.roiPct },
            { l: "Loan EMI", v: simRes.emi },
          ].map(({ l, v }) => (
            <GlassCard key={l} hover className="p-4 text-center">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{l}</p>
              <p className="mt-1 font-display text-xl font-bold">
                <AnimatedNumber
                  value={Number.isFinite(v) ? v : 0}
                  format={l.includes("%") ? (n) => `${Math.round(n)}%` : (n) => formatInr(n)}
                />
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="flex gap-3 p-4">
          <Calculator className="size-5 shrink-0 text-sky-600" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>How these numbers are made:</strong> EMI uses the reducing-balance formula P·r·(1+r)ⁿ/((1+r)ⁿ−1).
            Break-even units = fixed costs ÷ contribution per unit. ROI = annual profit ÷ invested capital.
            Nothing here is produced by an AI model guessing — the AI only narrates engine output.
          </p>
        </GlassCard>

        <ModelEditor financials={financials} onChange={setFinancials} />
      </div>
    </AppShell>
  );
}
