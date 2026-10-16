import { GovernmentSchemeDef, VERIFIED_SCHEMES } from "../data/schemes";

export interface FarmerSchemeProfile {
  totalLandAcres: number;
  socialCategory: "General" | "OBC" | "SC" | "ST" | "Vulnerable";
  isLandOwner: boolean;
  gender?: "Male" | "Female" | "Other";
  cropsGrown?: string[]; // array of crop IDs e.g. ["cotton", "soybean", "onion"]
  waterSources?: string[]; // e.g. ["Borewell", "Open_Well", "Canal", "Farm_Pond", "Rainfed"]
  hasElectricityConnection?: boolean;
  hasDripOrSprinkler?: boolean;
  district?: string;
  heldDocumentKeys?: string[]; // e.g. ["doc_7_12", "doc_aadhaar_npci", ...]
}

export type SchemeEligibilityStatus = "Eligible" | "Conditional" | "Ineligible";

export interface EvaluatedScheme {
  scheme: GovernmentSchemeDef;
  status: SchemeEligibilityStatus;
  statusLabelMr: string;
  statusLabelEn: string;
  statusBadgeClass: string;
  reasonsMr: string[];
  reasonsEn: string[];
  missingCriteriaMr: string[];
  missingCriteriaEn: string[];
  documentReadinessPercent: number;
  missingDocumentsMr: string[];
  missingDocumentsEn: string[];
  isTopSubsidy: boolean;
}

export interface SchemesSummary {
  totalSchemes: number;
  eligibleCount: number;
  conditionalCount: number;
  ineligibleCount: number;
  totalUnlockableBenefit: number;
  directCashBenefitYearly: number;
  maxCapitalSubsidyOneTime: number;
}

export interface KccCropItem {
  cropId: string;
  cropNameMr: string;
  cropNameEn: string;
  areaAcre: number;
  scaleOfFinancePerAcre: number;
  cropLoanAmount: number;
}

export interface KccCalculationResult {
  totalLandAcre: number;
  cropsBreakdown: KccCropItem[];
  baseCropFinance: number;
  postHarvestBuffer10Percent: number;
  farmMaintenanceBuffer20Percent: number;
  totalYear1CreditLimit: number;
  totalYear5RevolvingLimit: number;
  officialInterestRatePercent: number;
  govtInterestSubventionPercent: number;
  effectiveInterestRatePercent: number;
  isMaharashtraZeroPercentEligible: boolean;
  annualInterestAtCommercialRate: number;
  annualInterestAtKccRate: number;
  annualSavingsVsCommercial: number;
  tenureYears: number;
  stepsExplanationMr: string[];
  stepsExplanationEn: string[];
}

export interface StandardDocumentDef {
  key: string;
  nameMr: string;
  nameEn: string;
  shortDescMr: string;
  shortDescEn: string;
  badgeClass: string;
  iconName: string;
  issuingAuthority: string;
  officialUrl?: string;
}

