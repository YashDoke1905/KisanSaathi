import {
  VERIFIED_DISEASES,
  PlantDiseaseDef,
  AffectedPlantPart,
  ColorPattern,
  GrowthStage,
  PathogenType,
} from "../../data/diseases";
import {
  DiagnosticQuery,
  MatchedDiseaseResult,
  DoctorDiagnosisResponse,
  DoctorPresetSample,
} from "./types";

export const MANDATORY_KVK_DISCLAIMER_MR =
  "स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा तालुका कृषी अधिकाऱ्यांचा सल्ला घेऊनच फवारणी करावी.";
export const MANDATORY_KVK_DISCLAIMER_EN =
  "Always consult your local Krishi Vigyan Kendra (KVK) or Taluka Agriculture Officer before spraying.";

/**
 * Pre-configured canonical demo presets for educational demonstration.
 * Labeled explicitly as "प्रात्यक्षिक नमुना (Demo Preset)".
 */
export const DEMO_PRESETS: DoctorPresetSample[] = [
  {
    id: "preset-cotton-bollworm",
    labelMr: "कापूस - गुलाबी बोंडअळी (प्रात्यक्षिक नमुना)",
    labelEn: "Cotton - Pink Bollworm (Demo Preset)",
    cropId: "cotton",
    diseaseId: "cotton-pink-bollworm",
    affectedPart: "Fruit_Pod",
    colorPattern: "Holes_Chewed",
    descriptionMr: "बोंडांना बारीक छिद्रे, आत गुलाबी अळी आणि बोंड अकाली उमलणे.",
    descriptionEn: "Small entry boreholes in bolls, pink larvae feeding inside, premature opening.",
  },
  {
    id: "preset-onion-purple-blotch",
    labelMr: "कांदा - जांभळा करपा (प्रात्यक्षिक नमुना)",
    labelEn: "Onion - Purple Blotch (Demo Preset)",
    cropId: "onion",
    diseaseId: "onion-purple-blotch",
    affectedPart: "Leaf",
    colorPattern: "Brown_Black_Spots",
    descriptionMr: "पानांवर लंबगोलाकार जांभळट-तपकिरी रंगाचे चट्टे आणि कडा करपणे.",
    descriptionEn: "Sunken elliptical lesions with purple-brown centers on leaves.",
  },
  {
    id: "preset-tomato-early-blight",
    labelMr: "टोमॅटो - तांबोरा / करपा (प्रात्यक्षिक नमुना)",
    labelEn: "Tomato - Early Blight (Demo Preset)",
    cropId: "tomato",
    diseaseId: "tomato-early-blight",
    affectedPart: "Leaf",
    colorPattern: "Brown_Black_Spots",
    descriptionMr: "खालच्या पानांवर वर्तुळाकार काळे-तपकिरी गोल कडी असलेले ठिपके (Target board).",
    descriptionEn: "Concentric ring target board spots on lower leaves turning yellow.",
  },
  {
    id: "preset-grape-downy-mildew",
    labelMr: "द्राक्ष - डाऊनी मिल्ड्यू (प्रात्यक्षिक नमुना)",
    labelEn: "Grape - Downy Mildew (Demo Preset)",
    cropId: "grape",
    diseaseId: "grape-downy-mildew",
    affectedPart: "Leaf",
    colorPattern: "Yellowing",
    descriptionMr: "पानांच्या वर पिवळे तेलकट डाग आणि पानाच्या मागे पांढरी बुरशी.",
    descriptionEn: "Yellow oily spots on upper leaf surface, white downy growth underneath.",
  },
  {
    id: "preset-soybean-yellow-mosaic",
    labelMr: "सोयाबीन - पिवळा मोझॅक (प्रात्यक्षिक नमुना)",
    labelEn: "Soybean - Yellow Mosaic Virus (Demo Preset)",
    cropId: "soybean",
    diseaseId: "soybean-yellow-mosaic",
    affectedPart: "Leaf",
    colorPattern: "Yellowing",
    descriptionMr: "पानांवर अनियमित पिवळे व हिरवे चट्टे, पांढऱ्या माशीचा प्रादुर्भाव.",
    descriptionEn: "Irregular yellow and green mosaic pattern on leaves spread by whitefly.",
  },
  {
    id: "preset-sugarcane-red-rot",
    labelMr: "ऊस - लाल कुज / रेड रॉट (प्रात्यक्षिक नमुना)",
    labelEn: "Sugarcane - Red Rot (Demo Preset)",
    cropId: "sugarcane",
    diseaseId: "sugarcane-red-rot",
    affectedPart: "Stem",
    colorPattern: "Wilting",
    descriptionMr: "तिसऱ्या-चौथ्या पानांचे शेंडे सुकणे, ऊस चिरल्यावर आत लाल रंग व पांढरे पट्टे.",
    descriptionEn: "Crown leaves wilting, split cane showing blood red pith with white cross patches.",
  },
];

