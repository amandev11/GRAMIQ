import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { useBusiness } from "@/context/BusinessProvider";
import { DEMO_MARKET_POIS } from "@/lib/data/demo";
import { motion } from "framer-motion";
import {
  Compass, MapPin, Store, Truck, TriangleAlert, Zap,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar,
  RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const POI_META = {
  user: { color: "#0d9488", icon: MapPin, label: "You" },
  market: { color: "#0284c7", icon: Store, label: "Market" },
  supplier: { color: "#16a34a", icon: Truck, label: "Supplier" },
  competitor: { color: "#dc2626", icon: TriangleAlert, label: "Competitor" },
  opportunity: { color: "#d97706", icon: Zap, label: "Opportunity" },
} as const;

export default function Market() {
  const { profile, isDemo } = useBusiness();
  if (!profile) return null;

  // Modeled location scores (0-100) — clearly labeled as modeled.
  const radarData = [
    { factor: "Demand Signal", score: 88 },
    { factor: "Low Competition", score: 62 },
    { factor: "Accessibility", score: 81 },
    { factor: "Supplier Proximity", score: 92 },
    { factor: "Market Reach", score: 74 },
    { factor: "Logistics Ease", score: 79 },
  ];
  const overall = Math.round(radarData.reduce((s, d) => s + d.score, 0) / radarData.length);

  return (
    <AppShell title="Local Market">
      <div className="space-y-6">
        <SectionHeading
          title={`Market Intelligence — ${profile.location.village}, ${profile.location.district}`}
          desc="Hyper-local view of markets, suppliers, competitors and opportunity zones around you."
          badge={<><DemoBanner isDemo={isDemo} /><DataBadge source="DEMO DATA" /></>}
        />

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Stylized local map */}
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Your business map</h3>
              <DataBadge source="DEMO DATA" />
            </div>
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100/70 via-teal-50/60 to-emerald-50/50 ring-1 ring-foreground/8">
              {/* decorative roads */}
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M 0 55 Q 30 45 55 52 T 100 48" fill="none" stroke="oklch(0.6 0.03 230 / 25%)" strokeWidth="6" />
                <path d="M 40 0 Q 45 35 52 60 T 60 100" fill="none" stroke="oklch(0.6 0.03 230 / 18%)" strokeWidth="4" />
                <circle cx="22%" cy="44%" r="46" fill="oklch(0.78 0.13 80 / 14%)" />
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
            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(POI_META).map(([k, m]) => (
                <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Prototype note: live map tiles (MapLibre/Leaflet) plug into this component; positions here are
              illustrative demo data for {profile.location.district}.
            </p>
          </GlassCard>

          {/* Location score + reasoning */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold">Location score</h3>
                <DataBadge source="AI ESTIMATE" />
              </div>
              <div className="mt-1 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="oklch(0.55 0.02 230 / 20%)" />
                    <PolarAngleAxis dataKey="factor" fontSize={10} tickLine={false} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.28} animationDuration={900} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)", fontSize: 12 }} formatter={(v) => [`${v}/100`, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="-mt-2 text-center font-display text-2xl font-bold text-teal-700">{overall}<span className="text-sm text-muted-foreground">/100 estimated opportunity</span></p>
            </GlassCard>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard className="flex gap-3 p-5 ring-1 ring-teal-600/15">
                <Compass className="size-9 shrink-0 rounded-xl bg-teal-600 p-1.5 text-white" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">Why this location?</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {profile.location.village} sits within ~4 km of ~180 households (DEMO DATA) with two farmer
                    collection points under 4 km away — short cold-chain routes and daily cash demand. The main gap
                    is one established private seller on the eastern route; the highway tea-stall belt to the west is
                    unserved (AI ESTIMATE based on demo inputs only).
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Demand by segment */}
            <GlassCard className="p-5">
              <h3 className="font-display text-base font-bold">Estimated daily demand by segment</h3>
              <div className="mt-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { seg: "Households", litres: 320 },
                      { seg: "Tea stalls", litres: 140 },
                      { seg: "Shops", litres: 90 },
                    ]}
                    margin={{ left: 8 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="oklch(0.5 0.02 230 / 15%)" />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="seg" fontSize={11} width={80} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--glass-shadow)", fontSize: 12 }} formatter={(v) => [`${v} L/day`, "Demand"]} />
                    <Bar dataKey="litres" radius={[0, 8, 8, 0]} fill="oklch(0.58 0.12 205)" animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataBadge source="AI ESTIMATE" className="mt-2" />
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
