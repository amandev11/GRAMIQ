/**
 * Business Blueprint generation + Comparison Engine.
 * All numbers come from the deterministic finance engine; narrative is
 * template-based explanation with explicit provenance.
 */
import { COMPARISON_CANDIDATES } from "@/lib/data/demo";
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { L, pick, type Lang } from "@/lib/i18n/strings";
import type { EntrepreneurProfile, FinancialInputs } from "@/lib/types";

export interface Blueprint {
  businessName: string;
  overview: string;
  whyThisBusiness: string[];
  investmentBreakdown: { label: string; amount: number }[];
  revenueModel: string;
  monthlyExpenses: { label: string; amount: number }[];
  marketOpportunity: string[];
  fundingOptions: string[];
  results: ReturnType<typeof computeFinancials>;
}

export function generateBlueprint(profile: EntrepreneurProfile, f: FinancialInputs): Blueprint {
  const r = computeFinancials(f);
  const lang: Lang = profile.language ?? "en";
  const t = L.blueprint;
  // The business NAME and narrative derive from the DETECTED model —
  // never from a hardcoded demo idea.
  const model = detectBusinessModel(profile.businessIdea);
  const segments = pick(model.segments, lang) as [string, string, string];
  return {
    businessName: model.label,
    overview: pick(t.overview({
      name: profile.name,
      idea: profile.businessIdea,
      village: profile.location.village,
      district: profile.location.district,
      state: profile.location.state,
      units: f.unitsPerMonth.toLocaleString("en-IN"),
      price: f.sellingPricePerUnit,
      cost: f.rawMaterialPerUnit,
      unitShort: model.unitShort,
      unitLong: model.unitLong,
    }), lang),
    whyThisBusiness: [
      pick(model.whyPoint, lang),
      ...pick(t.whyGeneric({
        capital: profile.capital.toLocaleString("en-IN"),
        resource: profile.resources[0] ?? "available",
      }), lang),
    ],
    investmentBreakdown: pick(t.investmentBreakdown, lang).map((it, i) => ({
      ...it,
      amount: [f.equipmentCost, f.inventoryCost, f.otherSetupCost][i] ?? 0,
    })),
    // Revenue model mixes ₹ figures with translatable framing — keep numbers, localize verbs
    revenueModel: (() => {
      const buy = `₹${f.rawMaterialPerUnit}/${model.unitShort}`;
      const sell = `₹${f.sellingPricePerUnit}/${model.unitShort}`;
      const margin = `₹${r.contributionPerUnit}/${model.unitShort}`;
      const units = f.unitsPerMonth.toLocaleString("en-IN");
      const gross = formatInr(r.grossProfit);
      const u = model.unitShort;
      const text: Record<Lang, string> = {
        en: `Deliver at ${sell} against an input cost of ${buy}. Margin of ${margin} × ${units} ${u}/month = ${gross} gross profit before fixed costs.`,
        hi: `${sell} पर बिक्री, इनपुट लागत ${buy}। मार्जिन ${margin} × ${units} ${u}/माह = निश्चित लागत से पहले ${gross} सकल लाभ।`,
        hinglish: `${sell} par sale, input cost ${buy}. Margin ${margin} × ${units} ${u}/month = fixed costs se pehle ${gross} gross profit.`,
      };
      return text[lang];
    })(),
    monthlyExpenses: pick(t.monthlyExpenses, lang).map((it, i) => ({
      ...it,
      amount: [f.labor, f.utilities, f.otherMonthlyCost, f.rent, r.emi][i] ?? 0,
    })),
    marketOpportunity: pick(t.marketOpportunity({ village: profile.location.village, segA: segments[0], segB: segments[1] }), lang),
    fundingOptions: pick(t.fundingOptions, lang),
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