export const STANDARD_DOCUMENTS: StandardDocumentDef[] = [
  {
    key: "doc_7_12",
    nameMr: "७/१२ व ८-अ उतारा",
    nameEn: "7/12 & 8-A Land Extract",
    shortDescMr: "महाभूमी (Mahabhumi) पोर्टलवरून डिजिटल स्वाक्षरी असलेला जमिनीचा चालू उतारा.",
    shortDescEn: "Digitally signed current land title & holding extract from Mahabhumi portal.",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    iconName: "FileText",
    issuingAuthority: "महसूल विभाग, महाराष्ट्र शासन (Mahabhumi)",
    officialUrl: "https://bhulekh.mahabhumi.gov.in",
  },
  {
    key: "doc_aadhaar_npci",
    nameMr: "आधार कार्ड (NPCI DBT सक्रिय)",
    nameEn: "Aadhaar Card (NPCI DBT Active)",
    shortDescMr: "बँक खात्याशी आधार सीडिंग व थेट अनुदान (DBT) सक्रिय असणे बंधनकारक.",
    shortDescEn: "Aadhaar linked with primary bank account with active NPCI DBT mandate.",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    iconName: "Fingerprint",
    issuingAuthority: "UIDAI / NPCI",
    officialUrl: "https://myaadhaar.uidai.gov.in",
  },
  {
    key: "doc_bank_passbook",
    nameMr: "बँक पासबुक / रद्द धनादेश",
    nameEn: "Bank Passbook / Cancelled Cheque",
    shortDescMr: "IFSC कोड, एमआयसीआर आणि खाते क्रमांक स्पष्ट दिसणारे पासबुकचे पहिले पान.",
    shortDescEn: "First page of bank passbook clearly showing IFSC code, account number & name.",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    iconName: "CreditCard",
    issuingAuthority: "राष्ट्रीयकृत / सहकारी / ग्रामीण बँक",
  },
  {
    key: "doc_caste_cert",
    nameMr: "सक्षम प्राधिकाऱ्याचा जातीचा दाखला",
    nameEn: "Caste Certificate (SC/ST/OBC)",
    shortDescMr: "उपविभागीय अधिकारी (SDO) किंवा तहसीलदार यांचा वैध डिजिटल जाती प्रमाणपत्र.",
    shortDescEn: "Valid digital caste certificate from SDO/Tehsildar for affirmative action subsidies.",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    iconName: "Award",
    issuingAuthority: "आपले सरकार (Aaple Sarkar Portal)",
    officialUrl: "https://aaplesarkar.mahaonline.gov.in",
  },
  {
    key: "doc_e_pik_pahani",
    nameMr: "ई-पीक पाहणी डिजिटल नोंद",
    nameEn: "Digital E-Pik Pahani Record",
    shortDescMr: "मोबाईल ॲपवरून तलाठी दफ्तरी नोंदवलेले चालू हंगामातील खरीप/रब्बी पीक.",
    shortDescEn: "Crop sowing digital record uploaded on Revenue portal via E-Pik Pahani app.",
    badgeClass: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    iconName: "Sprout",
    issuingAuthority: "महसूल व कृषी विभाग, महाराष्ट्र शासन",
  },
  {
    key: "doc_soil_card",
    nameMr: "मृदा आरोग्य पत्रिका",
    nameEn: "Soil Health Card",
    shortDescMr: "शासकीय किंवा मान्यताप्राप्त प्रयोगशाळेतील माती परीक्षण अहवाल.",
    shortDescEn: "Official N-P-K & micronutrient soil test card from authorized Krishi laboratory.",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    iconName: "Layers",
    issuingAuthority: "कृषी विभाग / कृषी विज्ञान केंद्र (KVK)",
    officialUrl: "https://soilhealth.dac.gov.in",
  },
  {
    key: "doc_electricity_bill",
    nameMr: "महावितरण चालू वीजबिल पावती",
    nameEn: "MSEDCL Electricity Bill",
    shortDescMr: "शेतातील कृषी पंपाचे किंवा घरगुती चालू वीजबिल ग्राहक क्रमांक.",
    shortDescEn: "Recent agricultural or domestic power bill showing consumer connection number.",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    iconName: "Zap",
    issuingAuthority: "महाराष्ट्र राज्य विद्युत वितरण कंपनी (MSEDCL)",
    officialUrl: "https://www.mahadiscom.in",
  },
  {
    key: "doc_ration_card",
    nameMr: "रेशन कार्ड / कौटुंबिक ओळख",
    nameEn: "Ration Card (Family ID)",
    shortDescMr: "अन्न व नागरी पुरवठा विभागाचे वैध शिधापत्रिका पत्रक.",
    shortDescEn: "Valid Food & Civil Supplies ration card for family unit verification.",
    badgeClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
    iconName: "Users",
    issuingAuthority: "अन्न व नागरी पुरवठा विभाग",
  },
];

export const MAHARASHTRA_SCALE_OF_FINANCE: Record<
  string,
  { nameMr: string; nameEn: string; sofPerAcre: number }
