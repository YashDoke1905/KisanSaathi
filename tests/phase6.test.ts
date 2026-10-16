import { describe, it, expect } from "vitest";
import { VERIFIED_SIDE_BUSINESSES } from "../src/data/sideBusinesses";
import {
  rankSideBusinesses,
  calculateIntegratedCashFlow,
  matchAgroEcologicalSynergies,
  FarmerDiversificationProfile,
} from "../src/engine/diversification";

describe("Phase 6: Side-Business & Income Diversification Datasets", () => {
  it("contains at least 10 verified allied enterprise models with positive economics and realistic payback", () => {
    expect(VERIFIED_SIDE_BUSINESSES.length).toBeGreaterThanOrEqual(10);

    for (const ent of VERIFIED_SIDE_BUSINESSES) {
      expect(ent.id).toBeTruthy();
      expect(ent.titleMr).toBeTruthy();
      expect(ent.titleEn).toBeTruthy();
      expect(ent.setupCost).toBeGreaterThan(0);
      expect(ent.expectedMonthlyProfit).toBeGreaterThan(0);
      expect(ent.annualProfit).toBe(ent.expectedMonthlyProfit * 12);
      expect(ent.paybackPeriodMonths).toBeGreaterThan(0);
      expect(ent.paybackPeriodMonths).toBeLessThanOrEqual(24); // Realistic payback within 2 years
      expect(ent.dailyLabourHours).toBeGreaterThan(0);
      expect(ent.dailyLabourHours).toBeLessThanOrEqual(5.0); // Manageable alongside crop farming
      expect(ent.synergies.length).toBeGreaterThanOrEqual(1);
      expect(ent.capitalCostBreakdown.length).toBeGreaterThanOrEqual(2);
      expect(ent.marketChannelsMr.length).toBeGreaterThan(0);
      expect(ent.setupStepsMr.length).toBeGreaterThan(0);
    }
  });

  it("includes all 10 canonical allied templates from the specification", () => {
    const ids = VERIFIED_SIDE_BUSINESSES.map((b) => b.id);
    expect(ids).toContain("dairy-two-cows");
    expect(ids).toContain("goat-farming-osmanabadi");
    expect(ids).toContain("backyard-poultry-desi");
    expect(ids).toContain("farm-pond-fisheries");
    expect(ids).toContain("vermicompost-unit");
    expect(ids).toContain("apiculture-beekeeping");
    expect(ids).toContain("mushroom-oyster-cultivation");
    expect(ids).toContain("custom-hiring-center");
    expect(ids).toContain("mini-dal-mill-processing");
    expect(ids).toContain("high-density-nursery");
  });
});

describe("Phase 6: Multi-Criteria Ranking Scoring Engine (Formula 4.10)", () => {
  it("ranks low-capital options highest for small budget farmers (₹35,000 budget)", () => {
    const smallBudgetFarmer: FarmerDiversificationProfile = {
      availableBudget: 35000,
      dailyLabourHoursAvailable: 2.0,
      waterAvailability: "Moderate_Well",
      district: "Nashik",
      currentCropsGrown: ["soybean", "onion"],
    };

    const ranked = rankSideBusinesses(smallBudgetFarmer);

    expect(ranked.length).toBe(VERIFIED_SIDE_BUSINESSES.length);

    // Top 3 should be within the allowable budget ceiling (₹35,000 * 1.20 = ₹42,000)
    const topOption = ranked[0];
    expect(topOption.isWithinBudget).toBe(true);
    expect(topOption.enterprise.setupCost).toBeLessThanOrEqual(35000 * 1.2);
    expect(["vermicompost-unit", "backyard-poultry-desi", "mushroom-oyster-cultivation"]).toContain(
      topOption.enterprise.id
    );
  });

  it("prioritizes high-earning commercial enterprises for higher budget farmers (₹2,50,000 budget)", () => {
    const commercialFarmer: FarmerDiversificationProfile = {
      availableBudget: 250000,
      dailyLabourHoursAvailable: 3.0,
      waterAvailability: "Moderate_Well",
      district: "Latur",
      currentCropsGrown: ["soybean", "tur"],
    };

    const ranked = rankSideBusinesses(commercialFarmer);

    // Enterprises with setup cost <= ₹2.5L should be marked within budget
    const withinBudget = ranked.filter((r) => r.isWithinBudget);
    expect(withinBudget.length).toBeGreaterThanOrEqual(8);

    // Highest scorers should have solid profit metrics
    expect(ranked[0].totalFitScore).toBeGreaterThanOrEqual(75);
    expect(ranked[0].enterprise.expectedMonthlyProfit).toBeGreaterThan(10000);
  });

  it("correctly penalizes water-intensive enterprises in drought/scarce zones", () => {
    const droughtFarmer: FarmerDiversificationProfile = {
      availableBudget: 150000,
      dailyLabourHoursAvailable: 2.0,
      waterAvailability: "Scare_Drought",
      district: "Solapur",
      currentCropsGrown: ["bajra"],
      hasFarmPond: false,
    };

    const ranked = rankSideBusinesses(droughtFarmer);

    const goatUnit = ranked.find((r) => r.enterprise.id === "goat-farming-osmanabadi")!;
    const fisheryUnit = ranked.find((r) => r.enterprise.id === "farm-pond-fisheries")!;

    expect(goatUnit.waterFitScore).toBe(100); // Low water need = perfect fit in drought
    expect(fisheryUnit.waterFitScore).toBeLessThanOrEqual(25); // Fisheries requires pond
  });

  it("calculates subsidy-adjusted net capital cost and accelerated payback period", () => {
    const farmer: FarmerDiversificationProfile = {
      availableBudget: 100000,
      dailyLabourHoursAvailable: 2.0,
      waterAvailability: "Moderate_Well",
      district: "Nashik",
    };

    const ranked = rankSideBusinesses(farmer);
    const dairy = ranked.find((r) => r.enterprise.id === "dairy-two-cows")!;

    // Dairy: setup ₹1,60,000, 50% subsidy max ₹80,000 -> net setup = ₹80,000
    // Monthly profit = ₹14,500 -> Subsidized payback = Math.round(80000 / 14500) = 6 months
    expect(dairy.netSetupCostWithSubsidy).toBe(80000);
    expect(dairy.effectivePaybackMonthsWithSubsidy).toBe(6);
    expect(dairy.effectivePaybackMonthsWithSubsidy).toBeLessThan(dairy.enterprise.paybackPeriodMonths);
  });
});

