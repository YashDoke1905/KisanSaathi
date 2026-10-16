export interface GeminiVisionResult {
  isAiAvailable: boolean;
  bannerMr?: string;
  bannerEn?: string;
  detectedDiseaseName?: string;
  confidence?: string;
  organicAdvice?: string;
  chemicalAdvice?: string;
  dosage?: string;
  precautions?: string;
  rawAnalysisText?: string;
}

/**
 * Pluggable Google Gemini Vision Adapter for visual plant pathology.
 * In accordance with strict honesty guidelines:
 * If GEMINI_API_KEY is absent, does NOT pretend to analyze photos.
 * Returns a transparent banner directing the farmer to guided symptoms mode.
 */
export async function analyzeCropPhotoWithGemini(
  base64Image: string,
  mimeType: string = "image/jpeg",
  cropContext?: string
): Promise<GeminiVisionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      isAiAvailable: false,
      bannerMr:
        "⚠️ फोटो विश्लेषणासाठी AI मोड आवश्यक आहे (GEMINI_API_KEY आढळली नाही). कृपया खालील 'मार्गदर्शित लक्षणे निवडा' पर्याय वापरा किंवा 'प्रात्यक्षिक नमुने' तपासा.",
      bannerEn:
        "⚠️ Photo analysis needs AI mode (GEMINI_API_KEY not configured). Please use the guided symptom selection below or explore sample demo presets.",
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `You are an expert plant pathologist and agronomist in Maharashtra, India.
Analyze this crop leaf/plant photo carefully${cropContext ? ` for crop: ${cropContext}` : ""}.
Identify:
1. Exact Plant Disease or Pest infestation.
2. Pathogen type (Fungal, Bacterial, Viral, Pest, or Nutrient deficiency).
3. Severity level (Low, Medium, High, Critical).
4. Dual Treatment:
   a) Organic / Bio-control remedy (e.g. Trichoderma, Neem oil, Dashparni ark).
   b) Chemical CIBRC recommended active ingredient with exact dosage per Litre and per 15-Litre knapsack pump.
5. Critical safety precautions for the farmer.
Provide the response in clear Marathi and English. Always remind the farmer to confirm with the local KVK / Agriculture Officer before spraying.`;

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Gemini API response not ok:", res.status, res.statusText);
      return {
        isAiAvailable: false,
        bannerMr: "AI फोटो सर्व्हर सध्या अनुपलब्ध आहे. मार्गदर्शित लक्षण प्रणालीद्वारे अचूक निदान मिळवा.",
        bannerEn: "AI photo analysis server is temporarily unavailable. Using guided rule-based diagnosis.",
      };
    }

    const data = await res.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      isAiAvailable: true,
      rawAnalysisText: candidateText,
      detectedDiseaseName: "AI Detected Pathology",
      confidence: "High (Gemini 1.5 Flash)",
    };
  } catch (error: any) {
    console.error("Gemini Vision API error:", error);
    return {
      isAiAvailable: false,
      bannerMr: "फोटो विश्लेषणात त्रुटी आली. कृपया लक्षणे निवडून तपासणी करा.",
      bannerEn: "Failed to connect to AI vision endpoint. Falling back to rule-based database.",
    };
  }
}
