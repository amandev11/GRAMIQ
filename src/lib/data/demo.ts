/**
 * Demo dataset — REALISTIC BUT FICTIONAL.
 * Schemes below are DEMO entries for prototype purposes and must never be
 * presented as real government schemes. Market points are DEMO DATA.
 */
import type { ActionItem, DemoScheme, EntrepreneurProfile, FinancialInputs, MarketPoi } from "@/lib/types";

export const DEMO_PROFILE: EntrepreneurProfile = {
  name: "Ramesh Kumar",
  location: { state: "Rajasthan", district: "Jaipur", village: "Bassi" },
  businessIdea: "Small dairy business — collect milk from local farmers, sell to households and shops",
  capital: 100000,
  existingBusiness: "none",
  experience: "beginner",
  resources: ["Family labor available", "Own cycle for delivery", "Basic shed space"],
  goal: "new-business",
  timelineMonths: 6,
  language: "hi",
};

export const DEMO_FINANCIALS: FinancialInputs = {
  workingCapital: 25000,
  equipmentCost: 42000, // cans, cooler (shared), testing kit
  inventoryCost: 8000,
  otherSetupCost: 5000,
  rent: 0,
  labor: 4000,
  utilities: 1500,
  rawMaterialPerUnit: 38,
  otherMonthlyCost: 1000,
  sellingPricePerUnit: 46,
  unitsPerMonth: 4500, // litres/month
  loanAmount: 0,
  interestRatePct: 10.5,
  loanTenureMonths: 36,
};

/** DEMO schemes — illustrative only. */
export const DEMO_SCHEMES: DemoScheme[] = [
  {
    id: "demo-dairy-development",
    name: "Dairy Entrepreneur Development Assistance",
    type: "Subsidy",
    sector: ["dairy", "animal-husbandry"],
    description:
      "DEMO scheme entry: capital subsidy support for small dairy collection and chilling operations in rural areas.",
    criteria: {
      location: ["rural", "semi-urban"],
      sectors: ["dairy"],
      maxInvestment: 1000000,
      entrepreneurType: ["new", "existing"],
    },
    documents: ["Aadhaar ID", "Bank passbook copy", "Land/shed ownership proof or NOC", "Project report"],
    steps: [
      "Prepare a short project report (GRAMIQ can generate one)",
      "Apply through the district animal husbandry office",
      "Submit bank details and identity documents",
      "Await site verification visit",
    ],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…capital assistance may be considered for dairy collection infrastructure subject to state guidelines…",
      lastVerified: "2026-07-15",
      status: "DEMO DATA",
    },
  },
  {
    id: "demo-micro-credit",
    name: "Micro Business Credit Line (Small Loans)",
    type: "Loan",
    sector: ["any"],
    description:
      "DEMO scheme entry: collateral-free small business loans through partner banks for first-time rural entrepreneurs.",
    criteria: {
      sectors: ["any"],
      maxInvestment: 500000,
      entrepreneurType: ["new", "existing"],
    },
    documents: ["Aadhaar ID", "PAN card", "Bank statements (6 months)", "Simple business plan"],
    steps: [
      "Visit the nearest partner bank branch with documents",
      "Fill the micro-credit application form",
      "Attach the GRAMIQ-generated business plan",
      "Credit appraisal and disbursement",
    ],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…collateral-free credit up to defined limits may be extended to eligible micro-enterprises…",
      lastVerified: "2026-08-01",
      status: "DEMO DATA",
    },
  },
  {
    id: "demo-women-enterprise",
    name: "Women Rural Enterprise Support",
    type: "Grant",
    sector: ["any"],
    description:
      "DEMO scheme entry: grant-cum-training support for women-led rural micro-enterprises and self-help groups.",
    criteria: {
      gender: ["female"],
      entrepreneurType: ["new", "existing"],
    },
    documents: ["Aadhaar ID", "SHG membership proof (if applicable)", "Bank account details"],
    steps: ["Confirm eligibility with block-level office", "Submit application with SHG recommendation", "Attend orientation program"],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…women entrepreneurs may access training and seed support via approved channels…",
      lastVerified: "2026-06-20",
      status: "DEMO DATA",
    },
  },
  {
    id: "demo-food-processing",
    name: "Small Food Processing Unit Support",
    type: "Loan",
    sector: ["food-processing"],
    description:
      "DEMO scheme entry: subsidized project financing for village-level food processing units such as paneer, ghee or packing.",
    criteria: {
      sectors: ["food-processing"],
      minInvestment: 200000,
      maxInvestment: 2000000,
      entrepreneurType: ["new", "existing"],
    },
    documents: ["FSSAI registration", "Project report", "Quotations for machinery", "ID and address proof"],
    steps: [
      "Register the unit concept with the district office",
      "Obtain FSSAI basic registration",
      "Apply with machinery quotations and project report",
    ],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…support for food processing micro-units may include interest subvention components…",
      lastVerified: "2026-05-30",
      status: "DEMO DATA",
    },
  },
  {
    id: "demo-skill-program",
    name: "Rural Entrepreneurship Skill Program",
    type: "Skill Training",
    sector: ["any"],
    description:
      "DEMO scheme entry: free short-term training on bookkeeping, pricing and digital payments for rural entrepreneurs.",
    criteria: { entrepreneurType: ["new", "existing"] },
    documents: ["Aadhaar ID", "Mobile number linked to bank"],
    steps: ["Register at the common service center", "Choose batch timing", "Complete 2-week training"],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…entrepreneurship training modules may be offered free of cost at block-level centers…",
      lastVerified: "2026-07-28",
      status: "DEMO DATA",
    },
  },
  {
    id: "demo-poultry-insurance",
    name: "Livestock & Asset Insurance Cover",
    type: "Insurance",
    sector: ["dairy", "poultry", "animal-husbandry"],
    description:
      "DEMO scheme entry: low-premium insurance for livestock and cold-chain assets against disease and equipment failure.",
    criteria: {
      sectors: ["dairy", "poultry", "animal-husbandry"],
      entrepreneurType: ["new", "existing"],
    },
    documents: ["Asset purchase receipts", "Aadhaar ID", "Bank account"],
    steps: ["List assets to insure", "Get valuation from veterinary/technical officer", "Pay annual premium via bank"],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…livestock insurance products may be available through empanelled insurers…",
      lastVerified: "2026-08-10",
      status: "DEMO DATA",
    },
  },
];