/**
 * Returns canonical demo presets.
 */
export function getSamplePresets(): DoctorPresetSample[] {
  return DEMO_PRESETS;
}

/**
 * Metadata for symptom query UI
 */
export function getDoctorFilterMetadata() {
  const crops = Array.from(
    new Map(
      VERIFIED_DISEASES.map((d) => [
        d.cropId,
        { cropId: d.cropId, nameMr: d.cropNameMr, nameEn: d.cropNameEn },
      ])
    ).values()
  );

  const parts: { key: AffectedPlantPart; labelMr: string; labelEn: string }[] = [
    { key: "Leaf", labelMr: "पान (Leaf)", labelEn: "Leaf" },
    { key: "Stem", labelMr: "खोड / फांदी (Stem)", labelEn: "Stem / Branch" },
    { key: "Fruit_Pod", labelMr: "फळ / बोंड / शेंग (Fruit/Pod)", labelEn: "Fruit / Pod" },
    { key: "Root_Base", labelMr: "मूळ / जमिनीलगतचा भाग (Root/Base)", labelEn: "Root / Crown" },
    { key: "Flower", labelMr: "फूल / कळी (Flower/Bud)", labelEn: "Flower / Bud" },
    { key: "Whole_Plant", labelMr: "संपूर्ण रोप (Whole Plant)", labelEn: "Whole Plant" },
  ];

  const patterns: { key: ColorPattern; labelMr: string; labelEn: string }[] = [
    { key: "Yellowing", labelMr: "पिवळे पडणे (Yellowing)", labelEn: "Yellowing" },
    { key: "Brown_Black_Spots", labelMr: "काळे / तपकिरी ठिपके (Spots)", labelEn: "Brown/Black Spots" },
    { key: "White_Powder", labelMr: "पांढरी बुरशी / पावडर (White Powder)", labelEn: "White Powder / Mold" },
    { key: "Curling", labelMr: "पाने आकसणे / गोळा होणे (Curling)", labelEn: "Leaf Curling" },
    { key: "Wilting", labelMr: "सुकणे / कोमेgroupरणे (Wilting)", labelEn: "Wilting / Drooping" },
    { key: "Holes_Chewed", labelMr: "पाने कुरतडलेली / छिद्रे (Holes/Chewed)", labelEn: "Holes / Chewed" },
  ];

  const stages: { key: GrowthStage; labelMr: string; labelEn: string }[] = [
    { key: "Seedling", labelMr: "रोप अवस्था (Seedling)", labelEn: "Seedling" },
    { key: "Vegetative", labelMr: "वाढीची अवस्था (Vegetative)", labelEn: "Vegetative" },
    { key: "Flowering", labelMr: "फुलधारणा (Flowering)", labelEn: "Flowering" },
    { key: "Fruiting_Maturity", labelMr: "फळधारणा / पक्वता (Fruiting)", labelEn: "Fruiting / Maturity" },
    { key: "All_Stages", labelMr: "कोणतीही अवस्था (All Stages)", labelEn: "All Stages" },
  ];

  return { crops, parts, patterns, stages };
}

/**
 * Rule-Based Plant Pathology Matching Algorithm.
 * Matches symptoms, plant parts, and visual patterns against 50+ vetted crop disease definitions.
 */
