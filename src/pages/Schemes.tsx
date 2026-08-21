import { AppShell } from "@/components/app/AppShell";
import { DataBadge, DemoBanner, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from "@/context/BusinessProvider";
import { computeFinancials } from "@/lib/finance/engine";
import { matchSchemes } from "@/lib/intelligence/schemes";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2, ChevronDown, CircleAlert, FileText, Info, Ribbon,
} from "lucide-react";
import { useState } from "react";

export default function Schemes() {
  const { profile, financials, isDemo } = useBusiness();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!profile) return null;
  const fin = computeFinancials(financials);
  const matches = matchSchemes(profile, fin.totalStartupCost);

  return (
    <AppShell title="Funding & Schemes">
      <div className="space-y-6">
        <SectionHeading
          title="Funding & Schemes"
          desc="A deterministic eligibility filter runs first; the AI only explains the result. Every entry shows its source and verification status."
          badge={<><DemoBanner isDemo={isDemo} /><DataBadge source="DEMO DATA" /></>}
        />

        <GlassCard className="flex gap-3 bg-amber-400/10 p-4 ring-1 ring-amber-500/25">
          <Info className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-amber-700">Prototype notice:</strong> the scheme database below is
            fictional DEMO data used to demonstrate the matching architecture (document → chunk → embed →
            retrieve → cited answer). No scheme here is a real government scheme. Never treat a match as
            confirmed eligibility — always verify at the district office.
          </p>
        </GlassCard>

        <div className="grid gap-4 lg:grid-cols-2">
          {matches.map((m, idx) => (
            <motion.div
              key={m.scheme.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <GlassCard hover className="flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Ribbon className="size-4" />
                      </span>
                      <h3 className="font-display text-base leading-snug font-bold">{m.scheme.name}</h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{m.scheme.type}</Badge>
                      {m.scheme.criteria.sectors?.map((s) => <Badge key={s} variant="outline" className="text-[10px] capitalize">{s.replace("-", " ")}</Badge>)}
                    </div>
                  </div>
                  {/* Match ring */}
                  <div className="relative size-16 shrink-0">
                    <svg viewBox="0 0 64 64" className="-rotate-90">
                      <circle cx="32" cy="32" r="27" fill="none" stroke="oklch(0.6 0.03 220 / 14%)" strokeWidth="7" />
                      <circle
                        cx="32" cy="32" r="27" fill="none"
                        stroke={m.matchPct >= 75 ? "#0d9488" : m.matchPct >= 50 ? "#d97706" : "#dc2626"}
                        strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * 27}
                        strokeDashoffset={2 * Math.PI * 27 * (1 - m.matchPct / 100)}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular">{m.matchPct}%</span>
                  </div>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{m.scheme.description}</p>

                {/* Match strength verdict — deterministic, then explained */}
                <div
                  className={cn(
                    "mt-3 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
                    m.matchPct >= 75
                      ? "bg-emerald-500/8 text-emerald-800 ring-1 ring-emerald-600/20"
                      : m.matchPct >= 50
                        ? "bg-amber-500/10 text-amber-800 ring-1 ring-amber-600/25"
                        : "bg-rose-500/8 text-rose-800 ring-1 ring-rose-600/20",
                  )}
                >
                  <strong className="font-bold">
                    {m.matchPct >= 75 ? "Strong match:" : m.matchPct >= 50 ? "Partial match:" : "Weak match:"}
                  </strong>{" "}
                                    {m.missingRequirements.length === 0
                    ? "Meets all " + m.criteria.length + " criteria for your profile."
                    : "Meets " + m.criteria.filter((c) => c.met).length + " of " + m.criteria.length + " criteria. Gap: " + m.missingRequirements[0].toLowerCase() + "."}
                </div>

                {/* Criteria */}
                <div className="mt-4 space-y-1.5">
                  {m.criteria.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-sm">
                      {c.met ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <CircleAlert className="size-4 shrink-0 text-amber-600" />
                      )}
                      <span className={cn("font-medium", !c.met && "text-muted-foreground")}>{c.label}</span>
                      <span className="ml-auto truncate pl-2 text-right text-xs text-muted-foreground">{c.detail}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-foreground/10"
                  onClick={() => setExpanded(expanded === m.scheme.id ? null : m.scheme.id)}
                  aria-expanded={expanded === m.scheme.id}
                >
                  Why this match & how to apply
                  <ChevronDown className={cn("size-3.5 transition-transform", expanded === m.scheme.id && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {expanded === m.scheme.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 rounded-xl bg-foreground/6 p-4 text-sm">
                        {m.missingRequirements.length > 0 && (
                          <p><span className="font-semibold text-amber-700">Missing:</span> {m.missingRequirements.join("; ")}</p>
                        )}
                        <div>
                          <p className="font-semibold">Required documents</p>
                          <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                            {m.scheme.documents.map((d) => <li key={d}>{d}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold">Application steps</p>
                          <ol className="mt-1 list-inside list-decimal space-y-0.5 text-muted-foreground">
                            {m.scheme.steps.map((s) => <li key={s}>{s}</li>)}
                          </ol>
                        </div>
                        <div className="rounded-lg border border-border/70 p-3 text-xs">
                          <p className="flex items-center gap-1.5 font-semibold"><FileText className="size-3.5" /> Source · <DataBadge source={m.scheme.source.status} /></p>
                          <p className="mt-1 text-muted-foreground italic">"{m.scheme.source.excerpt}"</p>
                          <p className="mt-1 text-muted-foreground">
                            — {m.scheme.source.title} · last verified {m.scheme.source.lastVerified}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
