export type IrrigationMethod = "drip" | "sprinkler" | "flood" | "rainfed";

export type SoilType =
  | "Black_Cotton"
  | "Medium_Black"
  | "Red_Sandy"
  | "Loamy"
  | "Laterite";

export interface PlannerInput {
  cropId: string;
  varietyId?: string;
  areaAcre: number;
  sowingDate?: string | Date;
  soilType?: SoilType | string;
  irrigationMethod?: IrrigationMethod;
  district?: string;
  customCosts?: Partial<CostLineItems>;
  customPricePerQuintal?: number;
  customYieldQuintalsPerAcre?: number;
  borrowedCapitalPercent?: number; // e.g. 50% from KCC
  annualInterestRatePercent?: number; // e.g. 7%
}

export interface CostLineItems {
  seed: number;
  seedTreatment: number;
  landPrep: number;
  fertilizers: number;
  pesticides: number;
  irrigationEnergy: number;
  labour: number;
  machineryRental: number;
  harvesting: number;
  transport: number;
  marketFees: number;
  insurance: number;
  interestOnLoan: number;
  contingency: number; // 5% buffer
}

export interface ScenarioResult {
  scenarioName: "Pessimistic" | "Expected" | "Optimistic";
  labelMr: string;
  labelHi: string;
  yieldPerAcre: number;
  totalYieldQuintals: number;
  pricePerQuintal: number;
  grossRevenue: number;
  totalCost: number;
  netProfit: number;
  roiPercent: number;
  profitPerAcre: number;
  breakEvenYieldQuintals: number;
  breakEvenPricePerQuintal: number;
  yieldDeltaPercent: number;
  priceDeltaPercent: number;
}

export interface SensitivityCell {
  yieldDeltaPercent: number;
  priceDeltaPercent: number;
  adjustedYieldPerAcre: number;
  adjustedPricePerQuintal: number;
  netProfit: number;
  roiPercent: number;
  isProfitable: boolean;
}

export interface MonthlyCashFlow {
  monthIndex: number;
  monthNameEn: string;
  monthNameMr: string;
  outflowCost: number;
  inflowRevenue: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  activitiesMr: string[];
}

export interface StepExplanation {
  stepNumber: number;
  titleEn: string;
  titleMr: string;
  formula: string;
  inputsDesc: string;
  calculatedValue: string;
  sourceNote: string;
}

export interface PlannerOutput {
  cropId: string;
  cropNameEn: string;
  cropNameMr: string;
  cropNameHi: string;
  varietyName: string;
  sowingDate: string;
  harvestDate: string;
  durationDays: number;
  areaAcre: number;
  areaGuntha: number;
  areaHectare: number;
  soilType: string;
  irrigationMethod: IrrigationMethod;

  // Multipliers
  multipliers: {
    soilFactor: number;
    irrigationFactor: number;
    varietyFactor: number;
    weatherRiskFactor: number;
    combinedFactor: number;
  };

  // Yield & Prices
  baseYieldPerAcre: number;
  effectiveYieldPerAcre: number;
  totalExpectedYieldQuintals: number;
  basePricePerQuintal: number;
  effectivePricePerQuintal: number;

  // Financials
  costBreakdown: CostLineItems;
  totalCost: number;
  costPerAcre: number;
  grossRevenue: number;
  netProfit: number;
  roiPercent: number;
  profitPerAcre: number;
  profitPerDay: number;
  breakEvenYieldQuintals: number;
  breakEvenPricePerQuintal: number;

  // Work & Labour
  totalLabourDays: number;
  totalLabourHours: number;

  // Water
  waterReqMm: number;
  waterReqLitresPerAcre: number;

  // Analysis & Scenarios
  scenarios: {
    pessimistic: ScenarioResult;
    expected: ScenarioResult;
    optimistic: ScenarioResult;
  };
  sensitivityMatrix: SensitivityCell[][];
  monthlyCashFlow: MonthlyCashFlow[];

  // Plain-Language "How calculation was made" breakdown
  transparencySteps: StepExplanation[];
}
