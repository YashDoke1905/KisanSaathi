import { CROPS_MASTER, getCropData } from "../data/crops";
import {
  CostLineItems,
  MonthlyCashFlow,
  PlannerInput,
  PlannerOutput,
  ScenarioResult,
  SensitivityCell,
  StepExplanation,
} from "./types";

const SOIL_FACTORS: Record<string, number> = {
  Black_Cotton: 1.05,
  Medium_Black: 1.0,
  Loamy: 0.98,
  Red_Sandy: 0.88,
  Laterite: 0.85,
};

const IRRIGATION_FACTORS: Record<string, number> = {
  drip: 1.15, // 15% yield boost from fertigation & moisture control
  sprinkler: 1.05,
  flood: 0.95,
  rainfed: 0.7, // monsoon dependent
};

/**
 * Core Agricultural Economics & Planning Calculation Engine
 */
export function calculateCropPlan(input: PlannerInput): PlannerOutput {
  const crop = getCropData(input.cropId);
  const areaAcre = Math.max(0.1, Number(input.areaAcre || 1.0));

  // Area conversions
  const areaGuntha = Number((areaAcre * 40).toFixed(1));
  const areaHectare = Number((areaAcre * 0.404686).toFixed(2));

  // Dates & Duration
  const sowingDateObj = new Date(input.sowingDate || new Date());
  const avgDuration = Math.round((crop.durationDaysMin + crop.durationDaysMax) / 2);
  const harvestDateObj = new Date(sowingDateObj);
  harvestDateObj.setDate(harvestDateObj.getDate() + avgDuration);

  const sowingDateStr = sowingDateObj.toISOString().split("T")[0];
  const harvestDateStr = harvestDateObj.toISOString().split("T")[0];

  // Variety selection
  const selectedVariety =
    crop.varieties.find((v) => v.id === input.varietyId) || crop.varieties[0];
  const varietyName = selectedVariety ? selectedVariety.name : "Standard High-Yield";

  // Multipliers
  const soilTypeKey = input.soilType || "Medium_Black";
  const soilFactor = SOIL_FACTORS[soilTypeKey] ?? 1.0;

  const irrigationKey = input.irrigationMethod || "drip";
  const irrigationFactor = IRRIGATION_FACTORS[irrigationKey] ?? 1.0;

  let varietyFactor = 1.0;
  if (selectedVariety && crop.baseYieldQuintalsPerAcre > 0) {
    varietyFactor = Number(
      (selectedVariety.yieldPotentialQuintals / crop.baseYieldQuintalsPerAcre).toFixed(2)
    );
    varietyFactor = Math.min(1.25, Math.max(0.9, varietyFactor));
  }

  const weatherRiskFactor = 0.98; // baseline standard seasonal variation

  const combinedFactor = Number(
    (soilFactor * irrigationFactor * varietyFactor * weatherRiskFactor).toFixed(3)
  );

  // Yield Calculation
  const baseYieldPerAcre = crop.baseYieldQuintalsPerAcre;
  const effectiveYieldPerAcre = input.customYieldQuintalsPerAcre
    ? Number(input.customYieldQuintalsPerAcre)
    : Number((baseYieldPerAcre * combinedFactor).toFixed(2));

  const totalExpectedYieldQuintals = Number(
    (effectiveYieldPerAcre * areaAcre).toFixed(2)
  );

  // Price Calculation
  const basePricePerQuintal = crop.basePricePerQuintal;
  const effectivePricePerQuintal = input.customPricePerQuintal
    ? Number(input.customPricePerQuintal)
    : basePricePerQuintal;

  // Cost Line Items
  const baseCosts = crop.baseCostsPerAcre;
  const custom = input.customCosts || {};

  const seedCost =
    custom.seed !== undefined
      ? custom.seed
      : Math.round(crop.seedRateKgPerAcre * crop.seedCostPerKg * areaAcre);

  const seedTreatmentCost =
    custom.seedTreatment !== undefined
      ? custom.seedTreatment
      : Math.round(baseCosts.seedTreatment * areaAcre);

  const landPrepCost =
    custom.landPrep !== undefined
      ? custom.landPrep
      : Math.round(baseCosts.landPrep * areaAcre);

  const fertilizersCost =
    custom.fertilizers !== undefined
      ? custom.fertilizers
      : Math.round(baseCosts.fertilizers * areaAcre);

  const pesticidesCost =
    custom.pesticides !== undefined
      ? custom.pesticides
      : Math.round(baseCosts.pesticides * areaAcre);

  const irrigationEnergyCost =
    custom.irrigationEnergy !== undefined
      ? custom.irrigationEnergy
      : Math.round(baseCosts.irrigationEnergy * areaAcre);

  const labourCost =
    custom.labour !== undefined
      ? custom.labour
      : Math.round(baseCosts.labour * areaAcre);

  const machineryRentalCost =
    custom.machineryRental !== undefined
      ? custom.machineryRental
      : Math.round(baseCosts.machineryRental * areaAcre);

  const harvestingCost =
    custom.harvesting !== undefined
      ? custom.harvesting
      : Math.round(baseCosts.harvesting * areaAcre);

  const transportCost =
    custom.transport !== undefined
      ? custom.transport
      : Math.round(baseCosts.transport * areaAcre);

  const marketFeesCost =
    custom.marketFees !== undefined
      ? custom.marketFees
      : Math.round(baseCosts.marketFees * areaAcre);

  const insuranceCost =
    custom.insurance !== undefined
      ? custom.insurance
      : Math.round(baseCosts.insurance * areaAcre);

  // Subtotal before finance & contingency
  const operationalSubtotal =
    seedCost +
    seedTreatmentCost +
    landPrepCost +
    fertilizersCost +
    pesticidesCost +
    irrigationEnergyCost +
    labourCost +
    machineryRentalCost +
    harvestingCost +
    transportCost +
    marketFeesCost +
    insuranceCost;

  // Interest on borrowed working capital (KCC / loan)
  const borrowedPercent = input.borrowedCapitalPercent ?? 50.0; // 50% borrowed default
  const annualInterestRate = input.annualInterestRatePercent ?? 7.0; // 7% KCC rate default
  const durationFractionOfYear = avgDuration / 365;
  const loanPrincipal = operationalSubtotal * (borrowedPercent / 100);
  const interestOnLoan = Math.round(
    loanPrincipal * (annualInterestRate / 100) * durationFractionOfYear
  );

  // 5% Contingency Buffer for unexpected weather or pest spikes
  const contingency = Math.round((operationalSubtotal + interestOnLoan) * 0.05);

  const costBreakdown: CostLineItems = {
    seed: seedCost,
    seedTreatment: seedTreatmentCost,
    landPrep: landPrepCost,
    fertilizers: fertilizersCost,
    pesticides: pesticidesCost,
    irrigationEnergy: irrigationEnergyCost,
    labour: labourCost,
    machineryRental: machineryRentalCost,
    harvesting: harvestingCost,
    transport: transportCost,
    marketFees: marketFeesCost,
    insurance: insuranceCost,
    interestOnLoan,
    contingency,
  };

  const totalCost = operationalSubtotal + interestOnLoan + contingency;
  const costPerAcre = Math.round(totalCost / areaAcre);

  // Revenue & Profits
  const grossRevenue = Math.round(totalExpectedYieldQuintals * effectivePricePerQuintal);
  const netProfit = grossRevenue - totalCost;
  const roiPercent = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;
  const profitPerAcre = Math.round(netProfit / areaAcre);
  const profitPerDay = avgDuration > 0 ? Math.round(netProfit / avgDuration) : 0;

  // Break-even metrics
  const breakEvenYieldQuintals =
    effectivePricePerQuintal > 0
      ? Number((totalCost / effectivePricePerQuintal).toFixed(2))
      : 0;

  const breakEvenPricePerQuintal =
    totalExpectedYieldQuintals > 0
      ? Math.round(totalCost / totalExpectedYieldQuintals)
      : 0;

  // Labour days
  const totalLabourDays = Math.round(
    crop.stages.reduce((acc, s) => acc + s.labourDaysPerAcre, 0) * areaAcre
  );
  const totalLabourHours = totalLabourDays * 8;

  // Water requirements
  const waterReqMm = crop.waterReqMm;
  const waterReqLitresPerAcre = Math.round(crop.waterReqMm * 4047);

  // 3 Scenarios: Pessimistic (-20% yield, -15% price), Expected, Optimistic (+15% yield, +15% price)
  const scenarios = {
    pessimistic: createScenario(
      "Pessimistic",
      "प्रतिकूल परिस्थिती (Pessimistic)",
      "प्रतिकूल स्थिति",
      effectiveYieldPerAcre,
      effectivePricePerQuintal,
      areaAcre,
      totalCost,
      -20,
      -15
    ),
    expected: createScenario(
      "Expected",
      "अपेक्षित परिस्थिती (Expected)",
      "अपेक्षित स्थिति",
      effectiveYieldPerAcre,
      effectivePricePerQuintal,
      areaAcre,
      totalCost,
      0,
      0
    ),
    optimistic: createScenario(
      "Optimistic",
      "अनुकूल परिस्थिती (Optimistic)",
      "अनुकूल स्थिति",
      effectiveYieldPerAcre,
      effectivePricePerQuintal,
      areaAcre,
      totalCost,
      15,
      15
    ),
  };

  // 5x5 Sensitivity Matrix
  const yieldDeltas = [-20, -10, 0, 10, 20];
  const priceDeltas = [-20, -10, 0, 10, 20];

  const sensitivityMatrix: SensitivityCell[][] = yieldDeltas.map((yDelta) => {
    return priceDeltas.map((pDelta) => {
      const adjYield = effectiveYieldPerAcre * (1 + yDelta / 100);
      const adjPrice = effectivePricePerQuintal * (1 + pDelta / 100);
      const totalAdjYield = adjYield * areaAcre;
      const simRevenue = totalAdjYield * adjPrice;
      const simProfit = Math.round(simRevenue - totalCost);
      const simRoi = totalCost > 0 ? Number(((simProfit / totalCost) * 100).toFixed(1)) : 0;

      return {
        yieldDeltaPercent: yDelta,
        priceDeltaPercent: pDelta,
        adjustedYieldPerAcre: Number(adjYield.toFixed(2)),
        adjustedPricePerQuintal: Math.round(adjPrice),
        netProfit: simProfit,
        roiPercent: simRoi,
        isProfitable: simProfit > 0,
      };
    });
  });

  // Monthly Cash Flow Schedule
  const monthlyCashFlow = generateMonthlyCashFlow(
    sowingDateObj,
    avgDuration,
    costBreakdown,
    grossRevenue
  );

  // Plain-Language Transparency Steps
  const transparencySteps: StepExplanation[] = [
    {
      stepNumber: 1,
      titleEn: "Land Area & Crop Duration",
      titleMr: "जमिनीचे क्षेत्र व पिकाचा कालावधी",
      formula: "Area = Acre × 40 Guntha; Duration = Sowing to Maturity Days",
      inputsDesc: `${areaAcre} एकर (${areaGuntha} गुंठे) जमीन. पेरणी तारीख: ${sowingDateStr}, काढणी तारीख: ${harvestDateStr}. कालावधी: ${avgDuration} दिवस.`,
      calculatedValue: `${avgDuration} दिवस (${areaGuntha} गुंठे)`,
      sourceNote: "जमीन सातबारा नोंद व कृषी विद्यापीठ पीक मार्गदर्शिका",
    },
    {
      stepNumber: 2,
      titleEn: "Agronomic Multipliers",
      titleMr: "हवामान, माती व ठिबक सिंचन गुणांक",
      formula: "Combined Factor = F_soil × F_irrigation × F_variety × F_weather",
      inputsDesc: `माती (${soilTypeKey}): ${soilFactor}× | सिंचन (${irrigationKey}): ${irrigationFactor}× | वाण (${varietyName}): ${varietyFactor}× | हवामान जोखीम: ${weatherRiskFactor}×`,
      calculatedValue: `${combinedFactor}× एकूण उत्पादन गुणांक`,
      sourceNote: "ICAR & MPKV पॅकेज ऑफ प्रॅक्टिसेस संशोधन",
    },
    {
      stepNumber: 3,
      titleEn: "Expected Farm Yield",
      titleMr: "अपेक्षित एकूण उत्पादन हिशोब",
      formula: "Total Yield = Base Yield × Combined Multiplier × Area",
      inputsDesc: `${baseYieldPerAcre} क्विंटल पायाभूत उतारा × ${combinedFactor} गुणांक = ${effectiveYieldPerAcre} क्विंटल/एकर. एकूण ${areaAcre} एकर जमीन.`,
      calculatedValue: `${totalExpectedYieldQuintals} क्विंटल एकूण उत्पादन`,
      sourceNote: "महाराष्ट्र राज्य कृषी विद्यापीठ सरासरी उत्पादन क्षमता",
    },
    {
      stepNumber: 4,
      titleEn: "Total Cost of Cultivation (12 items + Contingency)",
      titleMr: "उत्पादन खर्च हिशोब (१२ घटक + ५% आकस्मिक खर्च)",
      formula: "Total Cost = Operational Subtotal + Loan Interest + 5% Contingency",
      inputsDesc: `बियाणे (₹${seedCost}) + खते (₹${fertilizersCost}) + औषधे (₹${pesticidesCost}) + मजुरी (₹${labourCost}) + नांगरणी/काढणी/वाहतूक (₹${landPrepCost + harvestingCost + transportCost}) + केसीसी व्याज (₹${interestOnLoan}) + ५% बफर (₹${contingency})`,
      calculatedValue: `₹${totalCost.toLocaleString("en-IN")} एकूण खर्च (₹${costPerAcre.toLocaleString("en-IN")}/एकर)`,
      sourceNote: "नाबार्ड व कृषी खर्च आणि मूल्य आयोग (CACP) दर प्रमाणके",
    },
    {
      stepNumber: 5,
      titleEn: "Gross Market Revenue",
      titleMr: "अपेक्षित एकूण उत्पन्न (बाजारभाव)",
      formula: "Revenue = Total Expected Yield (Qtl) × Expected Price (₹/Qtl)",
      inputsDesc: `${totalExpectedYieldQuintals} क्विंटल उत्पादन × ₹${effectivePricePerQuintal.toLocaleString("en-IN")} प्रति क्विंटल बाजारभाव.`,
      calculatedValue: `₹${grossRevenue.toLocaleString("en-IN")} एकूण उत्पन्न`,
      sourceNote: "अगमार्कनेट (Agmarknet) ३ वर्षांची सरासरी बाजारभाव आकडेवारी",
    },
    {
      stepNumber: 6,
      titleEn: "Net Profit & Return on Investment (ROI)",
      titleMr: "निव्वळ नफा व परतावा दर (ROI %)",
      formula: "Net Profit = Gross Revenue - Total Cost; ROI % = (Net Profit / Total Cost) × 100",
      inputsDesc: `उत्पन्न ₹${grossRevenue.toLocaleString("en-IN")} वजा खर्च ₹${totalCost.toLocaleString("en-IN")}. निव्वळ शिल्लक नफा = ₹${netProfit.toLocaleString("en-IN")}.`,
      calculatedValue: `₹${netProfit.toLocaleString("en-IN")} निव्वळ नफा (${roiPercent}% नफा परतावा)`,
      sourceNote: "पारदर्शक आर्थिक मॉडेल (शून्य छुपा खर्च)",
    },
    {
      stepNumber: 7,
      titleEn: "Break-Even Safety Points",
      titleMr: "सुरक्षितता मर्यादा (तोटा न होण्यासाठी किमान गरज)",
      formula: "Break-Even Price = Total Cost / Total Yield; Break-Even Yield = Total Cost / Expected Price",
      inputsDesc: `खर्च भरून निघण्यासाठी किमान ₹${breakEvenPricePerQuintal.toLocaleString("en-IN")}/क्विंटल भाव मिळणे आवश्यक आहे. किंवा एकूण ${breakEvenYieldQuintals} क्विंटल उत्पादन निघणे गरजेचे आहे.`,
      calculatedValue: `किमान भाव: ₹${breakEvenPricePerQuintal}/क्विंटल | किमान उत्पादन: ${breakEvenYieldQuintals} क्विंटल`,
      sourceNote: "शेतकरी जोखीम व्यवस्थापन सूत्र",
    },
  ];

  return {
    cropId: crop.id,
    cropNameEn: crop.nameEn,
    cropNameMr: crop.nameMr,
    cropNameHi: crop.nameHi,
    varietyName,
    sowingDate: sowingDateStr,
    harvestDate: harvestDateStr,
    durationDays: avgDuration,
    areaAcre,
    areaGuntha,
    areaHectare,
    soilType: soilTypeKey,
    irrigationMethod: irrigationKey as any,

    multipliers: {
      soilFactor,
      irrigationFactor,
      varietyFactor,
      weatherRiskFactor,
      combinedFactor,
    },

    baseYieldPerAcre,
    effectiveYieldPerAcre,
    totalExpectedYieldQuintals,
    basePricePerQuintal,
    effectivePricePerQuintal,

    costBreakdown,
    totalCost,
    costPerAcre,
    grossRevenue,
    netProfit,
    roiPercent,
    profitPerAcre,
    profitPerDay,
    breakEvenYieldQuintals,
    breakEvenPricePerQuintal,

    totalLabourDays,
    totalLabourHours,

    waterReqMm,
    waterReqLitresPerAcre,

    scenarios,
    sensitivityMatrix,
    monthlyCashFlow,
    transparencySteps,
  };
}

