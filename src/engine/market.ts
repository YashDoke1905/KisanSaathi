// Pure Calculation Engine: Market Intelligence & Sell-or-Wait Decision Optimizer

export interface PricePoint {
  date: string; // ISO date YYYY-MM-DD
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  arrivalTonnes: number;
}

export interface MandiInfo {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  marketFeePercent: number; // typically 1-2%
  hamaliPerQuintal: number; // typically ₹15-₹25/quintal
  distanceKm?: number;
  currentPrice: {
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    arrivalQuintals: number;
    priceDate: string;
    change7d: number;
  };
}

export interface SellOrWaitInput {
  cropId: string;
  quantityQuintals: number;
  currentModalPrice: number;
  mandiDistanceKm: number;
  transportRatePerKmPerQtl?: number; // default ₹0.85/km/qtl
  mandiFeePercent?: number; // default 1.5%
  hamaliPerQtl?: number; // default ₹18/qtl
  holdingDays: number; // e.g. 15, 30, 45, 60 days
  storageCostPerQtlPerMonth?: number; // default ₹25-₹40/qtl/month
  weightLossPercentPerMonth?: number; // moisture loss/shrinkage e.g. 3-6% for onion
  projectedPriceChangePercent?: number; // estimated future price trend based on seasonality
}

export interface SellOrWaitOutput {
  cropId: string;
  quantityQuintals: number;
  holdingDays: number;

  // Today's Economics
  grossRevenueToday: number;
  transportCostToday: number;
  mandiFeesToday: number;
  hamaliCostToday: number;
  netRevenueToday: number;
  netPricePerQuintalToday: number;

  // Future Economics (after holding)
  projectedPricePerQuintal: number;
  effectiveQuantityAfterShrinkage: number;
  weightLossQuintals: number;
  grossRevenueFuture: number;
  storageCostTotal: number;
  transportCostFuture: number;
  mandiFeesFuture: number;
  hamaliCostFuture: number;
  netRevenueFuture: number;
  netPricePerQuintalFuture: number;

  // Decision & Recommendation
  netGainTotal: number; // Future Net - Today Net
  netGainPerQuintal: number;
  recommendation: "SELL_NOW" | "HOLD_STORAGE";
  recommendationLabelMr: string;
  recommendationLabelEn: string;
  recommendationBadgeColor: string; // Tailwind class
  confidenceLevel: "HIGH" | "MEDIUM" | "CAUTION";
  reasoningMr: string;
  reasoningEn: string;

  // Step-by-step transparency breakdown
  transparencySteps: {
    titleMr: string;
    titleEn: string;
    formula: string;
    value: string;
  }[];
}

// Default storage & shrinkage parameters for key Maharashtra crops
export const CROP_STORAGE_PARAMS: Record<
  string,
  {
    storageCostPerQtlMonth: number;
    shrinkageLossPercentMonth: number;
    maxStorageMonths: number;
    seasonalityTrend: "RISING" | "FALLING" | "NEUTRAL";
    expectedPriceChange15d: number;
    expectedPriceChange30d: number;
    expectedPriceChange60d: number;
  }
> = {
  onion: {
    storageCostPerQtlMonth: 35, // scientific kanda chawl or warehouse
    shrinkageLossPercentMonth: 4.5, // moisture loss & rots
    maxStorageMonths: 5,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 6.0,
    expectedPriceChange30d: 14.0,
    expectedPriceChange60d: 28.0,
  },
  soybean: {
    storageCostPerQtlMonth: 22,
    shrinkageLossPercentMonth: 0.8, // dry grain, low shrinkage
    maxStorageMonths: 10,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 2.0,
    expectedPriceChange30d: 5.5,
    expectedPriceChange60d: 11.0,
  },
  cotton: {
    storageCostPerQtlMonth: 30,
    shrinkageLossPercentMonth: 0.5,
    maxStorageMonths: 8,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 1.5,
    expectedPriceChange30d: 4.0,
    expectedPriceChange60d: 9.0,
  },
  tomato: {
    storageCostPerQtlMonth: 120, // Cold chain refrigerated
    shrinkageLossPercentMonth: 12.0, // highly perishable
    maxStorageMonths: 1,
    seasonalityTrend: "NEUTRAL",
    expectedPriceChange15d: 0.0,
    expectedPriceChange30d: -5.0,
    expectedPriceChange60d: -20.0,
  },
  tur: {
    storageCostPerQtlMonth: 25,
    shrinkageLossPercentMonth: 0.7,
    maxStorageMonths: 12,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 2.5,
    expectedPriceChange30d: 6.0,
    expectedPriceChange60d: 12.0,
  },
  gram: {
    storageCostPerQtlMonth: 24,
    shrinkageLossPercentMonth: 0.8,
    maxStorageMonths: 12,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 2.0,
    expectedPriceChange30d: 5.0,
    expectedPriceChange60d: 10.0,
  },
  wheat: {
    storageCostPerQtlMonth: 20,
    shrinkageLossPercentMonth: 0.5,
    maxStorageMonths: 12,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 1.5,
    expectedPriceChange30d: 4.0,
    expectedPriceChange60d: 8.0,
  },
  pomegranate: {
    storageCostPerQtlMonth: 90,
    shrinkageLossPercentMonth: 5.0,
    maxStorageMonths: 2,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 5.0,
    expectedPriceChange30d: 10.0,
    expectedPriceChange60d: 15.0,
  },
  grapes: {
    storageCostPerQtlMonth: 150, // Cold storage
    shrinkageLossPercentMonth: 6.0,
    maxStorageMonths: 2,
    seasonalityTrend: "NEUTRAL",
    expectedPriceChange15d: 3.0,
    expectedPriceChange30d: 6.0,
    expectedPriceChange60d: 5.0,
  },
  garlic: {
    storageCostPerQtlMonth: 40,
    shrinkageLossPercentMonth: 3.5,
    maxStorageMonths: 6,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 4.0,
    expectedPriceChange30d: 10.0,
    expectedPriceChange60d: 20.0,
  },
};

