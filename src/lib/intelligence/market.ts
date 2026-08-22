/**
 * Hyper-local market intelligence — DERIVED from the entrepreneur's profile,
 * detected business model, and live financial model, so scores move when
 * inputs change. POI positions/distances are stylized DEMO DATA; every score
 * here is a labeled AI ESTIMATE with visible drivers.
 */
import { DEMO_MARKET_POIS } from "@/lib/data/demo";
import { detectBusinessModel, type BusinessModel } from "@/lib/intelligence/business-model";
import { roundTo } from "@/lib/finance/engine";
import { L, pick, type Lang } from "@/lib/i18n/strings";
import type { EntrepreneurProfile, FinancialInputs, MarketPoi } from "@/lib/types";

const clamp = (n: number) => Math.max(5, Math.min(98, Math.round(n)));

export interface MarketIntel {
  factors: Array<{ factor: string; score: number; driver: string }>;
  overall: number;
  demandSegments: Array<{ seg: string; units: number; sharePct: number }>;
  reasoning: string[];
}

/** Stylized map POIs renamed for the user's ACTUAL business (positions stay DEMO DATA). */
export function getMarketPois(idea: string): MarketPoi[] {
  const model: BusinessModel = detectBusinessModel(idea);
  return DEMO_MARKET_POIS.map((p, i) => {
    switch (p.kind) {
      case "user":
        return { ...p, name: `Your location` };
      case "market":
        return { ...p, name: model.pois.markets[i % model.pois.markets.length] };
      case "supplier":
        return { ...p, name: model.pois.suppliers[i % model.pois.suppliers.length] };
      case "competitor":
        return { ...p, name: model.pois.competitor };
      case "opportunity":
        return { ...p, name: model.pois.opportunity };
      default:
        return p;
    }
  });
}

export function computeMarketIntel(profile: EntrepreneurProfile, f: FinancialInputs): MarketIntel {
  const lang: Lang = profile.language ?? "en";
  const model = detectBusinessModel(profile.businessIdea);
  const u = model.unitShort;

  // Demo geography constants (labeled DEMO DATA in UI)
  const pois = getMarketPois(profile.businessIdea);
  const suppliers = pois.filter((p) => p.kind === "supplier");
  const avgSupplierKm = roundTo(suppliers.reduce((s, p) => s + p.distanceKm, 0) / Math.max(suppliers.length, 1), 1);
  const allKm = pois.filter((p) => p.kind !== "user");
  const avgReachKm = roundTo(allKm.reduce((s, p) => s + p.distanceKm, 0) / Math.max(allKm.length, 1), 1);
  const demandPoints = 180; // DEMO: mapped demand points within ~7 km
  const localCompPrice = roundTo(f.sellingPricePerUnit * 1.03, 1); // DEMO: established seller priced slightly above

  const dailyDemand = f.unitsPerMonth / 26; // ~26 selling days

  const demandScore = clamp(52 + dailyDemand * 0.9);
  const competitionScore = clamp(62 + (localCompPrice - f.sellingPricePerUnit) * 12 - f.rawMaterialPerUnit * 0.3);
  const accessibilityScore = clamp(96 - avgReachKm * 4);
  const supplierScore = clamp(102 - avgSupplierKm * 8);
  const reachScore = clamp(42 + demandPoints * 0.18 + (f.unitsPerMonth > 3000 ? 6 : 0));
  const logisticsScore = clamp(94 - avgSupplierKm * 4 - (f.labor > 0 ? 2 : 0));

  const mf = L.market.factors;
  const segments = pick(model.segments, lang) as [string, string, string];
  const factors = [
    { factor: pick(mf.demand, lang), score: demandScore, driver: `${Math.round(dailyDemand)} ${u}/day planned vs ~${demandPoints} mapped demand points` },
    { factor: pick(mf.competition, lang), score: competitionScore, driver: `Your ₹${f.sellingPricePerUnit}/${u} vs local ~₹${localCompPrice}/${u} (DEMO)` },
    { factor: pick(mf.accessibility, lang), score: accessibilityScore, driver: `Average ${avgReachKm} km to mapped points` },
    { factor: pick(mf.supplier, lang), score: supplierScore, driver: `${suppliers.length} supplier points, avg ${avgSupplierKm} km` },
    { factor: pick(mf.reach, lang), score: reachScore, driver: `~${demandPoints} demand points within ~7 km (DEMO)` },
    { factor: pick(mf.logistics, lang), score: logisticsScore, driver: `Short supply routes${f.labor > 0 ? ", delivery help budgeted" : ""}` },
  ];

  const overall = clamp(factors.reduce((s, x) => s + x.score, 0) / factors.length);

  return {
    factors,
    overall,
    demandSegments: [
      { seg: segments[0], units: Math.round(dailyDemand * 0.65), sharePct: 65 },
      { seg: segments[1], units: Math.round(dailyDemand * 0.25), sharePct: 25 },
      { seg: segments[2], units: Math.round(dailyDemand * 0.10), sharePct: 10 },
    ],
    reasoning: [
      `${profile.location.village} sits ~${avgSupplierKm} km from mapped supplier points — short input logistics routes.`,
      competitionScore >= 55
        ? `At ₹${f.sellingPricePerUnit}/${u} you price below the established local seller (~₹${localCompPrice}/${u} DEMO), leaving room to win customers on service and reliability.`
        : `Your ₹${f.sellingPricePerUnit}/${u} is at or above the local competitor's price — compete on timing and quality, not price.`,
      `AI ESTIMATE: capturing 35–40% of nearby demand covers your planned ${f.unitsPerMonth.toLocaleString("en-IN")} ${u}/month.`,
    ],
  };
}
