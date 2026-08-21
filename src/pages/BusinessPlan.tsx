import { AppShell } from "@/components/app/AppShell";
import { DataBadge, GlassCard } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { computeFinancials, formatInr, project12Months } from "@/lib/finance/engine";
import { computeRisks } from "@/lib/intelligence/scores";
import { matchSchemes } from "@/lib/intelligence/schemes";
import { Download } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

function PlanSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="print-page mt-8 break-inside-avoid">
      <h2 className="flex items-baseline gap-3 font-display text-xl font-bold">
        <span className="text-sm text-teal-700 tabular">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

export default function BusinessPlan() {
  const { profile, financials, actionItems } = useBusiness();
  if (!profile) return null;
  const fin = computeFinancials(financials);
  const projection = project12Months(financials);
  const risks = computeRisks(profile, financials);
  const topSchemes = matchSchemes(profile, fin.totalStartupCost).filter((m) => m.matchPct >= 60).slice(0, 3);

  return (
    <AppShell title="Business Plan PDF">
      <div className="mx-auto max-w-4xl">
        {/* Toolbar */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Professional Business Plan</h1>
            <p className="text-sm text-muted-foreground">Print or save as PDF — ready for banks and district offices.</p>
          </div>
          <Button onClick={() => window.print()} className="gap-2 rounded-full">
            <Download className="size-4" /> Print / Save PDF
          </Button>
        </div>

        <GlassCard className="p-6 sm:p-10">
          {/* Cover / header */}
          <header className="border-b-2 border-teal-600/30 pb-6 text-center print-page">
            <p className="text-xs font-bold tracking-[0.3em] text-teal-700 uppercase">GRAMIQ Business Plan</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Small Dairy Enterprise</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.name} · {profile.location.village}, {profile.location.district}, {profile.location.state}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Prepared by GRAMIQ · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </header>

          <PlanSection n={1} title="Executive Summary">
            <p>
              {profile.name} plans to establish a small dairy collection-and-sale enterprise in{" "}
              {profile.location.village}. With a startup investment of {formatInr(fin.totalStartupCost)} against{" "}
              {formatInr(profile.capital)} of available capital, the business is projected to generate{" "}
              {formatInr(fin.monthlyRevenue)} monthly revenue at planned volume and reach break-even in
              approximately {fin.breakEvenMonths} months. All financial projections are deterministic model
              outputs based on the stated assumptions (AI ESTIMATE); they are not guarantees.
            </p>
          </PlanSection>

          <PlanSection n={2} title="Entrepreneur Profile">
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              <li><strong>Name:</strong> {profile.name}</li>
              <li><strong>Experience:</strong> {profile.experience}</li>
              <li><strong>Location:</strong> {profile.location.village}, {profile.location.district}</li>
              <li><strong>Available capital:</strong> {formatInr(profile.capital)}</li>
              <li><strong>Existing business:</strong> {profile.existingBusiness === "none" ? "First venture" : profile.existingBusiness}</li>
              <li><strong>Resources:</strong> {profile.resources.join(", ") || "—"}</li>
            </ul>
          </PlanSection>

          <PlanSection n={3} title="Business Idea & Products">
            <p>{profile.businessIdea}.</p>
            <p className="mt-2">
              Revenue comes from daily household delivery, shop supply and tea-stall contracts. Value-added
              products (curd, paneer) are a year-two expansion option once the base route is stable.
            </p>
          </PlanSection>

          <PlanSection n={4} title="Market Opportunity & Location Analysis">
            <ul className="list-inside list-disc space-y-1">
              <li>DEMO DATA: ~180 households within 4 km purchase milk daily.</li>
              <li>DEMO DATA: two farmer collection points within 4 km; ~320 L/day combined potential.</li>
              <li>AI ESTIMATE: capturing 35–40% of nearby demand covers the planned volume.</li>
            </ul>
          </PlanSection>

          <PlanSection n={5} title="Startup Investment & Monthly Expenses">
            <div className="grid gap-6 sm:grid-cols-2">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"><th className="py-1.5">Item</th><th className="py-1.5 text-right">Amount</th></tr></thead>
                <tbody className="tabular">
                  <tr className="border-b border-border/50"><td className="py-1.5">Equipment</td><td className="py-1.5 text-right">{formatInr(financials.equipmentCost)}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-1.5">Initial stock</td><td className="py-1.5 text-right">{formatInr(financials.inventoryCost)}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-1.5">Setup & licenses</td><td className="py-1.5 text-right">{formatInr(financials.otherSetupCost)}</td></tr>
                  <tr className="font-semibold"><td className="py-1.5">Total startup</td><td className="py-1.5 text-right">{formatInr(fin.totalStartupCost)}</td></tr>
                </tbody>
              </table>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"><th className="py-1.5">Monthly</th><th className="py-1.5 text-right">Amount</th></tr></thead>
                <tbody className="tabular">
                  <tr className="border-b border-border/50"><td className="py-1.5">Raw material ({financials.unitsPerMonth.toLocaleString("en-IN")} L)</td><td className="py-1.5 text-right">{formatInr(fin.monthlyVariableCost)}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-1.5">Labor + utilities + other</td><td className="py-1.5 text-right">{formatInr(financials.labor + financials.utilities + financials.otherMonthlyCost + financials.rent)}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-1.5">Loan EMI</td><td className="py-1.5 text-right">{formatInr(fin.emi)}</td></tr>
                  <tr className="font-semibold"><td className="py-1.5">Total fixed</td><td className="py-1.5 text-right">{formatInr(fin.monthlyFixedCost)}</td></tr>
                </tbody>
              </table>
            </div>
          </PlanSection>

          <PlanSection n={6} title="Revenue & Profit Projection">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Monthly revenue", formatInr(fin.monthlyRevenue)],
                ["Monthly profit", formatInr(fin.operatingProfit)],
                ["Annual revenue", formatInr(fin.annualRevenue)],
                ["Annual profit", formatInr(fin.annualProfit)],
                ["Profit margin", `${fin.profitMarginPct}%`],
                ["ROI (annual)", `${fin.roiPct}%`],
                ["Break-even units", `${fin.breakEvenUnits.toLocaleString("en-IN")} L/mo`],
                ["Break-even period", Number.isFinite(fin.breakEvenMonths) ? `${fin.breakEvenMonths} months` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/60 p-3 ring-1 ring-black/5">
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
                  <Bar dataKey="revenue" name="Revenue" fill="oklch(0.58 0.12 205)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="oklch(0.68 0.13 165)" radius={[4, 4, 0, 0]} />
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
                  <Line type="monotone" dataKey="cash" name="Cumulative cash" stroke="oklch(0.64 0.14 300)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PlanSection>

          <PlanSection n={7} title="Risk Analysis">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"><th className="py-1.5">Risk</th><th className="py-1.5">Level</th><th className="py-1.5">Mitigation</th></tr></thead>
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

          <PlanSection n={8} title="Funding Opportunities">
            {topSchemes.length > 0 ? (
              <ul className="space-y-2">
                {topSchemes.map((m) => (
                  <li key={m.scheme.id} className="rounded-xl bg-white/60 p-3 ring-1 ring-black/5">
                    <p className="font-medium">{m.scheme.name} · {m.matchPct}% criteria match</p>
                    <p className="text-xs text-muted-foreground">
                      {m.scheme.type} · Source: {m.scheme.source.title} · last verified {m.scheme.source.lastVerified}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No strong scheme matches in the current demo database.</p>
            )}
            <DataBadge source="DEMO DATA" className="mt-3" />
          </PlanSection>

          <PlanSection n={9} title="Implementation Timeline">
            <ol className="space-y-1.5">
              {actionItems.filter((a) => !a.done).slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-2 text-sm">
                  <span className="shrink-0 rounded-md bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 uppercase">
                    {{ "7d": "7 days", "30d": "30 days", "90d": "90 days", "1y": "Year 1" }[a.horizon]}
                  </span>
                  {a.task}
                </li>
              ))}
            </ol>
          </PlanSection>

          <PlanSection n={10} title="Important Assumptions & Data Sources">
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>All financial figures derive from GRAMIQ's deterministic calculation engine given the inputs above (AI ESTIMATE).</li>
              <li>Ramp-up assumes 55% of planned volume in month 1, reaching full volume by month 6.</li>
              <li>Market and scheme entries are clearly labeled DEMO DATA from the prototype knowledge base.</li>
              <li>This plan is decision support, not a guarantee of business success or scheme eligibility.</li>
            </ul>
          </PlanSection>
        </GlassCard>
      </div>
    </AppShell>
  );
}
