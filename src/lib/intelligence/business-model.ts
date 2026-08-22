/**
 * GRAMIQ Business-Model Layer — the source of truth for "what business is
 * the user actually describing".
 *
 * The user's ORIGINAL IDEA is the canonical analysis input. Everything
 * downstream (financial model, simulator labels, risks, action plan, market
 * intelligence, PDF) derives from the detected model + the idea text itself.
 *
 * All derived numbers are MODELED ASSUMPTIONS (AI ESTIMATE) scaled to the
 * user's stated capital — they are never presented as verified facts.
 */
import type { FinancialInputs } from "@/lib/types";
import type { Lang } from "@/lib/i18n/strings";

export type BusinessModelKey =
  | "dairy"
  | "crops"
  | "livestock"
  | "food-service"
  | "retail"
  | "services"
  | "digital"
  | "generic";

export interface BusinessModel {
  key: BusinessModelKey;
  /** Human-readable family name used in titles. */
  label: string;
  /** Short revenue unit: "L", "kg", "orders", "items", "jobs", "users". */
  unitShort: string;
  /** Long unit name for narrative: "litre", "kilogram", … */
  unitLong: string;
  /** One business-specific "why this works" bullet (tri-lingual). */
  whyPoint: Record<Lang, string>;
  /** Simulator scenario questions generated from THIS business. */
  scenarioQuestions: string[];
  /** Demand segments for market intelligence (tri-lingual). */
  segments: Record<Lang, [string, string, string]>;
  /** Hyper-local map POI names (DEMO DATA positions). */
  pois: { markets: string[]; suppliers: string[]; competitor: string; opportunity: string };
  /** Key assumptions behind the derived financial model (shown as AI ESTIMATE). */
  assumptions: string[];
  /** Derive a deterministic starting financial model from available capital. */
  derive: (capital: number, areaSqft?: number | null) => FinancialInputs;
}

/* ── Idea-text parsing helpers ─────────────────────────────────────────── */

/** Parse an explicit investment amount mentioned inside the idea text. */
export function parseCapitalFromIdea(idea: string): number | null {
  const s = idea.toLowerCase().replace(/,/g, "");
  // "1.5 lakh" / "2 lakh" / "3 lac"
  const lakh = s.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs)/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  // "50000 rupees/₹" or bare "₹50000"
  const abs = s.match(/(?:₹|rs\.?|rupees)\s*(\d{4,9})/) ?? s.match(/(\d{5,9})\s*(?:₹|rs\.?|rupees)/);
  if (abs) return parseInt(abs[1], 10);
  // "50k" / "1.5L"
  const short = s.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (short) return Math.round(parseFloat(short[1]) * 1000);
  return null;
}

const SQFT_PER_UNIT: Array<[RegExp, number]> = [
  [/(\d+(?:,\d+)?)\s*(?:sq\.?\s*ft|sq\.?\s*feet|square\s*feet|sqft|feet|foot)\b/, 1],
  [/(\d+(?:\.\d+)?)\s*acre/, 43560],
  [/(\d+(?:\.\d+)?)\s*bigha/, 27000],
  [/(\d+(?:\.\d+)?)\s*gunta/, 1089],
];

/** Parse land area in sq ft ("1500 feet land", "2 acre", "1 bigha"). */
export function parseLandAreaSqft(idea: string): number | null {
  const s = idea.toLowerCase().replace(/,/g, "");
  for (const [re, mult] of SQFT_PER_UNIT) {
    const m = s.match(re);
    if (m) {
      const v = parseFloat(m[1]);
      if (Number.isFinite(v) && v > 0) return Math.round(v * mult);
    }
  }
  return null;
}

/* ── Detection: keyword scoring across English + common Roman Hindi ────── */

interface Detector {
  key: BusinessModelKey;
  keywords: string[]; // word-boundary matched
}

