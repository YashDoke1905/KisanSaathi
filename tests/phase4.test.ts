import { describe, it, expect } from "vitest";
import {
  calculateSellOrWaitDecision,
  calculatePriceTrend,
  CROP_STORAGE_PARAMS,
} from "../src/engine/market";
import { getMandiIntelligence } from "../src/services/mandi/adapter";
import { calculateMandiDistance, MAHARASHTRA_MANDIS, VERIFIED_WAREHOUSES } from "../src/services/mandi/seedData";

describe("Phase 4: Sell-or-Wait Decision Optimizer Engine", () => {
  it("recommends HOLD_STORAGE when projected price increase exceeds storage and shrinkage costs", () => {
    // 50 quintals of Onion at ₹2,000/qtl, 25 km distance, hold 30 days with +14% projected increase
    const result = calculateSellOrWaitDecision({
      cropId: "onion",
      quantityQuintals: 50,
      currentModalPrice: 2000,
      mandiDistanceKm: 25,
      holdingDays: 30,
      projectedPriceChangePercent: 14.0, // Expected seasonal increase
    });

    expect(result.cropId).toBe("onion");
    expect(result.quantityQuintals).toBe(50);
    expect(result.holdingDays).toBe(30);

    // Today's deductions
    expect(result.grossRevenueToday).toBe(100000); // 50 * 2000
    expect(result.transportCostToday).toBeGreaterThan(0);
    expect(result.mandiFeesToday).toBeGreaterThan(0);
    expect(result.hamaliCostToday).toBeGreaterThan(0);
    expect(result.netRevenueToday).toBeLessThan(result.grossRevenueToday);

    // Future economics with shrinkage
    expect(result.effectiveQuantityAfterShrinkage).toBeLessThan(50);
    expect(result.weightLossQuintals).toBeGreaterThan(0);
    expect(result.storageCostTotal).toBeGreaterThan(0);

    // In this case, 14% increase on ₹2000 is +₹280/qtl, while storage + shrinkage is ~₹125/qtl
    expect(result.netGainTotal).toBeGreaterThan(0);
    expect(result.netGainPerQuintal).toBeGreaterThan(50);
    expect(result.recommendation).toBe("HOLD_STORAGE");
    expect(result.recommendationLabelMr).toContain("थांबा व साठवणूक करा");
    expect(result.transparencySteps.length).toBe(5);
  });

  it("recommends SELL_NOW when future price gains do not compensate for storage fees & shrinkage", () => {
    // Highly perishable Tomato held for 30 days (12% shrinkage per month, ₹120 storage)
    const result = calculateSellOrWaitDecision({
      cropId: "tomato",
      quantityQuintals: 30,
      currentModalPrice: 2500,
      mandiDistanceKm: 20,
      holdingDays: 30,
      projectedPriceChangePercent: -5.0, // Falling price during peak arrival
    });

    expect(result.recommendation).toBe("SELL_NOW");
    expect(result.recommendationLabelMr).toContain("आजच");
    expect(result.netGainTotal).toBeLessThan(0);
  });

  it("transparently accounts for transport distance in net-in-hand calculation", () => {
    const near = calculateSellOrWaitDecision({
      cropId: "soybean",
      quantityQuintals: 40,
      currentModalPrice: 4500,
      mandiDistanceKm: 15,
      holdingDays: 15,
    });

    const far = calculateSellOrWaitDecision({
      cropId: "soybean",
      quantityQuintals: 40,
      currentModalPrice: 4500,
      mandiDistanceKm: 120,
      holdingDays: 15,
    });

    expect(far.transportCostToday).toBeGreaterThan(near.transportCostToday);
    expect(near.netRevenueToday).toBeGreaterThan(far.netRevenueToday);
  });
});

