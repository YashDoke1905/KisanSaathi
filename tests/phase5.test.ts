import { describe, it, expect } from "vitest";
import { VERIFIED_SCHEMES } from "../src/data/schemes";
import {
  evaluateSchemeEligibility,
  evaluateAllSchemes,
  calculateKccCreditLimit,
  STANDARD_DOCUMENTS,
  MAHARASHTRA_SCALE_OF_FINANCE,
  FarmerSchemeProfile,
} from "../src/engine/schemes";

describe("Phase 5: Government Schemes Engine & Eligibility Scanner", () => {
  it("contains at least 20 verified schemes with valid metadata, portals and helplines", () => {
    expect(VERIFIED_SCHEMES.length).toBeGreaterThanOrEqual(20);

    for (const scheme of VERIFIED_SCHEMES) {
      expect(scheme.id).toBeTruthy();
      expect(scheme.titleMr).toBeTruthy();
      expect(scheme.titleEn).toBeTruthy();
      expect(scheme.maxBenefitAmount).toBeGreaterThan(0);
      expect(scheme.officialPortalUrl).toMatch(/^https?:\/\//);
      expect(scheme.helplineNumber).toBeTruthy();
      expect(scheme.requiredDocumentsMr.length).toBeGreaterThan(0);
      expect(scheme.applicationStepsMr.length).toBeGreaterThan(0);
    }
  });

  it("accurately evaluates small/marginal landowner farmer for universal DBT cash schemes", () => {
    const profile: FarmerSchemeProfile = {
      totalLandAcres: 2.5,
      socialCategory: "General",
      isLandOwner: true,
      cropsGrown: ["soybean", "cotton"],
      waterSources: ["Open_Well"],
      hasElectricityConnection: true,
      heldDocumentKeys: ["doc_7_12", "doc_8a", "doc_aadhaar_npci", "doc_bank_passbook"],
    };

    const pmKisan = VERIFIED_SCHEMES.find((s) => s.id === "pm-kisan")!;
    const namoShetkari = VERIFIED_SCHEMES.find((s) => s.id === "namo-shetkari")!;

    const pmKisanEval = evaluateSchemeEligibility(pmKisan, profile);
    const namoEval = evaluateSchemeEligibility(namoShetkari, profile);

    expect(pmKisanEval.status).toBe("Eligible");
    expect(pmKisanEval.scheme.maxBenefitAmount).toBe(6000);
    expect(pmKisanEval.documentReadinessPercent).toBe(100);

    expect(namoEval.status).toBe("Eligible");
    expect(namoEval.scheme.maxBenefitAmount).toBe(6000);
  });

  it("disqualifies tenant/leased farmers without 7/12 land title for ownership-required schemes", () => {
    const tenantProfile: FarmerSchemeProfile = {
      totalLandAcres: 5.0,
      socialCategory: "OBC",
      isLandOwner: false, // Leased land, no 7/12 in own name
      cropsGrown: ["onion", "wheat"],
      waterSources: ["Canal"],
      hasElectricityConnection: true,
      heldDocumentKeys: ["doc_aadhaar_npci", "doc_bank_passbook"],
    };

    const pmKisan = VERIFIED_SCHEMES.find((s) => s.id === "pm-kisan")!;
    const evalResult = evaluateSchemeEligibility(pmKisan, tenantProfile);

    expect(evalResult.status).toBe("Ineligible");
    expect(evalResult.missingCriteriaMr.some((m) => m.includes("सातबारा"))).toBe(true);
    expect(evalResult.missingCriteriaEn.some((m) => m.includes("7/12"))).toBe(true);
  });

  it("enforces affirmative action social category filters (Dr. Ambedkar SC & Birsa Munda ST)", () => {
    const scScheme = VERIFIED_SCHEMES.find(
      (s) => s.id === "ambedkar-krishi-swavalamban"
    )!;
    const stScheme = VERIFIED_SCHEMES.find(
      (s) => s.id === "birsa-munda-kranti"
    )!;

    expect(scScheme).toBeDefined();
    expect(stScheme).toBeDefined();

    // General category farmer
    const generalFarmer: FarmerSchemeProfile = {
      totalLandAcres: 3.0,
      socialCategory: "General",
      isLandOwner: true,
      waterSources: ["Borewell"],
      cropsGrown: ["cotton"],
    };

    const genEvalSc = evaluateSchemeEligibility(scScheme, generalFarmer);
    const genEvalSt = evaluateSchemeEligibility(stScheme, generalFarmer);

    expect(genEvalSc.status).toBe("Ineligible");
    expect(genEvalSt.status).toBe("Ineligible");

    // SC category farmer
    const scFarmer: FarmerSchemeProfile = {
      totalLandAcres: 3.0,
      socialCategory: "SC",
      isLandOwner: true,
      waterSources: ["Open_Well"],
      cropsGrown: ["cotton"],
    };

    const scEval = evaluateSchemeEligibility(scScheme, scFarmer);
    expect(scEval.status).toBe("Eligible");
    expect(scEval.reasonsMr.some((r) => r.includes("अनुसूचित जाती"))).toBe(true);

    // ST category farmer
    const stFarmer: FarmerSchemeProfile = {
      totalLandAcres: 3.0,
      socialCategory: "ST",
      isLandOwner: true,
      waterSources: ["Open_Well"],
      cropsGrown: ["soybean"],
    };

    const stEval = evaluateSchemeEligibility(stScheme, stFarmer);
    expect(stEval.status).toBe("Eligible");
    expect(stEval.reasonsMr.some((r) => r.includes("अनुसूचित"))).toBe(true);
  });

  it("enforces land ceiling limits (e.g. 15 acres ceiling on affirmative action subsidies)", () => {
    const scScheme = VERIFIED_SCHEMES.find(
      (s) => s.id === "ambedkar-krishi-swavalamban"
    )!;

    // SC farmer with 20 acres (exceeds 15.0 acres ceiling)
    const largeScFarmer: FarmerSchemeProfile = {
      totalLandAcres: 20.0,
      socialCategory: "SC",
      isLandOwner: true,
      waterSources: ["Open_Well"],
    };

    const evalResult = evaluateSchemeEligibility(scScheme, largeScFarmer);
    expect(evalResult.status).toBe("Ineligible");
    expect(evalResult.missingCriteriaMr.some((m) => m.includes("कमाल जमीन मर्यादा"))).toBe(
      true
    );
  });

  it("marks crop-targeted schemes as conditional when farmer does not cultivate required crop", () => {
    const kandaChawl = VERIFIED_SCHEMES.find((s) => s.id === "kanda-chawl-subsidy")!;
    expect(kandaChawl).toBeDefined();

    // Farmer growing only wheat and gram (no onion)
    const nonOnionFarmer: FarmerSchemeProfile = {
      totalLandAcres: 4.0,
      socialCategory: "General",
      isLandOwner: true,
      cropsGrown: ["wheat", "gram"],
      waterSources: ["Open_Well"],
      hasElectricityConnection: true,
    };

    const evalNonOnion = evaluateSchemeEligibility(kandaChawl, nonOnionFarmer);
    expect(evalNonOnion.status).toBe("Conditional");
    expect(evalNonOnion.missingCriteriaMr.some((m) => m.includes("कांदा"))).toBe(true);

    // Farmer growing onion
    const onionFarmer: FarmerSchemeProfile = {
      ...nonOnionFarmer,
      cropsGrown: ["onion"],
    };
    const evalOnion = evaluateSchemeEligibility(kandaChawl, onionFarmer);
    expect(evalOnion.status).toBe("Eligible");
  });

  it("computes batch evaluation and summary aggregates correctly", () => {
    const profile: FarmerSchemeProfile = {
      totalLandAcres: 3.5,
      socialCategory: "General",
      isLandOwner: true,
      cropsGrown: ["cotton", "soybean", "onion"],
      waterSources: ["Open_Well", "Borewell"],
      hasElectricityConnection: true,
      heldDocumentKeys: ["doc_7_12", "doc_8a", "doc_aadhaar_npci", "doc_bank_passbook"],
    };

    const { evaluatedSchemes, summary } = evaluateAllSchemes(profile);

    expect(evaluatedSchemes.length).toBe(VERIFIED_SCHEMES.length);
    expect(summary.eligibleCount).toBeGreaterThan(0);
    expect(summary.totalUnlockableBenefit).toBeGreaterThan(100000);
    expect(summary.directCashBenefitYearly).toBe(12000); // PM-KISAN ₹6k + Namo Shetkari ₹6k
    expect(summary.maxCapitalSubsidyOneTime).toBeGreaterThanOrEqual(100000);
  });
});

describe("Phase 5: Kisan Credit Card (KCC) Scale of Finance & Subvention Calculator", () => {
  it("accurately calculates Year 1 credit limit with 10% household and 20% maintenance buffers", () => {
    // 2 acres Cotton (₹35,000/ac) + 1 acre Soybean (₹25,000/ac)
    // Base finance = 2*35000 + 1*25000 = 70000 + 25000 = 95,000
    // 10% Household buffer = 9,500
    // 20% Maintenance buffer = 19,000
    // Total Year 1 Limit = 95,000 + 9,500 + 19,000 = 1,23,500 (130% of base)
    const crops = [
      { cropId: "cotton", areaAcre: 2.0 },
      { cropId: "soybean", areaAcre: 1.0 },
    ];

    const result = calculateKccCreditLimit(crops);

    expect(result.baseCropFinance).toBe(95000);
    expect(result.postHarvestBuffer10Percent).toBe(9500);
    expect(result.farmMaintenanceBuffer20Percent).toBe(19000);
    expect(result.totalYear1CreditLimit).toBe(123500);
    expect(result.totalYear5RevolvingLimit).toBe(Math.round(123500 * 1.4));
  });

  it("applies Maharashtra Dr. Panjabrao Deshmukh 0% interest subvention for loans <= ₹3,00,000", () => {
    const crops = [
      { cropId: "cotton", areaAcre: 2.0 },
      { cropId: "soybean", areaAcre: 1.0 },
    ]; // Year 1 limit = ₹1,23,500 (<= ₹3 Lakh)

    const result = calculateKccCreditLimit(crops);

    expect(result.isMaharashtraZeroPercentEligible).toBe(true);
    expect(result.effectiveInterestRatePercent).toBe(0.0);
    expect(result.annualInterestAtKccRate).toBe(0);
    expect(result.annualSavingsVsCommercial).toBe(result.annualInterestAtCommercialRate);
  });

  it("applies standard 4.0% effective interest rate when KCC loan exceeds ₹3,00,000", () => {
    // 4 acres Sugarcane (₹65,000/ac) + 2 acres Grapes (₹85,000/ac)
    // Base finance = 4*65000 + 2*85000 = 2,60,000 + 1,70,000 = 4,30,000
    // Year 1 Limit = 4,30,000 * 1.3 = 5,59,000 (> ₹3 Lakh)
    const largeCrops = [
      { cropId: "sugarcane", areaAcre: 4.0 },
      { cropId: "grapes", areaAcre: 2.0 },
    ];

    const result = calculateKccCreditLimit(largeCrops);

    expect(result.totalYear1CreditLimit).toBeGreaterThan(300000);
    expect(result.isMaharashtraZeroPercentEligible).toBe(false);
    expect(result.effectiveInterestRatePercent).toBe(4.0);
    expect(result.officialInterestRatePercent).toBe(7.0);
    expect(result.govtInterestSubventionPercent).toBe(3.0);
  });
});

describe("Phase 5: Document Wallet Verification & Readiness Engine", () => {
  it("defines standard 8 Maharashtra agricultural documents with official portals", () => {
    expect(STANDARD_DOCUMENTS.length).toBe(8);

    const docKeys = STANDARD_DOCUMENTS.map((d) => d.key);
    expect(docKeys).toContain("doc_7_12");
    expect(docKeys).toContain("doc_ration_card");
    expect(docKeys).toContain("doc_aadhaar_npci");
    expect(docKeys).toContain("doc_bank_passbook");
    expect(docKeys).toContain("doc_caste_cert");
    expect(docKeys).toContain("doc_e_pik_pahani");
    expect(docKeys).toContain("doc_soil_card");
    expect(docKeys).toContain("doc_electricity_bill");
  });

  it("measures document readiness percentage accurately based on held documents", () => {
    const fullDocProfile: FarmerSchemeProfile = {
      totalLandAcres: 3.0,
      socialCategory: "General",
      isLandOwner: true,
      heldDocumentKeys: [
        "doc_7_12",
        "doc_8a",
        "doc_aadhaar_npci",
        "doc_bank_passbook",
        "doc_e_pik_pahani",
        "doc_soil_card",
        "doc_electricity_bill",
        "doc_caste_cert",
      ],
    };

    const pmKisan = VERIFIED_SCHEMES.find((s) => s.id === "pm-kisan")!;
    const evalFull = evaluateSchemeEligibility(pmKisan, fullDocProfile);
    expect(evalFull.documentReadinessPercent).toBe(100);
    expect(evalFull.missingDocumentsMr.length).toBe(0);

    const noDocProfile: FarmerSchemeProfile = {
      totalLandAcres: 3.0,
      socialCategory: "General",
      isLandOwner: true,
      heldDocumentKeys: [],
    };
    const evalNone = evaluateSchemeEligibility(pmKisan, noDocProfile);
    expect(evalNone.documentReadinessPercent).toBe(0);
    expect(evalNone.missingDocumentsMr.length).toBeGreaterThan(0);
  });
});