describe("Phase 6: Integrated 12-Month Farm Cash Flow Model", () => {
  it("shows how allied side income buffers pre-harvest negative cash deficits", () => {
    const annualCropProfit = 85000;
    const cropCultivationCost = 65000;
    const dairyEnterprise = VERIFIED_SIDE_BUSINESSES.find((b) => b.id === "dairy-two-cows")!;

    const result = calculateIntegratedCashFlow(
      annualCropProfit,
      cropCultivationCost,
      dairyEnterprise
    );

    expect(result.monthlyTimeline.length).toBe(12);

    // In crop-only farming, pre-harvest months (June, July, August) have cash outflows with 0 income
    expect(result.cropDeficitMonthsCount).toBeGreaterThan(0);
    expect(result.peakWorkingCapitalDeficitCropOnly).toBeGreaterThan(0);

    // Adding steady monthly side income (₹14,500/month from dairy) turns deficit months positive!
    expect(result.diversifiedDeficitMonthsCount).toBeLessThan(result.cropDeficitMonthsCount);

    // Check that some months are protected by side business
    const protectedMonths = result.monthlyTimeline.filter(
      (m) => m.isDeficitProtectedBySideBusiness
    );
    expect(protectedMonths.length).toBeGreaterThan(0);

    // Total integrated profit = Crop profit + Enterprise annual profit
    expect(result.totalIntegratedAnnualProfit).toBe(
      annualCropProfit + dairyEnterprise.annualProfit
    );
    expect(result.profitBoostPercent).toBeGreaterThan(100); // More than doubles total household income!
  });
});

describe("Phase 6: Agro-Ecological Bio-Economy Synergies", () => {
  it("matches circular bio-economy loops between crops and livestock", () => {
    const crops = ["soybean", "cotton", "sugarcane"];
    const dairyEnterprise = VERIFIED_SIDE_BUSINESSES.find((b) => b.id === "dairy-two-cows")!;

    const synergies = matchAgroEcologicalSynergies(crops, dairyEnterprise);

    expect(synergies.length).toBeGreaterThanOrEqual(2);

    // Must detect manure fertilizer replacement
    expect(synergies.some((s) => s.title.includes("सेंद्रिय खत"))).toBe(true);

    // Must detect crop residue fodder utilization
    expect(synergies.some((s) => s.title.includes("चारा"))).toBe(true);

    const totalSavings = synergies.reduce((sum, s) => sum + s.annualSavingsEst, 0);
    expect(totalSavings).toBeGreaterThanOrEqual(30000); // At least ₹30,000 saved per year
  });

  it("detects cross-pollination synergy between beekeeping and fruit/seed crops", () => {
    const pollinatedCrops = ["onion", "pomegranate", "sunflower"];
    const beekeeping = VERIFIED_SIDE_BUSINESSES.find((b) => b.id === "apiculture-beekeeping")!;

    const synergies = matchAgroEcologicalSynergies(pollinatedCrops, beekeeping);

    expect(synergies.some((s) => s.title.includes("परागीभवन"))).toBe(true);
    expect(synergies[0].annualSavingsEst).toBeGreaterThanOrEqual(25000);
  });
});