// Order matters only via score; ties resolve by list order.
const DETECTORS: Detector[] = [
  {
    key: "dairy",
    keywords: ["dairy", "milk", "doodh", "dudh", "paneer", "curd", "dahi", "ghee", "buttermilk", "chaas"],
  },
  {
    key: "livestock",
    keywords: ["poultry", "broiler", "layer farm", "chicken", "murgi", "murghi", "egg", "anda", "goat", "bakri", "fish", "machhli", "machli", "aquaculture", "pig farm", "sheep", "duck", "livestock", "cattle rearing", "animal husbandry"],
  },
  {
    key: "food-service",
    keywords: ["restaurant", "cafe", "café", "coffee shop", "tea stall", "chai stall", "tiffin", "canteen", "dhaba", "food stall", "food truck", "juice", "snack", "sweet shop", "mithai", "bakery", "catering", "thali", "fast food", "cloud kitchen", "kitchen", "eatery", "hotel business"],
  },
  {
    key: "digital",
    keywords: ["saas", "app", "software", "website", "online store", "e-commerce", "ecommerce", "digital", "youtube", "instagram", "tech startup", "coding", "cyber cafe", "csc", "common service center", "typing", "recharge shop", "tutoring online", "online course", "edtech", "freelance", "it service"],
  },
  {
    key: "services",
    keywords: ["laundry", "dry clean", "salon", "beauty parlour", "beauty parlor", "barber", "repair", "servicing", "tailoring", "silai", "photography", "gym", "fitness center", "printing", "xerox", "photocopy", "mechanic", "tutor", "tuition", "coaching", "daycare", "event planning", "wedding service"],
  },
  {
    key: "crops",
    keywords: ["farm", "farming", "kheti", "khet", "fasal", "crop", "vegetable", "sabzi", "sabji", "organic produce", "wheat", "rice", "grain", "orchard", "flower", "nursery", "polyhouse", "greenhouse", "mushroom", "herbs", "spices cultivation", "sericulture", "floriculture", "horticulture", "agriculture", "land and"],
  },
  {
    key: "retail",
    keywords: ["shop", "store", "kirana", "dukaan", "accessories", "boutique", "garment", "clothing", "mobile shop", "general store", "stationery", "hardware", "medical store", "cosmetics", "footwear", "electronics shop", "grocery", "supermarket", "provision store", "retail"],
  },
];

function countHits(ideaLower: string, keywords: string[]): number {
  let hits = 0;
  for (const kw of keywords) {
    if (ideaLower.includes(kw)) hits += kw.includes(" ") ? 2 : 1;
  }
  return hits;
}

export function detectBusinessModelKey(idea: string): BusinessModelKey {
  const s = ` ${idea.toLowerCase()} `;
  let best: BusinessModelKey = "generic";
  let bestScore = 0;
  for (const d of DETECTORS) {
    const score = countHits(s, d.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = d.key;
    }
  }
  return best;
}

/* ── Rounding helper — keeps derived numbers presentable ───────────────── */
const r50 = (n: number) => Math.max(0, Math.round(n / 50) * 50);

/* ── Per-model definitions ─────────────────────────────────────────────── */

const DAIRY: BusinessModel = {
  key: "dairy",
  label: "Dairy (Collection + Sale)",
  unitShort: "L",
  unitLong: "litre",
  whyPoint: {
    en: "Daily cash collection — no long credit cycles like seasonal crop sales.",
    hi: "रोज़ नकद वसूली — मौसमी फसल बिक्री जैसे लंबे क्रेडिट चक्र नहीं।",
    hinglish: "Daily cash collection — seasonal crop sale jaisa long credit cycle nahi.",
  },
  scenarioQuestions: [
    "What if milk price drops 10%?",
    "What if collection cost rises 15%?",
    "What if I supply 20% more litres daily?",
  ],
  segments: {
    en: ["Households", "Tea stalls", "Shops"],
    hi: ["घर", "चाय दुकानें", "दुकानें"],
    hinglish: ["Households", "Chai stalls", "Dukanen"],
  },
  pois: {
    markets: ["Weekly Village Market", "Household Route Cluster"],
    suppliers: ["Farmer Collection Point A", "Farmer Collection Point B"],
    competitor: "Established Private Milk Seller",
    opportunity: "Tea-stall Belt (no milk contract)",
  },
  assumptions: [
    "ASSUMED: buy price ₹38/L, sell price ₹46/L (typical small-route spread — verify locally).",
    "ASSUMED: volume scales with capital (~45 L/month per ₹1,000 invested in route capacity).",
    "ASSUMED: family labor covers delivery; one paid helper budgeted at larger scale.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.2),
    equipmentCost: r50(C * 0.42),
    inventoryCost: r50(C * 0.08),
    otherSetupCost: r50(C * 0.05),
    rent: 0,
    labor: r50(Math.max(3000, C * 0.04)),
    utilities: 1500,
    rawMaterialPerUnit: 38,
    otherMonthlyCost: 1000,
    sellingPricePerUnit: 46,
    unitsPerMonth: r50(Math.max(600, C * 0.045)),
    loanAmount: 0,
    interestRatePct: 10.5,
    loanTenureMonths: 36,
  }),
};

