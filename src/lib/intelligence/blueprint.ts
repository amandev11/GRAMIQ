/**
 * Business Blueprint generation + Comparison Engine.
 * All numbers come from the deterministic finance engine; narrative is
 * template-based explanation with explicit provenance.
 */
import { computeFinancials, formatInr } from "@/lib/finance/engine";
import { detectBusinessModel, type BusinessModelKey } from "@/lib/intelligence/business-model";
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

/* ── Comparison Engine ────────────────────────────────────────────────────
 * Candidates are NOT a fixed catalog. They are three strategies for the
 * USER'S OWN business (lean / as-planned / scale-up), each computed by the
 * deterministic finance engine from the user's actual inputs. Different
 * ideas therefore always produce different comparisons.
 */

export interface ComparisonCandidate {
  key: string;
  name: string;
  startupCost: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakEvenMonths: number; // capped at 36 (= "won't break even within 3 years")
  risk: number; // 1–10 modeled index
  capitalEfficiency: number; // annual profit per ₹1L invested (modeled)
  skillRequirement: "Low" | "Medium" | "Moderate-High";
  why: string;
  /** Total cash the strategy needs up front (startup + working capital). */
  cashNeeded: number;
}

/** Base modeled risk exposure per business family (price/demand/spoilage). */
const BASE_RISK: Record<BusinessModelKey, number> = {
  dairy: 4,
  crops: 5,
  livestock: 7,
  "food-service": 5,
  retail: 4,
  services: 3,
  digital: 5,
  generic: 5,
};

function skillFor(key: BusinessModelKey): ComparisonCandidate["skillRequirement"] {
  if (key === "food-service") return "Moderate-High";
  if (key === "digital" || key === "livestock") return "Medium";
  return "Low";
}

const bumpSkill = (s: ComparisonCandidate["skillRequirement"]): ComparisonCandidate["skillRequirement"] =>
  s === "Low" ? "Medium" : "Moderate-High";

/** Transparent scoring — every factor and its normalization shown to the user. */
export interface ComparisonFactor {
  label: string;
  scores: number[]; // 0-100 per candidate
  betterWhenLower?: boolean;
  note: string;
}

