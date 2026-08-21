import { AppShell } from "@/components/app/AppShell";
import { DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { useBusiness } from "@/context/BusinessProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CalendarDays, Check, CircleCheckBig } from "lucide-react";
import { useState } from "react";

const HORIZONS = [
  { key: "7d", label: "Next 7 days", icon: CalendarDays, desc: "Validation sprint" },
  { key: "30d", label: "Next 30 days", icon: CalendarDays, desc: "Foundation" },
  { key: "90d", label: "Next 90 days", icon: CalendarDays, desc: "Pilot launch" },
  { key: "1y", label: "First year", icon: CalendarDays, desc: "Scale & stabilize" },
] as const;

export default function Plan() {
  const { profile, actionItems, toggleActionItem, isDemo } = useBusiness();
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]["key"]>("7d");
  if (!profile) return null;

  const items = actionItems.filter((a) => a.horizon === horizon);
  const done = items.filter((i) => i.done).length;
  const totalDone = actionItems.filter((a) => a.done).length;

  return (
    <AppShell title="Action Plan">
      <div className="space-y-6">
        <SectionHeading
          title="Your Action Plan"
          desc="A sequenced roadmap from idea to a running business. Tick items off as you complete them — progress is saved."
          badge={<DemoBanner isDemo={isDemo} />}
        />

        {/* Overall progress */}
        <GlassCard className="flex items-center gap-4 p-5">
          <CircleCheckBig className="size-8 text-teal-600" />
          <div className="flex-1">
            <div className="flex justify-between text-sm font-medium">
              <span>Total progress</span>
              <span className="tabular">{totalDone}/{actionItems.length} done</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-foreground/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500"
                initial={{ width: 0 }}
                animate={{ width: `${(totalDone / actionItems.length) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Horizon tabs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HORIZONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setHorizon(key)}
              aria-pressed={horizon === key}
              className={cn(
                "glass glass-hover rounded-2xl p-4 text-left transition-all",
                horizon === key && "ring-2 ring-primary/50",
              )}
            >
              <p className="font-display text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>

        {/* Tasks */}
        <GlassCard className="p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">{HORIZONS.find((h) => h.key === horizon)?.label}</h3>
            <span className="text-xs text-muted-foreground tabular">{done}/{items.length} complete</span>
          </div>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-colors",
                    item.done ? "bg-emerald-500/8 text-muted-foreground" : "bg-white/55 hover:bg-white/80",
                  )}
                  onClick={() => toggleActionItem(item.id)}
                  aria-pressed={item.done}
                >
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      item.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-foreground/25",
                    )}
                    style={{ width: "1.375rem", height: "1.375rem" }}
                  >
                    {item.done && <Check className="size-3" />}
                  </span>
                  <span className={cn(item.done && "line-through decoration-muted-foreground/50")}>{item.task}</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