const CROPS: BusinessModel = {
  key: "crops",
  label: "Farming / Crop Cultivation",
  unitShort: "kg",
  unitLong: "kilogram",
  whyPoint: {
    en: "You control the land and inputs — no dependency on outside collection routes.",
    hi: "ज़मीन और इनपुट आपके नियंत्रण में — बाहरी संग्रह रूट पर निर्भरता नहीं।",
    hinglish: "Land aur inputs aapke control mein — kisi outside collection route pe depend nahi.",
  },
  scenarioQuestions: [
    "What if crop selling price falls 10%?",
    "What if yield is 15% lower than expected?",
    "What if input costs rise 20%?",
  ],
  segments: {
    en: ["Local vegetable market", "Weekly haat buyers", "Kirana shops"],
    hi: ["स्थानीय सब्ज़ी मंडी", "साप्ताहिक हाट खरीदार", "किराना दुकानें"],
    hinglish: ["Local sabzi mandi", "Weekly haat buyers", "Kirana shops"],
  },
  pois: {
    markets: ["Local Vegetable Mandi", "Weekly Haat Ground"],
    suppliers: ["Seed & Fertilizer Shop", "Agri Input Center"],
    competitor: "Established Vegetable Grower Cluster",
    opportunity: "Town Hotel & Canteen Belt",
  },
  assumptions: [
    "ASSUMED: net selling price ₹24/kg after middleman margin; input cost ₹14/kg (seed, fertilizer, water).",
    "AREA-BASED: yield modeled at ~1 kg/month per sq ft under intensive vegetable cultivation — adjust for your actual crop and cycle.",
    "ASSUMED: water source available on/near the plot; pump/drip budgeted within equipment cost.",
  ],
  derive: (C, area) => {
    const monthlyKg = area ? Math.max(200, Math.round(area * 1.0)) : Math.max(400, r50(C * 0.015));
    return {
      workingCapital: r50(C * 0.2),
      equipmentCost: r50(C * 0.3), // tools, pump, drip lines
      inventoryCost: r50(C * 0.18), // seeds, fertilizer, manure
      otherSetupCost: r50(C * 0.12), // land prep, bed making
      rent: 0,
      labor: r50(Math.max(2500, C * 0.05)),
      utilities: 800, // water/electricity for irrigation
      rawMaterialPerUnit: 14,
      otherMonthlyCost: 700,
      sellingPricePerUnit: 24,
      unitsPerMonth: r50(monthlyKg),
      loanAmount: 0,
      interestRatePct: 10.5,
      loanTenureMonths: 36,
    };
  },
};

const LIVESTOCK: BusinessModel = {
  key: "livestock",
  label: "Livestock / Poultry Unit",
  unitShort: "kg",
  unitLong: "kilogram",
  whyPoint: {
    en: "Short production cycles mean faster cash rotation than crop farming.",
    hi: "छोटे उत्पादन चक्रों का मतलब फसल खेती से तेज़ नकद रोटेशन है।",
    hinglish: "Short production cycles ka matlab crop farming se faster cash rotation.",
  },
  scenarioQuestions: [
    "What if live-bird prices fall 10%?",
    "What if feed costs rise 15%?",
    "What if disease cuts output 20%?",
  ],
  segments: {
    en: ["Local meat shops", "Weekly haat", "Households (festival demand)"],
    hi: ["स्थानीय मांस की दुकानें", "साप्ताहिक हाट", "घर (त्योहार माँग)"],
    hinglish: ["Local meat shops", "Weekly haat", "Ghar (festival demand)"],
  },
  pois: {
    markets: ["Weekly Livestock Haat", "Town Meat Shop Cluster"],
    suppliers: ["Feed & Chick Supplier", "Veterinary Medicine Center"],
    competitor: "Existing Broiler Farm (larger scale)",
    opportunity: "Festival-season Household Demand Belt",
  },
  assumptions: [
    "ASSUMED: sale price ₹90/kg live weight; chick + feed + medicine cost ₹72/kg.",
    "ASSUMED: batch cycles modeled as steady-state monthly output scaled to capital.",
    "AI ESTIMATE: mortality buffer of 5% included implicitly in output volume.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.22),
    equipmentCost: r50(C * 0.45), // shed, feeders, drinkers
    inventoryCost: r50(C * 0.15), // chicks + first feed batch
    otherSetupCost: r50(C * 0.08),
    rent: 0,
    labor: r50(Math.max(2500, C * 0.05)),
    utilities: 700,
    rawMaterialPerUnit: 72,
    otherMonthlyCost: 900,
    sellingPricePerUnit: 90,
    unitsPerMonth: r50(Math.max(200, C * 0.0045)),
    loanAmount: 0,
    interestRatePct: 10.5,
    loanTenureMonths: 36,
  }),
};

