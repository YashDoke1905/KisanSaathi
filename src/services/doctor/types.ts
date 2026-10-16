import {
  PlantDiseaseDef,
  AffectedPlantPart,
  ColorPattern,
  GrowthStage,
  PathogenType,
} from "../../data/diseases";

export interface DiagnosticQuery {
  cropId?: string;
  affectedPlantPart?: AffectedPlantPart;
  colorPattern?: ColorPattern;
  growthStage?: GrowthStage;
  pestObserved?: boolean;
  userDescription?: string;
  base64Image?: string;
  isDemoPreset?: boolean;
  demoPresetId?: string;
}

export interface MatchedDiseaseResult {
  disease: PlantDiseaseDef;
  confidenceScore: number; // 0 to 100%
  matchingReasonsMr: string[];
  matchingReasonsEn: string[];
  isTopMatch: boolean;
  kvkDisclaimerMr: string;
  kvkDisclaimerEn: string;
}

export interface DoctorDiagnosisResponse {
  modeUsed: "Rule_Based" | "Gemini_AI" | "Demo_Preset";
  isAiAvailable: boolean;
  aiModeNoticeMr?: string;
  aiModeNoticeEn?: string;
  querySummary: {
    cropNameMr: string;
    cropNameEn: string;
    partNameMr: string;
    colorPatternMr: string;
  };
  totalMatchesFound: number;
  results: MatchedDiseaseResult[];
  recommendedActionMr: string;
  recommendedActionEn: string;
  kvkOfficerNote: string;
}

export interface DoctorPresetSample {
  id: string;
  labelMr: string;
  labelEn: string;
  cropId: string;
  diseaseId: string;
  affectedPart: AffectedPlantPart;
  colorPattern: ColorPattern;
  descriptionMr: string;
  descriptionEn: string;
}
