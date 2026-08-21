import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, SectionHeading, StatTile } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { formatInr } from "@/lib/finance/engine";
import { generateBlueprint } from "@/lib/intelligence/blueprint";
import { motion } from "framer-motion";
import { CheckCircle2, Download, TrendingUp } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useNavigate } from "react-router";

const COLORS = ["oklch(0.58 0.12 205)", "oklch(0.68 0.13 165)", "oklch(0.78 0.13 80)"];

export default function Blueprint() {
  const { profile, financials, isDemo } = useBusiness();
  const navigate = useNavigate();
  if (!profile) return null;
  const bp = generateBlueprint(profile, financials);
  const fin = bp.results;

  const expenseData = bp.monthlyExpenses.filter((e) => e.amount > 0).map((e) => ({ name: e.label, amount: e.amount }));
  const investData = bp.investmentBreakdown.map((e) => ({ name: e.label.split(" (")[0], amount: e.amount }));

  return (
    <AppShell title="Business Blueprint">
      <div className="space-y-6">
        <SectionHeading
          title="Business Blueprint"
          desc={bp.overview}
          badge={<DemoBanner isDemo={isDemo} />}
          action={
            <Button variant="outline" className="glass gap-2 rounded-full" onClick={() => navigate("/business-plan")}>
              <Download className="size-4" /> Full Plan PDF
            </Button>
          }
        />

        {/* Section 1-2 */}
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Why this business works for you</h3>
            <ul className="mt-3 space-y-2.5">
              {bp.whyThisBusiness.map((w) => (
                <li key={w} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" />
                  {w}
                </li>
              ))}
            </ul>
            <DataBadge source="AI ESTIMATE" className="mt-4" />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Revenue model</h3>
            <p className="mt-3 rounded-xl bg-white/55 p-4 text-sm leading-relaxed">{bp.revenueModel}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "Buy price", v: `₹${financials.rawMaterialPerUnit}/L` },
                { l: "Sell price", v: `₹${financials.sellingPricePerUnit}/L` },
                { l: "Margin/L", v: `₹${fin.contributionPerUnit}` },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-xl bg-primary/6 p-3 ring-1 ring-primary/10">
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                  <p className="mt-0.5 font-display font-bold">{v}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Key financials */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile label="Monthly Revenue" value={fin.monthlyRevenue} format={formatInr} tone="positive" icon={<TrendingUp className="size-4" />} />
          <StatTile label="Monthly Expenses" value={fin.monthlyFixedCost + fin.monthlyVariableCost} format={formatInr} />
          <StatTile label="Expected Profit /mo" value={fin.operatingProfit} format={formatInr} tone={fin.operatingProfit > 0 ? "positive" : "negative"} sub={`${fin.profitMarginPct}% margin`} />
          <StatTile label="Break-even" value={Number.isFinite(fin.breakEvenMonths) ? `${fin.breakEvenMonths} mo` : "—"} sub={`${fin.breakEvenUnits.toLocaleString("en-IN")} L/month`} />
        </div>

        {/* Investment + expenses charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Required investment</h3>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                  <XAxis type="number" tickFormatter={(v) => formatInr(v, true)} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={90} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatInr(Number(v)), "Cost"]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)" }} />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} animationDuration={800}>
                    {investData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              Total startup cost: <strong>{formatInr(fin.totalStartupCost)}</strong> · Deterministic engine output
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Monthly expenses</h3>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                  <XAxis type="number" tickFormatter={(v) => formatInr(v, true)} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={110} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatInr(Number(v)), "Per month"]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)" }} />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} fill="oklch(0.64 0.14 300)" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              Raw material ({formatInr(fin.monthlyVariableCost)}/mo) counted separately as variable cost.
            </p>
          </GlassCard>
        </div>

        {/* Market + funding */}
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Market opportunity</h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              {bp.marketOpportunity.map((m) => (
                <li key={m} className="flex gap-2.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-sky-500" style={{ marginTop: "0.44rem" }} />
                  {m}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold">Funding options</h3>
            <motion.ul className="mt-3 space-y-2.5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
              {bp.fundingOptions.map((f, i) => (
                <motion.li
                  key={f}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/55 px-4 py-3 text-sm"
                >
                  {f}
                  {i > 0 && (
                    <Button variant="outline" size="sm" className="glass shrink-0 rounded-full text-xs" onClick={() => navigate("/schemes")}>
                      View
                    </Button>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
