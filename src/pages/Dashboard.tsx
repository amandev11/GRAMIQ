import {
  AnimatedNumber, DataBadge, DemoBanner, GlassCard, ScoreRing, SectionHeading, StatTile,
} from "@/components/glass/primitives";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { computeScores } from "@/lib/intelligence/scores";
import { cn } from "@/lib/utils";
import BorderGlow from "@/components/reactbits/BorderGlow";
import { motion } from "framer-motion";
import {
  ChevronDown, HandCoins, PiggyBank, Route, Sparkles, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const DEMO_JOURNEY = [
  { step: 1, label: "Your blueprint", desc: "The AI-built plan", to: "/blueprint" },
  { step: 2, label: "Simulate a decision", desc: "Live what-if engine", to: "/finance" },
  { step: 3, label: "Local market", desc: "Your village, mapped", to: "/market" },
  { step: 4, label: "Funding matches", desc: "Transparent eligibility", to: "/schemes" },
  { step: 5, label: "Business plan PDF", desc: "Bank-ready output", to: "/business-plan" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { profile, financials, isDemo } = useBusiness();
  const navigate = useNavigate();
  const [openScore, setOpenScore] = useState<string | null>(null);
  if (!profile) return null;

  const fin = computeFinancials(financials);
  const scores = computeScores(profile, financials);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <SectionHeading
          title={`${greeting()}, ${profile.name.split(" ")[0]}.`}
          desc={`Your ${profile.businessIdea.split("—")[0].trim().toLowerCase()} plan is ready. Here's where you stand today.`}
          badge={<DemoBanner isDemo={isDemo} />}
          action={
            <Button variant="outline" className="glass gap-2 rounded-full transition-all hover:bg-white/5" onClick={() => navigate("/compare")}>
              <Sparkles className="size-4" /> Compare ideas
            </Button>
          }
        />

        {/* Demo journey — guided 3-minute story (demo mode only) */}
        {isDemo && (
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Route className="size-4 text-indigo-300" />
              <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase">The 3-minute story</p>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {DEMO_JOURNEY.map(({ step, label, desc, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="glass glass-hover group flex min-w-44 shrink-0 items-center gap-3 rounded-2xl p-3 text-left"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                    {step}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold group-hover:text-indigo-300">{label}</span>
                    <span className="block text-[11px] text-muted-foreground">{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>
 )}

        {/* Snapshot + score */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile label="Monthly Revenue" value={fin.monthlyRevenue} format={(n) => formatInr(n)} icon={<TrendingUp className="size-4" />} sub="At planned volume" />
            <StatTile
              label="Monthly Profit"
              value={fin.operatingProfit}
              format={(n) => formatInr(n)}
              tone={fin.operatingProfit > 0 ? "positive" : "negative"}
              icon={<PiggyBank className="size-4" />}
              sub={`${fin.profitMarginPct}% margin · AI ESTIMATE`}
            />
            <StatTile label="Startup Cost" value={fin.totalStartupCost} format={(n) => formatInr(n)} icon={<HandCoins className="size-4" />} sub={`Capital available ${formatInr(profile.capital, true)}`} />
            <StatTile
              label="Break-even"
              value={Number.isFinite(fin.breakEvenMonths) ? `${fin.breakEvenMonths}` : "—"}
              icon={<TrendingUp className="size-4" />}
              sub="Months to recover investment"
            />
          </div>

          <BorderGlow
            glowColor="99 102 241"
            backgroundColor="#1e1b4bcc"
            borderRadius={24}
            glowRadius={44}
            glowIntensity={0.9}
            className="flex flex-col items-center justify-center px-8 py-6"
          >
            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Business Readiness</p>
            <ScoreRing score={scores.overall} size={148} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Composite of 5 factors — tap any to explore
            </p>
          </BorderGlow>
        </div>

        {/* Score breakdown */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold">Business Health Breakdown</h3>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <DataBadge source="AI ESTIMATE" />
              Overall = equal-weight mean of the five factor scores, each derived from your model inputs.
            </p>
          </div>
          <div className="mt-4 space-y-1.5">
            {scores.breakdown.map((b) => (
              <div key={b.key}>
                <button
                  className="group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-foreground/4"
                  onClick={() => setOpenScore(openScore === b.key ? null : b.key)}
                  aria-expanded={openScore === b.key}
                >
                  <span className="w-40 shrink-0 text-sm font-medium sm:w-52">{b.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/8">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${b.score}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-9 text-right font-display text-sm font-bold tabular">
                    <AnimatedNumber value={b.score} />
                  </span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform", openScore === b.key && "rotate-180")}
                  />
                </button>
                {openScore === b.key && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden px-3 pb-3"
                  >
                    <div className="rounded-xl bg-white/55 p-4 text-sm leading-relaxed">
                      <p><span className="font-semibold">Why this score:</span> {b.explanation}</p>
                      <p className="mt-2"><span className="font-semibold text-indigo-300">How to improve:</span> {b.improvement}</p>
                      <DataBadge source="AI ESTIMATE" className="mt-3" />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Simulate a decision", desc: "\"What if milk price drops 10%?\" — see live recalculation.", to: "/finance", cta: "Open Simulator" },
            { title: "Find funding", desc: "Matched schemes with transparent eligibility criteria.", to: "/schemes", cta: "View Matches" },
            { title: "Download your plan", desc: "A professional business-plan PDF for banks and offices.", to: "/business-plan", cta: "Generate PDF" },
          ].map(({ title, desc, to, cta }) => (
            <GlassCard key={title} hover className="flex flex-col p-5">
              <h4 className="font-display font-bold">{title}</h4>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <Button variant="outline" size="sm" className="glass mt-4 self-start rounded-full transition-all hover:bg-white/5" onClick={() => navigate(to)}>
                {cta}
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
