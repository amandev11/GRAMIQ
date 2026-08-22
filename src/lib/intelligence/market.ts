/**
 * Hyper-local market intelligence — DERIVED from the entrepreneur's profile
 * and live financial model, so scores move when inputs change.
 * POI positions/distances come from the demo dataset (DEMO DATA);
 * every score here is a labeled AI ESTIMATE with visible drivers.
 */
import { DEMO_MARKET_POIS } from "@/lib/data/demo";
import { roundTo } from "@/lib/finance/engine";
import { L, pick, type Lang } from "@/lib/i18n/strings";
import type { EntrepreneurProfile, FinancialInputs } from "@/lib/types";

const clamp = (n: number) => Math.max(5, Math.min(98, Math.round(n)));

export interface MarketIntel {
  factors: Array<{ factor: string; score: number; driver: string }>;
  overall: number;
  demandSegments: Array<{ seg: string; litres: number; sharePct: number }>;
  reasoning: string[];
}

export function computeMarketIntel(profile: EntrepreneurProfile, f: FinancialInputs): MarketIntel {
  // Demo geography constants (labeled DEMO DATA in UI)
  const suppliers = DEMO_MARKET_POIS.filter((p) => p.kind === "supplier");
  const avgSupplierKm = roundTo(suppliers.reduce((s, p) => s + p.distanceKm, 0) / Math.max(suppliers.length, 1), 1);
  const allKm = DEMO_MARKET_POIS.filter((p) => p.kind !== "user");
  const avgReachKm = roundTo(allKm.reduce((s, p) => s + p.distanceKm, 0) / Math.max(allKm.length, 1), 1);
  const households = 180; // DEMO: within 4 km
  const localCompPrice = 47.5; // DEMO: established seller's price

  const dailyDemandL = f.unitsPerMonth / 26; // ~26 selling days

  const demandScore = clamp(52 + dailyDemandL * 0.9); // volume you can absorb vs local demand
  const competitionScore = clamp(62 + (localCompPrice - f.sellingPricePerUnit) * 12 - f.rawMaterialPerUnit * 0.3);
  const accessibilityScore = clamp(96 - avgReachKm * 4);
  const supplierScore = clamp(102 - avgSupplierKm * 8);
  const reachScore = clamp(42 + households * 0.18 + (f.unitsPerMonth > 4000 ? 6 : 0));
  const logisticsScore = clamp(94 - avgSupplierKm * 4 - (f.labor > 0 ? 2 : 0));

  const lang: Lang = profile.language ?? "en";
  const mf = L.market.factors;
  const factors = [
    { factor: pick(mf.demand, lang), score: demandScore, driver: `${Math.round(dailyDemandL)} L/day planned vs ~${households} households + tea-stall belt` },
    { factor: pick(mf.competition, lang), score: competitionScore, driver: `Your ₹${f.sellingPricePerUnit}/L vs local ₹${localCompPrice}/L` },
    { factor: pick(mf.accessibility, lang), score: accessibilityScore, driver: `Average ${avgReachKm} km to mapped points` },
    { factor: pick(mf.supplier, lang), score: supplierScore, driver: `${suppliers.length} collection points, avg ${avgSupplierKm} km` },
    { factor: pick(mf.reach, lang), score: reachScore, driver: `~${households} households within 4 km` },
    { factor: pick(mf.logistics, lang), score: logisticsScore, driver: `Short cold-chain routes${f.labor > 0 ? ", delivery help budgeted" : ""}` },
  ];

  const overall = clamp(factors.reduce((s, x) => s + x.score, 0) / factors.length);

  return {
    factors,
    overall,
    demandSegments: [
      { seg: pick(L.market.demandSegments.households, lang), litres: Math.round(dailyDemandL * 0.65), sharePct: 65 },
      { seg: pick(L.market.demandSegments.teaStalls, lang), litres: Math.round(dailyDemandL * 0.25), sharePct: 25 },
      { seg: pick(L.market.demandSegments.shops, lang), litres: Math.round(dailyDemandL * 0.10), sharePct: 10 },
    ],
    reasoning: [
      `${profile.location.village} sits ~${avgSupplierKm} km from two farmer collection points — short morning cold-chain routes.`,
      competitionScore >= 55
        ? `At ₹${f.sellingPricePerUnit}/L you undercut the established private seller (₹${localCompPrice}/L DEMO), giving room to win households on freshness plus delivery.`
        : `Your ₹${f.sellingPricePerUnit}/L is at or above the local competitor's price — compete on timing and freshness, not price.`,
      "AI ESTIMATE: capturing 35–40% of nearby household demand covers your planned volume.",
    ],
  };
}