/**
 * Creates one scenario (Pessimistic, Expected, Optimistic)
 */
function createScenario(
  scenarioName: "Pessimistic" | "Expected" | "Optimistic",
  labelMr: string,
  labelHi: string,
  baseYield: number,
  basePrice: number,
  areaAcre: number,
  totalCost: number,
  yieldDeltaPercent: number,
  priceDeltaPercent: number
): ScenarioResult {
  const yieldPerAcre = Number(
    (baseYield * (1 + yieldDeltaPercent / 100)).toFixed(2)
  );
  const totalYieldQuintals = Number((yieldPerAcre * areaAcre).toFixed(2));
  const pricePerQuintal = Math.round(basePrice * (1 + priceDeltaPercent / 100));
  const grossRevenue = Math.round(totalYieldQuintals * pricePerQuintal);
  const netProfit = grossRevenue - totalCost;
  const roiPercent = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;
  const profitPerAcre = Math.round(netProfit / areaAcre);
  const breakEvenYieldQuintals =
    pricePerQuintal > 0 ? Number((totalCost / pricePerQuintal).toFixed(2)) : 0;
  const breakEvenPricePerQuintal =
    totalYieldQuintals > 0 ? Math.round(totalCost / totalYieldQuintals) : 0;

  return {
    scenarioName,
    labelMr,
    labelHi,
    yieldPerAcre,
    totalYieldQuintals,
    pricePerQuintal,
    grossRevenue,
    totalCost,
    netProfit,
    roiPercent,
    profitPerAcre,
    breakEvenYieldQuintals,
    breakEvenPricePerQuintal,
    yieldDeltaPercent,
    priceDeltaPercent,
  };
}

