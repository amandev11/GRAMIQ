import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { useBusiness } from "@/context/BusinessProvider";
import { computeRisks } from "@/lib/intelligence/scores";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

const levelStyles = {
  HIGH: "bg-rose-500/12 text-rose-700 ring-rose-500/30",
  MEDIUM: "bg-amber-500/14 text-amber-700 ring-amber-500/30",
  LOW: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/30",
} as const;

export default function Risks() {
  const { profile, financials, isDemo } = useBusiness();
  if (!profile) return null;
  const risks = computeRisks(profile, financials);
  const counts = {
    HIGH: risks.filter((r) => r.level === "HIGH").length,
    MEDIUM: risks.filter((r) => r.level === "MEDIUM").length,
    LOW: risks.filter((r) => r.level === "LOW").length,
  };

  return (
    <AppShell title="Risk Radar">
      <div className="space-y-6">
        <SectionHeading
          title="Risk Radar"
          desc="Seven risk categories scored against your live financial model — each with impact and a concrete mitigation."
          badge={<DemoBanner isDemo={isDemo} />}
        />

        <div className="grid grid-cols-3 gap-4">
          {(["HIGH", "MEDIUM", "LOW"] as const).map((lvl) => (
            <GlassCard key={lvl} hover className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{lvl}</p>
                <p className="font-display text-2xl font-bold tabular">{counts[lvl]}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ring-1", levelStyles[lvl])}>
                {lvl === "HIGH" ? "Act now" : lvl === "MEDIUM" ? "Monitor" : "Stable"}
              </span>
            </GlassCard>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {risks.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard hover className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("flex size-9 items-center justify-center rounded-xl ring-1", levelStyles[r.level])}>
                      <ShieldAlert className="size-4" />
                    </span>
                    <div>
                      <h3 className="leading-tight font-display text-base font-bold">{r.title}</h3>
                      <p className="text-xs text-muted-foreground">{r.category}</p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest ring-1", levelStyles[r.level])}>
                    {r.level}
                  </span>
                </div>

                <dl className="mt-4 space-y-2.5 text-sm leading-relaxed">
                  <div>
                    <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Why</dt>
                    <dd className="text-muted-foreground">{r.why}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Impact</dt>
                    <dd className="text-muted-foreground">{r.impact}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold tracking-wide text-indigo-300 uppercase">Mitigation</dt>
                    <dd className="text-muted-foreground">{r.mitigation}</dd>
                  </div>
                </dl>

                <DataBadge source={r.source} className="mt-4 self-start" />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
