import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, ScoreRing, SectionHeading } from "@/components/glass/primitives";
import { useBusiness } from "@/context/BusinessProvider";
import { formatInr } from "@/lib/finance/engine";
import { compareBusinesses } from "@/lib/intelligence/blueprint";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Info, Scale } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export default function Compare() {
  const { profile, isDemo } = useBusiness();
  const navigate = useNavigate();
  if (!profile) return null;
  const cmp = compareBusinesses();
  const best = cmp.candidates[cmp.recommendationIndex];

  // Decision trace: where does the winner beat the runner-up, by how much?
  const runnerUpIdx = cmp.totals
    .map((t, i) => ({ t, i }))
    .filter(({ i }) => i !== cmp.recommendationIndex)
    .sort((a, b) => b.t - a.t)[0].i;
  const deciding = cmp.factors
    .map((f) => ({
      label: f.label,
      delta: f.scores[cmp.recommendationIndex] - f.scores[runnerUpIdx],
      win: f.scores[cmp.recommendationIndex],
      lose: f.scores[runnerUpIdx],
    }))
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);

  return (
    <AppShell title="Compare Ideas">
      <div className="space-y-6">
        <SectionHeading
          title="Business Comparison Engine"
          desc="Three ventures scored on your actual profile. Every factor and weight is visible — nothing hidden inside a black box."
          badge={<><DemoBanner isDemo={isDemo} /><DataBadge source="AI ESTIMATE" /></>}
        />

        {/* Recommendation */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="flex flex-col items-start gap-5 p-6 ring-1 ring-indigo-500/15 sm:flex-row sm:items-center">
            <ScoreRing score={cmp.totals[cmp.recommendationIndex]} size={116} label="Best fit" />
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Recommendation</p>
              <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{best.name}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{cmp.recommendation}</p>
              {/* Decision trace — the three factors that decided it */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  Why it beats {cmp.candidates[runnerUpIdx].name.split(" (")[0]}
                </p>
                {deciding.map((d, i) => (
                  <motion.div
                    key={d.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.12 }}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="w-32 shrink-0 font-semibold sm:w-36">{d.label}</span>
                    <span className="w-7 text-right tabular text-muted-foreground">{d.win}</span>
                    <span className="text-indigo-400">›</span>
                    <span className="w-7 tabular text-muted-foreground">{d.lose}</span>
                    <div className="h-1.5 min-w-10 flex-1 overflow-hidden rounded-full bg-foreground/8">
                      <motion.div
                        className="h-full rounded-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(Math.min(d.delta * 2.5, 100), 3)}%` }}
                        transition={{ delay: 0.35 + i * 0.12, duration: 0.5 }}
                      />
                    </div>
                    <span className="w-10 text-right font-bold tabular text-indigo-300">+{d.delta}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <Button variant="outline" className="glass shrink-0 rounded-full" onClick={() => navigate("/blueprint")}>
              Open your blueprint
            </Button>
          </GlassCard>
        </motion.div>

        {/* Candidate summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {cmp.candidates.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                hover
                className={cn(
                  "flex h-full flex-col p-5",
                  i === cmp.recommendationIndex && "ring-2 ring-indigo-500/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base leading-snug font-bold">{c.name}</h3>
                  {i === cmp.recommendationIndex && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-indigo-500/12 px-2 py-0.5 text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
                      <Check className="size-3" /> Best
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Startup", formatInr(c.startupCost, true)],
                    ["Profit/mo", formatInr(c.monthlyProfit, true)],
                    ["Break-even", `${c.breakEvenMonths} mo`],
                    ["Skill", c.skillRequirement],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-foreground/6 px-2.5 py-2 ring-1 ring-white/5">
                      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{k}</p>
                      <p className="font-semibold tabular">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">{c.why}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Transparent scoring matrix */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <Scale className="size-4 text-primary" /> Scoring matrix
              </h3>
              <p className="text-xs text-muted-foreground">Each factor normalized 0–100 across the three candidates, then averaged equally.</p>
            </div>
            <DataBadge source="AI ESTIMATE" />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="pb-1 pl-1">Factor</th>
                  {cmp.candidates.map((c) => (
                    <th key={c.key} className="pb-1 text-center">{c.name.split(" (")[0]}</th>
                  ))}
                  <th className="pb-1 pr-1 text-right">Note</th>
                </tr>
              </thead>
              <tbody>
                {cmp.factors.map((f) => (
                  <tr key={f.label} className="align-middle">
                    <td className="rounded-l-xl bg-foreground/5 py-2.5 pl-3 font-medium">{f.label}</td>
                    {f.scores.map((s, i) => (
                      <td key={i} className="bg-foreground/5 px-2 py-2.5 text-center">
                        <div className="mx-auto flex w-28 items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/8">
                            <motion.div
                              className={cn(
                                "h-full rounded-full",
                                i === cmp.recommendationIndex ? "bg-indigo-500" : "bg-violet-500/70",
                              )}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${s}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.7, delay: i * 0.08 }}
                            />
                          </div>
                          <span className="w-6 text-xs tabular">{s}</span>
                        </div>
                      </td>
                    ))}
                    <td className="rounded-r-xl bg-foreground/5 pr-3 pl-4 text-right text-[11px] text-muted-foreground">
                      {f.note}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="rounded-l-xl bg-indigo-500/8 py-3 pl-3 font-display font-bold">Overall</td>
                  {cmp.totals.map((t, i) => (
                    <td key={i} className={cn("bg-indigo-500/8 py-3 text-center", i === cmp.recommendationIndex && "font-bold")}>
                      <span className="font-display text-lg font-bold tabular">{t}</span>
                    </td>
                  ))}
                  <td className="rounded-r-xl bg-indigo-500/8 pr-3 text-right text-[11px] text-muted-foreground">Equal-weight mean</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl bg-amber-400/10 p-4 ring-1 ring-amber-500/25">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-amber-700">Modeled assumptions, not market facts:</strong> candidate
              financials are illustrative models for comparison. GRAMIQ never presents modeled numbers as
              verified market data — verify with local suppliers and buyers before committing capital.
            </p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