/**
 * Calculates the exact net-in-hand financial comparison between selling crop today
 * vs. paying storage costs & taking weight-loss risk to sell in the future.
 */
export function calculateSellOrWaitDecision(input: SellOrWaitInput): SellOrWaitOutput {
  const {
    cropId,
    quantityQuintals,
    currentModalPrice,
    mandiDistanceKm,
    transportRatePerKmPerQtl = 0.85,
    mandiFeePercent = 1.5,
    hamaliPerQtl = 18,
    holdingDays,
  } = input;

  const storageParams = CROP_STORAGE_PARAMS[cropId] || {
    storageCostPerQtlMonth: 30,
    shrinkageLossPercentMonth: 3.0,
    maxStorageMonths: 6,
    seasonalityTrend: "RISING",
    expectedPriceChange15d: 3.0,
    expectedPriceChange30d: 7.0,
    expectedPriceChange60d: 14.0,
  };

  const storageCostPerQtlMonth = input.storageCostPerQtlPerMonth ?? storageParams.storageCostPerQtlMonth;
  const shrinkageLossPercentMonth = input.weightLossPercentPerMonth ?? storageParams.shrinkageLossPercentMonth;

  // Determine projected price change percentage
  let projectedPriceChangePercent = input.projectedPriceChangePercent;
  if (projectedPriceChangePercent === undefined) {
    if (holdingDays <= 15) {
      projectedPriceChangePercent = storageParams.expectedPriceChange15d;
    } else if (holdingDays <= 35) {
      projectedPriceChangePercent = storageParams.expectedPriceChange30d;
    } else {
      projectedPriceChangePercent = storageParams.expectedPriceChange60d;
    }
  }

  // 1. TODAY'S REVENUE BREAKDOWN
  const grossRevenueToday = quantityQuintals * currentModalPrice;
  const transportCostToday = quantityQuintals * mandiDistanceKm * transportRatePerKmPerQtl;
  const mandiFeesToday = (grossRevenueToday * mandiFeePercent) / 100;
  const hamaliCostToday = quantityQuintals * hamaliPerQtl;
  const netRevenueToday = Math.round(
    grossRevenueToday - (transportCostToday + mandiFeesToday + hamaliCostToday)
  );
  const netPricePerQuintalToday = Math.round(netRevenueToday / quantityQuintals);

  // 2. FUTURE REVENUE BREAKDOWN (AFTER HOLDING IN STORAGE)
  const monthsFraction = holdingDays / 30;
  const totalShrinkagePercent = Math.min(30, shrinkageLossPercentMonth * monthsFraction);
  const effectiveQuantityAfterShrinkage = Number(
    (quantityQuintals * (1 - totalShrinkagePercent / 100)).toFixed(2)
  );
  const weightLossQuintals = Number((quantityQuintals - effectiveQuantityAfterShrinkage).toFixed(2));

  const projectedPricePerQuintal = Math.round(
    currentModalPrice * (1 + projectedPriceChangePercent / 100)
  );
  const grossRevenueFuture = Math.round(
    effectiveQuantityAfterShrinkage * projectedPricePerQuintal
  );

  const storageCostTotal = Math.round(
    quantityQuintals * storageCostPerQtlMonth * monthsFraction
  );
  const transportCostFuture = effectiveQuantityAfterShrinkage * mandiDistanceKm * transportRatePerKmPerQtl;
  const mandiFeesFuture = (grossRevenueFuture * mandiFeePercent) / 100;
  const hamaliCostFuture = effectiveQuantityAfterShrinkage * hamaliPerQtl;

  const netRevenueFuture = Math.round(
    grossRevenueFuture - (storageCostTotal + transportCostFuture + mandiFeesFuture + hamaliCostFuture)
  );
  const netPricePerQuintalFuture = Math.round(netRevenueFuture / quantityQuintals);

  // 3. COMPARISON & RECOMMENDATION
  const netGainTotal = netRevenueFuture - netRevenueToday;
  const netGainPerQuintal = Math.round(netGainTotal / quantityQuintals);

  // Buffer: holding requires at least ₹100/qtl net gain to justify cash liquidity delay and storage risk
  const minimumThresholdPerQtl = 80;
  const shouldHold = netGainPerQuintal > minimumThresholdPerQtl;

  const recommendation = shouldHold ? "HOLD_STORAGE" : "SELL_NOW";
  const recommendationLabelMr = shouldHold
    ? `${holdingDays} दिवस थांबा व साठवणूक करा (HOLD)`
    : "आजच स्थानिक बाजारात विक्री करा (SELL NOW)";
  const recommendationLabelEn = shouldHold
    ? `Hold in Storage for ${holdingDays} Days`
    : "Sell Today at Local Mandi";

  const recommendationBadgeColor = shouldHold
    ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-700"
    : "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-700";

  let reasoningMr = "";
  let reasoningEn = "";

  if (shouldHold) {
    reasoningMr = `${holdingDays} दिवस साठवणूक केल्यास भावात संभाव्य +${projectedPriceChangePercent}% वाढ होईल. साठवणूक खर्च (₹${storageCostTotal}) व घट (वजन नुकसान ${weightLossQuintals} क्विं) वजा करूनही निव्वळ ₹${netGainTotal.toLocaleString("en-IN")} (प्रति क्विंटल ₹${netGainPerQuintal}) अधिक नफा मिळण्याचा अंदाज आहे.`;
    reasoningEn = `Holding for ${holdingDays} days projects a +${projectedPriceChangePercent}% price increase. Even after deducting storage fees (₹${storageCostTotal}) and weight shrinkage (${weightLossQuintals} qtl), you are expected to gain an extra ₹${netGainTotal.toLocaleString("en-IN")} (₹${netGainPerQuintal}/qtl).`;
  } else {
    reasoningMr = `आत्ता विक्री करणे अधिक सुरक्षित आहे. ${holdingDays} दिवस थांबल्यास साठवणूक खर्च (₹${storageCostTotal}) आणि वजनातील घट (${weightLossQuintals} क्विं) यामुळे भावातील किरकोळ वाढीचा फायदा वाहून जाईल किंवा तोटा होऊ शकतो.`;
    reasoningEn = `Selling now is the safer choice. Holding for ${holdingDays} days incurs storage charges (₹${storageCostTotal}) and weight shrinkage (${weightLossQuintals} qtl) that erode or wipe out projected seasonal price gains.`;
  }

  const confidenceLevel = Math.abs(netGainPerQuintal) > 200 ? "HIGH" : "MEDIUM";

  const transparencySteps = [
    {
      titleMr: "आजचा निव्वळ नफा (Net in Hand Today)",
      titleEn: "Net Revenue Today",
      formula: "एकूण रक्कम - (वाहतूक + मंडी सेस + हमाली)",
      value: `₹${grossRevenueToday.toLocaleString("en-IN")} - (₹${Math.round(transportCostToday)} + ₹${Math.round(mandiFeesToday)} + ₹${Math.round(hamaliCostToday)}) = ₹${netRevenueToday.toLocaleString("en-IN")}`,
    },
    {
      titleMr: "साठवणुकीतील वजनातील घट (Shrinkage Loss)",
      titleEn: "Moisture & Spoilage Loss",
      formula: "मूळ वजन × मासिक घट टक्के × महिना",
      value: `${quantityQuintals} क्विं - ${totalShrinkagePercent.toFixed(1)}% घट = ${effectiveQuantityAfterShrinkage} क्विं (नुकसान: ${weightLossQuintals} क्विं)`,
    },
    {
      titleMr: "साठवणूक खर्च (Storage Fee)",
      titleEn: "Storage Charges",
      formula: "क्विंटल × मासिक दर × महिने",
      value: `${quantityQuintals} क्विं × ₹${storageCostPerQtlMonth}/महिना × ${monthsFraction.toFixed(1)} महिने = ₹${storageCostTotal.toLocaleString("en-IN")}`,
    },
    {
      titleMr: "भविष्यातील अंदाजित निव्वळ रक्कम (Projected Net Revenue)",
      titleEn: "Projected Net In-Hand",
      formula: "भविष्य विक्री - (साठवणूक + वाहतूक + सेस + हमाली)",
      value: `₹${grossRevenueFuture.toLocaleString("en-IN")} - ₹${Math.round(storageCostTotal + transportCostFuture + mandiFeesFuture + hamaliCostFuture)} = ₹${netRevenueFuture.toLocaleString("en-IN")}`,
    },
    {
      titleMr: "तुलनात्मक नफा/तोटा (Net Difference)",
      titleEn: "Comparative Net Gain",
      formula: "भविष्य निव्वळ - आजचा निव्वळ",
      value: `₹${netRevenueFuture.toLocaleString("en-IN")} - ₹${netRevenueToday.toLocaleString("en-IN")} = ${netGainTotal >= 0 ? "+" : ""}₹${netGainTotal.toLocaleString("en-IN")} (₹${netGainPerQuintal}/क्विं)`,
    },
  ];

  return {
    cropId,
    quantityQuintals,
    holdingDays,
    grossRevenueToday,
    transportCostToday: Math.round(transportCostToday),
    mandiFeesToday: Math.round(mandiFeesToday),
    hamaliCostToday: Math.round(hamaliCostToday),
    netRevenueToday,
    netPricePerQuintalToday,
    projectedPricePerQuintal,
    effectiveQuantityAfterShrinkage,
    weightLossQuintals,
    grossRevenueFuture,
    storageCostTotal,
    transportCostFuture: Math.round(transportCostFuture),
    mandiFeesFuture: Math.round(mandiFeesFuture),
    hamaliCostFuture: Math.round(hamaliCostFuture),
    netRevenueFuture,
    netPricePerQuintalFuture,
    netGainTotal,
    netGainPerQuintal,
    recommendation,
    recommendationLabelMr,
    recommendationLabelEn,
    recommendationBadgeColor,
    confidenceLevel,
    reasoningMr,
    reasoningEn,
    transparencySteps,
  };
}