const FOOD_SERVICE: BusinessModel = {
  key: "food-service",
  label: "Food Service (Stall / Café / Tiffin)",
  unitShort: "orders",
  unitLong: "order",
  whyPoint: {
    en: "Daily footfall cash flow with margins protected by portion-cost control.",
    hi: "रोज़ाना फुटफॉल नकदी प्रवाह, पोर्शन-लागत नियंत्रण से मार्जिन सुरक्षित।",
    hinglish: "Rozana footfall cash flow, portion-cost control se margin safe rehta hai.",
  },
  scenarioQuestions: [
    "What if daily customers fall 20%?",
    "What if raw food costs rise 15%?",
    "What if average order value grows 10%?",
  ],
  segments: {
    en: ["Walk-in customers", "Offices / tiffin subscriptions", "Event orders"],
    hi: ["सीधे आने वाले ग्राहक", "ऑफिस / टिफ़िन सब्सक्रिप्शन", "इवेंट ऑर्डर"],
    hinglish: ["Walk-in customers", "Office tiffin subscriptions", "Event orders"],
  },
  pois: {
    markets: ["Main Market Footfall Zone", "College / Office Cluster"],
    suppliers: ["Wholesale Vegetable Market", "Grain & Oil Wholesale Dealer"],
    competitor: "Established Local Eatery",
    opportunity: "Highway / Bus-stand Footfall Belt",
  },
  assumptions: [
    "ASSUMED: average order value ₹70; food + packing cost ₹30/order (43% food cost — industry-typical).",
    "ASSUMED: ~26 selling days/month; volume scales with visibility investment.",
    "ASSUMED: FSSAI registration and basic licenses budgeted in setup cost.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.25),
    equipmentCost: r50(C * 0.35), // counter, stove, vessels, seating
    inventoryCost: r50(C * 0.12),
    otherSetupCost: r50(C * 0.13), // licenses, signage, interior basics
    rent: r50(Math.max(2000, C * 0.06)),
    labor: r50(Math.max(3000, C * 0.06)),
    utilities: 1200,
    rawMaterialPerUnit: 30,
    otherMonthlyCost: 800,
    sellingPricePerUnit: 70,
    unitsPerMonth: r50(Math.max(250, 200 + C * 0.005)),
    loanAmount: 0,
    interestRatePct: 11,
    loanTenureMonths: 36,
  }),
};

const RETAIL: BusinessModel = {
  key: "retail",
  label: "Retail Shop",
  unitShort: "items",
  unitLong: "item",
  whyPoint: {
    en: "Repeat local demand with predictable basket sizes and steady restocking cycles.",
    hi: "दोहरी स्थानीय माँग, अनुमानित बास्केट आकार और स्थिर स्टॉक चक्र।",
    hinglish: "Repeat local demand, predictable basket size aur steady restocking cycle.",
  },
  scenarioQuestions: [
    "What if footfall falls 20%?",
    "What if supplier prices rise 10%?",
    "What if average basket value grows 10%?",
  ],
  segments: {
    en: ["Walk-in customers", "Regular households", "Bulk / wholesale buyers"],
    hi: ["सीधे ग्राहक", "नियमित घर", "थोक खरीदार"],
    hinglish: ["Walk-in customers", "Regular ghar", "Thok buyers"],
  },
  pois: {
    markets: ["Main Shopping Street", "Bus-stand Commercial Belt"],
    suppliers: ["District Wholesale Market", "Brand Distributor Point"],
    competitor: "Existing Shop on Main Route",
    opportunity: "New Residential Colony (no nearby store)",
  },
  assumptions: [
    "ASSUMED: average basket ₹220 with a 25% gross margin (buy ₹165).",
    "ASSUMED: initial inventory is ~30% of capital; fixtures and shop setup the rest.",
    "ASSUMED: rent varies with location tier; adjust in the model editor for accuracy.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.24),
    equipmentCost: r50(C * 0.3), // racks, counters, billing
    inventoryCost: r50(C * 0.3),
    otherSetupCost: r50(C * 0.06),
    rent: r50(Math.max(1500, C * 0.07)),
    labor: C >= 150000 ? r50(C * 0.04) : 0,
    utilities: 900,
    rawMaterialPerUnit: 165,
    otherMonthlyCost: 700,
    sellingPricePerUnit: 220,
    unitsPerMonth: r50(Math.max(120, 120 + C * 0.0024)),
    loanAmount: 0,
    interestRatePct: 12,
    loanTenureMonths: 36,
  }),
};

