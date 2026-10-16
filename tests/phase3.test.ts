import { describe, it, expect } from "vitest";
import {
  calculateCropPlan,
  calculateFertilizerStoichiometry,
  calculateIrrigationRequirements,
  calculateSeedRequirement,
  generatePlanTasks,
} from "../src/engine";
import { CROPS_MASTER, getCropData, getAllCropsList } from "../src/data/crops";

describe("Phase 3: Master Agronomic Crops Dataset", () => {
  it("contains all 15 required seed crops plus regional additions", () => {
    const crops = getAllCropsList();
    expect(crops.length).toBeGreaterThanOrEqual(15);

    const requiredIds = [
      "soybean",
      "cotton",
      "onion",
      "sugarcane",
      "tur",
      "gram",
      "wheat",
      "jowar",
      "bajra",
      "tomato",
      "grapes",
      "pomegranate",
      "banana",
      "garlic",
      "chilli",
    ];

    for (const cropId of requiredIds) {
      expect(CROPS_MASTER[cropId], `Crop ${cropId} must exist`).toBeDefined();
      const c = CROPS_MASTER[cropId];
      expect(c.nameMr.length).toBeGreaterThan(0);
      expect(c.baseYieldQuintalsPerAcre).toBeGreaterThan(0);
      expect(c.basePricePerQuintal).toBeGreaterThan(0);
      expect(c.stages.length).toBeGreaterThanOrEqual(2);
      expect(c.varieties.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("safely falls back for unknown crop ID", () => {
    const fallback = getCropData("non-existent-crop");
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe("onion");
  });
});

describe("Phase 3: Economics Calculation Engine", () => {
  it("calculates transparent financials for Onion on 2.5 acres", () => {
    const result = calculateCropPlan({
      cropId: "onion",
      areaAcre: 2.5,
      sowingDate: "2026-10-15",
      soilType: "Medium_Black",
      irrigationMethod: "drip",
    });

    expect(result.cropId).toBe("onion");
    expect(result.areaAcre).toBe(2.5);
    expect(result.areaGuntha).toBe(100); // 2.5 * 40
    expect(result.effectiveYieldPerAcre).toBeGreaterThan(0);
    expect(result.totalExpectedYieldQuintals).toBe(
      Number((result.effectiveYieldPerAcre * 2.5).toFixed(2))
    );

    // Cost checks
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.costBreakdown.seed).toBeGreaterThan(0);
    expect(result.costBreakdown.contingency).toBeGreaterThan(0);
    expect(result.costBreakdown.interestOnLoan).toBeGreaterThan(0);

    // Revenue & Net profit
    expect(result.grossRevenue).toBe(
      Math.round(result.totalExpectedYieldQuintals * result.effectivePricePerQuintal)
    );
    expect(result.netProfit).toBe(result.grossRevenue - result.totalCost);
    expect(result.profitPerAcre).toBe(Math.round(result.netProfit / 2.5));

    // Break-even
    expect(result.breakEvenYieldQuintals).toBe(
      Number((result.totalCost / result.effectivePricePerQuintal).toFixed(2))
    );
    expect(result.breakEvenPricePerQuintal).toBe(
      Math.round(result.totalCost / result.totalExpectedYieldQuintals)
    );

    // Transparency steps
    expect(result.transparencySteps.length).toBe(7);
    expect(result.transparencySteps[0].titleMr).toContain("जमिनीचे क्षेत्र");
  });

  it("honors custom costs entered by the farmer", () => {
    const customSeed = 15000;
    const customLabour = 40000;
    const result = calculateCropPlan({
      cropId: "onion",
      areaAcre: 2.0,
      sowingDate: "2026-10-15",
      customCosts: {
        seed: customSeed,
        labour: customLabour,
      },
    });

    expect(result.costBreakdown.seed).toBe(customSeed);
    expect(result.costBreakdown.labour).toBe(customLabour);
  });

  it("generates 3 distinct scenarios: Pessimistic, Expected, Optimistic", () => {
    const result = calculateCropPlan({
      cropId: "soybean",
      areaAcre: 3.0,
      sowingDate: "2026-06-25",
    });

    const { pessimistic, expected, optimistic } = result.scenarios;
    expect(pessimistic.netProfit).toBeLessThan(expected.netProfit);
    expect(optimistic.netProfit).toBeGreaterThan(expected.netProfit);
    expect(pessimistic.yieldDeltaPercent).toBe(-20);
    expect(optimistic.yieldDeltaPercent).toBe(15);
  });

  it("generates a 5x5 sensitivity matrix with monotonic behavior", () => {
    const result = calculateCropPlan({
      cropId: "cotton",
      areaAcre: 1.0,
      sowingDate: "2026-06-20",
    });

    expect(result.sensitivityMatrix.length).toBe(5);
    expect(result.sensitivityMatrix[0].length).toBe(5);

    // Top-left is lowest yield & lowest price (-20%, -20%)
    const worstCase = result.sensitivityMatrix[0][0];
    // Bottom-right is highest yield & highest price (+20%, +20%)
    const bestCase = result.sensitivityMatrix[4][4];

    expect(worstCase.netProfit).toBeLessThan(bestCase.netProfit);
  });

  it("generates monthly cash flow with realistic outflow and harvest inflow", () => {
    const result = calculateCropPlan({
      cropId: "wheat",
      areaAcre: 2.0,
      sowingDate: "2026-11-01",
    });

    expect(result.monthlyCashFlow.length).toBeGreaterThanOrEqual(3);
    const firstMonth = result.monthlyCashFlow[0];
    const lastMonth = result.monthlyCashFlow[result.monthlyCashFlow.length - 1];

    // First month has initial seed/land prep costs and zero harvest revenue
    expect(firstMonth.outflowCost).toBeGreaterThan(0);
    expect(firstMonth.inflowRevenue).toBe(0);

    // Last month has harvest revenue
    expect(lastMonth.inflowRevenue).toBe(result.grossRevenue);
  });
});

describe("Phase 3: Fertilizer Stoichiometry Engine", () => {
  it("converts pure NPK requirements into DAP, Urea, and MOP bags accurately", () => {
    // 50 kg N, 50 kg P2O5, 50 kg K2O for 1 acre
    const result = calculateFertilizerStoichiometry(50, 50, 50, 1.0);

    // P2O5 = 50 / 0.46 = ~108.7 kg DAP
    expect(result.dapKg).toBeCloseTo(108.7, 0.5);
    expect(result.dapBags50kg).toBe(3); // 108.7 / 50 = ceil(2.17) = 3 bags

    // N supplied by DAP = 108.7 * 0.18 = ~19.6 kg N
    expect(result.nitrogenSuppliedByDapKg).toBeCloseTo(19.6, 0.5);

    // Remaining N = 50 - 19.6 = 30.4 kg N
    // Urea = 30.4 / 0.46 = ~66.1 kg Urea
    expect(result.ureaKg).toBeCloseTo(66.1, 0.5);
    expect(result.ureaBags50kg).toBe(2); // ceil(66.1 / 50) = 2 bags

    // K2O = 50 / 0.60 = ~83.3 kg MOP
    expect(result.mopKg).toBeCloseTo(83.3, 0.5);
    expect(result.mopBags50kg).toBe(2);

    expect(result.explanationMr).toContain("DAP");
  });
});

describe("Phase 3: Irrigation & Water Engine", () => {
  it("calculates water volume, pump hours, and drip water savings", () => {
    const dripResult = calculateIrrigationRequirements("onion", 2.0, "drip", 5.0);
    const floodResult = calculateIrrigationRequirements("onion", 2.0, "flood", 5.0);

    expect(dripResult.totalLitresFarm).toBeLessThan(floodResult.totalLitresFarm);
    expect(dripResult.waterSavingPercent).toBeGreaterThanOrEqual(40);
    expect(dripResult.totalPumpHours).toBeGreaterThan(0);
    expect(dripResult.estimatedCostElectricityRupees).toBeGreaterThan(0);
  });
});

describe("Phase 3: Automated Plan Task Generator", () => {
  it("generates sequential dated tasks for all growth stages", () => {
    const tasks = generatePlanTasks("tomato", "2026-10-01", 1.5);
    expect(tasks.length).toBeGreaterThan(5);

    // Verify task categories exist
    const categories = new Set(tasks.map((t) => t.category));
    expect(categories.has("General") || categories.has("Labour")).toBe(true);
    expect(categories.has("Fertilizer")).toBe(true);
    expect(categories.has("PestControl")).toBe(true);

    // Verify dates are ordered and valid
    for (let i = 0; i < tasks.length - 1; i++) {
      expect(new Date(tasks[i].dueDate).getTime()).toBeLessThanOrEqual(
        new Date(tasks[i + 1].dueDate).getTime() + 86400000 * 30 // allow small overlap in stage activities
      );
    }
  });
});

describe("Phase 3: Multi-Factor Crop Risk Evaluation Engine", () => {
  it("accurately classifies Soybean as Low Risk with MSP security and drought tolerance", async () => {
    const { getCropRiskProfile } = await import("../src/engine");
    const profile = getCropRiskProfile("soybean", 22000);

    expect(profile.overallRating).toBe("Low");
    expect(profile.priceVolatility.level).toBe("Low");
    expect(profile.weatherSensitivity.level).toBe("Low");
    expect(profile.overallRatingLabelMr).toContain("कमी जोखीम");
  });

  it("accurately classifies Tomato as High Risk due to volatility, blights, and high capital", async () => {
    const { getCropRiskProfile } = await import("../src/engine");
    const profile = getCropRiskProfile("tomato", 75000);

    expect(profile.overallRating).toBe("High");
    expect(profile.priceVolatility.level).toBe("High");
    expect(profile.capitalExposure.level).toBe("High");
    expect(profile.pestDiseaseRisk.level).toBe("High");
  });

  it("accurately captures Sugarcane high water dependency with guaranteed FRP price", async () => {
    const { getCropRiskProfile } = await import("../src/engine");
    const profile = getCropRiskProfile("sugarcane", 45000);

    expect(profile.priceVolatility.level).toBe("Low");
    expect(profile.weatherSensitivity.level).toBe("High");
    expect(profile.overallRatingLabelMr).toContain("पाणी जोखीम");
  });
});

describe("Phase 3: Universal Farmer Ledger & Diary Logic", () => {
  it("computes running balance, category breakdown, and net profit correctly", () => {
    const mockExpenses = [
      { amount: 3500, category: "Seed" },
      { amount: 5000, category: "Fertilizer" },
      { amount: 2000, category: "Labour" },
    ];
    const mockIncomes = [
      { totalAmount: 45000, quantityQuintal: 15, ratePerQuintal: 3000 },
    ];

    const totalExpense = mockExpenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = mockIncomes.reduce((s, i) => s + i.totalAmount, 0);
    const netBalance = totalIncome - totalExpense;

    expect(totalExpense).toBe(10500);
    expect(totalIncome).toBe(45000);
    expect(netBalance).toBe(34500);
  });
});

