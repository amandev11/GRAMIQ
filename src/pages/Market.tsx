import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { useBusiness } from "@/context/BusinessProvider";
import { DEMO_MARKET_POIS } from "@/lib/data/demo";
import { computeMarketIntel } from "@/lib/intelligence/market";
import { motion } from "framer-motion";
import {
  Compass, MapPin, Store, Truck, TriangleAlert, Zap,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const POI_META = {
  user: { color: "#0d9488", icon: MapPin, label: "You" },
  market: { color: "#0284c7", icon: Store, label: "Market" },
  supplier: { color: "#16a34a", icon: Truck, label: "Supplier" },
  competitor: { color: "#dc2626", icon: TriangleAlert, label: "Competitor" },
  opportunity: { color: "#d97706", icon: Zap, label: "Opportunity" },
} as const;

const tooltipStyle = { borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)", fontSize: 12 };

export default function Market() {
  const { profile, financials, isDemo } = useBusiness();
  if (!profile) return null;
  const intel = computeMarketIntel(profile, financials);

  return (
    <AppShell title="Local Market">
      <div className="space-y-6">
        <SectionHeading
          title={`Market Intelligence — ${profile.location.village}, ${profile.location.district}`}
          desc="Scores are computed live from your model and mapped geography — change your price or volume in the simulator and watch them move."
          badge={<><DemoBanner isDemo={isDemo} /><DataBadge source="AI ESTIMATE" /></>}
        />

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Stylized local map */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Your business map</h3>
              <DataBadge source="DEMO DATA" />
            </div>
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-violet-950/60 to-slate-950/50 ring-1 ring-foreground/8">
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M 0 55 Q 30 45 55 52 T 100 48" fill="none" stroke="oklch(0.6 0.03 230 / 25%)" strokeWidth="6" />
                <path d="M 40 0 Q 45 35 52 60 T 60 100" fill="none" stroke="oklch(0.6 0.03 230 / 18%)" strokeWidth="4" />
              </svg>
              {DEMO_MARKET_POIS.map((p, i) => {
                const meta = POI_META[p.kind];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <button
                      className="flex flex-col items-center gap-1 outline-none"
                      aria-label={`${meta.label}: ${p.name}. ${p.note}`}
                    >
                      <span
                        className="flex size-9 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/80 transition-transform group-hover:scale-110"
                        style={{ background: meta.color }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="max-w-24 rounded-md bg-white/85 px-1.5 py-0.5 text-center text-[10px] leading-tight font-semibold opacity-90 shadow-sm">
                        {p.name}
                      </span>
                    </button>
                    <div className="glass-strong pointer-events-none absolute top-full left-1/2 z-10 mt-1 hidden w-48 -translate-x-1/2 rounded-xl p-2.5 text-xs group-hover:block">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-muted-foreground">{p.distanceKm} km · {p.note}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(POI_META).map(([k, m]) => (
                <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Derived location scores */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold">Location score</h3>
                <DataBadge source="AI ESTIMATE" />
              </div>
              <div className="mt-1 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={intel.factors} outerRadius="72%">
                    <PolarGrid stroke="oklch(0.55 0.02 230 / 20%)" />
                    <PolarAngleAxis dataKey="factor" fontSize={10} tickLine={false} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.28} animationDuration={900} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/100`, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="-mt-2 text-center font-display text-2xl font-bold text-indigo-300">
                {intel.overall}
                <span className="text-sm font-normal text-muted-foreground">/100 estimated opportunity</span>
              </p>
            </GlassCard>

            {/* Factor drivers — explainability */}
            <GlassCard className="p-5">
              <h3 className="font-display text-base font-bold">What drives each score?</h3>
              <ul className="mt-3 space-y-2">
                {intel.factors.map((f) => (
                  <li key={f.factor} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 font-medium sm:w-36">{f.factor}</span>
                    <div className="h-2 min-w-8 flex-1 overflow-hidden rounded-full bg-foreground/8">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${f.score}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs tabular">{f.score}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted-foreground">
                {intel.factors.slice(0, 4).map((f) => (
                  <li key={f.factor}>· <strong className="font-medium text-foreground/70">{f.factor}:</strong> {f.driver}</li>
                ))}
              </ul>
            </GlassCard>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard className="flex gap-3 p-5 ring-1 ring-indigo-500/15">
                <Compass className="size-9 shrink-0 rounded-xl bg-indigo-500 p-1.5 text-white" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Why this location?</p>
                  <ul className="mt-1 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                    {intel.reasoning.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              </GlassCard>
            </motion.div>

            {/* Demand by segment */}
            <GlassCard className="p-5">
              <h3 className="font-display text-base font-bold">Estimated daily demand by segment</h3>
              <div className="mt-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={intel.demandSegments} margin={{ left: 8 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} unit=" L" />
                    <YAxis type="category" dataKey="seg" fontSize={11} width={82} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, _n, p) => [`${v} L/day`, `(${p.payload.sharePct}% of plan)`]} />
                    <Bar dataKey="litres" radius={[0, 8, 8, 0]} animationDuration={800}>
                      {intel.demandSegments.map((_, i) => (
                        <Cell key={i} fill={["#0d9488", "#0284c7", "#16a34a"][i % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground">Splits your planned volume across segments · AI ESTIMATE</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
