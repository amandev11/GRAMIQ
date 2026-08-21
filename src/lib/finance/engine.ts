/**
 * GRAMIQ Financial Engine — 100% deterministic.
 * Every number in the product is computed here with explicit formulas.
 * The AI layer EXPLAINS these results; it never performs arithmetic.
 */
import type { FinancialInputs, FinancialResults } from "@/lib/types";

export const roundTo = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/** Standard reducing-balance EMI: P·r·(1+r)^n / ((1+r)^n − 1) */
export function calcEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const pow = (1 + r) ** tenureMonths;
  return (principal * r * pow) / (pow - 1);
}

export function computeFinancials(i: FinancialInputs): FinancialResults {
  const totalStartupCost = i.equipmentCost + i.inventoryCost + i.otherSetupCost;
  const monthlyFixedCost = i.rent + i.labor + i.utilities + i.otherMonthlyCost + calcEmi(i.loanAmount, i.interestRatePct, i.loanTenureMonths);
  const monthlyVariableCost = i.rawMaterialPerUnit * i.unitsPerMonth;
  const monthlyRevenue = i.sellingPricePerUnit * i.unitsPerMonth;
  const grossProfit = monthlyRevenue - monthlyVariableCost;
  const operatingProfit = grossProfit - monthlyFixedCost;
  const profitMarginPct = monthlyRevenue > 0 ? (operatingProfit / monthlyRevenue) * 100 : 0;
  const contributionPerUnit = i.sellingPricePerUnit - i.rawMaterialPerUnit;
  const breakEvenUnits = contributionPerUnit > 0 ? monthlyFixedCost / contributionPerUnit : Infinity;
  const breakEvenRevenue = contributionPerUnit > 0 ? breakEvenUnits * i.sellingPricePerUnit : Infinity;
  const breakEvenMonths =
    operatingProfit > 0 ? (totalStartupCost + i.workingCapital * 0.5) / operatingProfit : Infinity;
  const annualInvestment = totalStartupCost + i.workingCapital * 0.5;
  const roiPct = annualInvestment > 0 ? ((operatingProfit * 12) / annualInvestment) * 100 : 0;
  const cashRunwayMonths =
    operatingProfit < 0 ? i.workingCapital / Math.abs(operatingProfit) : Infinity;
  return {
    totalStartupCost: roundTo(totalStartupCost),
    monthlyFixedCost: roundTo(monthlyFixedCost),
    monthlyVariableCost: roundTo(monthlyVariableCost),
    emi: roundTo(calcEmi(i.loanAmount, i.interestRatePct, i.loanTenureMonths)),
    monthlyRevenue: roundTo(monthlyRevenue),
    grossProfit: roundTo(grossProfit),
    operatingProfit: roundTo(operatingProfit),
    profitMarginPct: roundTo(profitMarginPct, 1),
    breakEvenUnits: Number.isFinite(breakEvenUnits) ? roundTo(breakEvenUnits) : Infinity,
    breakEvenRevenue: Number.isFinite(breakEvenRevenue) ? roundTo(breakEvenRevenue) : Infinity,
    breakEvenMonths: Number.isFinite(breakEvenMonths) ? roundTo(breakEvenMonths, 1) : Infinity,
    roiPct: roundTo(roiPct),
    cashRunwayMonths: Number.isFinite(cashRunwayMonths) ? roundTo(cashRunwayMonths, 1) : Infinity,
    annualRevenue: roundTo(monthlyRevenue * 12),
    annualProfit: roundTo(operatingProfit * 12),
    contributionPerUnit: roundTo(contributionPerUnit, 2),
  };
}

/** 12-month projection with a ramp-up factor (new businesses rarely sell 100% from month 1). */
export function project12Months(i: FinancialInputs, rampUp = [0.55, 0.65, 0.75, 0.85, 0.9, 1, 1, 1, 1, 1, 1, 1]) {
  const base = computeFinancials(i);
  const startupOutflow = i.equipmentCost + i.inventoryCost + i.otherSetupCost + i.workingCapital;
  let cash = -startupOutflow;
  return rampUp.map((f, idx) => {
    const revenue = i.sellingPricePerUnit * i.unitsPerMonth * f;
    const variable = i.rawMaterialPerUnit * i.unitsPerMonth * f;
    const fixed = base.monthlyFixedCost;
    const profit = revenue - variable - fixed;
    cash += profit;
    return {
      month: idx + 1,
      label: `M${idx + 1}`,
      revenue: roundTo(revenue),
      expenses: roundTo(variable + fixed),
      profit: roundTo(profit),
      cash: roundTo(cash),
    };
  });
}

/** Scenario presets applied as multiplicative deltas on the base model. */
export interface ScenarioAdjustment {
  priceFactor: number;
  volumeFactor: number;
  materialFactor: number;
  laborFactor: number;
  investmentFactor: number;
}

export const SCENARIOS: Record<string, { label: string; adj: ScenarioAdjustment; note: string }> = {
  base: { label: "Base Case", adj: { priceFactor: 1, volumeFactor: 1, materialFactor: 1, laborFactor: 1, investmentFactor: 1 }, note: "Your current plan as entered." },
  optimistic: { label: "Optimistic", adj: { priceFactor: 1.1, volumeFactor: 1.25, materialFactor: 0.95, laborFactor: 1, investmentFactor: 1 }, note: "Higher demand and slightly better input rates." },
  conservative: { label: "Conservative", adj: { priceFactor: 0.95, volumeFactor: 0.8, materialFactor: 1.05, laborFactor: 1, investmentFactor: 1 }, note: "Slower demand ramp and mild cost inflation." },
  stress: { label: "Stress Test", adj: { priceFactor: 0.9, volumeFactor: 0.65, materialFactor: 1.15, laborFactor: 1.1, investmentFactor: 1 }, note: "Severe demand drop with cost spikes." },
};

export function applyScenario(i: FinancialInputs, adj: ScenarioAdjustment): FinancialInputs {
  return {
    ...i,
    sellingPricePerUnit: i.sellingPricePerUnit * adj.priceFactor,
    unitsPerMonth: Math.round(i.unitsPerMonth * adj.volumeFactor),
    rawMaterialPerUnit: i.rawMaterialPerUnit * adj.materialFactor,
    labor: i.labor * adj.laborFactor,
    equipmentCost: i.equipmentCost * adj.investmentFactor,
  };
}

export function formatInr(n: number, compact = false): string {
  if (!Number.isFinite(n)) return "—";
  if (compact && Math.abs(n) >= 100000) return `₹${roundTo(n / 100000, 2)}L`;
  if (compact && Math.abs(n) >= 1000) return `₹${roundTo(n / 1000, 1)}K`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
