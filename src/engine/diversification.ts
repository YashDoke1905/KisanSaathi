import {
  SideBusinessDef,
  VERIFIED_SIDE_BUSINESSES,
  WaterNeedLevel,
} from "../data/sideBusinesses";

export interface FarmerDiversificationProfile {
  availableBudget: number; // in INR (e.g. 100000)
  dailyLabourHoursAvailable: number; // e.g. 2.0 to 4.0 hours/day
  waterAvailability: "Scare_Drought" | "Moderate_Well" | "Abundant_Canal" | "Farm_Pond";
  district?: string;
  currentCropsGrown?: string[]; // e.g. ["soybean", "cotton", "onion"]
  hasFarmPond?: boolean;
  hasDairyAnimals?: boolean;
}

export interface RankedEnterpriseResult {
  enterprise: SideBusinessDef;
  totalFitScore: number; // 0 to 100
  profitScore: number;
  capitalFitScore: number;
  waterFitScore: number;
  labourFitScore: number;
  marketDemandScore: number;
  isWithinBudget: boolean;
  netSetupCostWithSubsidy: number;
  effectivePaybackMonthsWithSubsidy: number;
  synergyMatches: {
    title: string;
    descriptionMr: string;
    descriptionEn: string;
    annualSavingsEst: number;
  }[];
  suitabilityTagMr: string;
  suitabilityTagEn: string;
}

export interface IntegratedMonthCashFlow {
  monthIndex: number; // 1-12 (June to May standard Kharif/Rabi cycle)
  monthNameEn: string;
  monthNameMr: string;
  cropOutflow: number;
  cropInflow: number;
  cropNet: number;
  sideBusinessNetInflow: number;
  combinedNet: number;
  cropCumulativeBalance: number;
  combinedCumulativeBalance: number;
  isDeficitInCropOnly: boolean;
  isDeficitProtectedBySideBusiness: boolean;
}

export interface IntegratedFarmPlanSummary {
  enterprise: SideBusinessDef;
  annualCropProfit: number;
  annualSideBusinessProfit: number;
  totalIntegratedAnnualProfit: number;
  profitBoostPercent: number;
  cropDeficitMonthsCount: number;
  diversifiedDeficitMonthsCount: number;
  peakWorkingCapitalDeficitCropOnly: number;
  peakWorkingCapitalDeficitDiversified: number;
  annualBioSynergySavings: number;
  monthlyTimeline: IntegratedMonthCashFlow[];
}

/**
 * Calculates multi-criteria ranking for allied enterprises (Formula 4.10)
 * Score = 0.30*Profit + 0.25*CapitalFit + 0.20*WaterFit + 0.15*LabourFit + 0.10*MarketDemand
 */
