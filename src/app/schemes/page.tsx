"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { AudioReaderButton } from "@/components/AudioReaderButton";
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Phone,
  FileText,
  Calculator,
  FolderLock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Zap,
  TrendingUp,
  CheckSquare,
  Square,
  RefreshCw,
  Coins,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  EvaluatedScheme,
  SchemesSummary,
  KccCalculationResult,
  StandardDocumentDef,
  STANDARD_DOCUMENTS,
  FarmerSchemeProfile,
  evaluateAllSchemes,
  calculateKccCreditLimit,
  MAHARASHTRA_SCALE_OF_FINANCE,
} from "@/engine/schemes";
import { VERIFIED_SCHEMES } from "@/data/schemes";

type ActiveTab = "schemes" | "kcc" | "wallet";

export default function SchemesPage() {
  const { language } = useLanguage();
  const isMr = language === "mr";
  const isHi = language === "hi";

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("schemes");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // Farmer profile & evaluation state
  const [profile, setProfile] = useState<FarmerSchemeProfile>({
    totalLandAcres: 3.5,
    socialCategory: "General",
    isLandOwner: true,
    gender: "Male",
    cropsGrown: ["cotton", "soybean", "onion"],
    waterSources: ["Open_Well", "Borewell"],
    hasElectricityConnection: true,
    district: "Nashik",
    heldDocumentKeys: [
      "doc_7_12",
      "doc_8a",
      "doc_aadhaar_npci",
      "doc_bank_passbook",
      "doc_e_pik_pahani",
    ],
  });

  const [evaluatedSchemes, setEvaluatedSchemes] = useState<EvaluatedScheme[]>([]);
  const [summary, setSummary] = useState<SchemesSummary | null>(null);
  const [kccResult, setKccResult] = useState<KccCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // KCC Interactive inputs
  const [kccCropInputs, setKccCropInputs] = useState<
    { cropId: string; areaAcre: number }[]
  >([
    { cropId: "cotton", areaAcre: 1.5 },
    { cropId: "soybean", areaAcre: 1.0 },
    { cropId: "onion", areaAcre: 1.0 },
  ]);

  // Simulator Drawer Open/Close
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Fetch initial profile and evaluation from API
  useEffect(() => {
    async function loadSchemesData() {
      try {
        setLoading(true);
        const res = await fetch("/api/schemes");
        if (res.ok) {
          const data = await res.json();
          if (data.farmerProfile) {
            setProfile(data.farmerProfile);
          }
          if (data.schemes) {
            setEvaluatedSchemes(data.schemes);
          }
          if (data.summary) {
            setSummary(data.summary);
          }
          if (data.kccResult) {
            setKccResult(data.kccResult);
          }
        } else {
          // Fallback to local evaluation engine if API fails
          runLocalEvaluation(profile);
        }
      } catch (err) {
        console.warn("Using local schemes fallback:", err);
        runLocalEvaluation(profile);
      } finally {
        setLoading(false);
      }
    }
    loadSchemesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run in-memory evaluation
  const runLocalEvaluation = (currProfile: FarmerSchemeProfile) => {
    const res = evaluateAllSchemes(currProfile, VERIFIED_SCHEMES);
    setEvaluatedSchemes(res.evaluatedSchemes);
    setSummary(res.summary);

    const cropsForKcc = (currProfile.cropsGrown || ["cotton", "soybean"]).map(
      (c) => ({
        cropId: c,
        areaAcre: currProfile.totalLandAcres / Math.max(1, currProfile.cropsGrown?.length || 1),
      })
    );
    const kcc = calculateKccCreditLimit(cropsForKcc, currProfile.totalLandAcres);
    setKccResult(kcc);
  };

  // Toggle document held in Document Wallet
  const handleToggleDocument = (docKey: string) => {
    const currentKeys = profile.heldDocumentKeys || [];
    const updatedKeys = currentKeys.includes(docKey)
      ? currentKeys.filter((k) => k !== docKey)
      : [...currentKeys, docKey];

    const updatedProfile = { ...profile, heldDocumentKeys: updatedKeys };
    setProfile(updatedProfile);
    runLocalEvaluation(updatedProfile);
  };

  // Re-calculate KCC when crop acreage changes
  const handleUpdateKccAcreage = (cropId: string, newArea: number) => {
    const updated = kccCropInputs.map((c) =>
      c.cropId === cropId ? { ...c, areaAcre: Math.max(0, newArea) } : c
    );
    setKccCropInputs(updated);
    const calculated = calculateKccCreditLimit(updated);
    setKccResult(calculated);
  };

  const handleAddKccCrop = (cropId: string) => {
    if (kccCropInputs.some((c) => c.cropId === cropId)) return;
    const updated = [...kccCropInputs, { cropId, areaAcre: 1.0 }];
    setKccCropInputs(updated);
    setKccResult(calculateKccCreditLimit(updated));
  };

  const handleRemoveKccCrop = (cropId: string) => {
    if (kccCropInputs.length <= 1) return;
    const updated = kccCropInputs.filter((c) => c.cropId !== cropId);
    setKccCropInputs(updated);
    setKccResult(calculateKccCreditLimit(updated));
  };

  // Filter schemes
  const filteredSchemes = evaluatedSchemes.filter((item) => {
    if (selectedCategory !== "all" && item.scheme.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  // Calculate wallet readiness
  const totalStandardDocs = STANDARD_DOCUMENTS.length;
  const heldDocsCount = (profile.heldDocumentKeys || []).length;
  const walletReadinessPercent = Math.round((heldDocsCount / totalStandardDocs) * 100);

  // TTS speech text for page overview
  const ttsOverviewText = isMr
    ? `आपल्या प्रोफाइलनुसार एकूण ${summary?.eligibleCount || 0} सरकारी योजनांमध्ये तुम्ही थेट पात्र आहात. वर्षाला ₹१२,००० थेट बँक खात्यात आणि ₹२ लाखांपेक्षा जास्त भांडवली अनुदान उपलब्ध आहे. किसान क्रेडिट कार्ड अंतर्गत ४% सवलतीच्या दरात कर्ज मर्यादा देखील तपासा.`
    : `According to your farm profile, you are eligible for ${summary?.eligibleCount || 0} government schemes, including ₹12,000 yearly direct bank cash and up to ₹2.5 Lakh capital subsidies. Check your Kisan Credit Card loan limit at 4% interest rate.`;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Landmark className="w-5 h-5 text-kisan-green-700 dark:text-kisan-green-400" />
            <span>
              {isMr
                ? "सरकारी योजना व अनुदान केंद्र"
                : isHi
                  ? "सरकारी योजना एवं अनुदान"
                  : "Government Schemes & Subsidies"}
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            {isMr
              ? "स्वयंचलित पात्रता तपासणी, KCC कर्ज मर्यादा व कागदपत्र पाकीट"
              : "Automated eligibility scanner, KCC limit calculator & document wallet"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <AudioReaderButton text={ttsOverviewText} lang={isMr ? "mr" : "en"} compact />
          <ProvenanceBadge type="live" sourceText="MahaDBT 2026" />
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-gradient-to-br from-kisan-green-800 to-kisan-green-950 text-white rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide uppercase text-kisan-green-200 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            {isMr ? "आपल्यासाठी उपलब्ध एकूण लाभ" : "Total Unlockable Value"}
          </span>
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white/15 hover:bg-white/25 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3 text-amber-300" />
            <span>{isMr ? "पात्रता बदला / तपासा" : "Simulate Profile"}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            ₹
            {(
              (summary?.totalUnlockableBenefit || 320000)
            ).toLocaleString("en-IN")}
            +
          </span>
          <span className="text-xs text-kisan-green-200">
            {isMr ? "अनुदान व आर्थिक लाभ" : "potential benefits"}
          </span>
        </div>

        {/* Counters grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-kisan-green-700/60">
          <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black text-emerald-300">
              {summary?.eligibleCount ?? 8}
            </div>
            <div className="text-[11px] font-medium text-emerald-100 flex items-center justify-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{isMr ? "पात्र" : "Eligible"}</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black text-amber-300">
              {summary?.conditionalCount ?? 10}
            </div>
            <div className="text-[11px] font-medium text-amber-100 flex items-center justify-center gap-0.5">
              <AlertCircle className="w-3 h-3 text-amber-300" />
              <span>{isMr ? "अटींवर पात्र" : "Conditional"}</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black text-sky-200">
              ₹{(summary?.directCashBenefitYearly || 12000).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-medium text-sky-100">
              {isMr ? "वार्षिक थेट रोख" : "Annual Cash"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("schemes")}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "schemes"
              ? "bg-white dark:bg-zinc-700 text-kisan-green-800 dark:text-kisan-green-300 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>{isMr ? "योजना यादी" : "Schemes"}</span>
        </button>

        <button
          onClick={() => setActiveTab("kcc")}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "kcc"
              ? "bg-white dark:bg-zinc-700 text-kisan-green-800 dark:text-kisan-green-300 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{isMr ? "KCC कर्ज (४%)" : "KCC Loan"}</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "wallet"
              ? "bg-white dark:bg-zinc-700 text-kisan-green-800 dark:text-kisan-green-300 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <FolderLock className="w-3.5 h-3.5" />
          <span>{isMr ? "कागदपत्र पाकीट" : "Wallet"}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white rounded-full">
            {walletReadinessPercent}%
          </span>
        </button>
      </div>

      {/* TAB 1: SCHEMES LIST & CATEGORIES */}
      {activeTab === "schemes" && (
        <div className="space-y-3">
          {/* Eligibility Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                selectedStatus === "all"
                  ? "bg-kisan-green-700 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              {isMr ? "सर्व योजना" : "All Schemes"} ({evaluatedSchemes.length})
            </button>
            <button
              onClick={() => setSelectedStatus("Eligible")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors min-h-[36px] flex items-center gap-1 ${
                selectedStatus === "Eligible"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMr ? "🟢 पूर्ण पात्र" : "🟢 Eligible"}</span>
            </button>
            <button
              onClick={() => setSelectedStatus("Conditional")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors min-h-[36px] flex items-center gap-1 ${
                selectedStatus === "Conditional"
                  ? "bg-amber-600 text-white shadow"
                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{isMr ? "🟡 अटींवर पात्र" : "🟡 Conditional"}</span>
            </button>
            <button
              onClick={() => setSelectedStatus("Ineligible")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors min-h-[36px] flex items-center gap-1 ${
                selectedStatus === "Ineligible"
                  ? "bg-rose-600 text-white shadow"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isMr ? "🔴 अपात्र" : "🔴 Ineligible"}</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: "all", labelMr: "सर्व वर्ग", labelEn: "All Categories" },
              { id: "Direct_Cash", labelMr: "थेट बँक अनुदान (DBT)", labelEn: "Direct Cash" },
              { id: "Irrigation_Solar", labelMr: "सौर पंप व सिंचन", labelEn: "Solar & Irrigation" },
              { id: "Crop_Insurance", labelMr: "₹१ पीक विमा", labelEn: "Insurance" },
              { id: "Machinery_Storage", labelMr: "अवजारे व कांदा चाळ", labelEn: "Machinery & Storage" },
              { id: "Special_Assistance", labelMr: "डॉ. आंबेडकर / बिरसा मुंडा", labelEn: "SC / ST Subsidies" },
              { id: "Concessional_Credit", labelMr: "KCC पीक कर्ज", labelEn: "Credit / KCC" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap text-xs transition-colors min-h-[32px] ${
                  selectedCategory === cat.id
                    ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-900"
                    : "bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {isMr ? cat.labelMr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Scheme Cards */}
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
              <Info className="w-6 h-6 mx-auto text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {isMr ? "निवडलेल्या फिल्टरनुसार योजना सापडल्या नाहीत." : "No schemes match the selected filters."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="text-xs text-kisan-green-700 dark:text-kisan-green-400 font-bold underline"
              >
                {isMr ? "सर्व फिल्टर रीसेट करा" : "Reset all filters"}
              </button>
            </div>
          ) : (
            filteredSchemes.map((item) => {
              const isExpanded = expandedSchemeId === item.scheme.id;
              const title = isMr ? item.scheme.titleMr : item.scheme.titleEn;
              const summaryText = isMr
                ? item.scheme.benefitSummaryMr
                : item.scheme.benefitSummaryEn;

              return (
                <div
                  key={item.scheme.id}
                  className={`bg-white dark:bg-zinc-800 rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    item.status === "Eligible"
                      ? "border-emerald-300 dark:border-emerald-800/80"
                      : item.status === "Conditional"
                        ? "border-amber-300 dark:border-amber-800/80"
                        : "border-zinc-200 dark:border-zinc-700 opacity-80"
                  }`}
                >
                  <div className="p-4 space-y-2.5">
                    {/* Top Row: Authority & Eligibility Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.statusBadgeClass}`}
                        >
                          {isMr ? item.statusLabelMr : item.statusLabelEn}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                          {item.scheme.authority === "Maharashtra"
                            ? isMr
                              ? "महाराष्ट्र शासन"
                              : "Govt of Maharashtra"
                            : item.scheme.authority === "Central"
                              ? isMr
                                ? "केंद्र शासन"
                                : "Govt of India"
                              : isMr
                                ? "संयुक्त योजना"
                                : "Joint Scheme"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <AudioReaderButton
                          text={`${title}. ${summaryText}`}
                          lang={isMr ? "mr" : "en"}
                          compact
                        />
                      </div>
                    </div>

                    {/* Scheme Title */}
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                      {title}
                    </h3>

                    {/* Benefit Highlight Bar */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase block">
                          {isMr ? "अनुदान / लाभ मर्यादा" : "Sanctioned Benefit"}
                        </span>
                        <span className="text-base font-black text-emerald-900 dark:text-emerald-200">
                          ₹{item.scheme.maxBenefitAmount.toLocaleString("en-IN")}
                          {item.scheme.benefitFrequency === "Annual" && (
                            <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300">
                              {" "}
                              / {isMr ? "वार्षिक" : "year"}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">
                          {isMr ? "कागदपत्र पूर्तता" : "Doc Readiness"}
                        </span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {item.documentReadinessPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Summary Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {summaryText}
                    </p>

                    {/* Key Evaluation Reasons / Missing Criteria */}
                    {item.status === "Eligible" && item.reasonsMr.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{isMr ? item.reasonsMr.join(" • ") : item.reasonsEn.join(" • ")}</span>
                      </div>
                    )}

                    {item.status === "Conditional" && item.missingCriteriaMr.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <span className="font-semibold block">
                            {isMr ? "आवश्यक पूर्तता:" : "Requirement:"}
                          </span>
                          <span>
                            {isMr
                              ? item.missingCriteriaMr.join(", ")
                              : item.missingCriteriaEn.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}

                    {item.status === "Ineligible" && item.missingCriteriaMr.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <span className="font-semibold block">
                            {isMr ? "अपात्रतेचे कारण:" : "Reason for Ineligibility:"}
                          </span>
                          <span>
                            {isMr
                              ? item.missingCriteriaMr.join(", ")
                              : item.missingCriteriaEn.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Expand Details Toggle */}
                    <button
                      onClick={() =>
                        setExpandedSchemeId(isExpanded ? null : item.scheme.id)
                      }
                      className="w-full text-center text-xs font-semibold text-kisan-green-700 dark:text-kisan-green-400 py-1.5 flex items-center justify-center gap-1 border-t border-zinc-100 dark:border-zinc-700/60 mt-2"
                    >
                      <span>
                        {isExpanded
                          ? isMr
                            ? "तपशील लपवा"
                            : "Hide details"
                          : isMr
                            ? "कागदपत्रे व अर्ज प्रक्रिया पहा"
                            : "View documents & steps"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Expandable Content Drawer */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                        {/* Required Documents */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-zinc-500" />
                            <span>
                              {isMr ? "आवश्यक कागदपत्रे:" : "Required Documents:"}
                            </span>
                          </h4>
                          <div className="space-y-1">
                            {item.scheme.requiredDocumentsMr.map((doc, idx) => {
                              const isMissing = item.missingDocumentsMr.includes(doc);
                              return (
                                <div
                                  key={idx}
                                  className={`text-xs p-2 rounded-lg flex items-center justify-between ${
                                    isMissing
                                      ? "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                                      : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {isMissing ? (
                                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                    <span>
                                      {isMr
                                        ? doc
                                        : item.scheme.requiredDocumentsEn[idx] || doc}
                                    </span>
                                  </span>
                                  <span className="text-[10px] font-semibold">
                                    {isMissing
                                      ? isMr
                                        ? "कागदपत्र जोडा"
                                        : "Missing"
                                      : isMr
                                        ? "उपलब्ध"
                                        : "Ready"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Application Steps */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {isMr ? "अर्ज कसा करावा (पायऱ्या):" : "Application Steps:"}
                          </h4>
                          <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 list-decimal pl-4">
                            {item.scheme.applicationStepsMr.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <a
                            href={item.scheme.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold text-xs rounded-xl shadow-sm min-h-[44px] transition-colors"
                          >
                            <span>{isMr ? "अधिकृत पोर्टलवर अर्ज करा" : "Apply on Portal"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`tel:${item.scheme.helplineNumber.split("/")[0].trim()}`}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl border border-zinc-300 dark:border-zinc-600 min-h-[44px] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                            <span>
                              {isMr ? "हेल्पलाइन कॉल" : "Call Helpline"}
                            </span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: KISAN CREDIT CARD CALCULATOR */}
      {activeTab === "kcc" && kccResult && (
        <div className="space-y-4">
          {/* KCC Banner */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />
                {isMr
                  ? "KCC पत मर्यादा व व्याज सवलत"
                  : "Kisan Credit Card Scale of Finance"}
              </span>
              <ProvenanceBadge type="live" sourceText="SLBC Maharashtra" />
            </div>
            <h2 className="text-lg font-black">
              {isMr
                ? "अधिकृत SLBC पीक कर्ज मर्यादा कॅल्क्युलेटर"
                : "Official SLBC Crop Loan Scale of Finance"}
            </h2>
            <p className="text-xs text-amber-100 leading-relaxed">
              {isMr
                ? "महाराष्ट्र राज्य तांत्रिक समिती (DLTC) नुसार पीकनिहाय मंजूर कर्ज, १०% काढणीपश्चात व २०% अवजारे देखभाल बफर मिळून १३०% पत मर्यादा दिली जाते."
                : "RBI guidelines: Year 1 limit is 130% of crop scale of finance (including 10% household buffer and 20% farm maintenance buffer)."}
            </p>
          </div>

          {/* Credit Limit Summary Display */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
            <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-700 pb-3">
              <div>
                <span className="text-xs text-zinc-500 block">
                  {isMr ? "मंजूर KCC मर्यादा (प्रथम वर्ष)" : "Sanctioned Year 1 Limit"}
                </span>
                <span className="text-2xl font-black text-kisan-green-700 dark:text-kisan-green-400">
                  ₹{kccResult.totalYear1CreditLimit.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block">
                  {isMr ? "५ वर्षांची आवर्ती मर्यादा" : "5-Year Limit"}
                </span>
                <span className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  ₹{kccResult.totalYear5RevolvingLimit.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Interest Subvention Highlighting */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                kccResult.isMaharashtraZeroPercentEligible
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200"
              }`}
            >
              <Zap className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold block text-sm">
                  {kccResult.isMaharashtraZeroPercentEligible
                    ? isMr
                      ? "🎉 डॉ. पंजाबराव देशमुख योजना: ०% व्याज!"
                      : "🎉 Maharashtra Subvention: 0% Effective Interest!"
                    : isMr
                      ? "सवलतीचा निव्वळ व्याजदर: फक्त ४% वार्षिक"
                      : "Effective Subsidized Rate: 4.0% per annum"}
                </span>
                <p className="leading-relaxed opacity-90">
                  {kccResult.isMaharashtraZeroPercentEligible
                    ? isMr
                      ? "₹३ लाखांपर्यंतचे पीक कर्ज वेळेत परतफेड केल्यास महाराष्ट्र शासनाकडून संपूर्ण व्याज परतावा मिळतो, म्हणजेच शेतकऱ्याला ०% व्याज लागते."
                      : "For loans up to ₹3,00,000 repaid on time, Govt of Maharashtra waives the entire balance interest under Dr Panjabrao Deshmukh scheme."
                    : isMr
                      ? "केंद्र शासनाच्या ३% तत्पर परतफेड सवलतीनंतर मूळ ७% पैकी निव्वळ ४% व्याज द्यावे लागते."
                      : "Base 7% minus 3% prompt repayment subvention leaves net 4% interest rate."}
                </p>
                <div className="pt-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  {isMr
                    ? `सावकारी/खाजगी कर्जाच्या (१८%) तुलनेत वार्षिक बचत: ₹${kccResult.annualSavingsVsCommercial.toLocaleString("en-IN")}`
                    : `Annual savings vs commercial credit (18%): ₹${kccResult.annualSavingsVsCommercial.toLocaleString("en-IN")}`}
                </div>
              </div>
            </div>

            {/* Interactive Crops Acreage Adjuster */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                <span>{isMr ? "आपली पिके व क्षेत्र बदला:" : "Modify Crop Acreage:"}</span>
                <span className="text-[11px] font-normal text-zinc-500">
                  {isMr ? "एकूण क्षेत्र:" : "Total:"} {kccResult.totalLandAcre.toFixed(1)}{" "}
                  {isMr ? "एकर" : "acres"}
                </span>
              </h4>

              <div className="space-y-2">
                {kccCropInputs.map((item) => {
                  const sof =
                    MAHARASHTRA_SCALE_OF_FINANCE[item.cropId] ||
                    MAHARASHTRA_SCALE_OF_FINANCE["default"];
                  return (
                    <div
                      key={item.cropId}
                      className="bg-zinc-50 dark:bg-zinc-700/50 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                          {isMr ? sof.nameMr : sof.nameEn}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {isMr ? "प्रमाण दर:" : "Scale:"} ₹
                          {sof.sofPerAcre.toLocaleString("en-IN")}/ac
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateKccAcreage(
                              item.cropId,
                              Math.max(0.5, item.areaAcre - 0.5)
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-600 font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-12 text-center text-zinc-900 dark:text-white">
                          {item.areaAcre.toFixed(1)} {isMr ? "एकर" : "ac"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateKccAcreage(item.cropId, item.areaAcre + 0.5)
                          }
                          className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-600 font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        {kccCropInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKccCrop(item.cropId)}
                            className="text-xs text-rose-500 hover:text-rose-700 pl-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Crop to KCC Calculator */}
              <div className="flex gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
                <span className="text-zinc-500 text-[11px] self-center">
                  {isMr ? "+ पीक जोडा:" : "+ Add Crop:"}
                </span>
                {["sugarcane", "grapes", "pomegranate", "tur", "wheat", "maize", "turmeric"]
                  .filter((cid) => !kccCropInputs.some((c) => c.cropId === cid))
                  .slice(0, 4)
                  .map((cid) => {
                    const info = MAHARASHTRA_SCALE_OF_FINANCE[cid];
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => handleAddKccCrop(cid)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-700 hover:bg-kisan-green-100 text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap text-[11px] font-semibold"
                      >
                        + {isMr ? info.nameMr.split(" ")[0] : info.nameEn}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Formula Transparency Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-700">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                {isMr ? "पत मर्यादा गणना कशी केली जाते?" : "KCC Calculation Breakdown"}
              </span>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                {(isMr
                  ? kccResult.stepsExplanationMr
                  : kccResult.stepsExplanationEn
                ).map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT WALLET CHECKLIST */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          {/* Wallet Header & Readiness Meter */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <FolderLock className="w-4 h-4 text-kisan-green-700 dark:text-kisan-green-400" />
                  <span>
                    {isMr
                      ? "शेतकरी डिजिटल कागदपत्र पाकीट"
                      : "Farmer Digital Document Wallet"}
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {isMr
                    ? "सर्व योजनांसाठी लागणाऱ्या ८ महत्त्वाच्या कागदपत्रांची पडताळणी"
                    : "Check readiness for Maharashtra & Central scheme DBT mandates"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-kisan-green-700 dark:text-kisan-green-400">
                  {walletReadinessPercent}%
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {isMr ? "तयार" : "Ready"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-kisan-green-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${walletReadinessPercent}%` }}
              />
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-kisan-green-50 dark:bg-kisan-green-950/40 p-2.5 rounded-xl border border-kisan-green-200 dark:border-kisan-green-800">
              {isMr
                ? `आपल्याकडे ८ पैकी ${heldDocsCount} आवश्यक कागदपत्रे उपलब्ध आहेत. खालील यादीतून आपल्याकडील कागदपत्रांवर टिक करा, त्यानुसार योजनांची पात्रता आपोआप अपडेट होईल.`
                : `You currently have ${heldDocsCount} of 8 standard documents. Toggle your available documents below to instantly re-calculate scheme readiness.`}
            </p>
          </div>

          {/* Standard Documents Checklist */}
          <div className="space-y-2.5">
            {STANDARD_DOCUMENTS.map((doc) => {
              const isHeld = (profile.heldDocumentKeys || []).includes(doc.key);
              return (
                <div
                  key={doc.key}
                  onClick={() => handleToggleDocument(doc.key)}
                  className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                    isHeld
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      className="mt-0.5 text-kisan-green-700 dark:text-kisan-green-400 shrink-0"
                    >
                      {isHeld ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">
                          {isMr ? doc.nameMr : doc.nameEn}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${doc.badgeClass}`}
                        >
                          {doc.issuingAuthority.split("(")[0]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                        {isMr ? doc.shortDescMr : doc.shortDescEn}
                      </p>
                      {doc.officialUrl && (
                        <a
                          href={doc.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-kisan-green-700 dark:text-kisan-green-400 hover:underline pt-0.5"
                        >
                          <span>{isMr ? "अधिकृत पोर्टलवरून डाऊनलोड करा" : "Download / Verify"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold shrink-0 px-2 py-1 rounded-lg ${
                      isHeld
                        ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                    }`}
                  >
                    {isHeld ? (isMr ? "उपलब्ध" : "Ready") : isMr ? "नाही" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK ELIGIBILITY SIMULATOR MODAL / DRAWER */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-kisan-green-700" />
                <span>
                  {isMr
                    ? "शेतकरी प्रोफाइल पात्रता सिम्युलेटर"
                    : "Farmer Profile Eligibility Simulator"}
                </span>
              </h3>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Land Acreage */}
              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  {isMr ? "एकूण जमीन क्षेत्र (एकर):" : "Total Landholding (Acres):"}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.5"
                    value={profile.totalLandAcres}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        totalLandAcres: parseFloat(e.target.value),
                      };
                      setProfile(updated);
                      runLocalEvaluation(updated);
                    }}
                    className="w-full accent-kisan-green-600"
                  />
                  <span className="font-black text-sm w-16 text-right text-kisan-green-700 dark:text-kisan-green-400">
                    {profile.totalLandAcres.toFixed(1)} {isMr ? "एकर" : "ac"}
                  </span>
                </div>
              </div>

              {/* Social Category */}
              <div>
                <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  {isMr ? "सामाजिक प्रवर्ग (Caste Category):" : "Social Category:"}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["General", "OBC", "SC", "ST"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const updated = { ...profile, socialCategory: cat };
                        setProfile(updated);
                        runLocalEvaluation(updated);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        profile.socialCategory === cat
                          ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {(profile.socialCategory === "SC" || profile.socialCategory === "ST") && (
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold pt-1">
                    ✨ डॉ. बाबासाहेब आंबेडकर व बिरसा मुंडा योजनेअंतर्गत नवीन विहीर, सौर पंप व ठिबकवर ९०-१००% विशेष अनुदान अनलॉक झाले आहे!
                  </p>
                )}
              </div>

              {/* Land Ownership */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">
                    {isMr ? "जमीन मालकी हक्क (७/१२ उतारा)" : "7/12 Land Ownership"}
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    {isMr
                      ? "जमीन स्वतःच्या नावावर आहे का?"
                      : "Is land parcel owned in farmer's name?"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...profile,
                      isLandOwner: !profile.isLandOwner,
                    };
                    setProfile(updated);
                    runLocalEvaluation(updated);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                    profile.isLandOwner
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700"
                  }`}
                >
                  {profile.isLandOwner ? (isMr ? "होय (स्वतःची)" : "Owned") : isMr ? "नाही (भाडेतत्त्व)" : "Leased"}
                </button>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">
                    {isMr ? "कृषी वीज जोडणी" : "Agri Power Connection"}
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    {isMr
                      ? "महावितरण वीज जोडणी उपलब्ध आहे का?"
                      : "Active MSEDCL electricity connection"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...profile,
                      hasElectricityConnection: !profile.hasElectricityConnection,
                    };
                    setProfile(updated);
                    runLocalEvaluation(updated);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                    profile.hasElectricityConnection
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700"
                  }`}
                >
                  {profile.hasElectricityConnection
                    ? isMr
                      ? "उपलब्ध"
                      : "Yes"
                    : isMr
                      ? "नाही"
                      : "No"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="w-full py-3 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold text-sm rounded-xl shadow min-h-[44px]"
            >
              {isMr ? "अद्यतनित योजना निकाल पहा" : "Apply & View Results"}
            </button>
          </div>
        </div>
      )}

      {/* Return to Dashboard */}
      <Link
        href="/"
        className="block text-center text-xs font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline py-3 min-h-[44px]"
      >
        ← {isMr ? "मुख्य डॅशबोर्डवर परत जा" : "Return to Home Dashboard"}
      </Link>
    </div>
  );
}