describe("Phase 4: Market Price Trend & Moving Average Engine", () => {
  it("detects an upward trend when recent prices rise by 3% or more", () => {
    const sampleHistory = [
      { date: "2026-10-01", minPrice: 1900, modalPrice: 2000, maxPrice: 2100, arrivalTonnes: 50 },
      { date: "2026-10-02", minPrice: 1950, modalPrice: 2050, maxPrice: 2150, arrivalTonnes: 45 },
      { date: "2026-10-03", minPrice: 2000, modalPrice: 2100, maxPrice: 2200, arrivalTonnes: 40 },
      { date: "2026-10-04", minPrice: 2050, modalPrice: 2150, maxPrice: 2250, arrivalTonnes: 38 },
      { date: "2026-10-05", minPrice: 2100, modalPrice: 2200, maxPrice: 2300, arrivalTonnes: 35 },
      { date: "2026-10-06", minPrice: 2150, modalPrice: 2250, maxPrice: 2350, arrivalTonnes: 32 },
      { date: "2026-10-07", minPrice: 2200, modalPrice: 2300, maxPrice: 2400, arrivalTonnes: 30 },
    ];

    const trend = calculatePriceTrend(sampleHistory);
    expect(trend.direction).toBe("UP");
    expect(trend.percentChange7d).toBeGreaterThan(5);
    expect(trend.directionLabelMr).toContain("वाढीचा कल");
    expect(trend.highestPrice).toBe(2300);
    expect(trend.lowestPrice).toBe(2000);
  });

  it("detects a downward trend during heavy market arrival gluts", () => {
    const sampleHistory = [
      { date: "2026-10-01", minPrice: 2500, modalPrice: 2600, maxPrice: 2700, arrivalTonnes: 20 },
      { date: "2026-10-02", minPrice: 2400, modalPrice: 2500, maxPrice: 2600, arrivalTonnes: 35 },
      { date: "2026-10-03", minPrice: 2300, modalPrice: 2400, maxPrice: 2500, arrivalTonnes: 50 },
      { date: "2026-10-04", minPrice: 2200, modalPrice: 2300, maxPrice: 2400, arrivalTonnes: 70 },
      { date: "2026-10-05", minPrice: 2100, modalPrice: 2200, maxPrice: 2300, arrivalTonnes: 90 },
      { date: "2026-10-06", minPrice: 2000, modalPrice: 2100, maxPrice: 2200, arrivalTonnes: 110 },
      { date: "2026-10-07", minPrice: 1900, modalPrice: 2000, maxPrice: 2100, arrivalTonnes: 130 },
    ];

    const trend = calculatePriceTrend(sampleHistory);
    expect(trend.direction).toBe("DOWN");
    expect(trend.percentChange7d).toBeLessThan(-10);
    expect(trend.directionLabelMr).toContain("घसरणीचा कल");
  });
});

describe("Phase 4: Mandi Adapter & Distance Discovery", () => {
  it("calculates realistic distance from farmer district to APMC", () => {
    // Nashik farmer to Lasalgaon APMC (~40-50 km)
    const distLasalgaon = calculateMandiDistance("Nashik", 20.1472, 74.2263);
    expect(distLasalgaon).toBeGreaterThan(30);
    expect(distLasalgaon).toBeLessThan(70);

    // Pune farmer to Gultekdi APMC (< 20 km)
    const distPune = calculateMandiDistance("Pune", 18.4967, 73.8643);
    expect(distPune).toBeLessThan(25);
  });

  it("fetches comprehensive mandi intelligence for Onion in Nashik", async () => {
    const data = await getMandiIntelligence("onion", "Nashik");

    expect(data.cropId).toBe("onion");
    expect(data.stateAverageModalPrice).toBeGreaterThan(1000);
    expect(data.bestMandi).toBeDefined();
    expect(data.nearestMandi).toBeDefined();
    expect(data.allMandis.length).toBeGreaterThanOrEqual(3);
    expect(data.trend7d.points.length).toBe(7);
    expect(data.trend30d.points.length).toBe(30);
    expect(data.trend90d.points.length).toBe(90);
    expect(data.warehousesNearby.length).toBeGreaterThanOrEqual(1);

    // Provenance badge is explicit
    expect(["live", "demo"]).toContain(data.provenance.type);
    expect(data.provenance.sourceText.length).toBeGreaterThan(0);
  });

  it("contains verified WDRA accredited warehouse facilities in Maharashtra", () => {
    expect(VERIFIED_WAREHOUSES.length).toBeGreaterThanOrEqual(5);
    const wdraWarehouses = VERIFIED_WAREHOUSES.filter((w) => w.hasWdraAccreditation);
    expect(wdraWarehouses.length).toBeGreaterThanOrEqual(3);

    for (const wh of VERIFIED_WAREHOUSES) {
      expect(wh.monthlyRatePerQuintal).toBeGreaterThan(0);
      expect(wh.capacityMetricTonnes).toBeGreaterThan(0);
      expect(wh.contactPhone).toBeDefined();
    }
  });
});
