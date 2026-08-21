/** GRAMIQ core domain types. */

/** Provenance label attached to every data point shown to the user. */
export type DataSource = "VERIFIED SOURCE" | "AI ESTIMATE" | "DEMO DATA";

export interface EntrepreneurProfile {
  name: string;
  location: { state: string; district: string; village: string };
  businessIdea: string;
  capital: number;
  existingBusiness: "none" | "side" | "full";
  experience: "beginner" | "some" | "experienced";
  resources: string[];
  goal: "new-business" | "improve" | "funding" | "finances" | "compare" | "schemes";
  timelineMonths: number;
  language: "hi" | "en" | "hinglish";
}

export interface FinancialInputs {
  /** Working capital held at start (₹) */
  workingCapital: number;
  /** One-time startup costs (₹) */
  equipmentCost: number;
  inventoryCost: number;
  otherSetupCost: number;
  /** Monthly operating costs (₹) */
  rent: number;
  labor: number;
  utilities: number;
  rawMaterialPerUnit: number;
  otherMonthlyCost: number;
  /** Revenue drivers */
  sellingPricePerUnit: number;
  unitsPerMonth: number;
  /** Loan */
  loanAmount: number;
  interestRatePct: number;
  loanTenureMonths: number;
}

export interface FinancialResults {
  totalStartupCost: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  emi: number;
  monthlyRevenue: number;
  grossProfit: number;
  operatingProfit: number;
  profitMarginPct: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenMonths: number;
  roiPct: number;
  cashRunwayMonths: number;
  annualRevenue: number;
  annualProfit: number;
  contributionPerUnit: number;
}

export interface RiskItem {
  id: string;
  category:
    | "Demand"
    | "Cost"
    | "Cash Flow"
    | "Competition"
    | "Operational"
    | "Weather/Environment"
    | "Funding";
  title: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  why: string;
  impact: string;
  mitigation: string;
  source: DataSource;
}

export interface SchemeCriterion {
  label: string;
  met: boolean;
  detail: string;
}

export interface DemoScheme {
  id: string;
  name: string;
  type: "Subsidy" | "Loan" | "Grant" | "Insurance" | "Skill Training";
  sector: string[];
  description: string;
  criteria: {
    location?: string[];
    sectors?: string[];
    maxInvestment?: number;
    minInvestment?: number;
    entrepreneurType?: Array<"new" | "existing">;
    gender?: ("female" | "male")[];
    ageMax?: number;
  };
  documents: string[];
  steps: string[];
  source: { title: string; excerpt: string; lastVerified: string; status: DataSource };
}

export interface SchemeMatch {
  scheme: DemoScheme;
  matchPct: number;
  criteria: SchemeCriterion[];
  missingRequirements: string[];
}

export interface MarketPoi {
  id: string;
  kind: "user" | "market" | "supplier" | "competitor" | "opportunity";
  name: string;
  x: number; // % position on stylized map
  y: number;
  distanceKm: number;
  note: string;
}

export interface ScoreBreakdown {
  key: string;
  label: string;
  score: number;
  explanation: string;
  improvement: string;
}

export interface ActionItem {
  id: string;
  horizon: "7d" | "30d" | "90d" | "1y";
  task: string;
  done: boolean;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  chips?: string[];
  source?: DataSource;
}