> = {
  cotton: { nameMr: "कापूस (बागायती/कोरडवाहू)", nameEn: "Cotton", sofPerAcre: 35000 },
  soybean: { nameMr: "सोयाबीन", nameEn: "Soybean", sofPerAcre: 25000 },
  onion: { nameMr: "कांदा (खरीप/रांगडा/उन्हाळी)", nameEn: "Onion", sofPerAcre: 40000 },
  sugarcane: { nameMr: "ऊस (सुरू/पूर्वहंगामी/अडसाली)", nameEn: "Sugarcane", sofPerAcre: 65000 },
  wheat: { nameMr: "गहू", nameEn: "Wheat", sofPerAcre: 22000 },
  gram: { nameMr: "हरभरा (चना)", nameEn: "Gram / Chana", sofPerAcre: 20000 },
  tur: { nameMr: "तूर (अरहर)", nameEn: "Tur / Arhar", sofPerAcre: 24000 },
  tomato: { nameMr: "टोमॅटो / भाजीपाला", nameEn: "Tomato / Vegetables", sofPerAcre: 45000 },
  grapes: { nameMr: "द्राक्ष बाग", nameEn: "Grapes Vineyard", sofPerAcre: 85000 },
  pomegranate: { nameMr: "डाळिंब बाग", nameEn: "Pomegranate Orchard", sofPerAcre: 75000 },
  banana: { nameMr: "केळी बाग", nameEn: "Banana Plantation", sofPerAcre: 55000 },
  orange: { nameMr: "संत्रा / मोसंबी बाग", nameEn: "Orange / Citrus Orchard", sofPerAcre: 60000 },
  turmeric: { nameMr: "हळद", nameEn: "Turmeric", sofPerAcre: 60000 },
  maize: { nameMr: "मका", nameEn: "Maize", sofPerAcre: 20000 },
  jowar: { nameMr: "ज्वारी (रब्बी/खरीप)", nameEn: "Jowar", sofPerAcre: 18000 },
  bajra: { nameMr: "बाजरी", nameEn: "Bajra", sofPerAcre: 18000 },
  garlic: { nameMr: "लसूण", nameEn: "Garlic", sofPerAcre: 40000 },
  green_chilli: { nameMr: "हिरवी मिरची", nameEn: "Green Chilli", sofPerAcre: 42000 },
  default: { nameMr: "इतर पिके", nameEn: "General / Other Crops", sofPerAcre: 25000 },
};

/**
 * Evaluates a single scheme's eligibility for the specified farmer profile.
 */
