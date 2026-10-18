"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { AudioReaderButton } from "@/components/AudioReaderButton";
import {
  Stethoscope,
  Sparkles,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ShieldCheck,
  FlaskConical,
  Leaf,
  Bug,
  RotateCcw,
  Info,
  Upload,
  Droplets,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  AffectedPlantPart,
  ColorPattern,
  GrowthStage,
  PlantDiseaseDef,
} from "@/data/diseases";
import {
  DoctorDiagnosisResponse,
  DoctorPresetSample,
  MatchedDiseaseResult,
} from "@/services/doctor/types";

export default function DoctorPage() {
  const { language } = useLanguage();
  const isMr = language === "mr";
  const isHi = language === "hi";

  // Active Tab: "guided" vs "photo"
  const [activeTab, setActiveTab] = useState<"guided" | "photo">("guided");

  // Metadata & Presets
  const [metadata, setMetadata] = useState<{
    crops: { cropId: string; nameMr: string; nameEn: string }[];
    parts: { key: AffectedPlantPart; labelMr: string; labelEn: string }[];
    patterns: { key: ColorPattern; labelMr: string; labelEn: string }[];
    stages: { key: GrowthStage; labelMr: string; labelEn: string }[];
  } | null>(null);
  const [demoPresets, setDemoPresets] = useState<DoctorPresetSample[]>([]);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<string>("cotton");
  const [selectedPart, setSelectedPart] = useState<AffectedPlantPart>("Leaf");
  const [selectedPattern, setSelectedPattern] = useState<ColorPattern>("Brown_Black_Spots");
  const [selectedStage, setSelectedStage] = useState<GrowthStage>("Vegetative");
  const [pestObserved, setPestObserved] = useState<boolean>(false);
  const [userDescription, setUserDescription] = useState<string>("");

  // Photo State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Loading & Results
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosisResponse, setDiagnosisResponse] = useState<DoctorDiagnosisResponse | null>(null);
  const [aiNotice, setAiNotice] = useState<{ mr: string; en: string } | null>(null);
  const [expandedMatchIndex, setExpandedMatchIndex] = useState<number | null>(null);

  // Load Metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch("/api/doctor");
        const json = await res.json();
        if (json.success) {
          setMetadata(json.metadata);
          setDemoPresets(json.demoPresets || []);
          setHasGeminiKey(json.hasGeminiKey);
        }
      } catch (e) {
        console.error("Failed to load doctor metadata:", e);
      }
    }
    loadMetadata();
  }, []);

  // Run Diagnosis
  const handleDiagnose = async (overridePresetId?: string) => {
    setLoading(true);
    setAiNotice(null);

    try {
      const payload: any = {
        cropId: selectedCrop,
        affectedPlantPart: selectedPart,
        colorPattern: selectedPattern,
        growthStage: selectedStage,
        pestObserved: pestObserved,
        userDescription: userDescription,
      };

      if (overridePresetId) {
        payload.demoPresetId = overridePresetId;
        payload.isDemoPreset = true;
      } else if (activeTab === "photo" && photoPreview) {
        payload.base64Image = photoPreview;
      }

      const res = await fetch("/api/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setDiagnosisResponse(json.data);
        if (json.aiNoticeMr || json.aiNoticeEn) {
          setAiNotice({ mr: json.aiNoticeMr, en: json.aiNoticeEn });
        }
      }
    } catch (e) {
      console.error("Diagnosis error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setSelectedPresetId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Demo Preset
  const handleSelectPreset = (preset: DoctorPresetSample) => {
    setSelectedPresetId(preset.id);
    setSelectedCrop(preset.cropId);
    setSelectedPart(preset.affectedPart);
    setSelectedPattern(preset.colorPattern);
    handleDiagnose(preset.id);
  };

  // Prepare Audio Text
  const topResult = diagnosisResponse?.results?.[0];
  const audioText = topResult
    ? isMr
      ? `पिकाचे नाव ${topResult.disease.cropNameMr}. संभाव्य रोग ${topResult.disease.nameMr}. तीव्रता ${topResult.disease.severity}. सेंद्रिय उपाय: ${topResult.disease.organicControlMr}. रासायनिक उपाय: ${topResult.disease.chemicalControlMr}. फवारणी प्रमाण: ${topResult.disease.knapsack15LDose}. खबरदारी: ${topResult.disease.precautionMr}. स्थानिक कृषी विज्ञान केंद्राचा सल्ला घेऊनच फवारणी करावी.`
      : isHi
        ? `फसल का नाम ${topResult.disease.cropNameEn}। संभावित रोग ${topResult.disease.nameHi || topResult.disease.nameEn}। जैविक उपचार: ${topResult.disease.organicControlEn}। रासायनिक उपचार: ${topResult.disease.chemicalControlEn}। छिड़काव मात्रा: ${topResult.disease.knapsack15LDose}।`
        : `Crop ${topResult.disease.cropNameEn}. Likely pathology ${topResult.disease.nameEn}. Severity ${topResult.disease.severity}. Organic control: ${topResult.disease.organicControlEn}. Chemical control: ${topResult.disease.chemicalControlEn}. Dosage: ${topResult.disease.knapsack15LDose}. Always consult Krishi Vigyan Kendra before spraying.`
    : "";

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#121411] text-stone-900 dark:text-stone-100 transition-colors pb-24">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors py-1 min-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isMr ? "मुख्य डॅशबोर्ड" : isHi ? "होम डैशबोर्ड" : "Home Dashboard"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <ProvenanceBadge type="live" sourceText="ICAR / CIBRC 2026" />
            {topResult && (
              <AudioReaderButton
                text={audioText}
                lang={isMr ? "mr" : isHi ? "hi" : "en"}
                label={isMr ? "निदान ऐका" : isHi ? "निदान सुनें" : "Listen"}
              />
            )}
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span>
              {isMr ? "पीक डॉक्टर व रोगनिदान" : isHi ? "फसल डॉक्टर एवं रोग निदान" : "Crop Doctor & Diagnostics"}
            </span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 pl-11">
            {isMr
              ? "शास्त्रीय वनस्पती रोगनिदान, CIBRC प्रमाणित सेंद्रिय/रासायनिक उपचार व नॅपसॅक पंप प्रमाण"
              : isHi
                ? "शास्त्रीय पौध रोग निदान, CIBRC प्रमाणित उपचार व पंप खुराक"
                : "Plant pathology diagnosis, CIBRC verified dual remedies & knapsack dosage"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-stone-200/70 dark:bg-stone-900/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("guided")}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === "guided"
                ? "bg-white dark:bg-[#1E221B] text-[#1B4332] dark:text-[#52B788] shadow-sm font-extrabold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>
              {isMr
                ? "मार्गदर्शित लक्षणे (Guided)"
                : isHi
                  ? "लक्षण आधारित (Guided)"
                  : "Guided Symptoms"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === "photo"
                ? "bg-white dark:bg-[#1E221B] text-[#1B4332] dark:text-[#52B788] shadow-sm font-extrabold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>
              {isMr
                ? "फोटो विश्लेषण (Photo)"
                : isHi
                  ? "फोटो विश्लेषण (Photo)"
                  : "Photo Analysis"}
            </span>
          </button>
        </div>

        {/* HONEST AI FALLBACK BANNER */}
        {(!hasGeminiKey || aiNotice) && (
          <div className="p-4 rounded-3xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 space-y-1.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold font-heading">
                  {isMr
                    ? "फोटो विश्लेषणासाठी AI मोड आवश्यक आहे (GEMINI_API_KEY आढळली नाही)"
                    : isHi
                      ? "फोटो विश्लेषण के लिए AI मोड आवश्यक है"
                      : "Photo analysis needs AI mode (GEMINI_API_KEY not configured)"}
                </div>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-[11px]">
                  {isMr
                    ? "आमचे ॲप बनावट किंवा अंदाजे फोटो निदान करत नाही. अचूक आणि अधिकृत उपचारांसाठी खालील 'मार्गदर्शित लक्षणे' पर्याय वापरा किंवा तयार 'प्रात्यक्षिक नमुने' तपासा."
                    : isHi
                      ? "यह ऐप अनुमानित फोटो विश्लेषण नहीं करता। सटीक निदान के लिए 'मार्गदर्शित लक्षण' चुनें या 'डेमो नमूने' देखें।"
                      : "We do not fake photo pathology. For 100% verified CIBRC dosage, use the Guided Symptoms engine or try our educational Demo Presets below."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: GUIDED SYMPTOM QUESTIONNAIRE
            ======================================================== */}
        {activeTab === "guided" && (
          <div className="bg-white dark:bg-[#1E221B] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100">
                  {isMr ? "पिकाची माहिती व लक्षणे निवडा" : isHi ? "फसल और लक्षण चुनें" : "Select Crop & Symptoms"}
                </h2>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                {isMr ? "५०+ रोग व कीड संदर्भ" : "50+ Vetted Pathologies"}
              </span>
            </div>

            {/* 1. Crop Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                {isMr ? "१. पिक निवडा (Select Crop):" : "1. Select Crop:"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {metadata?.crops?.map((c) => {
                  const isSelected = selectedCrop.toLowerCase() === c.cropId.toLowerCase();
                  return (
                    <button
                      key={c.cropId}
                      type="button"
                      onClick={() => setSelectedCrop(c.cropId)}
                      className={`p-2.5 rounded-2xl border text-xs font-semibold text-center transition-all min-h-[44px] ${
                        isSelected
                          ? "border-[#1B4332] bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] font-bold shadow-xs"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-900/40"
                      }`}
                    >
                      {isMr ? c.nameMr : c.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Plant Part */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                {isMr ? "२. बाधित वनस्पती भाग (Affected Plant Part):" : "2. Affected Plant Part:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {metadata?.parts?.map((p) => {
                  const isSelected = selectedPart === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPart(p.key)}
                      className={`p-3 rounded-2xl border text-xs font-medium text-left flex items-center justify-between transition-all min-h-[46px] ${
                        isSelected
                          ? "border-[#1B4332] bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] font-bold shadow-xs"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-900/40"
                      }`}
                    >
                      <span>{isMr ? p.labelMr : p.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Visual Pattern / Color */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                {isMr ? "३. लक्षणांचे स्वरूप व रंग (Visual Pattern):" : "3. Visual Pattern / Color:"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {metadata?.patterns?.map((pt) => {
                  const isSelected = selectedPattern === pt.key;
                  return (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={() => setSelectedPattern(pt.key)}
                      className={`p-3 rounded-2xl border text-xs font-medium text-left flex items-center justify-between transition-all min-h-[46px] ${
                        isSelected
                          ? "border-[#1B4332] bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] font-bold shadow-xs"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-900/40"
                      }`}
                    >
                      <span>{isMr ? pt.labelMr : pt.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Growth Stage & Pest Observation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  {isMr ? "४. पिकाची अवस्था (Growth Stage):" : "4. Crop Growth Stage:"}
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as GrowthStage)}
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px] font-semibold"
                >
                  {metadata?.stages?.map((s) => (
                    <option key={s.key} value={s.key}>
                      {isMr ? s.labelMr : s.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  {isMr ? "५. प्रत्यक्ष अळी किंवा कीड दिसली का? (Pests Visible?):" : "5. Pests/Larvae Observed?:"}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPestObserved(true)}
                    className={`flex-1 p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[46px] transition-all ${
                      pestObserved
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold shadow-xs"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-900/40"
                    }`}
                  >
                    <Bug className="w-4 h-4 text-amber-600" />
                    <span>{isMr ? "होय (कीटक दिसले)" : "Yes (Pests Seen)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestObserved(false)}
                    className={`flex-1 p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[46px] transition-all ${
                      !pestObserved
                        ? "border-[#1B4332] bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] font-bold shadow-xs"
                        : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-900/40"
                    }`}
                  >
                    <Leaf className="w-4 h-4 text-[#1B4332]" />
                    <span>{isMr ? "नाही (फक्त डाग/सुकणे)" : "No (Only Spots)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {isMr
                  ? "अतिरिक्त लक्षणे किंवा माहिती (ऐच्छिक - Optional):"
                  : "Additional Symptoms / Keywords (Optional):"}
              </label>
              <input
                type="text"
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder={
                  isMr
                    ? "उदा. वर्तुळाकार रिंग, पांढरी माशी, तेलकट चट्टे..."
                    : "e.g. concentric rings, whitefly, oily spots..."
                }
                className="w-full text-xs p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => handleDiagnose()}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all min-h-[52px]"
              >
                {loading ? (
                  <span>{isMr ? "तपासणी सुरू आहे..." : "Diagnosing..."}</span>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 text-amber-300" />
                    <span>{isMr ? "रोग निदान करा (Diagnose Now)" : "Diagnose Disease"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCrop("cotton");
                  setSelectedPart("Leaf");
                  setSelectedPattern("Brown_Black_Spots");
                  setSelectedStage("Vegetative");
                  setPestObserved(false);
                  setUserDescription("");
                  setDiagnosisResponse(null);
                }}
                className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-h-[52px] min-w-[52px] flex items-center justify-center"
                title={isMr ? "रीसेट करा" : "Reset"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PHOTO ANALYSIS & DEMO PRESETS
            ======================================================== */}
        {activeTab === "photo" && (
          <div className="space-y-4">
            {/* Camera / Upload Box */}
            <div className="bg-white dark:bg-[#1E221B] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 md:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100">
                    {isMr ? "बाधित पानाचा / पिकाचा फोटो घ्या" : "Capture or Upload Crop Photo"}
                  </h2>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  {hasGeminiKey ? "AI Vision Active" : "AI Mode Inactive"}
                </span>
              </div>

              {photoPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden max-h-64 border border-stone-200 dark:border-stone-800 flex items-center justify-center bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Crop disease upload preview"
                      className="max-h-64 object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDiagnose()}
                      disabled={loading}
                      className="flex-1 py-3 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{isMr ? "फोटोचे विश्लेषण करा" : "Analyze Photo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[48px]"
                    >
                      {isMr ? "काढून टाका" : "Remove"}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-3xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors">
                  <Upload className="w-9 h-9 text-stone-400 mb-2" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 text-center">
                    {isMr
                      ? "कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा"
                      : "Tap to capture photo or upload from gallery"}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-1">
                    JPG, PNG किंवा WebP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* CANONICAL DEMO PRESETS */}
            <div className="bg-white dark:bg-[#1E221B] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 md:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100">
                      {isMr
                        ? "प्रात्यक्षिक नमुने (Demo Presets)"
                        : "Educational Demo Presets"}
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      {isMr
                        ? "प्रत्यक्ष चाचणीसाठी खालीलपैकी कोणत्याही प्रात्यक्षिक नमुन्यावर क्लिक करा"
                        : "Click any verified preset below to test instant clinical diagnosis"}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {isMr ? "प्रात्यक्षिक" : "Demo Only"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {demoPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? "border-[#1B4332] bg-[#1B4332]/10 dark:bg-[#52B788]/20 ring-2 ring-[#1B4332]"
                          : "border-stone-200 dark:border-stone-800 hover:border-[#1B4332]/60 bg-stone-50/50 dark:bg-stone-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {preset.cropId}
                        </span>
                        <span className="text-[10px] font-bold text-[#1B4332] dark:text-[#52B788]">
                          {isMr ? "प्रात्यक्षिक" : "Demo"}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                        {isMr ? preset.labelMr : preset.labelEn}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                        {isMr ? preset.descriptionMr : preset.descriptionEn}
                      </p>
                      <div className="mt-2.5 text-[11px] text-[#1B4332] dark:text-[#52B788] font-bold flex items-center gap-1">
                        <span>{isMr ? "निदान पहा" : "View Diagnosis"}</span>
                        <span>→</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            DIAGNOSIS RESULTS SECTION
            ======================================================== */}
        {diagnosisResponse && (
          <div className="space-y-4 pt-1">
            {/* Primary Match Card */}
            {topResult ? (
              <div className="bg-white dark:bg-[#1E221B] rounded-3xl border-2 border-emerald-500/80 p-4 md:p-5 shadow-lg space-y-4">
                {/* Mode & Title Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {diagnosisResponse.modeUsed === "Demo_Preset"
                          ? isMr
                            ? "प्रात्यक्षिक नमुना (Demo Preset)"
                            : "Demo Preset"
                          : isMr
                            ? "शास्त्रीय रोगनिदान (Match Found)"
                            : "Clinical Diagnosis"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {topResult.disease.pathogenTypeLabelMr} ({topResult.disease.pathogenType})
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                      {isMr ? topResult.disease.nameMr : topResult.disease.nameEn}
                    </h3>
                    <p className="text-xs text-stone-500 italic">
                      {topResult.disease.scientificName || topResult.disease.nameEn} |{" "}
                      {isMr ? `पिक: ${topResult.disease.cropNameMr}` : `Crop: ${topResult.disease.cropNameEn}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {topResult.confidenceScore}%
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {isMr ? "अचूकता गुण" : "Match Score"}
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 text-xs space-y-1.5 border border-stone-100 dark:border-stone-800">
                  <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isMr ? "निदानाची प्रमुख कारणे:" : "Matching Criteria:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                    {(isMr ? topResult.matchingReasonsMr : topResult.matchingReasonsEn).map(
                      (r, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* DUAL TREATMENT MODE: ORGANIC & CHEMICAL */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                      <span>
                        {isMr
                          ? "दुहेरी नियंत्रण पद्धती (सेंद्रिय व रासायनिक)"
                          : "Dual Treatment Solutions (Organic & Chemical)"}
                      </span>
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium">
                      CIBRC Authorized Active Ingredients
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 1. Organic Remedy */}
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <span>{isMr ? "🌿 सेंद्रिय / जैविक उपाय (Bio-Control)" : "🌿 Organic Control"}</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {isMr ? topResult.disease.organicControlMr : topResult.disease.organicControlEn}
                      </p>
                    </div>

                    {/* 2. Chemical Remedy */}
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                        <FlaskConical className="w-4 h-4 text-blue-600" />
                        <span>{isMr ? "🧪 रासायनिक उपाय (CIBRC Active Ingredient)" : "🧪 Chemical Remedy"}</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {isMr ? topResult.disease.chemicalControlMr : topResult.disease.chemicalControlEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EXACT KNAPSACK 15-LITRE PUMP DOSAGE */}
                <div className="rounded-2xl border border-amber-300 dark:border-amber-700/70 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200 text-xs">
                      <Droplets className="w-4 h-4 text-amber-600" />
                      <span>
                        {isMr
                          ? "🧴 अचूक फवारणी प्रमाण (Exact Dosage Recommendation)"
                          : "🧴 Exact Knapsack Pump Dosage"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      {isMr ? "१५ लिटर पंप" : "15L Knapsack"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div className="bg-white/80 dark:bg-[#1E221B]/80 rounded-xl p-2.5 border border-amber-200 dark:border-amber-800">
                      <div className="text-[11px] text-stone-500">
                        {isMr ? "प्रति १ लिटर पाण्यासाठी:" : "Per 1 Litre Water:"}
                      </div>
                      <div className="font-bold font-mono text-sm text-stone-900 dark:text-stone-100 tabular-nums">
                        {topResult.disease.dosagePerLitre}
                      </div>
                    </div>

                    <div className="bg-amber-500/15 dark:bg-amber-500/20 rounded-xl p-2.5 border border-amber-400 dark:border-amber-700">
                      <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        {isMr
                          ? "⭐ १५ लिटर नॅपसॅक पंपासाठी (एकत्रित प्रमाण):"
                          : "⭐ Standard 15L Pump Tank:"}
                      </div>
                      <div className="font-black font-mono text-base text-amber-900 dark:text-amber-200 tabular-nums">
                        {topResult.disease.knapsack15LDose}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precautions & Safety */}
                <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs space-y-1">
                  <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                    <span>{isMr ? "फवारणी करताना खबरदारी (Safety Precautions):" : "Safety Precautions:"}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                    {isMr ? topResult.disease.precautionMr : topResult.disease.precautionEn}
                  </p>
                </div>

                {/* MANDATORY KVK DISCLAIMER */}
                <div className="p-3.5 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {isMr
                        ? "स्थानिक कृषी विज्ञान केंद्र (KVK) सूचना:"
                        : "Official KVK Disclaimer:"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {isMr ? topResult.kvkDisclaimerMr : topResult.kvkDisclaimerEn}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E221B]">
                <p className="text-stone-500 text-sm">
                  {isMr
                    ? "कोणतेही रोग निदान आढळले नाही. कृपया लक्षणे बदलून पुन्हा प्रयत्न करा."
                    : "No matching disease found. Please refine symptoms."}
                </p>
              </div>
            )}

            {/* Alternative Possible Matches */}
            {diagnosisResponse.results.length > 1 && (
              <div className="bg-white dark:bg-[#1E221B] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 md:p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {isMr
                    ? "इतर संभाव्य रोग शक्यता (Other Possibilities):"
                    : "Other Possible Pathologies:"}
                </h4>

                <div className="space-y-2">
                  {diagnosisResponse.results.slice(1).map((match, idx) => {
                    const isExpanded = expandedMatchIndex === idx;
                    return (
                      <div
                        key={match.disease.id}
                        className="border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 text-xs bg-stone-50/50 dark:bg-stone-900/40"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedMatchIndex(isExpanded ? null : idx)}
                        >
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {isMr ? match.disease.nameMr : match.disease.nameEn}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {match.disease.cropNameMr} • {match.disease.pathogenTypeLabelMr}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                              {match.confidenceScore}%
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="pt-3 mt-2 border-t border-stone-200 dark:border-stone-800 space-y-2 text-[11px]">
                            <div>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                {isMr ? "सेंद्रिय उपाय: " : "Organic: "}
                              </span>
                              <span>
                                {isMr
                                  ? match.disease.organicControlMr
                                  : match.disease.organicControlEn}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-blue-700 dark:text-blue-400">
                                {isMr ? "रासायनिक उपाय: " : "Chemical: "}
                              </span>
                              <span>
                                {isMr
                                  ? match.disease.chemicalControlMr
                                  : match.disease.chemicalControlEn}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-amber-700 dark:text-amber-400">
                                {isMr ? "१५L पंप प्रमाण: " : "15L Pump Dose: "}
                              </span>
                              <span className="font-mono">{match.disease.knapsack15LDose}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return to Dashboard */}
        <div className="pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-[#1B4332] dark:text-[#52B788] bg-white dark:bg-[#1E221B] border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 py-3 rounded-2xl min-h-[48px] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isMr ? "मुख्य डॅशबोर्डवर परत जा" : isHi ? "मुख्य डैशबोर्ड पर वापस जाएं" : "Return to Home Dashboard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