/** Stylized hyper-local map — DEMO DATA positions (% coordinates). */
export const DEMO_MARKET_POIS: MarketPoi[] = [
  { id: "u", kind: "user", name: "Your location (Bassi)", x: 50, y: 52, distanceKm: 0, note: "Home base for collection & dispatch" },
  { id: "m1", kind: "market", name: "Bassi Weekly Market", x: 68, y: 34, distanceKm: 3, note: "High footfall; direct household sales" },
  { id: "m2", kind: "market", name: "Kanota Village Cluster", x: 30, y: 26, distanceKm: 5, note: "~180 households within 4 km" },
  { id: "s1", kind: "supplier", name: "Farmer Collection Point A", x: 40, y: 66, distanceKm: 2, note: "6 small farmers, ~120 L/day" },
  { id: "s2", kind: "supplier", name: "Farmer Collection Point B", x: 62, y: 70, distanceKm: 4, note: "9 small farmers, ~200 L/day" },
  { id: "c1", kind: "competitor", name: "Existing Private Doodhiya", x: 74, y: 58, distanceKm: 6, note: "Established route; sells at ₹47–48/L (DEMO)" },
  { id: "o1", kind: "opportunity", name: "Highway Tea-stall Belt", x: 22, y: 44, distanceKm: 7, note: "12 tea stalls, no formal milk contract" },
];

/** Business idea catalog used by the Comparison Engine (modeled assumptions). */
export interface BizCandidate {
  key: string;
  name: string;
  startupCost: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakEvenMonths: number;
  risk: number; // 1-10 modeled
  demand: number;
  competition: number; // higher = more crowded
  capitalEfficiency: number; // profit per lakh invested (modeled)
  skillRequirement: "Low" | "Medium" | "Moderate-High";
  why: string;
}

