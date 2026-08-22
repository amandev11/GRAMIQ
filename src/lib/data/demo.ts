/**
 * Demo dataset — REALISTIC BUT FICTIONAL.
 * Schemes below are DEMO entries for prototype purposes and must never be
 * presented as real government schemes. Market points are DEMO DATA.
 */
import type { DemoScheme, EntrepreneurProfile, FinancialInputs, MarketPoi } from "@/lib/types";

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
    id: "demo-agri-input-support",
    name: "Agriculture Input & Irrigation Support",
    type: "Subsidy",
    sector: ["agriculture", "crops"],
    description:
      "DEMO scheme entry: support for seeds, drip irrigation and small farm equipment for smallholder cultivation.",
    criteria: {
      location: ["rural"],
      sectors: ["agriculture", "crops"],
      maxInvestment: 1500000,
      entrepreneurType: ["new", "existing"],
    },
    documents: ["Land record / tenancy proof", "Aadhaar ID", "Bank passbook copy", "Cultivation plan"],
    steps: [
      "Confirm land documents are in order",
      "Apply at the agriculture department's block-level office",
      "Submit cultivation plan and equipment quotations",
      "Await field verification",
    ],
    source: {
      title: "Demo Scheme Database v1 (prototype knowledge base)",
      excerpt: "…input and irrigation assistance may be extended to smallholder cultivators subject to state guidelines…",
      lastVerified: "2026-08-05",
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

/** Localized action plans now derive from the user's actual idea — see
 *  `src/lib/intelligence/action-plan.ts`. Demo Mode builds its dairy plan via
 *  buildActionPlan(DEMO_PROFILE.businessIdea, lang).
 *
 *  Comparison-engine candidates also derive from the user's actual idea +
 *  financial inputs — see `compareBusinesses()` in
 *  `src/lib/intelligence/blueprint.ts`. There is intentionally NO fixed
 *  candidate catalog: every user's comparison is computed from their own
 *  numbers. */
