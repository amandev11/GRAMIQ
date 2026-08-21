import { DataBadge, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { Button } from "@/components/ui/button";
import { DEMO_SCHEMES } from "@/lib/data/demo";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";

const LEVELS = [
  {
    badge: "VERIFIED SOURCE" as const,
    color: "emerald",
    meaning: "Taken from an indexed document in the knowledge base. Shown with source title, excerpt and last-verified date.",
    example: "Scheme criteria once a real government circular is uploaded by an admin.",
  },
  {
    badge: "AI ESTIMATE" as const,
    color: "sky",
    meaning: "Computed or narrated from your inputs using deterministic formulas and stated assumptions. Always inspectable — never a guarantee.",
    example: "Monthly profit, break-even period, risk impact ranges.",
  },
  {
    badge: "DEMO DATA" as const,
    color: "amber",
    meaning: "Fictional prototype data used to demonstrate the architecture. Never represented as a real scheme, market fact or official statistic.",
    example: "All scheme entries in this prototype; mapped market points.",
  },
];

export default function Trust() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/")} aria-label="Back to home">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="space-y-6">
        <SectionHeading
          title="Trust Center"
          desc="GRAMIQ deals with money and government information. Here is exactly how every piece of information earns — or declares — its credibility."
        />

        {/* Provenance levels */}
        <div className="space-y-3">
          {LEVELS.map((l) => (
            <GlassCard key={l.badge} className="flex gap-4 p-5">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  l.color === "emerald"
                    ? "bg-emerald-500/12 text-emerald-700"
                    : l.color === "sky"
                      ? "bg-violet-500/12 text-violet-300"
                      : "bg-amber-500/14 text-amber-700"
                }`}
              >
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <DataBadge source={l.badge} />
                </div>
                <p className="mt-2 text-sm leading-relaxed">{l.meaning}</p>
                <p className="mt-1 text-xs text-muted-foreground">e.g. {l.example}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Commitments */}
        <GlassCard className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold">What GRAMIQ will never do</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {[
              "Guarantee business success or fixed returns.",
              "Claim confirmed eligibility for any government scheme without verification against an authoritative source.",
              "Invent schemes, subsidy percentages or interest rates.",
              "Let an AI model perform financial arithmetic — all numbers come from the open formula engine.",
              "Present synthetic demo data as real market facts.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" />
                {t}
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Knowledge base freshness */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Knowledge base freshness</h3>
            <DataBadge source="DEMO DATA" />
          </div>
          <ul className="mt-3 space-y-2">
            {DEMO_SCHEMES.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-foreground/5 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium">{s.source.title.replace(" (prototype knowledge base)", "")}</span>
                <span className="text-xs text-muted-foreground">verified {s.source.lastVerified}</span>
                <DataBadge source={s.source.status} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            In production, admins upload authoritative documents (scheme circulars, rate cards) via the
            Knowledge Admin screen. Documents are chunked, embedded and cited in every answer with their
            verification date.
          </p>
        </GlassCard>

        {/* Assumptions register */}
        <GlassCard className="p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold">Standing assumptions</h3>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li>~26 selling days per month; ramp-up from 55% volume in month 1 to full by month 6.</li>
            <li>Half of working capital counts toward invested capital for ROI.</li>
            <li>Extra investment buys capacity at ₹10k per 6% of volume (simulator assumption).</li>
            <li>Local competitor price of ₹47–48/L is DEMO DATA used for comparison scoring only.</li>
          </ul>
        </GlassCard>
        </div>
      </div>
    </div>
  );
}
