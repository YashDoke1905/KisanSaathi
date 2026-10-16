import { describe, it, expect } from "vitest";
import { VERIFIED_DISEASES } from "../src/data/diseases";
import {
  diagnoseBySymptoms,
  getSamplePresets,
  getDoctorFilterMetadata,
  MANDATORY_KVK_DISCLAIMER_MR,
  MANDATORY_KVK_DISCLAIMER_EN,
} from "../src/services/doctor/ruleBasedDoctorAdapter";
import { analyzeCropPhotoWithGemini } from "../src/services/doctor/geminiVisionAdapter";

describe("Phase 7: Verified Diseases Dataset Integrity", () => {
  it("contains at least 50 verified plant pathology definitions across Maharashtra crops", () => {
    expect(VERIFIED_DISEASES.length).toBeGreaterThanOrEqual(50);
  });

  it("covers major cash crops, pulses, oilseeds, fruits, and vegetables in Maharashtra", () => {
    const crops = new Set(VERIFIED_DISEASES.map((d) => d.cropId.toLowerCase()));
    expect(crops.has("cotton")).toBe(true);
    expect(crops.has("soybean")).toBe(true);
    expect(crops.has("onion")).toBe(true);
    expect(crops.has("sugarcane")).toBe(true);
    expect(crops.has("tomato")).toBe(true);
    expect(crops.has("grape")).toBe(true);
    expect(crops.has("pomegranate")).toBe(true);
    expect(crops.has("banana")).toBe(true);
    expect(crops.has("chilli")).toBe(true);
    expect(crops.has("wheat")).toBe(true);
    expect(crops.has("gram")).toBe(true);
  });

  it("ensures every disease has dual treatments (organic & chemical) and exact 15-litre knapsack pump dosage", () => {
    for (const d of VERIFIED_DISEASES) {
      expect(d.id).toBeTruthy();
      expect(d.nameMr).toBeTruthy();
      expect(d.nameEn).toBeTruthy();
      expect(d.cropNameMr).toBeTruthy();
      expect(d.pathogenType).toBeTruthy();
      expect(d.affectedPlantPart).toBeTruthy();
      expect(d.colorPattern).toBeTruthy();
      expect(d.growthStage).toBeTruthy();
      expect(d.severity).toBeTruthy();

      // Dual Treatment
      expect(d.organicControlMr.length).toBeGreaterThan(10);
      expect(d.organicControlEn.length).toBeGreaterThan(10);
      expect(d.chemicalControlMr.length).toBeGreaterThan(10);
      expect(d.chemicalControlEn.length).toBeGreaterThan(10);

      // Exact Knapsack 15L Dosage
      expect(d.dosagePerLitre).toBeTruthy();
      expect(d.knapsack15LDose).toBeTruthy();
      expect(d.knapsack15LDose.includes("१५ लिटर") || d.knapsack15LDose.includes("15L")).toBe(true);

      // Precaution
      expect(d.precautionMr.length).toBeGreaterThan(10);
      expect(d.precautionEn.length).toBeGreaterThan(10);
    }
  });
});