export function diagnoseBySymptoms(query: DiagnosticQuery): DoctorDiagnosisResponse {
  // Check if this is a direct demo preset lookup
  if (query.demoPresetId) {
    const preset = DEMO_PRESETS.find((p) => p.id === query.demoPresetId);
    if (preset) {
      const disease = VERIFIED_DISEASES.find((d) => d.id === preset.diseaseId);
      if (disease) {
        const topMatch: MatchedDiseaseResult = {
          disease,
          confidenceScore: 98,
          matchingReasonsMr: [
            `निवडलेला प्रात्यक्षिक नमुना: ${preset.labelMr}`,
            `पिक: ${disease.cropNameMr}`,
            `बाधित भाग: ${disease.affectedPlantPartLabelMr}`,
            `लक्षण स्वरूप: ${disease.colorPatternLabelMr}`,
          ],
          matchingReasonsEn: [
            `Selected Demo Preset: ${preset.labelEn}`,
            `Crop: ${disease.cropNameEn}`,
            `Affected Part: ${disease.affectedPlantPart}`,
            `Pattern: ${disease.colorPattern}`,
          ],
          isTopMatch: true,
          kvkDisclaimerMr: MANDATORY_KVK_DISCLAIMER_MR,
          kvkDisclaimerEn: MANDATORY_KVK_DISCLAIMER_EN,
        };

        return {
          modeUsed: "Demo_Preset",
          isAiAvailable: false,
          aiModeNoticeMr:
            "प्रात्यक्षिक नमुना मोड सक्रिय आहे. प्रत्यक्ष शेतात फवारणीपूर्वी स्थानिक KVK अधिकाऱ्यांचा सल्ला घ्या.",
          aiModeNoticeEn:
            "Demo preset mode active. Consult your local KVK officer before spraying in your field.",
          querySummary: {
            cropNameMr: disease.cropNameMr,
            cropNameEn: disease.cropNameEn,
            partNameMr: disease.affectedPlantPartLabelMr,
            colorPatternMr: disease.colorPatternLabelMr,
          },
          totalMatchesFound: 1,
          results: [topMatch],
          recommendedActionMr: `तातडीने ${disease.nameMr} नियंत्रणासाठी शिफारस केलेले सेंद्रिय किंवा रासायनिक उपाय योजावेत.`,
          recommendedActionEn: `Immediate application of recommended organic or chemical controls for ${disease.nameEn}.`,
          kvkOfficerNote: MANDATORY_KVK_DISCLAIMER_MR,
        };
      }
    }
  }

  // General rule-based scoring
  const scoredDiseases: {
    disease: PlantDiseaseDef;
    score: number;
    reasonsMr: string[];
    reasonsEn: string[];
  }[] = [];

  for (const d of VERIFIED_DISEASES) {
    let score = 0;
    const reasonsMr: string[] = [];
    const reasonsEn: string[] = [];

    // 1. Crop Match (Weight: 35)
    if (query.cropId) {
      if (d.cropId.toLowerCase() === query.cropId.toLowerCase()) {
        score += 35;
        reasonsMr.push(`पिक जुळले: ${d.cropNameMr}`);
        reasonsEn.push(`Crop matched: ${d.cropNameEn}`);
      } else {
        // Different crop: heavily penalize unless searching across all crops
        score -= 50;
      }
    } else {
      score += 10; // Baseline when no crop is specified
    }

    // 2. Affected Plant Part (Weight: 25)
    if (query.affectedPlantPart) {
      if (d.affectedPlantPart === query.affectedPlantPart) {
        score += 25;
        reasonsMr.push(`बाधित भाग जुळला: ${d.affectedPlantPartLabelMr}`);
        reasonsEn.push(`Plant part matched: ${d.affectedPlantPart}`);
      } else if (
        d.affectedPlantPart === "Whole_Plant" ||
        query.affectedPlantPart === "Whole_Plant"
      ) {
        score += 15;
        reasonsMr.push(`संपूर्ण रोगाचा प्रादुर्भाव जुळला`);
        reasonsEn.push(`Broad plant involvement`);
      }
    }

    // 3. Color / Symptom Pattern (Weight: 25)
    if (query.colorPattern) {
      if (d.colorPattern === query.colorPattern) {
        score += 25;
        reasonsMr.push(`लक्षण स्वरूप जुळले: ${d.colorPatternLabelMr}`);
        reasonsEn.push(`Color pattern matched: ${d.colorPattern}`);
      }
    }

    // 4. Growth Stage (Weight: 15)
    if (query.growthStage) {
      if (d.growthStage === query.growthStage || d.growthStage === "All_Stages") {
        score += 15;
        reasonsMr.push(`पिकाची अवस्था जुळली: ${d.growthStage}`);
        reasonsEn.push(`Growth stage matched`);
      }
    }

    // 5. Pest observed bonus
    if (query.pestObserved !== undefined) {
      if (query.pestObserved && d.pathogenType === "Pest") {
        score += 10;
        reasonsMr.push(`कीड प्रत्यक्ष दिसल्याची नोंद जुळली`);
        reasonsEn.push(`Observed pest matches insect infestation`);
      } else if (!query.pestObserved && d.pathogenType !== "Pest") {
        score += 5;
      }
    }

    // 6. User Description keyword boost
    if (query.userDescription && query.userDescription.trim().length > 2) {
      const words = query.userDescription.toLowerCase().split(/\s+/);
      let matchCount = 0;
      for (const w of words) {
        if (
          d.nameMr.toLowerCase().includes(w) ||
          d.nameEn.toLowerCase().includes(w) ||
          d.symptomsMr.some((s) => s.toLowerCase().includes(w)) ||
          d.symptomsEn.some((s) => s.toLowerCase().includes(w))
        ) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        const bonus = Math.min(15, matchCount * 5);
        score += bonus;
        reasonsMr.push(`वर्णनातील मुख्य शब्द जुळले (${matchCount})`);
        reasonsEn.push(`Description keywords matched`);
      }
    }

    // Normalization & clamping (0 to 98)
    const normalizedScore = Math.max(0, Math.min(98, score));

    if (normalizedScore >= 35) {
      scoredDiseases.push({
        disease: d,
        score: normalizedScore,
        reasonsMr,
        reasonsEn,
      });
    }
  }

  // Sort descending by score
  scoredDiseases.sort((a, b) => b.score - a.score);

  const topResults = scoredDiseases.slice(0, 5);

  const matchedResults: MatchedDiseaseResult[] = topResults.map((item, idx) => ({
    disease: item.disease,
    confidenceScore: item.score,
    matchingReasonsMr: item.reasonsMr,
    matchingReasonsEn: item.reasonsEn,
    isTopMatch: idx === 0,
    kvkDisclaimerMr: MANDATORY_KVK_DISCLAIMER_MR,
    kvkDisclaimerEn: MANDATORY_KVK_DISCLAIMER_EN,
  }));

  // Find crop name for summary
  const sampleMatch = topResults[0]?.disease;
  const cropNameMr = sampleMatch?.cropNameMr || (query.cropId || "सर्व पिके");
  const cropNameEn = sampleMatch?.cropNameEn || (query.cropId || "All Crops");

  return {
    modeUsed: "Rule_Based",
    isAiAvailable: false,
    aiModeNoticeMr:
      "मार्गदर्शित लक्षण प्रणालीद्वारे (Rule-Based Expert Engine) शास्त्रीय रोग निदान करण्यात आले आहे.",
    aiModeNoticeEn:
      "Diagnosis performed via Agronomic Rule-Based Expert Engine matching 50+ Maharashtra crop pathogens.",
    querySummary: {
      cropNameMr,
      cropNameEn,
      partNameMr: query.affectedPlantPart || "सर्व भाग",
      colorPatternMr: query.colorPattern || "विविध लक्षणे",
    },
    totalMatchesFound: topResults.length,
    results: matchedResults,
    recommendedActionMr:
      topResults.length > 0
        ? `प्राथमिक निष्कर्ष: ${topResults[0].disease.nameMr}. खालील सेंद्रिय किंवा रासायनिक उपचारांपैकी एकाची निवड करा.`
        : "लक्षणे स्पष्ट नाहीत. कृपया जवळच्या कृषी विज्ञान केंद्राशी (KVK) संपर्क साधा.",
    recommendedActionEn:
      topResults.length > 0
        ? `Primary finding: ${topResults[0].disease.nameEn}. Select one of the recommended organic or chemical controls.`
        : "Symptoms inconclusive. Please consult your local Krishi Vigyan Kendra.",
    kvkOfficerNote: MANDATORY_KVK_DISCLAIMER_MR,
  };
}