export function evaluateSchemeEligibility(
  scheme: GovernmentSchemeDef,
  profile: FarmerSchemeProfile
): EvaluatedScheme {
  const reasonsMr: string[] = [];
  const reasonsEn: string[] = [];
  const missingCriteriaMr: string[] = [];
  const missingCriteriaEn: string[] = [];

  let isDisqualified = false;
  let isConditional = false;

  const rules = scheme.eligibilityRules;

  // 1. Land Ownership
  if (rules.requiresLandOwnership) {
    if (!profile.isLandOwner) {
      isDisqualified = true;
      missingCriteriaMr.push("सातबारा (७/१२) स्वतःच्या नावावर असणे आवश्यक आहे.");
      missingCriteriaEn.push("Land ownership (7/12 land extract in applicant's name) is required.");
    } else {
      reasonsMr.push("७/१२ शेतजमीन मालकी अट पूर्ण.");
      reasonsEn.push("Satisfies 7/12 landholder ownership requirement.");
    }
  }

  // 2. Max Landholding Limit (e.g. Small / Marginal farmer ceiling)
  if (rules.maxLandholdingAcres !== undefined) {
    if (profile.totalLandAcres > rules.maxLandholdingAcres) {
      isDisqualified = true;
      missingCriteriaMr.push(
        `कमाल जमीन मर्यादा ${rules.maxLandholdingAcres} एकर आहे (आपले क्षेत्र ${profile.totalLandAcres.toFixed(1)} एकर आहे).`
      );
      missingCriteriaEn.push(
        `Land ceiling is ${rules.maxLandholdingAcres} acres (your holding is ${profile.totalLandAcres.toFixed(1)} acres).`
      );
    } else {
      reasonsMr.push(`जमीन मर्यादा (जास्तीत जास्त ${rules.maxLandholdingAcres} एकर) निकषात बसते.`);
      reasonsEn.push(`Within allowable land ceiling of ${rules.maxLandholdingAcres} acres.`);
    }
  }

  // 3. Min Landholding Limit
  if (rules.minLandholdingAcres !== undefined) {
    if (profile.totalLandAcres < rules.minLandholdingAcres) {
      isDisqualified = true;
      missingCriteriaMr.push(
        `किमान जमीन मर्यादा ${rules.minLandholdingAcres} एकर आवश्यक आहे (आपले क्षेत्र ${profile.totalLandAcres.toFixed(1)} एकर आहे).`
      );
      missingCriteriaEn.push(
        `Minimum land required is ${rules.minLandholdingAcres} acres (your holding is ${profile.totalLandAcres.toFixed(1)} acres).`
      );
    } else {
      reasonsMr.push(`किमान जमीन धारणा निकष पूर्ण.`);
      reasonsEn.push(`Satisfies minimum land requirement.`);
    }
  }

  // 4. Social Category (Affirmative Action Tiers)
  if (rules.targetSocialCategories && rules.targetSocialCategories.length > 0) {
    const isCategoryMatched = rules.targetSocialCategories.includes(profile.socialCategory);
    if (!isCategoryMatched) {
      isDisqualified = true;
      const allowedCategories = rules.targetSocialCategories.join(", ");
      missingCriteriaMr.push(`ही योजना केवळ ${allowedCategories} प्रवर्गासाठी राखीव आहे.`);
      missingCriteriaEn.push(`Reserved exclusively for ${allowedCategories} social categories.`);
    } else {
      if (profile.socialCategory === "SC" || profile.socialCategory === "ST") {
        reasonsMr.push(
          `अनुसूचित जाती/जमाती (${profile.socialCategory}) प्रवर्गासाठी ९०% ते १००% विशेष अनुदान लागू.`
        );
        reasonsEn.push(`Special high-tier subsidy (up to 90-100%) for ${profile.socialCategory} category.`);
      } else {
        reasonsMr.push(`सामाजिक प्रवर्ग (${profile.socialCategory}) निकष पात्र.`);
        reasonsEn.push(`Category criteria (${profile.socialCategory}) satisfied.`);
      }
    }
  }

  // 5. Electricity Requirement
  if (rules.requiresElectricityConnection === true) {
    if (!profile.hasElectricityConnection) {
      isConditional = true;
      missingCriteriaMr.push("शेतात महावितरण वीज जोडणी आवश्यक आहे.");
      missingCriteriaEn.push("Active MSEDCL agricultural power connection required.");
    } else {
      reasonsMr.push("कृषी वीज जोडणी उपलब्ध.");
      reasonsEn.push("Agri power connection present.");
    }
  }

  // 6. Water Sources
  if (rules.requiredWaterSources && rules.requiredWaterSources.length > 0) {
    const hasWaterSource = profile.waterSources?.some((ws) =>
      rules.requiredWaterSources!.some(
        (rws) =>
          rws.toLowerCase() === ws.toLowerCase() ||
          ws.toLowerCase().includes(rws.toLowerCase()) ||
          rws.toLowerCase().includes(ws.toLowerCase())
      )
    );
    if (!hasWaterSource) {
      isConditional = true;
      const required = rules.requiredWaterSources.join(" किंवा ");
      missingCriteriaMr.push(`सिंचन स्रोत (${required}) आवश्यक आहे.`);
      missingCriteriaEn.push(`Irrigation water source (${rules.requiredWaterSources.join(" or ")}) required.`);
    } else {
      reasonsMr.push("सिंचन पाण्याचा शाश्वत स्रोत उपलब्ध आहे.");
      reasonsEn.push("Sustainable irrigation source present.");
    }
  }

  // 7. Target Crops
  if (rules.targetCrops && rules.targetCrops.length > 0 && !rules.targetCrops.includes("all")) {
    const crops = profile.cropsGrown || [];
    const hasTargetCrop = crops.some((c) =>
      rules.targetCrops!.some(
        (tc) =>
          tc.toLowerCase() === c.toLowerCase() ||
          c.toLowerCase().includes(tc.toLowerCase()) ||
          tc.toLowerCase().includes(c.toLowerCase())
      )
    );
    if (!hasTargetCrop) {
      isConditional = true;
      const cropNamesMr = rules.targetCrops
        .map((tc) => MAHARASHTRA_SCALE_OF_FINANCE[tc.toLowerCase()]?.nameMr || tc)
        .join(", ");
      const cropNamesEn = rules.targetCrops.join(", ");
      missingCriteriaMr.push(`सदर योजना विशिष्ट पिकांसाठी आहे (${cropNamesMr}).`);
      missingCriteriaEn.push(`Applicable for targeted crops: ${cropNamesEn}.`);
    } else {
      reasonsMr.push("पात्र पीक लागवड क्षेत्र उपलब्ध.");
      reasonsEn.push("Cultivating eligible notified crop.");
    }
  }

  // Determine Final Status
  let status: SchemeEligibilityStatus = "Eligible";
  if (isDisqualified) {
    status = "Ineligible";
  } else if (isConditional) {
    status = "Conditional";
  }

  // Document Readiness Matching
  const heldDocs = profile.heldDocumentKeys || [];
  const requiredDocsEn = scheme.requiredDocumentsEn || [];
  let matchedDocCount = 0;
  const missingDocsMr: string[] = [];
  const missingDocsEn: string[] = [];

  scheme.requiredDocumentsMr.forEach((docMr, idx) => {
    const docEn = requiredDocsEn[idx] || docMr;
    const isDocHeld = heldDocs.some((heldKey) => {
      if (
        (heldKey === "doc_7_12" || heldKey === "doc_8a") &&
        (docEn.includes("7/12") || docMr.includes("७/१२") || docEn.includes("8-A") || docMr.includes("८-अ") || docMr.includes("जमिनीचा"))
      )
        return true;
      if (
        heldKey === "doc_aadhaar_npci" &&
        (docEn.toLowerCase().includes("aadhaar") ||
          docMr.includes("आधार") ||
          docEn.toLowerCase().includes("kyc") ||
          docMr.toLowerCase().includes("केवायसी"))
      )
        return true;
      if (
        heldKey === "doc_bank_passbook" &&
        (docEn.toLowerCase().includes("passbook") ||
          docMr.includes("पासबुक") ||
          docEn.toLowerCase().includes("bank") ||
          docMr.includes("बँक"))
      )
        return true;
      if (
        heldKey === "doc_caste_cert" &&
        (docEn.toLowerCase().includes("caste") ||
          docMr.includes("जात") ||
          docMr.includes("दाखला") ||
          docEn.toLowerCase().includes("income") ||
          docMr.includes("उत्पन्न"))
      )
        return true;
      if (
        heldKey === "doc_soil_card" &&
        (docEn.toLowerCase().includes("soil") || docMr.includes("मृदा"))
      )
        return true;
      if (
        heldKey === "doc_electricity_bill" &&
        (docEn.toLowerCase().includes("electricity") ||
          docMr.includes("वीजबिल") ||
          docMr.includes("वीज"))
      )
        return true;
      if (
        heldKey === "doc_e_pik_pahani" &&
        (docEn.toLowerCase().includes("pik") || docMr.includes("पीक पाहणी"))
      )
        return true;
      return false;
    });

    if (isDocHeld) {
      matchedDocCount++;
    } else {
      missingDocsMr.push(docMr);
      missingDocsEn.push(docEn);
    }
  });

  const totalRequiredDocs = scheme.requiredDocumentsMr.length;
  const documentReadinessPercent =
    totalRequiredDocs > 0 ? Math.round((matchedDocCount / totalRequiredDocs) * 100) : 100;

  let statusLabelMr = "पात्र";
  let statusLabelEn = "Eligible";
  let statusBadgeClass =
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";

  if (status === "Conditional") {
    statusLabelMr = "अटी पूर्ण केल्यास पात्र";
    statusLabelEn = "Conditionally Eligible";
    statusBadgeClass =
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
  } else if (status === "Ineligible") {
    statusLabelMr = "अपात्र";
    statusLabelEn = "Not Eligible";
    statusBadgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
  }

  const isTopSubsidy =
    (status === "Eligible" || status === "Conditional") && scheme.maxBenefitAmount >= 50000;

  return {
    scheme,
    status,
    statusLabelMr,
    statusLabelEn,
    statusBadgeClass,
    reasonsMr,
    reasonsEn,
    missingCriteriaMr,
    missingCriteriaEn,
    documentReadinessPercent,
    missingDocumentsMr: missingDocsMr,
    missingDocumentsEn: missingDocsEn,
    isTopSubsidy,
  };
}