export function rankSideBusinesses(
  profile: FarmerDiversificationProfile,
  enterprises: SideBusinessDef[] = VERIFIED_SIDE_BUSINESSES
): RankedEnterpriseResult[] {
  const maxProfitInPool = Math.max(...enterprises.map((e) => e.annualProfit), 1);
  const userBudget = Math.max(10000, profile.availableBudget);
  const budgetCeilingWithFinancing = userBudget * 1.2;

  const results: RankedEnterpriseResult[] = enterprises.map((item) => {
    // 1. Profit Score (0-100) based on annual profit and ROI
    const profitRatio = item.annualProfit / maxProfitInPool;
    const roiFactor = Math.min(1.0, item.roiPercent / 250);
    const profitScore = Math.round((profitRatio * 0.7 + roiFactor * 0.3) * 100);

    // 2. Capital Fit Score (0-100)
    let capitalFitScore = 0;
    if (item.setupCost <= userBudget) {
      capitalFitScore = 100;
    } else if (item.setupCost <= budgetCeilingWithFinancing) {
      // Within 20% margin for subsidized/bank financing
      capitalFitScore = Math.round(
        100 - ((item.setupCost - userBudget) / (budgetCeilingWithFinancing - userBudget)) * 40
      );
    } else {
      // Over budget
      const overRatio = item.setupCost / budgetCeilingWithFinancing;
      capitalFitScore = Math.max(0, Math.round(50 / overRatio));
    }

    // 3. Water Fit Score (0-100)
    let waterFitScore = 80;
    const isPondOnly = item.category === "Fisheries";

    if (isPondOnly) {
      waterFitScore = profile.hasFarmPond || profile.waterAvailability === "Farm_Pond" ? 100 : 20;
    } else if (item.waterNeed === "Zero" || item.waterNeed === "Low") {
      waterFitScore = 100;
    } else if (item.waterNeed === "Medium") {
      waterFitScore =
        profile.waterAvailability === "Scare_Drought"
          ? 50
          : profile.waterAvailability === "Moderate_Well"
            ? 85
            : 100;
    } else if (item.waterNeed === "High") {
      waterFitScore =
        profile.waterAvailability === "Abundant_Canal"
          ? 100
          : profile.waterAvailability === "Moderate_Well"
            ? 60
            : 25;
    }

    // 4. Labour Fit Score (0-100)
    const availableHours = profile.dailyLabourHoursAvailable || 2.0;
    let labourFitScore = 100;
    if (item.dailyLabourHours > availableHours) {
      labourFitScore = Math.max(30, Math.round((availableHours / item.dailyLabourHours) * 100));
    }

    // 5. Market Demand & District Suitability (0-100)
    let marketDemandScore = 75;
    const farmerDistrict = profile.district?.toLowerCase() || "";
    if (
      item.preferredDistricts.includes("all") ||
      item.preferredDistricts.some((d) => d.toLowerCase() === farmerDistrict)
    ) {
      marketDemandScore = 100;
    }

    // Weighted Formula 4.10 from Specification:
    // Score = 0.30*Profit + 0.25*Capital + 0.20*Water + 0.15*Labour + 0.10*Market
    const totalFitScore = Math.round(
      0.3 * profitScore +
        0.25 * capitalFitScore +
        0.2 * waterFitScore +
        0.15 * labourFitScore +
        0.1 * marketDemandScore
    );

    // Subsidy-adjusted economics
    const calculatedSubsidy = Math.min(
      item.setupCost * (item.subsidyPercent / 100),
      item.maxSubsidyAmount
    );
    const netSetupCostWithSubsidy = Math.round(item.setupCost - calculatedSubsidy);
    const effectivePaybackMonthsWithSubsidy = Math.max(
      1,
      Math.round(netSetupCostWithSubsidy / item.expectedMonthlyProfit)
    );

    // Synergy matching with current crops
    const synergyMatches = matchAgroEcologicalSynergies(
      profile.currentCropsGrown || ["soybean", "cotton"],
      item
    );

    // Suitability Badges
    let suitabilityTagMr = "उत्कृष्ट जुळणी (Best Fit)";
    let suitabilityTagEn = "Highly Recommended";
    if (totalFitScore < 60) {
      suitabilityTagMr = "मध्यम जुळणी (Moderate Fit)";
      suitabilityTagEn = "Moderate Fit";
    }
    if (item.setupCost <= userBudget && totalFitScore >= 80) {
      suitabilityTagMr = "⭐ बजेटमध्ये सर्वोत्तम (Top Value)";
      suitabilityTagEn = "Top Budget Fit";
    }

    return {
      enterprise: item,
      totalFitScore,
      profitScore,
      capitalFitScore,
      waterFitScore,
      labourFitScore,
      marketDemandScore,
      isWithinBudget: item.setupCost <= budgetCeilingWithFinancing,
      netSetupCostWithSubsidy,
      effectivePaybackMonthsWithSubsidy,
      synergyMatches,
      suitabilityTagMr,
      suitabilityTagEn,
    };
  });

  // Sort descending by totalFitScore
  return results.sort((a, b) => b.totalFitScore - a.totalFitScore);
}

/**
 * Detects circular bio-economy synergies between the farmer's crops and side-enterprise
 */
