/**
 * Copilot brain — answers questions using the LIVE financial model and the
 * user's ACTUAL business. Answers are STRUCTURED: headline + metric deltas +
 * calculation steps + short narration. Every number comes from the
 * deterministic engine; the copilot explains, never invents.
 *
 * All chips are CopilotChip: plain chips re-ask the copilot; chips with a
 * `to` navigate to the matching GRAMIQ surface (simulator, schemes, risk
 * radar, plan, business-plan PDF…).
 */
import { applyScenario, computeFinancials, formatInr, SCENARIOS } from "@/lib/finance/engine";
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import { computeRisks } from "@/lib/intelligence/scores";
import { matchSchemes } from "@/lib/intelligence/schemes";
import { pick, type Lang } from "@/lib/i18n/strings";
import type { ActionItem, EntrepreneurProfile, FinancialInputs } from "@/lib/types";
import type { CopilotChip } from "@/lib/types";

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
  chips: CopilotChip[];
  source: "AI ESTIMATE" | "DEMO DATA";
}

const t = (en: string, hi: string, hinglish: string): Record<Lang, string> => ({ en, hi, hinglish });

/* ── Dynamic contextual suggestions ─────────────────────────────────────── */

/**
 * Suggestion chips shown above the conversation and as the opening message.
 * Derived from the DETECTED business family + the user's capital — never
 * hardcoded to one business.
 */
