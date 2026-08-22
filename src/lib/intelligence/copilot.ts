/**
 * Copilot brain — answers questions using the LIVE financial model.
 * Answers are STRUCTURED: headline + metric deltas + calculation steps +
 * short narration. Every number comes from the deterministic engine.
 */
import { applyScenario, computeFinancials, formatInr, SCENARIOS } from "@/lib/finance/engine";
import { computeRisks } from "@/lib/intelligence/scores";
import { matchSchemes } from "@/lib/intelligence/schemes";
import { pick, type Lang } from "@/lib/i18n/strings";
import type { EntrepreneurProfile, FinancialInputs } from "@/lib/types";

export interface CopilotMetric {
  label: string;
  before: string;
  after: string;
}

export interface CalcStep {
  expression: string;
  note: string;
}

export interface CopilotAnswer {
  headline: string;
  text: string;
  metrics?: CopilotMetric[];
  calcSteps?: CalcStep[];
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
  const lang: Lang = profile.language ?? "en";

  // "biggest risk"
  if (q.includes("risk") || (lang === "hi" && question.includes("जोखिम"))) {
    const high = risks.filter((r) => r.level === "HIGH");
    const top = high[0] ?? risks[0];
    const headlineMap: Record<Lang, string> = {
      en: `Biggest risk: ${top.title} (${top.level})`,
      hi: `सबसे बड़ा जोखिम: ${top.title} (${top.level})`,
      hinglish: `Biggest risk: ${top.title} (${top.level})`,
    };
    return {
      headline: headlineMap[lang],
      text: `${top.why}\n\n${pick({ en: "Impact", hi: "प्रभाव", hinglish: "Impact" }, lang)} — ${top.impact}\n${pick({ en: "Mitigation", hi: "शमन", hinglish: "Mitigation" }, lang)} — ${top.mitigation}\n\n${pick({
        en: `Your radar shows ${high.length} HIGH and ${risks.filter((r) => r.level === "MEDIUM").length} MEDIUM risk(s).`,
        hi: `आपका रडार ${high.length} उच्च और ${risks.filter((r) => r.level === "MEDIUM").length} मध्यम जोखिम दिखाता है।`,
        hinglish: `Aapka radar ${high.length} HIGH aur ${risks.filter((r) => r.level === "MEDIUM").length} MEDIUM risk dikhata hai.`,
      }, lang)}`,
      chips: lang === "hi" ? ["रडार खोलें", "तनाव परीक्षण", "गणना दिखाएँ"] : ["Open Risk Radar", "Run stress test", "Show Calculation"],
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
        headline: "You're already investing that amount",
        text: `Your equipment + stock investment is ${formatInr(target)}. Give me a different target and I'll simulate it.`,
        chips: ["Simulate +₹50,000", "Show my break-even"],
        source: "AI ESTIMATE",
      };
    }
    // Simulate: extra capital buys cooling/storage → +6% volume per ₹10k (AI ESTIMATE)
    const scaled: FinancialInputs = {
      ...inputs,
      equipmentCost: inputs.equipmentCost + Math.max(delta, 0),
      unitsPerMonth: Math.round(inputs.unitsPerMonth * (1 + (Math.max(delta, 0) / 10000) * 0.06)),
    };
    const sim = computeFinancials(scaled);
    return {
      headline: `Simulated: investing ${formatInr(target)}`,
      metrics: [
        { label: "Monthly profit", before: formatInr(base.operatingProfit), after: formatInr(sim.operatingProfit) },
        { label: "Break-even", before: `${base.breakEvenMonths} mo`, after: `${sim.breakEvenMonths} mo` },
        { label: "Margin", before: `${base.profitMarginPct}%`, after: `${sim.profitMarginPct}%` },
      ],
      text: `Extra capacity adds ${formatInr(sim.monthlyRevenue - base.monthlyRevenue)}/month in revenue, but your payback stretches.\n\nRecommendation: increase only if you can add at least ${formatInr(Math.max(sim.breakEvenUnits - base.breakEvenUnits, 0))} of monthly sales. Otherwise keep the money as working capital.`,
      calcSteps: [
        { expression: `+${formatInr(delta)} invested → +${(Math.max(delta, 0) / 10000) * 0.06 * 100 | 0}% volume (₹6k capacity per ₹10k)`, note: "Modeled capacity assumption" },
        { expression: `Break-even: ${formatInr(sim.monthlyFixedCost)} ÷ ₹${sim.contributionPerUnit}/L = ${sim.breakEvenUnits.toLocaleString("en-IN")} L/mo`, note: "Fixed costs ÷ contribution per unit" },
      ],
      chips: ["Open Simulator", "Compare", "What is my biggest risk?"],
      source: "AI ESTIMATE",
    };
  }

  // calculation walkthrough
  if (q.includes("calculation") || q.includes("show the math") || q.includes("how did you")) {
    return {
      headline: "The math behind your plan",
      calcSteps: [
        { expression: `EMI = ${formatInr(base.emi)}`, note: "P·r·(1+r)ⁿ / ((1+r)ⁿ−1) on a reducing balance" },
        { expression: `Fixed costs = ${formatInr(base.monthlyFixedCost)}/mo`, note: `Labor ${formatInr(inputs.labor)} + utilities ${formatInr(inputs.utilities)} + other ${formatInr(inputs.otherMonthlyCost)} + EMI ${formatInr(base.emi)}` },
        { expression: `Contribution = ₹${inputs.sellingPricePerUnit} − ₹${inputs.rawMaterialPerUnit} = ₹${base.contributionPerUnit}/L`, note: "Sell price minus buy price" },
        { expression: `Break-even = ${formatInr(base.monthlyFixedCost)} ÷ ₹${base.contributionPerUnit} = ${base.breakEvenUnits.toLocaleString("en-IN")} L/mo`, note: "Fixed costs ÷ contribution per unit" },
        { expression: `Monthly profit = ${formatInr(base.monthlyRevenue)} − ${formatInr(base.monthlyVariableCost)} − ${formatInr(base.monthlyFixedCost)} = ${formatInr(base.operatingProfit)}`, note: "Revenue − variable − fixed" },
        { expression: `Break-even period ≈ ${base.breakEvenMonths} mo`, note: `(${formatInr(base.totalStartupCost)} startup + half working capital) ÷ ${formatInr(base.operatingProfit)}/mo` },
      ],
      text: "Every figure on every page comes from these exact formulas. Change any input in the model and they recompute instantly.",
      chips: ["Open Simulator", "What if milk price falls?"],
      source: "AI ESTIMATE",
    };
  }

  // break-even
  if (q.includes("break-even") || q.includes("breakeven") || q.includes("break even")) {
    return {
      headline: `You break even at ${base.breakEvenUnits.toLocaleString("en-IN")} L/month`,
      metrics: [
        { label: "Break-even revenue", before: "—", after: formatInr(base.breakEvenRevenue) },
        { label: "Planned volume", before: "—", after: `${inputs.unitsPerMonth.toLocaleString("en-IN")} L` },
        { label: "Payback period", before: "—", after: `${base.breakEvenMonths} mo` },
      ],
      text: `Your safety cushion is ${Math.max(inputs.unitsPerMonth - base.breakEvenUnits, 0).toLocaleString("en-IN")} L/month (${Math.round((1 - base.breakEvenUnits / inputs.unitsPerMonth) * 100)}% headroom) before you start losing money.`,
      calcSteps: [
        { expression: `${formatInr(base.monthlyFixedCost)} ÷ ₹${base.contributionPerUnit}/L = ${base.breakEvenUnits.toLocaleString("en-IN")} L/mo`, note: "Fixed costs ÷ contribution per unit" },
      ],
      chips: ["Show Calculation", "What if milk price falls?"],
      source: "AI ESTIMATE",
    };
  }

  // price sensitivity
  if (q.includes("milk price") || q.includes("price fall") || q.includes("price drop")) {
    const stress = computeFinancials(applyScenario(inputs, SCENARIOS.stress.adj));
    return {
      headline: "Stress test: −10% price, −35% volume",
      metrics: [
        { label: "Revenue", before: formatInr(base.monthlyRevenue), after: formatInr(stress.monthlyRevenue) },
        { label: "Profit", before: formatInr(base.operatingProfit), after: formatInr(stress.operatingProfit) },
        { label: "Break-even", before: `${base.breakEvenMonths} mo`, after: `${stress.breakEvenMonths} mo` },
      ],
      text: `Your business becomes sensitive below ₹${(inputs.sellingPricePerUnit * 0.93).toFixed(0)}/L. Protect price with direct household sales and fixed-rate tea-stall contracts instead of matching competitor cuts.`,
      chips: ["Open Simulator", "Compare scenarios"],
      source: "AI ESTIMATE",
    };
  }

  // schemes
  if (q.includes("scheme") || q.includes("subsidy") || q.includes("loan") || q.includes("fund")) {
    const matches = matchSchemes(profile, base.totalStartupCost);
    const top = matches.filter((m) => m.matchPct >= 60).slice(0, 3);
    return {
      headline: `${top.length} scheme matches above 60%`,
      text: top
        .map((m, i) => `${i + 1}. ${m.scheme.name} — ${m.matchPct}% (${m.scheme.type})`)
        .join("\n") + "\n\nThese are DEMO database entries — verify at the district office before applying. The eligibility filter is deterministic; I only explain it.",
      chips: ["Open Funding & Schemes", "What documents do I need?"],
      source: "DEMO DATA",
    };
  }

  // profit / how am I doing
  if (q.includes("profit") || q.includes("earning")) {
    return {
      headline: `${formatInr(base.operatingProfit)}/month at ${base.profitMarginPct}% margin`,
      metrics: [
        { label: "Revenue", before: "—", after: formatInr(base.monthlyRevenue) },
        { label: "Variable cost", before: "—", after: formatInr(base.monthlyVariableCost) },
        { label: "Fixed cost", before: "—", after: formatInr(base.monthlyFixedCost) },
        { label: "Annual profit", before: "—", after: formatInr(base.annualProfit) },
      ],
      text: `Every ₹1/L added to your selling price adds about ${formatInr(inputs.unitsPerMonth)}/month to profit — the single most powerful lever in your model.`,
      chips: ["Show Calculation", "Open Simulator"],
      source: "AI ESTIMATE",
    };
  }

  // documents
  if (q.includes("document") || q.includes("paper")) {
    return {
      headline: "Documents you'd typically need",
      text: "• Aadhaar ID and PAN card\n• Bank passbook / 6-month statements\n• Land or shed ownership proof (or NOC)\n• Project report — your GRAMIQ Business Plan PDF works as a draft\n\nThese are DEMO requirements; confirm the exact list at the district office.",
      chips: ["Open Funding & Schemes", "Generate Business Plan"],
      source: "DEMO DATA",
    };
  }

  // default: grounded status summary
  const glanceHeadline: Record<Lang, string> = {
    en: "Your business at a glance",
    hi: "आपका व्यवसाय एक नज़र में",
    hinglish: "Aapka business ek nazar mein",
  };
  const glanceText: Record<Lang, string> = {
    en: `Biggest risk: ${risks[0].title} (${risks[0].level}).\n\nAsk about your profit, risks, break-even or schemes — or say "what if I invest ₹1.5 lakh?" and I'll simulate it.`,
    hi: `सबसे बड़ा जोखिम: ${risks[0].title} (${risks[0].level})।\n\nअपने लाभ, जोखिम, ब्रेक-ईन या योजनाओं के बारे में पूछें — या कहें "अगर मैं ₹1.5 लाख निवेश करूँ?" और मैं इसे सिम्युलेट करूँगा।`,
    hinglish: `Biggest risk: ${risks[0].title} (${risks[0].level}).\n\nProfit, risks, break-even ya schemes ke baare mein poocho — ya bolo "agar main ₹1.5 lakh invest karoon?" aur main simulate karunga.`,
  };
  return {
    headline: glanceHeadline[lang],
    metrics: [
      { label: pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), before: "—", after: formatInr(base.operatingProfit) },
      { label: pick({ en: "Break-even", hi: "ब्रेक-ईन", hinglish: "Break-even" }, lang), before: "—", after: `${base.breakEvenMonths} mo` },
      { label: pick({ en: "Startup cost", hi: "स्टार्टअप लागत", hinglish: "Startup cost" }, lang), before: "—", after: formatInr(base.totalStartupCost) },
    ],
    text: glanceText[lang],
    chips: lang === "hi"
      ? ["मेरा सबसे बड़ा जोखिम क्या है?", "मेरा ब्रेक-ईन दिखाएँ", "गणना दिखाएँ"]
      : ["What is my biggest risk?", "Show my break-even", "Show Calculation"],
    source: "AI ESTIMATE",
  };
}