export function matchAgroEcologicalSynergies(
  cropsGrown: string[],
  enterprise: SideBusinessDef
): {
  title: string;
  descriptionMr: string;
  descriptionEn: string;
  annualSavingsEst: number;
}[] {
  const matches: {
    title: string;
    descriptionMr: string;
    descriptionEn: string;
    annualSavingsEst: number;
  }[] = [];

  const cropsNormalized = cropsGrown.map((c) => c.toLowerCase());

  // 1. Manure / Compost Synergies (Dairy, Goats, Vermicompost, Poultry)
  if (
    enterprise.category === "Livestock" ||
    enterprise.category === "Poultry" ||
    enterprise.category === "Organic_Inputs"
  ) {
    const hasNutrientHungryCrops = cropsNormalized.some((c) =>
      ["sugarcane", "cotton", "banana", "onion", "grapes", "pomegranate"].includes(c)
    );
    if (hasNutrientHungryCrops) {
      matches.push({
        title: "सेंद्रिय खत बचत (Organic Fertilizer Replacement)",
        descriptionMr: `${enterprise.titleMr.split(" ")[0]} मधून मिळणारे शेण/लेंड्या/कंपोस्ट खत ऊस, कापूस व फळबागांसाठी वापरल्याने रासायनिक खतांचा खर्च ३०-५०% वाचतो.`,
        descriptionEn: `Manure/compost produced directly fertilizes nutrient-intensive crops, cutting external fertilizer bills by 30-50%.`,
        annualSavingsEst: 25000,
      });
    }
  }

  // 2. Crop Residue to Fodder (Soybean, Bajra, Jowar, Maize -> Dairy / Goats)
  if (enterprise.category === "Livestock") {
    const hasFodderCrops = cropsNormalized.some((c) =>
      ["soybean", "jowar", "bajra", "maize", "wheat", "tur"].includes(c)
    );
    if (hasFodderCrops) {
      matches.push({
        title: "मोफत सुका चारा (Free Crop Residue Fodder)",
        descriptionMr: `शेतातील सोयाबीन भुसा, मका/बाजरीचे कडबा जनावरांना सुका चारा म्हणून वापरल्याने विकतच्या चाऱ्याचा खर्च वाचतो.`,
        descriptionEn: `Crop residues (soybean husk, maize stover, bajra kadba) serve as free on-farm fodder.`,
        annualSavingsEst: 18000,
      });
    }
  }

  // 3. Pollination Synergies (Beekeeping -> Orchards & Oilseeds)
  if (enterprise.id === "apiculture-beekeeping") {
    const hasPollinatedCrops = cropsNormalized.some((c) =>
      ["pomegranate", "onion", "mustard", "sunflower", "tomato"].includes(c)
    );
    if (hasPollinatedCrops) {
      matches.push({
        title: "परागीभवन व पीक उत्पादनात २५-३५% वाढ (Pollination Yield Boost)",
        descriptionMr: `मधमाश्यांच्या मुक्त परागीभवनामुळे कांदा बीजोत्पादन, डाळिंब व टोमॅटोच्या फळधारणेत व दर्जात मोठी वाढ होते.`,
        descriptionEn: `Honeybee cross-pollination enhances fruit setting and quality in orchards and seed crops.`,
        annualSavingsEst: 35000,
      });
    }
  }

  // 4. Fish Pond Fertigation (Fisheries in Farm Pond)
  if (enterprise.id === "farm-pond-fisheries") {
    matches.push({
      title: "सेंद्रिय पोषक पाणी (Liquid Fertigation via Shettale)",
      descriptionMr: `माशांच्या विष्ठेने समृद्ध झालेले शेततळ्याचे पाणी ठिबक सिंचनाद्वारे पिकांना दिल्यास विद्राव्य खतांची गरज कमी होते.`,
      descriptionEn: `Fish pond water is rich in organic nitrogen and phosphorus, acting as natural liquid fertigation.`,
      annualSavingsEst: 20000,
    });
  }

  // Default to standard synergies if specific ones not triggered
  if (matches.length === 0 && enterprise.synergies && enterprise.synergies.length > 0) {
    enterprise.synergies.forEach((s) => {
      matches.push({
        title: s.source,
        descriptionMr: s.benefitMr,
        descriptionEn: s.benefitEn,
        annualSavingsEst: s.savingsEstimatedPerYear,
      });
    });
  }

  return matches;
}

/**
 * Calculates a 12-Month Combined Crop + Side-Business Cash Flow Model.
 * Demonstrates how steady monthly side-business income buffers the severe
 * negative pre-harvest cash deficits experienced in crop-only farming!
 */