export function compareBusinesses(
  idea: string,
  f: FinancialInputs,
  capital?: number,
): {
  modelLabel: string;
  candidates: ComparisonCandidate[];
  factors: ComparisonFactor[];
  totals: number[];
  recommendationIndex: number;
  recommendation: string;
} {
  const model = detectBusinessModel(idea);

  // Three strategies over the USER'S OWN inputs — nothing hardcoded.
  const leanInputs: FinancialInputs = {
    ...f,
    unitsPerMonth: Math.max(1, Math.round(f.unitsPerMonth * 0.6)),
    equipmentCost: Math.round(f.equipmentCost * 0.7),
    inventoryCost: Math.round(f.inventoryCost * 0.6),
    otherSetupCost: Math.round(f.otherSetupCost * 0.7),
    labor: Math.round(f.labor * 0.8),
    utilities: Math.round(f.utilities * 0.8),
    otherMonthlyCost: Math.round(f.otherMonthlyCost * 0.8),
    workingCapital: Math.round(f.workingCapital * 0.6),
    loanAmount: 0,
  };
  const scaleStartup =
    Math.round(f.equipmentCost * 1.35) + Math.round(f.inventoryCost * 1.5) + Math.round(f.otherSetupCost * 1.2);
  const scaleInputs: FinancialInputs = {
    ...f,
    unitsPerMonth: Math.round(f.unitsPerMonth * 1.5),
    equipmentCost: Math.round(f.equipmentCost * 1.35),
    inventoryCost: Math.round(f.inventoryCost * 1.5),
    otherSetupCost: Math.round(f.otherSetupCost * 1.2),
    labor: Math.round(f.labor * 1.4),
    utilities: Math.round(f.utilities * 1.3),
    otherMonthlyCost: Math.round(f.otherMonthlyCost * 1.25),
    workingCapital: Math.round(f.workingCapital * 1.4),
    loanAmount: Math.round(scaleStartup * 0.4),
    interestRatePct: 10.5,
    loanTenureMonths: 36,
  };

  const capBE = (m: number) => (Number.isFinite(m) ? Math.min(m, 36) : 36);
  const build = (
    key: string,
    name: string,
    inputs: FinancialInputs,
    baseRisk: number,
    skill: ComparisonCandidate["skillRequirement"],
    why: string,
  ): ComparisonCandidate & { cashNeeded: number } => {
    const r = computeFinancials(inputs);
    const invested = r.totalStartupCost + inputs.workingCapital * 0.5;
    return {
      key,
      name,
      startupCost: r.totalStartupCost,
      monthlyRevenue: r.monthlyRevenue,
      monthlyProfit: r.operatingProfit,
      breakEvenMonths: capBE(r.breakEvenMonths),
      risk: Math.round(Math.min(10, Math.max(1, baseRisk)) * 10) / 10,
      capitalEfficiency: invested > 0 ? Math.round(((r.operatingProfit * 12) / invested) * 100000) : 0,
      skillRequirement: skill,
      why,
      cashNeeded: r.totalStartupCost + inputs.workingCapital,
    };
  };

  const planSkill = skillFor(model.key);
  const baseRisk = BASE_RISK[model.key];
  const candidates: ComparisonCandidate[] = [
    build(
      "lean",
      `${model.label} — Lean start`,
      leanInputs,
      baseRisk - 1.5,
      "Low",
      "Smaller equipment set, family labor and lower stock. Slower volume, but far less money at risk and a faster path to break-even if demand ramps slowly.",
    ),
    build(
      "plan",
      `${model.label} — Your plan`,
      f,
      baseRisk,
      planSkill,
      "The strategy exactly as you entered it — balanced use of your stated budget at your planned operating scale.",
    ),
    build(
      "scale",
      `${model.label} — Scale up`,
      scaleInputs,
      baseRisk + 1.5,
      bumpSkill(planSkill),
      "Higher volume with a small working-capital loan. Bigger profit potential, but adds EMI pressure and more exposure if sales ramp slower than planned.",
    ),
  ];

  const norm = (v: number, min: number, max: number, betterWhenLower = false) => {
    if (!Number.isFinite(v)) return 0;
    const t = max === min ? 1 : (v - min) / (max - min);
    const s = Math.round(t * 100);
    return betterWhenLower ? 100 - s : s;
  };
  const col = (get: (c: ComparisonCandidate) => number) => candidates.map(get);
  const min = (a: number[]) => Math.min(...a);
  const max = (a: number[]) => Math.max(...a);

  // Budget Fit: share of the user's ACTUAL stated capital each strategy
  // requires. This is what lets a tight budget legitimately flip the winner
  // toward the lean strategy.
  const budgetScores = (() => {
    if (!capital || capital <= 0) return candidates.map(() => 50); // unknown — neutral
    // Ratio of the user's stated capital to each strategy's total cash need,
    // capped at 100 once comfortably affordable.
    return candidates.map((c) => Math.round(Math.min(1, capital / Math.max(c.cashNeeded, 1)) * 100));
  })();

  const factors: ComparisonFactor[] = [
    { label: "Budget Fit", scores: budgetScores, betterWhenLower: false, note: capital && capital > 0 ? `Cash each strategy needs vs your stated ₹${capital.toLocaleString("en-IN")}` : "Computed cash requirement of each strategy" },
    { label: "Startup Cost", scores: candidates.map((c) => norm(c.startupCost, min(col((x) => x.startupCost)), max(col((x) => x.startupCost)), true)), betterWhenLower: true, note: "Computed from your inputs — lower protects a small budget" },
    { label: "Profit Potential", scores: candidates.map((c) => norm(c.monthlyProfit, min(col((x) => x.monthlyProfit)), max(col((x) => x.monthlyProfit)))), note: "Computed monthly operating profit at this scale" },
    { label: "Speed to Break-Even", scores: candidates.map((c) => norm(c.breakEvenMonths, min(col((x) => x.breakEvenMonths)), max(col((x) => x.breakEvenMonths)), true)), betterWhenLower: true, note: "Computed months to recover startup capital (capped at 36)" },
    { label: "Low Risk", scores: candidates.map((c) => norm(c.risk, min(col((x) => x.risk)), max(col((x) => x.risk)), true)), betterWhenLower: true, note: "Modeled exposure to price, demand and loan stress for this business type" },
    { label: "Capital Efficiency", scores: candidates.map((c) => norm(c.capitalEfficiency, min(col((x) => x.capitalEfficiency)), max(col((x) => x.capitalEfficiency)))), note: "Computed annual profit per ₹1 lakh invested" },
  ];

  const totals = candidates.map((_, i) =>
    Math.round(factors.reduce((s, fct) => s + fct.scores[i], 0) / factors.length),
  );
  const recommendationIndex = totals.indexOf(Math.max(...totals));
  const best = candidates[recommendationIndex];
  return {
    modelLabel: model.label,
    candidates,
    factors,
    totals,
    recommendationIndex,
    recommendation: `${best.name} scores highest (${Math.max(...totals)}/100). ${best.why} Every figure is computed from YOUR inputs through GRAMIQ's open formula engine — modeled estimates for comparison, not market guarantees.`,
  };
}