/**
 * Evaluates all verified government schemes for a farmer profile
 * and calculates consolidated summaries.
 */
export function evaluateAllSchemes(
  profile: FarmerSchemeProfile,
  schemes: GovernmentSchemeDef[] = VERIFIED_SCHEMES
): {
  evaluatedSchemes: EvaluatedScheme[];
  summary: SchemesSummary;
} {
  const evaluatedSchemes = schemes.map((s) => evaluateSchemeEligibility(s, profile));

  let eligibleCount = 0;
  let conditionalCount = 0;
  let ineligibleCount = 0;
  let totalUnlockableBenefit = 0;
  let directCashBenefitYearly = 0;
  let maxCapitalSubsidyOneTime = 0;

  for (const es of evaluatedSchemes) {
    if (es.status === "Eligible") {
      eligibleCount++;
      totalUnlockableBenefit += es.scheme.maxBenefitAmount;
      if (es.scheme.category === "Direct_Cash" && es.scheme.benefitFrequency === "Annual") {
        directCashBenefitYearly += es.scheme.maxBenefitAmount;
      }
      if (es.scheme.benefitFrequency === "One_Time") {
        if (es.scheme.maxBenefitAmount > maxCapitalSubsidyOneTime) {
          maxCapitalSubsidyOneTime = es.scheme.maxBenefitAmount;
        }
      }
    } else if (es.status === "Conditional") {
      conditionalCount++;
      totalUnlockableBenefit += es.scheme.maxBenefitAmount;
      if (es.scheme.benefitFrequency === "One_Time") {
        if (es.scheme.maxBenefitAmount > maxCapitalSubsidyOneTime) {
          maxCapitalSubsidyOneTime = es.scheme.maxBenefitAmount;
        }
      }
    } else {
      ineligibleCount++;
    }
  }

  return {
    evaluatedSchemes,
    summary: {
      totalSchemes: schemes.length,
      eligibleCount,
      conditionalCount,
      ineligibleCount,
      totalUnlockableBenefit,
      directCashBenefitYearly,
      maxCapitalSubsidyOneTime,
    },
  };
}