export function calculateIntegratedCashFlow(
  annualCropProfit: number = 85000,
  cropCultivationCost: number = 65000,
  enterprise: SideBusinessDef = VERIFIED_SIDE_BUSINESSES[0] // Dairy default
): IntegratedFarmPlanSummary {
  const monthNamesMr = [
    "जून (Sowing)",
    "जुलै (Vegetative)",
    "ऑगस्ट (Weeding)",
    "सप्टेंबर (Flowering)",
    "ऑक्टोबर (Harvest 1)",
    "नोव्हेंबर (Rabi Sowing)",
    "डिसेंबर (Growth)",
    "जानेवारी (Irrigation)",
    "फेब्रुवारी (Rabi Harvest)",
    "मार्च (Summer Prep)",
    "एप्रिल (Fallow)",
    "मे (Land Prep)",
  ];

  const monthNamesEn = [
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
  ];

  // Kharif/Rabi typical cash distribution curve (percentage of total cost and revenue)
  // Costs: High in June (30%), July (20%), August (15%), Nov (20%), Dec (10%), Jan (5%)
  // Revenues: Lump sum in October (60% Kharif sale) and February (40% Rabi sale)
  const cropCostMonthlyWeights = [0.3, 0.2, 0.15, 0.05, 0.05, 0.12, 0.08, 0.05, 0.0, 0.0, 0.0, 0.0];
  const cropRevenueMonthlyWeights = [0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.0, 0.0, 0.4, 0.0, 0.0, 0.0];

  const totalCropRevenue = cropCultivationCost + annualCropProfit;
  const monthlyTimeline: IntegratedMonthCashFlow[] = [];

  let cropCumulative = 0;
  let combinedCumulative = 0;
  let cropDeficitMonthsCount = 0;
  let diversifiedDeficitMonthsCount = 0;
  let peakWorkingCapitalDeficitCropOnly = 0;
  let peakWorkingCapitalDeficitDiversified = 0;

  for (let i = 0; i < 12; i++) {
    const cropOutflow = Math.round(cropCultivationCost * cropCostMonthlyWeights[i]);
    const cropInflow = Math.round(totalCropRevenue * cropRevenueMonthlyWeights[i]);
    const cropNet = cropInflow - cropOutflow;

    cropCumulative += cropNet;

    // Side business steady monthly net profit
    const sideNet = enterprise.expectedMonthlyProfit;
    const combinedNet = cropNet + sideNet;

    combinedCumulative += combinedNet;

    const isDeficitInCropOnly = cropCumulative < 0;
    const isDeficitProtectedBySideBusiness = isDeficitInCropOnly && combinedCumulative >= 0;

    if (cropCumulative < 0) {
      cropDeficitMonthsCount++;
      if (Math.abs(cropCumulative) > peakWorkingCapitalDeficitCropOnly) {
        peakWorkingCapitalDeficitCropOnly = Math.abs(cropCumulative);
      }
    }

    if (combinedCumulative < 0) {
      diversifiedDeficitMonthsCount++;
      if (Math.abs(combinedCumulative) > peakWorkingCapitalDeficitDiversified) {
        peakWorkingCapitalDeficitDiversified = Math.abs(combinedCumulative);
      }
    }

    monthlyTimeline.push({
      monthIndex: i + 1,
      monthNameEn: monthNamesEn[i],
      monthNameMr: monthNamesMr[i],
      cropOutflow,
      cropInflow,
      cropNet,
      sideBusinessNetInflow: sideNet,
      combinedNet,
      cropCumulativeBalance: cropCumulative,
      combinedCumulativeBalance: combinedCumulative,
      isDeficitInCropOnly,
      isDeficitProtectedBySideBusiness,
    });
  }

  const annualSideBusinessProfit = enterprise.annualProfit;
  const totalIntegratedAnnualProfit = annualCropProfit + annualSideBusinessProfit;
  const profitBoostPercent = Math.round((annualSideBusinessProfit / annualCropProfit) * 100);

  // Calculate annual biological synergies savings
  const synergies = matchAgroEcologicalSynergies(["soybean", "cotton"], enterprise);
  const annualBioSynergySavings = synergies.reduce((sum, s) => sum + s.annualSavingsEst, 0);

  return {
    enterprise,
    annualCropProfit,
    annualSideBusinessProfit,
    totalIntegratedAnnualProfit,
    profitBoostPercent,
    cropDeficitMonthsCount,
    diversifiedDeficitMonthsCount,
    peakWorkingCapitalDeficitCropOnly,
    peakWorkingCapitalDeficitDiversified,
    annualBioSynergySavings,
    monthlyTimeline,
  };
}
