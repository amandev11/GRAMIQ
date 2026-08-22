/**
 * GRAMIQ Intelligence Layer — deterministic scoring.
 * Structured outputs with provenance; the AI layer explains, never invents numbers.
 */
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { L, pick, type Lang } from "@/lib/i18n/strings";
import type { EntrepreneurProfile, FinancialInputs, FinancialResults, RiskItem, ScoreBreakdown } from "@/lib/types";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

export function computeScores(profile: EntrepreneurProfile, f: FinancialInputs): {
  overall: number;
  breakdown: ScoreBreakdown[];
} {
  const r = computeFinancials(f);
  const lang: Lang = profile.language ?? "en";
  const unit = detectBusinessModel(profile.businessIdea).unitShort;
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
  const s = L.scores;

  return {
    overall: clamp((financialViability + marketOpportunity + riskScore + fundingReadiness + operationalReadiness) / 5),
    breakdown: [
      {
        key: "financial",
        label: pick(s.financial.label, lang),
        score: financialViability,
        explanation: pick(s.financial.explanation({ profit: formatInr(r.operatingProfit), margin: margin.toFixed(1) }), lang),
        improvement: pick(s.financial.improvement, lang),
      },
      {
        key: "market",
        label: pick(s.market.label, lang),
        score: marketOpportunity,
        explanation: pick(s.market.explanation({ units: f.unitsPerMonth.toLocaleString("en-IN"), unit, village: profile.location.village, district: profile.location.district }), lang),
        improvement: pick(s.market.improvement, lang),
      },
      {
        key: "risk",
        label: pick(s.risk.label, lang),
        score: riskScore,
        explanation: pick(s.risk.explanation({ be: Number.isFinite(r.breakEvenMonths) ? String(r.breakEvenMonths) : "—" }), lang),
        improvement: pick(s.risk.improvement, lang),
      },
      {
        key: "funding",
        label: pick(s.funding.label, lang),
        score: fundingReadiness,
        explanation: pick(s.funding.explanation({ capital: formatInr(profile.capital), startup: formatInr(r.totalStartupCost) }), lang),
        improvement: pick(s.funding.improvement, lang),
      },
      {
        key: "operational",
        label: pick(s.operational.label, lang),
        score: operationalReadiness,
        explanation: pick(s.operational.explanation({ count: profile.resources.length }), lang),
        improvement: pick(s.operational.improvement, lang),
      },
    ],
  };
}

/** Deterministic risk engine driven off the financial model. */
export function computeRisks(profile: EntrepreneurProfile, f: FinancialInputs): RiskItem[] {
  const r: FinancialResults = computeFinancials(f);
  const lang: Lang = profile.language ?? "en";
  const risks: RiskItem[] = [];
  const materialSensitivity = parseFloat(((r.monthlyVariableCost / Math.max(r.monthlyRevenue, 1)) * 100).toFixed(0));
  const rk = L.risks;

  risks.push({
    id: "cost",
    category: "Cost",
    title: pick(rk.cost.title, lang),
    level: materialSensitivity > 70 ? "HIGH" : "MEDIUM",
    why: pick(rk.cost.why({ pct: materialSensitivity }), lang),
    impact: pick(rk.cost.impact, lang),
    mitigation: pick(rk.cost.mitigation, lang),
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "demand",
    category: "Demand",
    title: pick(rk.demand.title, lang),
    level: r.profitMarginPct < 8 ? "HIGH" : "MEDIUM",
    why: pick(rk.demand.why, lang),
    impact: pick(rk.demand.impact, lang),
    mitigation: pick(rk.demand.mitigation, lang),
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "cashflow",
    category: "Cash Flow",
    title: pick(rk.cashflow.title, lang),
    level: f.workingCapital < r.monthlyFixedCost * 2 ? "HIGH" : "LOW",
    why: pick(rk.cashflow.why({ wc: formatInr(f.workingCapital), fc: formatInr(r.monthlyFixedCost) }), lang),
    impact: pick(rk.cashflow.impact, lang),
    mitigation: pick(rk.cashflow.mitigation, lang),
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "competition",
    category: "Competition",
    title: pick(rk.competition.title, lang),
    level: "MEDIUM",
    why: pick(rk.competition.why, lang),
    impact: pick(rk.competition.impact, lang),
    mitigation: pick(rk.competition.mitigation, lang),
    source: "DEMO DATA",
  });

  risks.push({
    id: "weather",
    category: "Weather/Environment",
    title: pick(rk.weather.title, lang),
    level: "HIGH",
    why: pick(rk.weather.why, lang),
    impact: pick(rk.weather.impact, lang),
    mitigation: pick(rk.weather.mitigation, lang),
    source: "AI ESTIMATE",
  });

  risks.push({
    id: "funding",
    category: "Funding",
    title: pick(rk.funding.title, lang),
    level: profile.capital >= f.equipmentCost + f.inventoryCost ? "LOW" : "MEDIUM",
    why: pick(rk.funding.why({ need: formatInr(f.equipmentCost + f.inventoryCost), avail: formatInr(profile.capital) }), lang),
    impact: pick(rk.funding.impact, lang),
    mitigation: pick(rk.funding.mitigation, lang),
    source: "AI ESTIMATE",
  });

  return risks;
}