const MONTH_NAMES_MR = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
];

const MONTH_NAMES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Generates month-by-month cash outflow and inflow schedule
 */
function generateMonthlyCashFlow(
  sowingDate: Date,
  durationDays: number,
  costBreakdown: CostLineItems,
  grossRevenue: number
): MonthlyCashFlow[] {
  const totalMonths = Math.max(1, Math.ceil(durationDays / 30));
  const flows: MonthlyCashFlow[] = [];
  let cumulative = 0;

  for (let m = 0; m < totalMonths; m++) {
    const currentMonthDate = new Date(sowingDate);
    currentMonthDate.setMonth(currentMonthDate.getMonth() + m);
    const monthIndex = currentMonthDate.getMonth();
    const monthNameEn = MONTH_NAMES_EN[monthIndex];
    const monthNameMr = MONTH_NAMES_MR[monthIndex];

    let outflow = 0;
    const activities: string[] = [];

    if (m === 0) {
      // Month 1: Land prep, seed, initial basal fertilizers, labour
      outflow +=
        costBreakdown.landPrep +
        costBreakdown.seed +
        costBreakdown.seedTreatment +
        Math.round(costBreakdown.fertilizers * 0.4) +
        Math.round(costBreakdown.labour * 0.3) +
        Math.round(costBreakdown.machineryRental * 0.5);
      activities.push("रानबांधणी, बियाणे खरेदी, बीजप्रक्रिया व पेरणी");
    } else if (m === totalMonths - 1) {
      // Final Month: Harvesting, transport, market fees, contingency, loan interest
      outflow +=
        costBreakdown.harvesting +
        costBreakdown.transport +
        costBreakdown.marketFees +
        costBreakdown.interestOnLoan +
        costBreakdown.contingency +
        Math.round(costBreakdown.labour * 0.4);
      activities.push("कापणी, तोडणी, वाहतूक, हमाली व कर्ज परतफेड");
    } else {
      // Intermediate Growth Months: Fertilizers, pesticides, irrigation, weeding labour
      const remainingFert = Math.round((costBreakdown.fertilizers * 0.6) / Math.max(1, totalMonths - 2));
      const pesticidePerMonth = Math.round(costBreakdown.pesticides / Math.max(1, totalMonths - 2));
      const waterPerMonth = Math.round(costBreakdown.irrigationEnergy / Math.max(1, totalMonths - 1));
      const labourInter = Math.round((costBreakdown.labour * 0.3) / Math.max(1, totalMonths - 2));

      outflow += remainingFert + pesticidePerMonth + waterPerMonth + labourInter;
      activities.push("खतांचा हप्ता, कीड नियंत्रण फवारणी व पाणी व्यवस्थापन");
    }

    // Revenue arrives in the final harvest month
    const inflow = m === totalMonths - 1 ? grossRevenue : 0;
    const netFlow = inflow - outflow;
    cumulative += netFlow;

    flows.push({
      monthIndex: m + 1,
      monthNameEn,
      monthNameMr,
      outflowCost: outflow,
      inflowRevenue: inflow,
      netCashFlow: netFlow,
      cumulativeCashFlow: cumulative,
      activitiesMr: activities,
    });
  }

  return flows;
}