/**
 * Calculates Kisan Credit Card (KCC) credit limit based on official
 * RBI / NABARD Scale of Finance per acre in Maharashtra.
 */
export function calculateKccCreditLimit(
  crops: { cropId: string; areaAcre: number }[],
  totalLandAcre?: number
): KccCalculationResult {
  const cropsBreakdown: KccCropItem[] = [];
  let baseCropFinance = 0;

  for (const item of crops) {
    const cropKey = item.cropId.toLowerCase();
    const sofInfo =
      MAHARASHTRA_SCALE_OF_FINANCE[cropKey] || MAHARASHTRA_SCALE_OF_FINANCE["default"];
    const cropLoan = Math.round(item.areaAcre * sofInfo.sofPerAcre);
    baseCropFinance += cropLoan;

    cropsBreakdown.push({
      cropId: item.cropId,
      cropNameMr: sofInfo.nameMr,
      cropNameEn: sofInfo.nameEn,
      areaAcre: item.areaAcre,
      scaleOfFinancePerAcre: sofInfo.sofPerAcre,
      cropLoanAmount: cropLoan,
    });
  }

  // If no crops provided, calculate based on total acreage at default Scale of Finance
  if (cropsBreakdown.length === 0 && totalLandAcre && totalLandAcre > 0) {
    const defaultSof = MAHARASHTRA_SCALE_OF_FINANCE["default"];
    const cropLoan = Math.round(totalLandAcre * defaultSof.sofPerAcre);
    baseCropFinance = cropLoan;
    cropsBreakdown.push({
      cropId: "general",
      cropNameMr: defaultSof.nameMr,
      cropNameEn: defaultSof.nameEn,
      areaAcre: totalLandAcre,
      scaleOfFinancePerAcre: defaultSof.sofPerAcre,
      cropLoanAmount: cropLoan,
    });
  }

  // Official RBI / NABARD KCC formulation:
  // Year 1 Limit = Crop Finance + 10% Household + 20% Farm Maintenance = 130%
  const postHarvestBuffer10Percent = Math.round(baseCropFinance * 0.1);
  const farmMaintenanceBuffer20Percent = Math.round(baseCropFinance * 0.2);
  const totalYear1CreditLimit =
    baseCropFinance + postHarvestBuffer10Percent + farmMaintenanceBuffer20Percent;
  // 5-year revolving limit with 10% compound escalation over 5 years (1.40x)
  const totalYear5RevolvingLimit = Math.round(totalYear1CreditLimit * 1.4);

  // Interest subvention math:
  // Base Bank Interest Rate = 7.0%
  // Central Govt Subvention = 3.0% (Prompt Repayment)
  // Maharashtra Dr. Panjabrao Deshmukh Interest Concession:
  // Up to ₹3,00,000 prompt repayment qualifies for full interest reimbursement (Effective 0%)
  const officialInterestRatePercent = 7.0;
  const govtInterestSubventionPercent = 3.0;
  const isMaharashtraZeroPercentEligible = totalYear1CreditLimit <= 300000;
  const effectiveInterestRatePercent = isMaharashtraZeroPercentEligible ? 0.0 : 4.0;

  const annualInterestAtCommercialRate = Math.round(totalYear1CreditLimit * 0.18);
  const annualInterestAtKccRate = Math.round(
    totalYear1CreditLimit * (effectiveInterestRatePercent / 100)
  );
  const annualSavingsVsCommercial = annualInterestAtCommercialRate - annualInterestAtKccRate;

  const totalCalculatedAcres = cropsBreakdown.reduce((sum, c) => sum + c.areaAcre, 0);

  const stepsExplanationMr = [
    `१. पीक कर्ज प्रमाण (Scale of Finance): एकूण ${totalCalculatedAcres.toFixed(1)} एकर पिकांसाठी ₹${baseCropFinance.toLocaleString("en-IN")}.`,
    `२. काढणीपश्चात व घरगुती गरजा (१०% बफर): ₹${postHarvestBuffer10Percent.toLocaleString("en-IN")}.`,
    `३. शेती अवजारे देखभाल व पीक विमा (२०% बफर): ₹${farmMaintenanceBuffer20Percent.toLocaleString("en-IN")}.`,
    `४. प्रथम वर्ष KCC पत मर्यादा: ₹${totalYear1CreditLimit.toLocaleString("en-IN")} (मूळ खर्चाच्या १३०%).`,
    `५. ५ वर्षांची आवर्ती मर्यादा (१०% वार्षिक वाढ): ₹${totalYear5RevolvingLimit.toLocaleString("en-IN")}.`,
    isMaharashtraZeroPercentEligible
      ? `६. महाराष्ट्र डॉ. पंजाबराव देशमुख व्याज सवलत: वेळेत परतफेड केल्यास ₹३ लाखांपर्यंत ०% व्याज!`
      : `६. केंद्र शासन ३% सवलतीनंतर निव्वळ व्याजदर: फक्त ४% वार्षिक.`,
  ];

  const stepsExplanationEn = [
    `1. Scale of Finance: ₹${baseCropFinance.toLocaleString("en-IN")} for ${totalCalculatedAcres.toFixed(1)} acres of cultivated crops.`,
    `2. Post-harvest / Household Consumption Buffer (10%): ₹${postHarvestBuffer10Percent.toLocaleString("en-IN")}.`,
    `3. Farm Asset Maintenance & Insurance Buffer (20%): ₹${farmMaintenanceBuffer20Percent.toLocaleString("en-IN")}.`,
    `4. Year 1 Sanctioned KCC Limit: ₹${totalYear1CreditLimit.toLocaleString("en-IN")} (130% of crop finance).`,
    `5. 5-Year Revolving Limit (10% compound annual escalation): ₹${totalYear5RevolvingLimit.toLocaleString("en-IN")}.`,
    isMaharashtraZeroPercentEligible
      ? `6. Maharashtra Dr. Panjabrao Deshmukh Subvention: 0% effective interest up to ₹3,00,000 upon timely repayment!`
      : `6. Central Govt 3% prompt repayment incentive: 4.0% effective interest rate per annum.`,
  ];

  return {
    totalLandAcre: totalCalculatedAcres,
    cropsBreakdown,
    baseCropFinance,
    postHarvestBuffer10Percent,
    farmMaintenanceBuffer20Percent,
    totalYear1CreditLimit,
    totalYear5RevolvingLimit,
    officialInterestRatePercent,
    govtInterestSubventionPercent,
    effectiveInterestRatePercent,
    isMaharashtraZeroPercentEligible,
    annualInterestAtCommercialRate,
    annualInterestAtKccRate,
    annualSavingsVsCommercial,
    tenureYears: 5,
    stepsExplanationMr,
    stepsExplanationEn,
  };
}
