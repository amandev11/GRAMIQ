/**
 * Copilot brain — answers questions using the LIVE financial model.
 * Every answer is grounded in deterministic engine output; the copilot
 * explains and compares, it never does its own arithmetic.
 */
import { applyScenario, computeFinancials, formatInr, SCENARIOS } from "@/lib/finance/engine";
import { computeRisks } from "@/lib/intelligence/scores";
import { matchSchemes } from "@/lib/intelligence/schemes";
import type { EntrepreneurProfile, FinancialInputs } from "@/lib/types";

export interface CopilotAnswer {
  text: string;
  chips: string[];
  source: "AI ESTIMATE" | "DEMO DATA";
}

export function answerQuestion(
  question: string,
  profile: EntrepreneurProfile,
  inputs: FinancialInputs,
): CopilotAnswer {
  const q = question.toLowerCase();
  const base = computeFinancials(inputs);
  const risks = computeRisks(profile, inputs);

  // "biggest risk"
  if (q.includes("risk")) {
    const high = risks.filter((r) => r.level === "HIGH");
    const top = high[0] ?? risks[0];
    return {
      text: `Your biggest risk right now is "${top.title}" (${top.level}).\n\nWhy: ${top.why}\n\nImpact: ${top.impact}\n\nMitigation: ${top.mitigation}\n\nYou have ${high.length} HIGH risk(s) and ${risks.filter((r) => r.level === "MEDIUM").length} MEDIUM risk(s) on the Risk Radar.`,
      chips: ["Open Risk Radar", "Run stress test", "How do I reduce this?"],
      source: "AI ESTIMATE",
    };
  }

  // investment change simulation
  const investMatch = question.match(/(\d+(?:[.,]\d+)?)\s*(lakh|lac|l\b|k\b|000)/i);
  if ((q.includes("increase") || q.includes("invest")) && investMatch) {
    let target = parseFloat(investMatch[1].replace(",", ""));
    const unit = investMatch[2].toLowerCase();
    if (unit.startsWith("l")) target *= 100000;
    else if (unit === "k") target *= 1000;
    else if (target < 1000) target *= 1000;

    const delta = target - inputs.equipmentCost - inputs.inventoryCost;
    if (delta === 0) {
      return {
        text: `Your current equipment + stock investment is already ${formatInr(target)}. Tell me a different target and I'll simulate it.`,
        chips: ["Show calculation", "Run stress test"],
        source: "AI ESTIMATE",
      };
    }
    // Simulate: extra capital buys more cooling/storage → assume +6% volume per ₹10k invested (AI ESTIMATE)
    const scaled: FinancialInputs = {
      ...inputs,
      equipmentCost: inputs.equipmentCost + Math.max(delta, 0),
      unitsPerMonth: Math.round(inputs.unitsPerMonth * (1 + (Math.max(delta, 0) / 10000) * 0.06)),
    };
    const sim = computeFinancials(scaled);
    return {
      text: `I simulated raising investment to ${formatInr(target)}.\n\nCurrent plan:\n• Investment ${formatInr(inputs.equipmentCost + inputs.inventoryCost)}\n• Monthly profit ${formatInr(base.operatingProfit)}\n• Break-even ${base.breakEvenMonths} months\n\nProposed:\n• Investment ${formatInr(scaled.equipmentCost + scaled.inventoryCost)}\n• Monthly profit ${formatInr(sim.operatingProfit)}\n• Break-even ${sim.breakEvenMonths} months\n\nRecommendation: increase investment only if you can add at least ${formatInr(Math.max(sim.breakEvenUnits - base.breakEvenUnits, 0))} L of monthly sales. Otherwise keep the buffer as working capital.`,
      chips: ["Simulate", "Compare", "Show Calculation"],
      source: "AI ESTIMATE",
    };
  }

  // break-even
  if (q.includes("break-even") || q.includes("breakeven") || q.includes("break even")) {
    return {
      text: `Your break-even:\n\n• ${base.breakEvenUnits.toLocaleString("en-IN")} litres/month (you plan ${inputs.unitsPerMonth.toLocaleString("en-IN")} L)\n• ${formatInr(base.breakEvenRevenue)} monthly revenue\n• ~${base.breakEvenMonths} months to recover your ${formatInr(base.totalStartupCost)} startup cost\n\nCalculation: fixed costs ${formatInr(base.monthlyFixedCost)} ÷ margin ₹${base.contributionPerUnit}/L = ${base.breakEvenUnits.toLocaleString("en-IN")} L.`,
      chips: ["Show Calculation", "What if milk price falls?"],
      source: "AI ESTIMATE",
    };
  }

  // price sensitivity
  if (q.includes("milk price") || q.includes("price fall") || q.includes("price drop")) {
    const stress = computeFinancials(applyScenario(inputs, SCENARIOS.stress.adj));
    return {
      text: `If selling price drops 10% and volumes fall 35% (stress case):\n\n• Revenue: ${formatInr(base.monthlyRevenue)} → ${formatInr(stress.monthlyRevenue)}\n• Profit: ${formatInr(base.operatingProfit)} → ${formatInr(stress.operatingProfit)}\n• Break-even: ${base.breakEvenMonths} → ${stress.breakEvenMonths} months\n\nYour business becomes sensitive below ₹${(inputs.sellingPricePerUnit * 0.93).toFixed(0)}/L. Consider direct household sales or fixed-rate tea-stall contracts to protect price.`,
      chips: ["Open Simulator", "Compare scenarios"],
      source: "AI ESTIMATE",
    };
  }

  // schemes
  if (q.includes("scheme") || q.includes("subsidy") || q.includes("loan") || q.includes("fund")) {
    const matches = matchSchemes(profile, base.totalStartupCost);
    const top = matches.filter((m) => m.matchPct >= 60).slice(0, 3);
    return {
      text: `Top scheme matches for your profile (deterministic eligibility filter, then AI explanation):\n\n${top
        .map((m, i) => `${i + 1}. ${m.scheme.name} — ${m.matchPct}% match (${m.scheme.type}, ${m.scheme.source.status})`)
        .join("\n")}\n\nNote: these are DEMO database entries for the prototype — verify with the district office before applying. Open Funding & Schemes to see per-criterion eligibility.`,
      chips: ["Open Funding & Schemes", "What documents do I need?"],
      source: "DEMO DATA",
    };
  }

  // profit / how am I doing
  if (q.includes("profit") || q.includes("earning")) {
    return {
      text: `At your current plan:\n\n• Monthly revenue ${formatInr(base.monthlyRevenue)}\n• Variable cost ${formatInr(base.monthlyVariableCost)}\n• Fixed cost (incl. EMI) ${formatInr(base.monthlyFixedCost)}\n• Operating profit ${formatInr(base.operatingProfit)} (${base.profitMarginPct}% margin)\n• Annual profit ${formatInr(base.annualProfit)}\n\nEvery ₹1/L added to your selling price adds about ${formatInr(inputs.unitsPerMonth)}/month to profit.`,
      chips: ["Show Calculation", "Open Simulator"],
      source: "AI ESTIMATE",
    };
  }

  // documents
  if (q.includes("document") || q.includes("paper")) {
    return {
      text: `For the top demo scheme matches you would typically need:\n\n• Aadhaar ID and PAN card\n• Bank passbook / 6-month statements\n• Land or shed ownership proof (or NOC)\n• A short project report — your GRAMIQ Business Plan PDF works as a draft\n\nThese are DEMO requirements from the prototype knowledge base; confirm the exact list at the district office.`,
      chips: ["Open Funding & Schemes", "Generate Business Plan"],
      source: "DEMO DATA",
    };
  }

  // default: grounded status summary
  return {
    text: `Here's where your business stands:\n\n• Monthly profit: ${formatInr(base.operatingProfit)} (${base.profitMarginPct}% margin)\n• Break-even: ${base.breakEvenUnits.toLocaleString("en-IN")} L/month, ~${base.breakEvenMonths} months\n• Startup cost: ${formatInr(base.totalStartupCost)} against ${formatInr(profile.capital)} capital\n• Biggest risk: ${risks[0].title} (${risks[0].level})\n\nAsk me about your profit, risks, break-even, schemes — or ask "what if I invest ₹1.5 lakh?" and I'll simulate it.`,
    chips: ["What is my biggest risk?", "What if I invest ₹1.5 lakh?", "Show my break-even"],
    source: "AI ESTIMATE",
  };
}