describe("Phase 7: Rule-Based Plant Pathology Matching Engine", () => {
  it("correctly identifies Cotton Pink Bollworm from fruit pod entry hole symptoms", () => {
    const diagnosis = diagnoseBySymptoms({
      cropId: "cotton",
      affectedPlantPart: "Fruit_Pod",
      colorPattern: "Holes_Chewed",
      pestObserved: true,
    });

    expect(diagnosis.results.length).toBeGreaterThan(0);
    const top = diagnosis.results[0];
    expect(top.disease.id).toBe("cotton-pink-bollworm");
    expect(top.confidenceScore).toBeGreaterThanOrEqual(75);
    expect(top.isTopMatch).toBe(true);
    expect(top.matchingReasonsMr.length).toBeGreaterThanOrEqual(2);
    expect(top.kvkDisclaimerMr).toBe(MANDATORY_KVK_DISCLAIMER_MR);
  });

  it("correctly identifies Onion Purple Blotch from leaf spot symptoms", () => {
    const diagnosis = diagnoseBySymptoms({
      cropId: "onion",
      affectedPlantPart: "Leaf",
      colorPattern: "Brown_Black_Spots",
    });

    expect(diagnosis.results.length).toBeGreaterThan(0);
    const top = diagnosis.results[0];
    expect(top.disease.id).toBe("onion-purple-blotch");
    expect(top.confidenceScore).toBeGreaterThanOrEqual(75);
    expect(top.disease.knapsack15LDose).toBeTruthy();
  });

  it("correctly identifies Tomato Early Blight from leaf spots", () => {
    const diagnosis = diagnoseBySymptoms({
      cropId: "tomato",
      affectedPlantPart: "Leaf",
      colorPattern: "Brown_Black_Spots",
    });

    expect(diagnosis.results.length).toBeGreaterThan(0);
    const top = diagnosis.results[0];
    expect(top.disease.id).toBe("tomato-early-blight");
  });

  it("correctly identifies Grape Downy Mildew from leaf yellowing and oil spots", () => {
    const diagnosis = diagnoseBySymptoms({
      cropId: "grape",
      affectedPlantPart: "Leaf",
      colorPattern: "Yellowing",
    });

    expect(diagnosis.results.length).toBeGreaterThan(0);
    const top = diagnosis.results[0];
    expect(top.disease.id).toBe("grape-downy-mildew");
  });

  it("includes mandatory KVK advice note in every diagnosis response", () => {
    const diagnosis = diagnoseBySymptoms({
      cropId: "soybean",
      affectedPlantPart: "Leaf",
      colorPattern: "Yellowing",
    });

    expect(diagnosis.kvkOfficerNote).toBe(MANDATORY_KVK_DISCLAIMER_MR);
    for (const r of diagnosis.results) {
      expect(r.kvkDisclaimerMr).toBe(MANDATORY_KVK_DISCLAIMER_MR);
      expect(r.kvkDisclaimerEn).toBe(MANDATORY_KVK_DISCLAIMER_EN);
    }
  });
});

describe("Phase 7: Demo Presets & Honest AI Fallback", () => {
  it("provides canonical demo presets explicitly labeled for demonstration", () => {
    const presets = getSamplePresets();
    expect(presets.length).toBeGreaterThanOrEqual(4);

    for (const p of presets) {
      expect(p.id).toBeTruthy();
      expect(p.labelMr).toContain("प्रात्यक्षिक नमुना");
      expect(p.labelEn).toContain("Demo Preset");
      expect(p.cropId).toBeTruthy();
      expect(p.diseaseId).toBeTruthy();
    }
  });

  it("runs demo preset instant diagnosis with high confidence and educational notice", () => {
    const res = diagnoseBySymptoms({ demoPresetId: "preset-cotton-bollworm" });
    expect(res.modeUsed).toBe("Demo_Preset");
    expect(res.results.length).toBe(1);
    expect(res.results[0].disease.id).toBe("cotton-pink-bollworm");
    expect(res.results[0].confidenceScore).toBe(98);
    expect(res.aiModeNoticeMr).toContain("प्रात्यक्षिक नमुना मोड सक्रिय आहे");
  });

  it("returns honest AI fallback banner without faking vision analysis when GEMINI_API_KEY is not configured", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await analyzeCropPhotoWithGemini("data:image/jpeg;base64,dummy_test_bytes");
    expect(res.isAiAvailable).toBe(false);
    expect(res.bannerMr).toContain("फोटो विश्लेषणासाठी AI मोड आवश्यक आहे");
    expect(res.bannerEn).toContain("Photo analysis needs AI mode");

    // Restore key if existed
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("returns filter metadata including crops, parts, patterns, and stages", () => {
    const meta = getDoctorFilterMetadata();
    expect(meta.crops.length).toBeGreaterThanOrEqual(10);
    expect(meta.parts.length).toBe(6);
    expect(meta.patterns.length).toBe(6);
    expect(meta.stages.length).toBe(5);
  });
});