const SERVICES: BusinessModel = {
  key: "services",
  label: "Service Business",
  unitShort: "jobs",
  unitLong: "job",
  whyPoint: {
    en: "Low inventory risk — your skill and equipment are the main assets.",
    hi: "कम इन्वेंटरी जोखिम — आपका कौशल और उपकरण मुख्य संपत्ति हैं।",
    hinglish: "Inventory risk kam — skill aur equipment hi main asset hain.",
  },
  scenarioQuestions: [
    "What if bookings fall 20%?",
    "What if consumable costs rise 15%?",
    "What if I raise my service price 10%?",
  ],
  segments: {
    en: ["Walk-in bookings", "Home-visit requests", "Monthly regulars"],
    hi: ["सीधे बुकिंग", "घर आकर सेवा अनुरोध", "मासिक नियमित ग्राहक"],
    hinglish: ["Walk-in bookings", "Home-visit requests", "Monthly regulars"],
  },
  pois: {
    markets: ["Main Market Service Lane", "Residential Colony Cluster"],
    suppliers: ["Spare Parts & Consumables Dealer", "Equipment Rental Point"],
    competitor: "Established Local Service Provider",
    opportunity: "Nearby Colony (underserved area)",
  },
  assumptions: [
    "ASSUMED: average job value ₹180 with consumables at ₹45/job.",
    "ASSUMED: owner-operated initially; hired help only at larger scale.",
    "ASSUMED: equipment (machines/tools) takes ~35% of starting capital.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.25),
    equipmentCost: r50(C * 0.35),
    inventoryCost: r50(C * 0.1), // consumables stock
    otherSetupCost: r50(C * 0.05),
    rent: r50(Math.max(1000, C * 0.05)),
    labor: 0,
    utilities: 600,
    rawMaterialPerUnit: 45,
    otherMonthlyCost: 500,
    sellingPricePerUnit: 180,
    unitsPerMonth: r50(Math.max(60, 80 + C * 0.0012)),
    loanAmount: 0,
    interestRatePct: 12,
    loanTenureMonths: 36,
  }),
};

const DIGITAL: BusinessModel = {
  key: "digital",
  label: "Digital / SaaS Venture",
  unitShort: "users",
  unitLong: "subscriber",
  whyPoint: {
    en: "Near-zero marginal cost per additional customer once the product works.",
    hi: "प्रोडक्ट तैयार होने के बाद हर अतिरिक्त ग्राहक पर लगभग शून्य सीमांत लागत।",
    hinglish: "Product ban jane ke baad har extra customer pe near-zero marginal cost.",
  },
  scenarioQuestions: [
    "What if customer acquisition slows 25%?",
    "What if hosting/tool costs rise 20%?",
    "What if pricing increases to ₹399/user?",
  ],
  segments: {
    en: ["Local shop subscribers", "Direct outreach", "Referral network"],
    hi: ["स्थानीय दुकान सब्सक्राइबर", "सीधा संपर्क", "रेफ़रल नेटवर्क"],
    hinglish: ["Local shop subscribers", "Direct outreach", "Referral network"],
  },
  pois: {
    markets: ["Town Business Association", "Nearby Market Committee"],
    suppliers: ["Cloud Hosting Provider", "Payment Gateway Partner"],
    competitor: "Regional Software Vendor",
    opportunity: "Un-digitized Local Trade Belt",
  },
  assumptions: [
    "ASSUMED: subscription price ₹299/user/month; hosting + tools ₹60/user/month.",
    "ASSUMED: acquisition modeled organically (no paid marketing budget at this scale).",
    "ASSUMED: one-time device/setup cost takes ~30–40% of capital at this budget.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.3),
    equipmentCost: r50(Math.max(20000, C * 0.32)), // laptop/device/server deposit
    inventoryCost: 0,
    otherSetupCost: r50(C * 0.1), // incorporation, domain, tooling
    rent: 0,
    labor: r50(C * 0.06), // freelance help budget
    utilities: 500, // internet + power
    rawMaterialPerUnit: 60,
    otherMonthlyCost: 400,
    sellingPricePerUnit: 299,
    unitsPerMonth: r50(Math.max(30, 30 + C * 0.0005)),
    loanAmount: 0,
    interestRatePct: 12,
    loanTenureMonths: 36,
  }),
};