/**
 * Calculates 7-day and 30-day moving average and trend slope from historical prices
 */
export function calculatePriceTrend(history: PricePoint[]): {
  direction: "UP" | "DOWN" | "FLAT";
  directionLabelMr: string;
  directionLabelEn: string;
  percentChange7d: number;
  percentChange30d: number;
  average7d: number;
  average30d: number;
  highestPrice: number;
  lowestPrice: number;
} {
  if (!history || history.length === 0) {
    return {
      direction: "FLAT",
      directionLabelMr: "स्थिर भाव",
      directionLabelEn: "Stable Price",
      percentChange7d: 0,
      percentChange30d: 0,
      average7d: 0,
      average30d: 0,
      highestPrice: 0,
      lowestPrice: 0,
    };
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const last7 = sorted.slice(-7);
  const last30 = sorted.slice(-30);

  const avg7 = Math.round(last7.reduce((s, p) => s + p.modalPrice, 0) / last7.length);
  const avg30 = Math.round(last30.reduce((s, p) => s + p.modalPrice, 0) / last30.length);

  const sevenDaysAgoPrice = last7[0]?.modalPrice || latest.modalPrice;
  const thirtyDaysAgoPrice = last30[0]?.modalPrice || latest.modalPrice;

  const pct7 = Number((((latest.modalPrice - sevenDaysAgoPrice) / sevenDaysAgoPrice) * 100).toFixed(1));
  const pct30 = Number((((latest.modalPrice - thirtyDaysAgoPrice) / thirtyDaysAgoPrice) * 100).toFixed(1));

  const allModal = sorted.map((p) => p.modalPrice);
  const highestPrice = Math.max(...allModal);
  const lowestPrice = Math.min(...allModal);

  let direction: "UP" | "DOWN" | "FLAT" = "FLAT";
  let directionLabelMr = "स्थिर भाव (Stable)";
  let directionLabelEn = "Stable Prices";

  if (pct7 >= 2.5) {
    direction = "UP";
    directionLabelMr = "भाव वाढीचा कल (Upward Trend)";
    directionLabelEn = "Upward Trend";
  } else if (pct7 <= -2.5) {
    direction = "DOWN";
    directionLabelMr = "भाव घसरणीचा कल (Downward Trend)";
    directionLabelEn = "Downward Trend";
  }

  return {
    direction,
    directionLabelMr,
    directionLabelEn,
    percentChange7d: pct7,
    percentChange30d: pct30,
    average7d: avg7,
    average30d: avg30,
    highestPrice,
    lowestPrice,
  };
}
