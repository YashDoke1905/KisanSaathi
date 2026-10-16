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
  ChevronRight,
  ShieldCheck,
  FlaskConical,
  Leaf,
  Bug,
  RotateCcw,
  Info,
  HelpCircle,
  Upload,
  Droplets,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
      : `Crop ${topResult.disease.cropNameEn}. Likely pathology ${topResult.disease.nameEn}. Severity ${topResult.disease.severity}. Organic control: ${topResult.disease.organicControlEn}. Chemical control: ${topResult.disease.chemicalControlEn}. Dosage: ${topResult.disease.knapsack15LDose}. Always consult Krishi Vigyan Kendra before spraying.`
    : "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">
      {/* Top App Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              ←
            </Link>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  {isMr ? "पीक डॉक्टर" : isHi ? "फसल डॉक्टर" : "Crop Doctor"}
                </h1>
                <ProvenanceBadge
                  type="live"
                  sourceText="ICAR / CIBRC 2026"
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isMr
                  ? "शास्त्रीय वनस्पती रोगनिदान व सेंद्रिय/रासायनिक उपचार"
                  : isHi
                  ? "पौध रोग निदान और जैविक/रासायनिक समाधान"
                  : "Plant pathology diagnosis, dual remedies & knapsack dosage"}
              </p>
            </div>
          </div>

          {topResult && (
            <AudioReaderButton
              text={audioText}
              lang={isMr ? "mr" : isHi ? "hi" : "en"}
              label={isMr ? "निदान ऐका" : isHi ? "निदान सुनें" : "Listen"}
            />
          )}
        </div>

        {/* Tab Switcher */}
        <div className="max-w-4xl mx-auto px-4 pt-1 flex gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("guided")}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "guided"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Leaf className="w-4 h-4" />
            {isMr
              ? "📋 मार्गदर्शित लक्षणे (Guided)"
              : isHi
              ? "📋 लक्षण आधारित (Guided)"
              : "📋 Guided Symptoms"}
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "photo"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Camera className="w-4 h-4" />
            {isMr
              ? "📷 फोटो विश्लेषण (Photo Analysis)"
              : isHi
              ? "📷 फोटो विश्लेषण (Photo)"
              : "📷 Photo Analysis"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* HONEST AI FALLBACK BANNER */}
        {(!hasGeminiKey || aiNotice) && (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold">
                  {isMr
                    ? "⚠️ फोटो विश्लेषणासाठी AI मोड आवश्यक आहे (GEMINI_API_KEY आढळली नाही)"
                    : isHi
                    ? "⚠️ फोटो विश्लेषण के लिए AI मोड आवश्यक है (GEMINI_API_KEY नहीं मिला)"
                    : "⚠️ Photo analysis needs AI mode (GEMINI_API_KEY not configured)"}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {isMr ? "पिकाची माहिती व लक्षणे निवडा" : isHi ? "फसल और लक्षण चुनें" : "Select Crop & Symptoms"}
                </h2>
              </div>
              <span className="text-[11px] text-zinc-500">
                {isMr ? "५०+ रोग व कीड संदर्भ" : "50+ Vetted Pathologies"}
              </span>
            </div>

            {/* 1. Crop Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
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
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
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
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
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
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{isMr ? p.labelMr : p.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Visual Pattern / Color */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                {isMr ? "३. लक्षणांचे स्वरूप व रंग (Visual Pattern):" : "3. Visual Pattern / Color:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {metadata?.patterns?.map((pt) => {
                  const isSelected = selectedPattern === pt.key;
                  return (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={() => setSelectedPattern(pt.key)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{isMr ? pt.labelMr : pt.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Growth Stage & Pest Observation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  {isMr ? "४. पिकाची अवस्था (Growth Stage):" : "4. Crop Growth Stage:"}
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as GrowthStage)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {metadata?.stages?.map((s) => (
                    <option key={s.key} value={s.key}>
                      {isMr ? s.labelMr : s.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  {isMr ? "५. प्रत्यक्ष अळी किंवा कीड दिसली का? (Pests Visible?):" : "5. Pests/Larvae Observed?:"}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPestObserved(true)}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
                      pestObserved
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    {isMr ? "होय (कीटक दिसले)" : "Yes (Pests Seen)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestObserved(false)}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
                      !pestObserved
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    {isMr ? "नाही (फक्त डाग/सुकणे)" : "No (Only Spots/Wilting)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => handleDiagnose()}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <span>{isMr ? "तपासणी सुरू आहे..." : "Diagnosing..."}</span>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>{isMr ? "🔎 रोग निदान करा (Diagnose Now)" : "🔎 Diagnose Disease"}</span>
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
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
          <div className="space-y-6">
            {/* Camera / Upload Box */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {isMr ? "बाधित पानाचा / पिकाचा फोटो घ्या" : "Capture or Upload Crop Photo"}
                  </h2>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {hasGeminiKey ? "AI Vision Active" : "AI Mode Inactive"}
                </span>
              </div>

              {photoPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden max-h-64 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-black/5">
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
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isMr ? "फोटोचे विश्लेषण करा" : "Analyze Photo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {isMr ? "काढून टाका" : "Remove"}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isMr
                      ? "कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा"
                      : "Tap to capture photo or upload from gallery"}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1">
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {isMr
                        ? "प्रात्यक्षिक नमुने (Demo Presets)"
                        : "Educational Demo Presets"}
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      {isMr
                        ? "प्रत्यक्ष चाचणीसाठी खालीलपैकी कोणत्याही प्रात्यक्षिक नमुन्यावर क्लिक करा"
                        : "Click any verified preset below to test instant clinical diagnosis"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
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
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 bg-zinc-50/50 dark:bg-zinc-800/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {preset.cropId}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {isMr ? "प्रात्यक्षिक नमुना" : "Demo"}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {isMr ? preset.labelMr : preset.labelEn}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {isMr ? preset.descriptionMr : preset.descriptionEn}
                      </p>
                      <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
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
          <div className="space-y-6 pt-2">
            {/* Primary Match Card */}
            {topResult ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-emerald-500/80 p-5 shadow-lg space-y-5">
                {/* Mode & Title Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {diagnosisResponse.modeUsed === "Demo_Preset"
                          ? isMr
                            ? "प्रात्यक्षिक नमुना (Demo Preset)"
                            : "Demo Preset"
                          : isMr
                          ? "शास्त्रीय रोगनिदान (Match Found)"
                          : "Clinical Diagnosis"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {topResult.disease.pathogenTypeLabelMr} ({topResult.disease.pathogenType})
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {isMr ? topResult.disease.nameMr : topResult.disease.nameEn}
                    </h3>
                    <p className="text-xs text-zinc-500 italic">
                      {topResult.disease.scientificName || topResult.disease.nameEn} |{" "}
                      {isMr ? `पिक: ${topResult.disease.cropNameMr}` : `Crop: ${topResult.disease.cropNameEn}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {topResult.confidenceScore}%
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">
                      {isMr ? "अचूकता गुण (Confidence)" : "Match Score"}
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{isMr ? "निदानाची प्रमुख कारणे:" : "Matching Criteria:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                    {(isMr ? topResult.matchingReasonsMr : topResult.matchingReasonsEn).map(
                      (r, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* DUAL TREATMENT MODE: ORGANIC & CHEMICAL */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>
                        {isMr
                          ? "दुहेरी नियंत्रण पद्धती (सेंद्रिय व रासायनिक)"
                          : "Dual Treatment Solutions (Organic & Chemical)"}
                      </span>
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      CIBRC Authorized Active Ingredients
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Organic Remedy */}
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <span>{isMr ? "🌿 सेंद्रिय / जैविक उपाय (Bio-Control)" : "🌿 Organic Control"}</span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {isMr ? topResult.disease.organicControlMr : topResult.disease.organicControlEn}
                      </p>
                    </div>

                    {/* 2. Chemical Remedy */}
                    <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
                        <FlaskConical className="w-4 h-4 text-blue-600" />
                        <span>{isMr ? "🧪 रासायनिक उपाय (CIBRC Active Ingredient)" : "🧪 Chemical Remedy"}</span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {isMr ? topResult.disease.chemicalControlMr : topResult.disease.chemicalControlEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EXACT KNAPSACK 15-LITRE PUMP DOSAGE */}
                <div className="rounded-xl border-2 border-amber-300 dark:border-amber-600/70 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs">
                      <Droplets className="w-4 h-4 text-amber-600" />
                      <span>
                        {isMr
                          ? "🧴 अचूक फवारणी प्रमाण (Exact Dosage Recommendation)"
                          : "🧴 Exact Knapsack Pump Dosage"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      {isMr ? "१५ लिटर पंप" : "15L Knapsack"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/80 dark:bg-zinc-900/80 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800">
                      <div className="text-[11px] text-zinc-500">
                        {isMr ? "प्रति १ लिटर पाण्यासाठी:" : "Per 1 Litre Water:"}
                      </div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">
                        {topResult.disease.dosagePerLitre}
                      </div>
                    </div>

                    <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-2.5 border border-amber-400 dark:border-amber-700">
                      <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        {isMr
                          ? "⭐ १५ लिटर नॅपसॅक पंपासाठी (एकत्रित प्रमाण):"
                          : "⭐ Standard 15L Pump Tank:"}
                      </div>
                      <div className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                        {topResult.disease.knapsack15LDose}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precautions & Safety */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs space-y-1">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isMr ? "फवारणी करताना खबरदारी (Safety Precautions):" : "Safety Precautions:"}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {isMr ? topResult.disease.precautionMr : topResult.disease.precautionEn}
                  </p>
                </div>

                {/* MANDATORY KVK DISCLAIMER */}
                <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-xs space-y-1">
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
              <div className="p-6 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-zinc-500 text-sm">
                  {isMr
                    ? "कोणतेही रोग निदान आढळले नाही. कृपया लक्षणे बदलून पुन्हा प्रयत्न करा."
                    : "No matching disease found. Please refine symptoms."}
                </p>
              </div>
            )}

            {/* Alternative Possible Matches */}
            {diagnosisResponse.results.length > 1 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
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
                        className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedMatchIndex(isExpanded ? null : idx)}
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {isMr ? match.disease.nameMr : match.disease.nameEn}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {match.disease.cropNameMr} • {match.disease.pathogenTypeLabelMr}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                              {match.confidenceScore}%
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-[11px]">
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
                              <span>{match.disease.knapsack15LDose}</span>
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
      </div>
    </div>
  );
}