const GENERIC: BusinessModel = {
  key: "generic",
  label: "Small Business",
  unitShort: "units",
  unitLong: "unit",
  whyPoint: {
    en: "A focused small-business model you can refine as real numbers come in.",
    hi: "एक केंद्रित लघु व्यवसाय मॉडल जिसे असली आँकड़े आने पर परिष्कृत किया जा सकता है।",
    hinglish: "Ek focused small-business model — real numbers aane par refine kar sakte ho.",
  },
  scenarioQuestions: [
    "What if selling price falls 10%?",
    "What if input costs rise 15%?",
    "What if sales volume falls 20%?",
  ],
  segments: {
    en: ["Walk-in customers", "Repeat local buyers", "Bulk orders"],
    hi: ["सीधे ग्राहक", "नियमित स्थानीय खरीदार", "थोक ऑर्डर"],
    hinglish: ["Walk-in customers", "Repeat local buyers", "Bulk orders"],
  },
  pois: {
    markets: ["Main Local Market", "Weekly Haat"],
    suppliers: ["Wholesale Supply Point", "District Distributor"],
    competitor: "Established Local Seller",
    opportunity: "Growing Residential Area",
  },
  assumptions: [
    "ASSUMED: generic trading model — avg unit sells at ₹300 vs ₹228 procurement (24% margin).",
    "IMPORTANT: tell GRAMIQ more about your business (what you sell, to whom) for a sharper model.",
  ],
  derive: (C) => ({
    workingCapital: r50(C * 0.24),
    equipmentCost: r50(C * 0.28),
    inventoryCost: r50(C * 0.32),
    otherSetupCost: r50(C * 0.06),
    rent: r50(Math.max(1000, C * 0.05)),
    labor: 0,
    utilities: 800,
    rawMaterialPerUnit: 228,
    otherMonthlyCost: 700,
    sellingPricePerUnit: 300,
    unitsPerMonth: r50(Math.max(80, 100 + C * 0.0025)),
    loanAmount: 0,
    interestRatePct: 11,
    loanTenureMonths: 36,
  }),
};

const MODELS: Record<BusinessModelKey, BusinessModel> = {
  dairy: DAIRY,
  crops: CROPS,
  livestock: LIVESTOCK,
  "food-service": FOOD_SERVICE,
  retail: RETAIL,
  services: SERVICES,
  digital: DIGITAL,
  generic: GENERIC,
};

export function getBusinessModel(key: BusinessModelKey): BusinessModel {
  return MODELS[key] ?? GENERIC;
}

/** Detect + fetch in one step. */
export function detectBusinessModel(idea: string): BusinessModel {
  return getBusinessModel(detectBusinessModelKey(idea));
}

/**
 * Canonical entry point: build the full starting financial model from the
 * user's actual idea text + their stated capital. An amount mentioned inside
 * the idea itself ("…and 1.5 lakh investment") overrides the form field.
 */
export function deriveFinancialsFromIdea(
  idea: string,
  capitalField: number,
): { model: BusinessModel; financials: FinancialInputs; capitalUsed: number; areaSqft: number | null; parsedCapital: boolean } {
  const model = detectBusinessModel(idea);
  const parsed = parseCapitalFromIdea(idea);
  const capitalUsed = parsed && parsed > 0 ? parsed : capitalField > 0 ? capitalField : 100000;
  const areaSqft = parseLandAreaSqft(idea);
  return { model, financials: model.derive(capitalUsed, areaSqft), capitalUsed, areaSqft, parsedCapital: !!parsed };
}