export const COMPARISON_CANDIDATES: BizCandidate[] = [
  {
    key: "dairy", name: "Dairy (Collection + Sale)", startupCost: 55000, monthlyRevenue: 207000,
    monthlyProfit: 14200, breakEvenMonths: 6.4, risk: 4, demand: 9, competition: 5,
    capitalEfficiency: 142000 / 100000, skillRequirement: "Low",
    why: "Daily cash flow, steady household demand, uses existing family labor.",
  },
  {
    key: "poultry", name: "Poultry (Broiler Unit)", startupCost: 90000, monthlyRevenue: 168000,
    monthlyProfit: 11000, breakEvenMonths: 11, risk: 7, demand: 8, competition: 6,
    capitalEfficiency: 110000 / 100000, skillRequirement: "Medium",
    why: "Fast production cycles but exposed to feed prices and disease risk.",
  },
  {
    key: "food", name: "Small Food Processing", startupCost: 160000, monthlyRevenue: 240000,
    monthlyProfit: 18500, breakEvenMonths: 14, risk: 5, demand: 8, competition: 4,
    capitalEfficiency: 185000 / 100000, skillRequirement: "Moderate-High",
    why: "Higher margins and value addition, but needs more capital and licensing.",
  },
];

/** Localized action plan — task text follows the user's chosen response language. */
export function getActionPlan(lang: "en" | "hi" | "hinglish"): ActionItem[] {
  // Importing here would create a cycle (strings → nothing → demo, but demo is
  // imported by strings indirectly). To avoid the cycle we inline minimal copies.
  const TASKS: Record<string, string[]> = {
    en: [
      "Talk to 10 households about milk price they pay today",
      "Meet Farmer Collection Points A & B about daily supply",
      "Price milk cans, testing kit and cooling arrangement",
      "Finalize supplier rates and write them into your plan",
      "Open/confirm a current account for business collections",
      "Check eligibility for demo dairy support scheme at district office",
      "Launch pilot route with 40 households",
      "Track daily collections vs wastage; keep spoilage under 2%",
      "Review actual vs planned profit with GRAMIQ copilot",
      "Add value-added products (paneer/curd) if margin allows",
      "Hire one delivery helper during peak months",
      "Re-run stress test and set aside 1 month of costs as buffer",
    ],
    hi: [
      "10 घरों से उनके द्वारा आज दूध मूल्य पूछें",
      "किसान संग्रह बिंदु A और B से दैनिक आपूर्ति मिलें",
      "दूध कैन, टेस्टिंग किट और कूलिंग व्यवस्था का मूल्य लगाएँ",
      "आपूर्तिकर्ता दरें अंतिम करें और उन्हें अपनी योजना में लिखें",
      "व्यापार संग्रह के लिए चालू खाता खोलें/पुष्टि करें",
      "ज़िला कार्यालय में डेयरी सहायता योजना पात्रता जाँचें",
      "40 घरों के साथ पायलट रूट शुरू करें",
      "दैनिक संग्रह बनाम क्षय पर नज़र रखें; खराबी 2% से नीचे रखें",
      "GRAMIQ कोपायलट से वास्तविक बनाम योजनित लाभ समीक्षा करें",
      "यदि मार्जिन अनुमति दे तो मूल्य-वर्धित उत्पाद (पनीर/दही) जोड़ें",
      "चरम माह में एक डिलीवरी सहायक रखें",
      "तनाव परीक्षण दोबारा चलाएँ और 1 माह की लागत बफर रूप में रखें",
    ],
    hinglish: [
      "10 households se unka doodh price pata karo",
      "Farmer Collection Points A & B se daily supply ke baare mein milo",
      "Milk cans, testing kit aur cooling arrangement price lagao",
      "Supplier rates finalize karo aur plan mein likho",
      "Business collections ke liye current account open/confirm karo",
      "District office mein demo dairy support scheme eligibility check karo",
      "40 households ke saath pilot route launch karo",
      "Daily collections vs wastage track karo; spoilage 2% se neeche rakh lo",
      "GRAMIQ copilot se actual vs planned profit review karo",
      "Margin allow kare to value-added products (paneer/curd) add karo",
      "Peak months mein ek delivery helper hire karo",
      "Stress test re-run karo aur 1 month ki cost buffer rakh do",
    ],
  };
  const tasks = TASKS[lang] ?? TASKS.en;
  const horizons: ActionItem["horizon"][] = ["7d", "7d", "7d", "30d", "30d", "30d", "90d", "90d", "90d", "1y", "1y", "1y"];
  return tasks.map((task, i) => ({ id: `a${i + 1}`, horizon: horizons[i], task, done: false }));
}

/** Backwards-compatible default (English). New callers should use getActionPlan(lang). */
export const DEFAULT_ACTION_PLAN: ActionItem[] = getActionPlan("en");