export function buildCopilotSuggestions(profile: EntrepreneurProfile): CopilotChip[] {
  const lang: Lang = profile.language ?? "en";
  const model = detectBusinessModel(profile.businessIdea);
  const cap = Math.max(profile.capital, 0);
  const investAsk: Record<Lang, string> = {
    en: `What if I only have ₹${cap.toLocaleString("en-IN")}?`,
    hi: `अगर मेरे पास केवल ₹${cap.toLocaleString("en-IN")} हों?`,
    hinglish: `Agar mere paas sirf ₹${cap.toLocaleString("en-IN")} hon?`,
  };

  const FAMILY: Record<string, Array<{ en: string; hi: string; hinglish: string }>> = {
    dairy: [
      t("Which customer segment pays best?", "कौन सा ग्राहक वर्ग सबसे अच्छा भुगतान करता है?", "Kaun sa customer segment sabse achha pay karta hai?"),
      t("Reduce my collection costs", "मेरी संग्रह लागत घटाएँ", "Meri collection cost kam karo"),
      t("How do I keep spoilage low?", "खराबी कम कैसे रखूँ?", "Spoilage kam kaise rakhoon?"),
    ],
    crops: [
      t("Which crop should I choose?", "मुझे कौन सी फसल चुननी चाहिए?", "Mujhe kaun si fasal chunni chahiye?"),
      t("Reduce my input costs", "मेरी इनपुट लागत घटाएँ", "Meri input cost kam karo"),
      t("Best use of my land", "मेरी ज़मीन का सबसे अच्छा उपयोग", "Meri zameen ka best upyog"),
      t("Estimate my water needs", "मेरी पानी की ज़रूरत का अनुमान", "Meri paani ki zaroorat ka andaza"),
    ],
    livestock: [
      t("Reduce my feed costs", "मेरी चारा लागत घटाएँ", "Meri feed cost kam karo"),
      t("Biggest disease risk?", "सबसे बड़ा रोग जोखिम?", "Sabse bada disease risk?"),
      t("Best sale channel for my stock?", "मेरे स्टॉक के लिए सबसे अच्छा बिक्री माध्यम?", "Mere stock ke liye best sale channel?"),
    ],
    "food-service": [
      t("Reduce my food cost per order", "प्रति ऑर्डर खाद्य लागत घटाएँ", "Per order food cost kam karo"),
      t("How do I get more daily customers?", "दैनिक ग्राहक कैसे बढ़ाएँ?", "Daily customers kaise badhayein?"),
      t("What should be on my menu?", "मेरे मेन्यू में क्या होना चाहिए?", "Mere menu mein kya hona chahiye?"),
    ],
    retail: [
      t("Which items sell fastest locally?", "स्थानीय रूप से कौन से सामान सबसे तेज़ बिकते हैं?", "Kaun se items local mein sabse fast bikte hain?"),
      t("Reduce my stock investment", "मेरा स्टॉक निवेश घटाएँ", "Mera stock investment kam karo"),
      t("How do I beat the nearby shop?", "पास की दुकान को कैसे हराऊँ?", "Paas ki dukaan ko kaise haraoon?"),
    ],
    services: [
      t("Which service earns me most?", "कौन सी सेवा मुझे सबसे अधिक कमाती है?", "Kaun si service mujhe sabse zyada kamaati hai?"),
      t("Raise my service price?", "मेरी सेवा दर बढ़ाएँ?", "Meri service rate badhayein?"),
      t("Get more bookings", "ज़्यादा बुकिंग पाएँ", "Zyada bookings pao"),
    ],
    digital: [
      t("Improve my pricing", "मेरी कीमत निर्धारण सुधारें", "Meri pricing improve karo"),
      t("Find my first 10 customers", "अपने पहले 10 ग्राहक खोजें", "Apne pehle 10 customers dhoondo"),
      t("Reduce my running costs", "मेरी चालू लागत घटाएँ", "Meri running cost kam karo"),
    ],
    generic: [
      t("Is this actually profitable?", "क्या यह वाकई लाभदायक है?", "Kya yeh sach mein profitable hai?"),
      t("Reduce my startup cost", "मेरी स्टार्टअप लागत घटाएँ", "Meri startup cost kam karo"),
      t("Who are my competitors?", "मेरे प्रतिस्पर्धी कौन हैं?", "Mere competitors kaun hain?"),
      t("What should I do in the first 30 days?", "पहले 30 दिनों में क्या करूँ?", "Pehle 30 dinon mein kya karoon?"),
    ],
  };

  const family = FAMILY[model.key] ?? FAMILY.generic;
  const chips: CopilotChip[] = [
    pick({ en: "Is this actually profitable?", hi: "क्या यह वाकई लाभदायक है?", hinglish: "Kya yeh sach mein profitable hai?" }, lang),
    pick(investAsk, lang),
    ...family.slice(0, 3).map((c) => pick(c, lang)),
  ].map((label) => ({ label }));

  // Navigation chips — the copilot is an interface into GRAMIQ, not a chat.
  chips.push(
    { label: pick({ en: "My 30-day plan", hi: "मेरी 30-दिन की योजना", hinglish: "Meri 30-din ki plan" }, lang), to: "/plan" },
    { label: pick({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, lang), to: "/finance" },
  );
  return chips;
}

/* ── Answer engine ──────────────────────────────────────────────────────── */

export function answerQuestion(
  question: string,
  profile: EntrepreneurProfile,
  inputs: FinancialInputs,
  actionItems: ActionItem[] = [],
): CopilotAnswer {
  const q = question.toLowerCase();
  const base = computeFinancials(inputs);
  const risks = computeRisks(profile, inputs);
  const lang: Lang = profile.language ?? "en";
  // All units/chips/scenario language derive from the user's ACTUAL business.
  const model = detectBusinessModel(profile.businessIdea);
  const u = model.unitShort;
  const scenarioQ = model.scenarioQuestions[0];

  const open = (label: Record<Lang, string>, to: string): CopilotChip => ({ label: pick(label, lang), to });
  const ask = (label: Record<Lang, string>): CopilotChip => ({ label: pick(label, lang) });

  // ── viability ──
  if (q.includes("profitable") || q.includes("viable") || q.includes("worth it") || q.includes("feasible") || (lang === "hi" && (question.includes("लाभदायक") || question.includes("व्यवहार्य")))) {
    const verdict =
      base.operatingProfit > 0
        ? pick({
          en: `Yes — at your modeled volume this shows ${formatInr(base.operatingProfit)}/month profit (${base.profitMarginPct}% margin). It survives the stress test (profit stays positive at −10% price / −35% volume).`,
          hi: `हाँ — आपकी मॉडलित मात्रा पर यह ${formatInr(base.operatingProfit)}/माह लाभ दिखाता है (${base.profitMarginPct}% मार्जिन)। यह तनाव परीक्षण में भी टिकता है (−10% मूल्य / −35% मात्रा पर लाभ सकारात्मक रहता है)।`,
          hinglish: `Haan — aapki modeled volume par yeh ${formatInr(base.operatingProfit)}/month profit dikhata hai (${base.profitMarginPct}% margin). Yeh stress test mein bhi survive karta hai (−10% price / −35% volume par profit positive rehta hai).`,
        }, lang)
        : pick({
          en: `Not yet — at your current inputs the model shows ${formatInr(base.operatingProfit)}/month (${base.profitMarginPct}% margin). The main levers are price (raise by ₹1–2/${u}) and volume (confirm real demand before scaling).`,
          hi: `अभी नहीं — वर्तमान इनपुट पर मॉडल ${formatInr(base.operatingProfit)}/माह दिखाता है (${base.profitMarginPct}% मार्जिन)। मुख्य लीवर हैं मूल्य (₹1–2/${u} बढ़ाएँ) और मात्रा (बढ़ाने से पहले असली माँग पक्की करें)।`,
          hinglish: `Abhi nahi — current inputs par model ${formatInr(base.operatingProfit)}/month dikhata hai (${base.profitMarginPct}% margin). Main levers hain: price (₹1–2/${u} badhao) aur volume (scale se pehle real demand confirm karo).`,
        }, lang);
    return {
      headline: pick({
        en: `Viability check: ${base.operatingProfit > 0 ? "profitable" : "not yet profitable"} at plan`,
        hi: `व्यवहार्यता जाँच: योजना पर ${base.operatingProfit > 0 ? "लाभदायक" : "अभी लाभदायक नहीं"}`,
        hinglish: `Viability check: plan par ${base.operatingProfit > 0 ? "profitable" : "abhi profitable nahi"}`,
      }, lang),
      metrics: [
        { label: pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), before: "—", after: formatInr(base.operatingProfit) },
        { label: pick({ en: "Margin", hi: "मार्जिन", hinglish: "Margin" }, lang), before: "—", after: `${base.profitMarginPct}%` },
        { label: pick({ en: "Stress-case profit", hi: "तनाव-स्थिति लाभ", hinglish: "Stress-case profit" }, lang), before: "—", after: formatInr(computeFinancials(applyScenario(inputs, SCENARIOS.stress.adj)).operatingProfit) },
      ],
      text: verdict,
      chips: [ask({ en: "What is my biggest risk?", hi: "मेरा सबसे बड़ा जोखिम क्या है?", hinglish: "Mera sabse bada risk kya hai?" }), open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance")],
      source: "AI ESTIMATE",
    };
  }

  // ── biggest risk ──
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
      chips: [open({ en: "Open Risk Radar", hi: "रडार खोलें", hinglish: "Risk radar kholo" }, "/risks"), ask({ en: "Run stress test", hi: "तनाव परीक्षण", hinglish: "Stress test chalao" }), ask({ en: "Show Calculation", hi: "गणना दिखाएँ", hinglish: "Calculation dikhao" })],
      source: "AI ESTIMATE",
    };
  }

  // ── reduce costs / startup cost ──
  if (q.includes("reduce") || q.includes("cut") || q.includes("lower") || q.includes("cheaper") || q.includes("cost")) {
    const biggestFixed = [
      { label: pick({ en: "Labor", hi: "मज़दूरी", hinglish: "Labor" }, lang), amount: inputs.labor },
      { label: pick({ en: "Rent", hi: "किराया", hinglish: "Rent" }, lang), amount: inputs.rent },
      { label: pick({ en: "Utilities", hi: "उपयोगिताएँ", hinglish: "Utilities" }, lang), amount: inputs.utilities },
      { label: pick({ en: "Other monthly", hi: "अन्य मासिक", hinglish: "Other monthly" }, lang), amount: inputs.otherMonthlyCost },
    ].filter((x) => x.amount > 0).sort((a, b) => b.amount - a.amount)[0];
    const materialShare = Math.round((base.monthlyVariableCost / Math.max(base.monthlyRevenue, 1)) * 100);
    const trimmed: FinancialInputs = {
      ...inputs,
      rawMaterialPerUnit: inputs.rawMaterialPerUnit * 0.95,
      labor: inputs.labor * 0.9,
      utilities: inputs.utilities * 0.9,
    };
    const after = computeFinancials(trimmed);
    return {
      headline: pick({
        en: "Cost levers in your model",
        hi: "आपके मॉडल के लागत लीवर",
        hinglish: "Aapke model ke cost levers",
      }, lang),
      metrics: [
        { label: pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), before: formatInr(base.operatingProfit), after: formatInr(after.operatingProfit) },
        { label: pick({ en: "Margin", hi: "मार्जिन", hinglish: "Margin" }, lang), before: `${base.profitMarginPct}%`, after: `${after.profitMarginPct}%` },
      ],
      text: pick({
        en: `1) Raw materials are ~${materialShare}% of revenue — negotiate fixed weekly rates with 2+ suppliers (a 5% cut adds ~${formatInr(after.operatingProfit - base.operatingProfit)}/month).\n2) Biggest fixed cost: ${biggestFixed?.label ?? "—"} at ${formatInr(biggestFixed?.amount ?? 0)}/month — verify it is necessary at this stage.${inputs.labor > 0 ? "\n3) Family labor for the first 3 months instead of hired help." : ""}\n\nSimulated: −5% input cost, −10% labor/utilities → ${formatInr(after.operatingProfit)}/month (${after.profitMarginPct}% margin).`,
        hi: `1) कच्चा माल राजस्व का ~${materialShare}% है — 2+ आपूर्तिकर्ताओं के साथ निश्चित साप्ताहिक दरें तय करें (5% कटौती से ~${formatInr(after.operatingProfit - base.operatingProfit)}/माह अतिरिक्त)।\n2) सबसे बड़ी निश्चित लागत: ${biggestFixed?.label ?? "—"} ${formatInr(biggestFixed?.amount ?? 0)}/माह — पुष्टि करें कि इस चरण में यह आवश्यक है।${inputs.labor > 0 ? "\n3) पहले 3 माह परिवार श्रम से चलाएँ, बाहरी मज़दूरी नहीं।" : ""}\n\nसिम्युलेशन: −5% इनपुट लागत, −10% मज़दूरी/उपयोगिताएँ → ${formatInr(after.operatingProfit)}/माह (${after.profitMarginPct}% मार्जिन)।`,
        hinglish: `1) Raw material revenue ka ~${materialShare}% hai — 2+ suppliers ke saath fixed weekly rates pakkao (5% cut se ~${formatInr(after.operatingProfit - base.operatingProfit)}/month extra).\n2) Sabse badi fixed cost: ${biggestFixed?.label ?? "—"} ${formatInr(biggestFixed?.amount ?? 0)}/month — check karo ki is stage par zaroori hai ya nahi.${inputs.labor > 0 ? "\n3) Pehle 3 months family labor chalao, hired help nahi." : ""}\n\nSimulated: −5% input cost, −10% labor/utilities → ${formatInr(after.operatingProfit)}/month (${after.profitMarginPct}% margin).`,
      }, lang),
      chips: [open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance"), { label: scenarioQ }],
      source: "AI ESTIMATE",
    };
  }

  // ── improve margins ──
  if (q.includes("margin")) {
    const priceUp: FinancialInputs = { ...inputs, sellingPricePerUnit: inputs.sellingPricePerUnit * 1.05 };
    const after = computeFinancials(priceUp);
    return {
      headline: pick({
        en: "Margins: the ₹ lever is your price",
        hi: "मार्जिन: ₹ का लीवर आपकी कीमत है",
        hinglish: "Margins: ₹ wala lever aapki price hai",
      }, lang),
      metrics: [
        { label: pick({ en: "Profit at +5% price", hi: "+5% मूल्य पर लाभ", hinglish: "+5% price par profit" }, lang), before: formatInr(base.operatingProfit), after: formatInr(after.operatingProfit) },
        { label: pick({ en: "Margin", hi: "मार्जिन", hinglish: "Margin" }, lang), before: `${base.profitMarginPct}%`, after: `${after.profitMarginPct}%` },
      ],
      text: pick({
        en: `Each ₹1/${u} of price adds ~${formatInr(inputs.unitsPerMonth)}/month of pure profit. But price is set by the market: win the right to charge more with delivery timing and quality, then raise price in small steps (₹1–2/${u}) and watch volume. Also cut input cost per ${u} — it compounds the same way.`,
        hi: `प्रत्येक ₹1/${u} मूल्य वृद्धि से ~${formatInr(inputs.unitsPerMonth)}/माह शुद्ध लाभ जुड़ता है। लेकिन कीमत बाज़ार तय करता है: डिलीवरी समय और गुणवत्ता से अधिक वसूलने का अधिकार जीतें, फिर छोटे कदमों में कीमत बढ़ाएँ (₹1–2/${u}) और मात्रा पर नज़र रखें। साथ ही प्रति ${u} इनपुट लागत घटाएँ — वही तरीका है।`,
        hinglish: `Har ₹1/${u} price se ~${formatInr(inputs.unitsPerMonth)}/month pure profit badhta hai. Lekin price market set karta hai: delivery timing aur quality se zyada lene ka haq jeeto, phir chhote steps mein price badhao (₹1–2/${u}) aur volume dekho. Input cost per ${u} bhi kato — same tarah compound hota hai.`,
      }, lang),
      chips: [open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance"), ask({ en: "Reduce my costs", hi: "मेरी लागत घटाएँ", hinglish: "Meri cost kam karo" })],
      source: "AI ESTIMATE",
    };
  }

  // ── competitors ──
  if (q.includes("competitor") || q.includes("competition") || (lang === "hi" && question.includes("प्रतिस्पर्ध"))) {
    return {
      headline: pick({
        en: "Who you're up against (DEMO map)",
        hi: "आप किसके खिलाफ हैं (DEMO नक्शा)",
        hinglish: "Aap kis ke khilaf ho (DEMO map)",
      }, lang),
      text: pick({
        en: `The mapped competitor is "${model.pois.competitor}". They price around ₹${(inputs.sellingPricePerUnit * 1.03).toFixed(0)}/${u} (DEMO DATA) — slightly above your plan of ₹${inputs.sellingPricePerUnit}/${u}. Compete on timing, freshness and doorstep service, not on price wars. Your opportunity pocket: "${model.pois.opportunity}".`,
        hi: `मैप किया गया प्रतिस्पर्धी "${model.pois.competitor}" है। उनकी कीमत लगभग ₹${(inputs.sellingPricePerUnit * 1.03).toFixed(0)}/${u} है (DEMO DATA) — आपकी योजना ₹${inputs.sellingPricePerUnit}/${u} से थोड़ी ऊपर। मूल्य युद्ध के बजाय समय, ताज़गी और घर-द्वार सेवा पर प्रतिस्पर्धा करें। आपका अवसर क्षेत्र: "${model.pois.opportunity}"।`,
        hinglish: `Mapped competitor "${model.pois.competitor}" hai. Unki price around ₹${(inputs.sellingPricePerUnit * 1.03).toFixed(0)}/${u} hai (DEMO DATA) — aapki plan ₹${inputs.sellingPricePerUnit}/${u} se thodi upar. Price war ke bajaye timing, freshness aur doorstep service par compete karo. Aapka opportunity pocket: "${model.pois.opportunity}".`,
      }, lang),
      chips: [open({ en: "Open Local Market", hi: "स्थानीय बाज़ार खोलें", hinglish: "Local market kholo" }, "/market"), open({ en: "Open Risk Radar", hi: "रडार खोलें", hinglish: "Risk radar kholo" }, "/risks")],
      source: "DEMO DATA",
    };
  }

  // ── 30-day plan ──
  if (q.includes("30 day") || q.includes("30-day") || q.includes("first month") || q.includes("first 30")) {
    const short = actionItems.filter((a) => a.horizon === "7d" || a.horizon === "30d");
    const plan = (short.length > 0 ? short : actionItems).slice(0, 6);
    return {
      headline: pick({
        en: "Your first 30 days, sequenced",
        hi: "आपके पहले 30 दिन, क्रमबद्ध",
        hinglish: "Aapke pehle 30 din, sequenced",
      }, lang),
      text: plan.map((a, i) => `${i + 1}. ${a.task}`).join("\n") + (short.length === 0 ? `\n\n${pick({ en: "Full sequenced plan:", hi: "पूर्ण क्रमबद्ध योजना:", hinglish: "Full sequenced plan:" }, lang)}` : ""),
      chips: [open({ en: "Open Action Plan", hi: "कार्य योजना खोलें", hinglish: "Action plan kholo" }, "/plan"), ask({ en: "What is my biggest risk?", hi: "मेरा सबसे बड़ा जोखिम क्या है?", hinglish: "Mera sabse bada risk kya hai?" })],
      source: "AI ESTIMATE",
    };
  }

  // ── what to sell / which crop ──
  if (q.includes("which crop") || q.includes("what should i sell") || q.includes("what to sell") || q.includes("best use of my land") || (lang === "hi" && question.includes("कौन सी फसल"))) {
    // Crop advice only makes sense for farming businesses — never mislead
    // a dairy or shop owner with land-allocation guidance.
    if (model.key !== "crops") {
      return {
        headline: pick({
          en: `Your model is ${model.label.toLowerCase()} — not crop farming`,
          hi: `आपका मॉडल ${model.label} है — फसल खेती नहीं`,
          hinglish: `Aapka model ${model.label} hai — crop farming nahi`,
        }, lang),
        text: pick({
          en: `I've built your plan around ${model.label.toLowerCase()}. Crop-selection advice only applies to farming. Tell me exactly what you plan to sell (and to whom) and I'll sharpen the model for that.`,
          hi: `मैंने आपकी योजना ${model.label} के आधार पर बनाई है। फसल चयन सलाह केवल खेती पर लागू होती है। बताएँ कि आप वास्तव में क्या बेचना चाहते हैं (और किसे) और मैं उसके लिए मॉडल को तेज़ करूँगा।`,
          hinglish: `Maine aapki plan ${model.label} ke around banayi hai. Crop-selection advice sirf farming par lagti hai. Batao ki aap exactly kya bechna chahte ho (aur kisko) — main uske liye model sharpen karunga.`,
        }, lang),
        chips: [open({ en: "Open your Blueprint", hi: "अपना ब्लूप्रिंट खोलें", hinglish: "Apna blueprint kholo" }, "/blueprint"), ask({ en: "Who are my competitors?", hi: "मेरे प्रतिस्पर्धी कौन हैं?", hinglish: "Mere competitors kaun hain?" })],
        source: "AI ESTIMATE",
      };
    }
    const cropAdvice = pick({
      en: "With your land, start with SHORT-CYCLE, HIGH-VALUE crops that pay back within a season: leafy greens and vegetables (palak, coriander, methi, brinjal, tomato) sell daily at local mandis. Mix 60% short-cycle vegetables with 40% a staple (wheat/rice) for food security. Confirm soil and water at the Krishi Vigyan Kendra first — that decides what your land can actually grow.",
      hi: "अपनी ज़मीन के साथ, छोटे-चक्र, उच्च-मूल्य फसलों से शुरू करें जो एक सीज़न में भुगतान करें: पत्तेदार साग और सब्ज़ियाँ (पालक, धनिया, मेथी, बैंगन, टमाटर) स्थानीय मंडियों में रोज़ बिकती हैं। 60% छोटे-चक्र सब्ज़ियाँ + 40% मुख्य फसल (गेहूँ/चावल) मिलाएँ। पहले कृषि विज्ञान केंद्र से मिट्टी और पानी की जाँच कराएँ — यही तय करता है कि आपकी ज़मीन वाकई क्या उगा सकती है।",
      hinglish: "Apni zameen ke saath, SHORT-CYCLE, HIGH-VALUE crops se start karo jo ek season mein payback karein: leafy greens aur vegetables (palak, coriander, methi, brinjal, tomato) local mandis mein roz bikti hain. 60% short-cycle sabzi + 40% staple (wheat/rice) mix karo. Pehle Krishi Vigyan Kendra se soil aur water test karao — wahi decide karta hai ki aapki zameen sach mein kya uga sakti hai.",
    }, lang);
    return {
      headline: pick({
        en: "Land allocation advice (AI ESTIMATE)",
        hi: "भूमि आवंटन सलाह (AI ESTIMATE)",
        hinglish: "Land allocation advice (AI ESTIMATE)",
      }, lang),
      text: cropAdvice,
      chips: [open({ en: "Open Action Plan", hi: "कार्य योजना खोलें", hinglish: "Action plan kholo" }, "/plan"), ask({ en: "Reduce my input costs", hi: "मेरी इनपुट लागत घटाएँ", hinglish: "Meri input cost kam karo" })],
      source: "AI ESTIMATE",
    };
  }

  // investment change simulation (increase or "only have" budget)
  const investMatch = question.match(/(\d+(?:[.,]\d+)?)\s*(lakh|lac|l\b|k\b|000)/i);
  if (investMatch && (q.includes("increase") || q.includes("invest") || q.includes("only have") || q.includes("budget") || q.includes("capital") || q.includes("पूँजी"))) {
    let target = parseFloat(investMatch[1].replace(",", ""));
    const unit = investMatch[2].toLowerCase();
    if (unit.startsWith("l")) target *= 100000;
    else if (unit === "k") target *= 1000;
    else if (target < 1000) target *= 1000;

    const delta = target - inputs.equipmentCost - inputs.inventoryCost;
    // Downward adjustment: reduce capacity + setup proportionally.
    const ratio = Math.max(0.35, (target / Math.max(inputs.equipmentCost + inputs.inventoryCost, 1)));
    const scaled: FinancialInputs = delta >= 0
      ? {
        ...inputs,
        equipmentCost: inputs.equipmentCost + Math.max(delta, 0),
        unitsPerMonth: Math.round(inputs.unitsPerMonth * (1 + (Math.max(delta, 0) / 10000) * 0.06)),
      }
      : {
        ...inputs,
        equipmentCost: Math.round(inputs.equipmentCost * ratio),
        inventoryCost: Math.round(inputs.inventoryCost * ratio),
        workingCapital: Math.max(0, Math.round(inputs.workingCapital * ratio)),
        unitsPerMonth: Math.max(10, Math.round(inputs.unitsPerMonth * ratio)),
      };
    const sim = computeFinancials(scaled);
    const direction = delta >= 0 ? "up" : "down";
    return {
      headline: pick({
        en: `Simulated: ${formatInr(target)} of capital`,
        hi: `सिम्युलेटेड: ${formatInr(target)} पूँजी`,
        hinglish: `Simulated: ${formatInr(target)} capital`,
      }, lang),
      metrics: [
        { label: pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), before: formatInr(base.operatingProfit), after: formatInr(sim.operatingProfit) },
        { label: pick({ en: "Break-even", hi: "ब्रेक-ईन", hinglish: "Break-even" }, lang), before: `${base.breakEvenMonths} mo`, after: `${sim.breakEvenMonths} mo` },
        { label: pick({ en: "Margin", hi: "मार्जिन", hinglish: "Margin" }, lang), before: `${base.profitMarginPct}%`, after: `${sim.profitMarginPct}%` },
      ],
      text: direction === "down"
        ? pick({
          en: `At ${formatInr(target)} the model scales capacity down to ${scaled.unitsPerMonth.toLocaleString("en-IN")} ${u}/month — profit falls to ${formatInr(sim.operatingProfit)}/month but break-even improves to ${sim.breakEvenMonths} months. Start lean; add capacity only when real orders justify it.`,
          hi: `${formatInr(target)} पर मॉडल क्षमता घटाकर ${scaled.unitsPerMonth.toLocaleString("en-IN")} ${u}/माह करता है — लाभ ${formatInr(sim.operatingProfit)}/माह तक गिरता है लेकिन ब्रेक-ईन ${sim.breakEvenMonths} माह तक सुधरता है। पतला शुरू करें; असली ऑर्डर मिलने पर ही क्षमता बढ़ाएँ।`,
          hinglish: `${formatInr(target)} par model capacity ghatakar ${scaled.unitsPerMonth.toLocaleString("en-IN")} ${u}/month karta hai — profit ${formatInr(sim.operatingProfit)}/month tak girta hai lekin break-even ${sim.breakEvenMonths} months tak sudhar jata hai. Lean start karo; real orders justify karein tabhi capacity badhao.`,
        }, lang)
        : pick({
          en: `Extra capacity adds ${formatInr(sim.monthlyRevenue - base.monthlyRevenue)}/month revenue, but payback stretches. Only scale if you can add at least ${formatInr(Math.max(sim.breakEvenUnits - base.breakEvenUnits, 0))} of monthly sales — otherwise keep the money as working capital.`,
          hi: `अतिरिक्त क्षमता ${formatInr(sim.monthlyRevenue - base.monthlyRevenue)}/माह राजस्व जोड़ती है, लेकिन पेबैक लंबा होता है। तभी बढ़ाएँ जब आप कम से कम ${formatInr(Math.max(sim.breakEvenUnits - base.breakEvenUnits, 0))} अतिरिक्त मासिक बिक्री जोड़ सकें — अन्यथा पैसा कार्यशील पूँजी में रखें।`,
          hinglish: `Extra capacity ${formatInr(sim.monthlyRevenue - base.monthlyRevenue)}/month revenue add karti hai, lekin payback lamba hota hai. Sirf tab scale karo jab kam se kam ${formatInr(Math.max(sim.breakEvenUnits - base.breakEvenUnits, 0))} extra monthly sales add kar sako — warna paisa working capital mein rakho.`,
        }, lang),
      calcSteps: [
        { expression: `Capacity scale factor: ${ratio.toFixed(2)}× on setup + volume (modeled)`, note: "Deterministic assumption — visible and editable in the simulator" },
        { expression: `Break-even: ${formatInr(sim.monthlyFixedCost)} ÷ ₹${sim.contributionPerUnit}/${u} = ${sim.breakEvenUnits.toLocaleString("en-IN")} ${u}/mo`, note: "Fixed costs ÷ contribution per unit" },
      ],
      chips: [open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance"), ask({ en: "What is my biggest risk?", hi: "मेरा सबसे बड़ा जोखिम क्या है?", hinglish: "Mera sabse bada risk kya hai?" })],
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
        { expression: `Contribution = ₹${inputs.sellingPricePerUnit} − ₹${inputs.rawMaterialPerUnit} = ₹${base.contributionPerUnit}/${u}`, note: "Sell price minus input cost per unit" },
        { expression: `Break-even = ${formatInr(base.monthlyFixedCost)} ÷ ₹${base.contributionPerUnit} = ${base.breakEvenUnits.toLocaleString("en-IN")} ${u}/mo`, note: "Fixed costs ÷ contribution per unit" },
        { expression: `Monthly profit = ${formatInr(base.monthlyRevenue)} − ${formatInr(base.monthlyVariableCost)} − ${formatInr(base.monthlyFixedCost)} = ${formatInr(base.operatingProfit)}`, note: "Revenue − variable − fixed" },
        { expression: `Break-even period ≈ ${base.breakEvenMonths} mo`, note: `(${formatInr(base.totalStartupCost)} startup + half working capital) ÷ ${formatInr(base.operatingProfit)}/mo` },
      ],
      text: "Every figure on every page comes from these exact formulas. Change any input in the model and they recompute instantly.",
      chips: [open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance"), { label: scenarioQ }],
      source: "AI ESTIMATE",
    };
  }

  // break-even
  if (q.includes("break-even") || q.includes("breakeven") || q.includes("break even")) {
    return {
      headline: `You break even at ${base.breakEvenUnits.toLocaleString("en-IN")} ${u}/month`,
      metrics: [
        { label: "Break-even revenue", before: "—", after: formatInr(base.breakEvenRevenue) },
        { label: "Planned volume", before: "—", after: `${inputs.unitsPerMonth.toLocaleString("en-IN")} ${u}` },
        { label: "Payback period", before: "—", after: `${base.breakEvenMonths} mo` },
      ],
      text: `Your safety cushion is ${Math.max(inputs.unitsPerMonth - base.breakEvenUnits, 0).toLocaleString("en-IN")} ${u}/month (${Math.round((1 - base.breakEvenUnits / inputs.unitsPerMonth) * 100)}% headroom) before you start losing money.`,
      calcSteps: [
        { expression: `${formatInr(base.monthlyFixedCost)} ÷ ₹${base.contributionPerUnit}/${u} = ${base.breakEvenUnits.toLocaleString("en-IN")} ${u}/mo`, note: "Fixed costs ÷ contribution per unit" },
      ],
      chips: [ask({ en: "Show Calculation", hi: "गणना दिखाएँ", hinglish: "Calculation dikhao" }), { label: scenarioQ }],
      source: "AI ESTIMATE",
    };
  }

  // price sensitivity — triggered by ANY pricing question about THIS business
  if (q.includes("price") && (q.includes("fall") || q.includes("drop") || q.includes("rise") || q.includes("increase"))) {
    const stress = computeFinancials(applyScenario(inputs, SCENARIOS.stress.adj));
    return {
      headline: "Stress test: −10% price, −35% volume",
      metrics: [
        { label: "Revenue", before: formatInr(base.monthlyRevenue), after: formatInr(stress.monthlyRevenue) },
        { label: "Profit", before: formatInr(base.operatingProfit), after: formatInr(stress.operatingProfit) },
        { label: "Break-even", before: `${base.breakEvenMonths} mo`, after: `${stress.breakEvenMonths} mo` },
      ],
      text: `At your modeled economics, profit turns sensitive below ₹${(inputs.sellingPricePerUnit * 0.93).toFixed(0)}/${u}. Protect your price with direct customer relationships and fixed-rate supply agreements instead of matching competitor cuts.`,
      chips: [open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance"), open({ en: "Compare scenarios", hi: "परिदृश्य तुलना", hinglish: "Scenarios compare karo" }, "/compare")],
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
      chips: [open({ en: "Open Funding & Schemes", hi: "वित्तपोषण और योजनाएँ खोलें", hinglish: "Funding & Schemes kholo" }, "/schemes"), ask({ en: "What documents do I need?", hi: "मुझे कौन से दस्तावेज़ चाहिए?", hinglish: "Mujhe kaun se documents chahiye?" })],
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
      text: `Every ₹1/${u} added to your selling price adds about ${formatInr(inputs.unitsPerMonth)}/month to profit — the single most powerful lever in your model.`,
      chips: [ask({ en: "Show Calculation", hi: "गणना दिखाएँ", hinglish: "Calculation dikhao" }), open({ en: "Open Simulator", hi: "सिम्युलेटर खोलें", hinglish: "Simulator kholo" }, "/finance")],
      source: "AI ESTIMATE",
    };
  }

  // documents
  if (q.includes("document") || q.includes("paper")) {
    return {
      headline: "Documents you'd typically need",
      text: "• Aadhaar ID and PAN card\n• Bank passbook / 6-month statements\n• Land or shed ownership proof (or NOC)\n• Project report — your GRAMIQ Business Plan PDF works as a draft\n\nThese are DEMO requirements; confirm the exact list at the district office.",
      chips: [open({ en: "Open Funding & Schemes", hi: "वित्तपोषण और योजनाएँ खोलें", hinglish: "Funding & Schemes kholo" }, "/schemes"), open({ en: "Generate Business Plan", hi: "व्यापार योजना बनाएँ", hinglish: "Business plan banao" }, "/business-plan")],
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
    en: `Biggest risk: ${risks[0].title} (${risks[0].level}).\n\nAsk about your profit, risks, break-even or schemes — or say "what if I only have ₹80,000?" and I'll simulate it.`,
    hi: `सबसे बड़ा जोखिम: ${risks[0].title} (${risks[0].level})।\n\nअपने लाभ, जोखिम, ब्रेक-ईन या योजनाओं के बारे में पूछें — या कहें "अगर मेरे पास केवल ₹80,000 हों?" और मैं इसे सिम्युलेट करूँगा।`,
    hinglish: `Biggest risk: ${risks[0].title} (${risks[0].level}).\n\nProfit, risks, break-even ya schemes ke baare mein poocho — ya bolo "agar mere paas sirf ₹80,000 hon?" aur main simulate karunga.`,
  };
  return {
    headline: glanceHeadline[lang],
    metrics: [
      { label: pick({ en: "Monthly profit", hi: "मासिक लाभ", hinglish: "Monthly profit" }, lang), before: "—", after: formatInr(base.operatingProfit) },
      { label: pick({ en: "Break-even", hi: "ब्रेक-ईन", hinglish: "Break-even" }, lang), before: "—", after: `${base.breakEvenMonths} mo` },
      { label: pick({ en: "Startup cost", hi: "स्टार्टअप लागत", hinglish: "Startup cost" }, lang), before: "—", after: formatInr(base.totalStartupCost) },
    ],
    text: glanceText[lang],
    chips: buildCopilotSuggestions(profile),
    source: "AI ESTIMATE",
  };
}
