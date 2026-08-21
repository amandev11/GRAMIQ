/**
 * Scheme matching: deterministic eligibility filter first,
 * then explanation. Never claims confirmed eligibility — shows criteria.
 */
import { DEMO_SCHEMES } from "@/lib/data/demo";
import type { EntrepreneurProfile, SchemeMatch } from "@/lib/types";

export function matchSchemes(profile: EntrepreneurProfile, startupCost: number): SchemeMatch[] {
  const results: SchemeMatch[] = DEMO_SCHEMES.map((scheme) => {
    const criteria: SchemeMatch["criteria"] = [];
    const missing: string[] = [];

    // Sector criterion
    if (scheme.criteria.sectors && !scheme.criteria.sectors.includes("any")) {
      const idea = profile.businessIdea.toLowerCase();
      const sectorHit =
        (scheme.criteria.sectors.includes("dairy") && (idea.includes("dairy") || idea.includes("milk"))) ||
        (scheme.criteria.sectors.includes("food-processing") && idea.includes("process")) ||
        (scheme.criteria.sectors.includes("poultry") && idea.includes("poultry"));
      criteria.push({ label: "Business Type", met: sectorHit, detail: `Idea must be in: ${scheme.criteria.sectors.join(", ")}` });
      if (!sectorHit) missing.push("Business idea does not fall under this scheme's sectors");
    }

    // Investment criterion
    if (scheme.criteria.maxInvestment !== undefined) {
      const met = startupCost <= scheme.criteria.maxInvestment;
      criteria.push({ label: "Investment Limit", met, detail: `Startup cost ₹${startupCost.toLocaleString("en-IN")} vs limit ₹${scheme.criteria.maxInvestment.toLocaleString("en-IN")}` });
      if (!met) missing.push(`Startup cost exceeds the ₹${scheme.criteria.maxInvestment.toLocaleString("en-IN")} cap`);
    }
    if (scheme.criteria.minInvestment !== undefined) {
      const met = startupCost >= scheme.criteria.minInvestment;
      criteria.push({ label: "Minimum Investment", met, detail: `Requires at least ₹${scheme.criteria.minInvestment.toLocaleString("en-IN")} project size` });
      if (!met) missing.push(`Project size below ₹${scheme.criteria.minInvestment.toLocaleString("en-IN")} minimum`);
    }

    // Gender criterion
    if (scheme.criteria.gender) {
      const met = scheme.criteria.gender.includes("female");
      criteria.push({ label: "Entrepreneur Type", met, detail: "This demo entry targets women-led enterprises" });
      if (!met) missing.push("Demo entry is oriented to women-led enterprises");
    }

    // Location criterion (always met for rural demo)
    if (scheme.criteria.location) {
      criteria.push({ label: "Location", met: true, detail: `${profile.location.village}, ${profile.location.district} — rural/semi-urban ✓` });
    }

    // Entrepreneur type
    criteria.push({
      label: "Experience Status",
      met: true,
      detail: profile.existingBusiness === "none" ? "New entrepreneur ✓" : "Existing business ✓",
    });

    const metCount = criteria.filter((c) => c.met).length;
    const matchPct = Math.round((metCount / criteria.length) * 100);
    return { scheme, matchPct, criteria, missingRequirements: missing };
  });

  return results.sort((a, b) => b.matchPct - a.matchPct);
}
