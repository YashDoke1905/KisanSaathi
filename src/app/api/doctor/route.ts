import { NextRequest, NextResponse } from "next/server";
import {
  diagnoseBySymptoms,
  getDoctorFilterMetadata,
  getSamplePresets,
  MANDATORY_KVK_DISCLAIMER_MR,
  MANDATORY_KVK_DISCLAIMER_EN,
} from "../../../services/doctor/ruleBasedDoctorAdapter";
import { analyzeCropPhotoWithGemini } from "../../../services/doctor/geminiVisionAdapter";
import { DiagnosticQuery } from "../../../services/doctor/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const presetId = searchParams.get("presetId");

    if (presetId) {
      const response = diagnoseBySymptoms({ demoPresetId: presetId });
      return NextResponse.json({ success: true, data: response });
    }

    const metadata = getDoctorFilterMetadata();
    const demoPresets = getSamplePresets();

    return NextResponse.json({
      success: true,
      metadata,
      demoPresets,
      kvkDisclaimerMr: MANDATORY_KVK_DISCLAIMER_MR,
      kvkDisclaimerEn: MANDATORY_KVK_DISCLAIMER_EN,
      hasGeminiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""),
    });
  } catch (error: any) {
    console.error("Doctor API GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load doctor metadata" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: DiagnosticQuery = await req.json();

    // 1. If photo upload provided, try Gemini Vision
    if (body.base64Image && !body.isDemoPreset) {
      const geminiResult = await analyzeCropPhotoWithGemini(
        body.base64Image,
        "image/jpeg",
        body.cropId
      );

      // If AI is NOT available (missing key or failed), return honest response with fallback
      if (!geminiResult.isAiAvailable) {
        // Run rule-based diagnosis on symptoms provided if any, else empty query
        const fallbackDiagnosis = diagnoseBySymptoms(body);

        return NextResponse.json({
          success: true,
          modeUsed: "Rule_Based",
          isAiAvailable: false,
          aiNoticeMr:
            geminiResult.bannerMr ||
            "⚠️ फोटो विश्लेषणासाठी AI मोड आवश्यक आहे (GEMINI_API_KEY आढळली नाही).",
          aiNoticeEn:
            geminiResult.bannerEn ||
            "⚠️ Photo analysis needs AI mode (GEMINI_API_KEY not configured).",
          data: fallbackDiagnosis,
        });
      }

      // If Gemini AI succeeded
      const fallbackDiagnosis = diagnoseBySymptoms(body);
      return NextResponse.json({
        success: true,
        modeUsed: "Gemini_AI",
        isAiAvailable: true,
        aiAnalysis: geminiResult,
        data: fallbackDiagnosis,
      });
    }

    // 2. Demo Preset or Rule-Based Diagnosis
    const diagnosis = diagnoseBySymptoms(body);

    return NextResponse.json({
      success: true,
      modeUsed: body.demoPresetId ? "Demo_Preset" : "Rule_Based",
      isAiAvailable: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""),
      data: diagnosis,
    });
  } catch (error: any) {
    console.error("Doctor API POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run diagnosis" },
      { status: 500 }
    );
  }
}
