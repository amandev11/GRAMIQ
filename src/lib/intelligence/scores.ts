/**
 * GRAMIQ Intelligence Layer — deterministic scoring.
 * Structured outputs with provenance; the AI layer explains, never invents numbers.
 */
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import type { EntrepreneurProfile, FinancialInputs, FinancialResults, RiskItem, ScoreBreakdown } from "@/lib/types";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

export function computeScores(profile: EntrepreneurProfile, f: FinancialInputs): {
  overall: number;
  breakdown: ScoreBreakdown[];
} {
  const r = computeFinancials(f);
  const margin = r.profitMarginPct;
  const financialViability = clamp(35 + margin * 2.2 + (r.operatingProfit > 0 ? 12 : -15));
  const marketOpportunity = clamp(
    62 + (profile.existingBusiness !== "none" ? 6 : 0) + (f.unitsPerMonth > 3000 ? 14 : 8),
  );
  const riskScore = clamp(92 - Math.abs(margin) * 1.4 - (r.breakEvenMonths > 10 ? 18 : r.breakEvenMonths > 7 ? 9 : 0));
  const fundingReadiness = clamp(
    50 +
      (profile.capital >= r.totalStartupCost ? 30 : profile.capital >= r.totalStartupCost * 0.6 ? 16 : 4) +
      (profile.experience === "experienced" ? 12 : profile.experience === "some" ? 6 : 0),
  );
  const operationalReadiness = clamp(
    45 + profile.resources.length * 8 + (profile.experience === "beginner" ? 5 : 14) + (f.labor === 0 ? 10 : 0),
  );

  return {
    overall: clamp((financialViability + marketOpportunity + riskScore + fundingReadiness + operationalReadiness) / 5),
    breakdown: [
      {
        key: "financial",
        label: "Financial Viability",
        score: financialViability,
        explanation: `Projected operating profit of ${formatInr(r.operatingProfit)}/month at a ${margin.toFixed(1)}% margin drives this score.`,
        improvement: "Raise contribution per unit by ₹2–3/L via direct household sales instead of shop-only supply.",
      },
      {
        key: "market",
        label: "Market Opportunity",
        score: marketOpportunity,
        explanation: `Planned volume of ${f.unitsPerMonth.toLocaleString("en-IN")} L/month against local demand signals in ${profile.location.village}, ${profile.location.district}.`,
        improvement: "Sign 3–4 tea stalls on the highway belt for fixed daily offtake.",
      },
      {
        key: "risk",
        label: "Risk Resilience",
        score: riskScore,
        explanation: `Break-even in ~${Number.isFinite(r.breakEvenMonths) ? r.breakEvenMonths : "—"} months with low fixed costs keeps downside limited.`,
        improvement: "Keep one month of operating costs as cash buffer before scaling volume.",
      },
      {
        key: "funding",
        label: "Funding Readiness",
        score: fundingReadiness,
        explanation: `Available capital ${formatInr(profile.capital)} vs startup need ${formatInr(r.totalStartupCost)}.`,
        improvement: "Prepare the GRAMIQ business plan PDF — it is accepted as a project report draft.",
      },
      {
        key: "operational",
        label: "Operational Readiness",
        score: operationalReadiness,
        explanation: `${profile.resources.length} resource advantage(s) recorded, including family labor support.`,
        improvement: "Fix a cold-chain arrangement (shared cooler) before summer months.",
      },
    ],
  };
}

/** Deterministic risk engine driven off the financial model. */
export function computeRisks(profile: EntrepreneurProfile, f: FinancialInputs): RiskItem[] {
  const r: FinancialResults = computeFinancials(f);
  const risks: RiskItem[] = [];
  const materialSensitivity = parseFloat(((r.monthlyVariableCost / Math.max(r.monthlyRevenue, 1)) * 100).toFixed(0));

  risks.push({
    id: "cost",
    category: "Cost",
    title: "Raw Material Price Volatility",
    level: materialSensitivity > 70 ? "HIGH" : "MEDIUM",
    why: `Raw material is about ${materialSensitivity}% of your revenue. Small price changes move profit sharply.`,
    impact: "AI ESTIMATE: an 8% input price rise could cut monthly profit by roughly 25–40%.",
    mitigation: "Agree fixed weekly rates with 2+ suppliers; revisit rates monthly using your copilot.",
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "demand",
    category: "Demand",
    title: "Slower Customer Ramp-Up",
    level: r.profitMarginPct < 8 ? "HIGH" : "MEDIUM",
    why: "Your plan assumes full sales from month 1; new routes typically take 3–6 months to fill.",
    impact: "AI ESTIMATE: at 70% volume your monthly profit falls to about 40–55% of plan.",
    mitigation: "Start with a smaller pilot route and scale only after collections are stable for 3 weeks.",
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "cashflow",
    category: "Cash Flow",
    title: "Working Capital Gap",
    level: f.workingCapital < r.monthlyFixedCost * 2 ? "HIGH" : "LOW",
    why: `You hold ${formatInr(f.workingCapital)} working capital vs fixed costs of ${formatInr(r.monthlyFixedCost)}/month.`,
    impact: "Below 2 months of cover, one slow collection week can force borrowing at high cost.",
    mitigation: "Reserve at least 2 months of fixed costs; collect household payments weekly, not monthly.",
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "competition",
    category: "Competition",
    title: "Established Local Seller",
    level: "MEDIUM",
    why: "DEMO DATA shows an existing private milk seller on the main route selling at ₹47–48/L.",
    impact: "Price undercutting on overlapping streets could slow customer acquisition.",
    mitigation: "Compete on freshness and home delivery timing rather than matching price cuts.",
    source: "DEMO DATA",
  });

  risks.push({
    id: "weather",
    category: "Weather/Environment",
    title: "Summer Spoilage & Cold Chain",
    level: "HIGH",
    why: "Rajasthan summer temperatures raise spoilage risk without reliable cooling.",
    impact: "Spoilage above 3% can erase roughly half your monthly profit (AI ESTIMATE).",
    mitigation: "Arrange shared chiller access and plan morning-only delivery in May–July.",
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "funding",
    category: "Funding",
    title: "Single-Source Capital",
    level: profile.capital >= f.equipmentCost + f.inventoryCost ? "LOW" : "MEDIUM",
    why: `Startup needs ${formatInr(f.equipmentCost + f.inventoryCost)} against ${formatInr(profile.capital)} available.`,
    impact: "Any equipment failure early on would come straight out of working capital.",
    mitigation: "Check scheme matches on the Funding page before committing all savings.",
    source: "AI ESTIMATE",
  });

  return risks;
}
