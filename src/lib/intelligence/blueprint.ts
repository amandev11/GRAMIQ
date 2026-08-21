/**
 * Business Blueprint generation + Comparison Engine.
 * All numbers come from the deterministic finance engine; narrative is
 * template-based explanation with explicit provenance.
 */
import { COMPARISON_CANDIDATES } from "@/lib/data/demo";
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import type { EntrepreneurProfile, FinancialInputs, FinancialResults } from "@/lib/types";

export interface Blueprint {
  businessName: string;
  overview: string;
  whyThisBusiness: string[];
  investmentBreakdown: { label: string; amount: number }[];
  revenueModel: string;
  monthlyExpenses: { label: string; amount: number }[];
  marketOpportunity: string[];
  fundingOptions: string[];
  results: FinancialResults;
}

export function generateBlueprint(profile: EntrepreneurProfile, f: FinancialInputs): Blueprint {
  const r = computeFinancials(f);
  return {
    businessName: "Small Dairy Enterprise",
    overview: `${profile.name} plans to collect milk from small farmers around ${profile.location.village} (${profile.location.district}, ${profile.location.state}) and sell to households and shops. The model runs on ${f.unitsPerMonth.toLocaleString("en-IN")} litres/month at ₹${f.sellingPricePerUnit}/L against a collection cost of ₹${f.rawMaterialPerUnit}/L.`,
    whyThisBusiness: [
      "Daily cash collection — no long credit cycles like crop businesses.",
      `Uses existing family labor (${profile.resources[0] ?? "available"}), keeping fixed costs low.`,
      "Steady everyday demand; milk is bought in good and bad months alike.",
      "Small starting capital fits your available ₹" + profile.capital.toLocaleString("en-IN") + ".",
    ],
    investmentBreakdown: [
      { label: "Equipment (cans, testing kit, cooler share)", amount: f.equipmentCost },
      { label: "Initial working stock", amount: f.inventoryCost },
      { label: "Setup & licenses", amount: f.otherSetupCost },
    ],
    revenueModel: `Buy at ₹${f.rawMaterialPerUnit}/L → sell at ₹${f.sellingPricePerUnit}/L. Margin of ₹${r.contributionPerUnit}/L × ${f.unitsPerMonth.toLocaleString("en-IN")} L/month = ${formatInr(r.grossProfit)} gross profit before fixed costs.`,
    monthlyExpenses: [
      { label: "Labor", amount: f.labor },
      { label: "Utilities (electricity, chiller share)", amount: f.utilities },
      { label: "Transport & misc", amount: f.otherMonthlyCost },
      { label: "Rent", amount: f.rent },
      { label: "Loan EMI", amount: r.emi },
    ],
    marketOpportunity: [
      `DEMO DATA: ~180 households within 4 km of ${profile.location.village} buy milk daily.`,
      "DEMO DATA: 12 tea stalls on the highway belt have no formal milk contract.",
      "AI ESTIMATE: capturing 35–40% of nearby household demand covers your planned volume.",
    ],
    fundingOptions: [
      "Self-funding from savings (current plan)",
      "DEMO: dairy development subsidy — see Funding & Schemes page",
      "DEMO: collateral-free micro credit line for working capital",
    ],
    results: r,
  };
}

/** Transparent comparison scoring — every factor shown to the user. */
export interface ComparisonFactor {
  label: string;
  scores: number[]; // 0-100 per candidate
  betterWhenLower?: boolean;
  note: string;
}

export function compareBusinesses(): {
  candidates: typeof COMPARISON_CANDIDATES;
  factors: ComparisonFactor[];
  totals: number[];
  recommendationIndex: number;
  recommendation: string;
} {
  const cands = COMPARISON_CANDIDATES;
  const norm = (v: number, min: number, max: number, betterWhenLower = false) => {
    const t = max === min ? 1 : (v - min) / (max - min);
    const s = Math.round(t * 100);
    return betterWhenLower ? 100 - s : s;
  };
  const costs = cands.map((c) => c.startupCost);
  const profits = cands.map((c) => c.monthlyProfit);
  const bes = cands.map((c) => c.breakEvenMonths);
  const risks = cands.map((c) => c.risk);
  const demands = cands.map((c) => c.demand);
  const comps = cands.map((c) => c.competition);
  const ces = cands.map((c) => c.capitalEfficiency);
  const min = (a: number[]) => Math.min(...a);
  const max = (a: number[]) => Math.max(...a);

  const factors: ComparisonFactor[] = [
    { label: "Startup Cost", scores: cands.map((c) => norm(c.startupCost, min(costs), max(costs), true)), betterWhenLower: true, note: "Modeled: lower is better for a ₹1L budget" },
    { label: "Profit Potential", scores: cands.map((c) => norm(c.monthlyProfit, min(profits), max(profits))), note: "Modeled monthly profit at planned scale" },
    { label: "Speed to Break-Even", scores: cands.map((c) => norm(c.breakEvenMonths, min(bes), max(bes), true)), betterWhenLower: true, note: "Modeled months to recover startup cost" },
    { label: "Low Risk", scores: cands.map((c) => norm(c.risk, min(risks), max(risks), true)), betterWhenLower: true, note: "Modeled risk index (feed/disease/spoilage exposure)" },
    { label: "Demand Strength", scores: cands.map((c) => norm(c.demand, min(demands), max(demands))), note: "Modeled everyday-demand signal" },
    { label: "Low Competition", scores: cands.map((c) => norm(c.competition, min(comps), max(comps), true)), betterWhenLower: true, note: "Modeled crowding of local market" },
    { label: "Capital Efficiency", scores: cands.map((c) => norm(c.capitalEfficiency, min(ces), max(ces))), note: "Modeled annual profit per ₹1L invested" },
  ];

  const totals = cands.map((_, i) =>
    Math.round(factors.reduce((s, f) => s + f.scores[i], 0) / factors.length),
  );
  const recommendationIndex = totals.indexOf(Math.max(...totals));
  const best = cands[recommendationIndex];
  return {
    candidates: cands,
    factors,
    totals,
    recommendationIndex,
    recommendation: `${best.name} scores highest (${Math.max(...totals)}/100) on your profile: ${best.why} All scores are modeled assumptions for comparison — not market guarantees.`,
  };
}
