"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { AudioReaderButton } from "@/components/AudioReaderButton";
import {
  Briefcase,
  TrendingUp,
  Clock,
  Droplet,
  Coins,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Repeat,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  RankedEnterpriseResult,
  IntegratedFarmPlanSummary,
  rankSideBusinesses,
  calculateIntegratedCashFlow,
  FarmerDiversificationProfile,
} from "@/engine/diversification";
import {
  VERIFIED_SIDE_BUSINESSES,
  SideBusinessDef,
} from "@/data/sideBusinesses";

export default function DiversificationPage() {
  const { language } = useLanguage();
  const isMr = language === "mr";
  const isHi = language === "hi";

  // State
  const [budgetSlider, setBudgetSlider] = useState<number>(100000);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedEnterpriseForFlow, setSelectedEnterpriseForFlow] =
    useState<SideBusinessDef>(VERIFIED_SIDE_BUSINESSES[0]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile
  const [farmerProfile, setFarmerProfile] = useState<FarmerDiversificationProfile>({
    availableBudget: 100000,
    dailyLabourHoursAvailable: 2.5,
    waterAvailability: "Moderate_Well",
    district: "Nashik",
    currentCropsGrown: ["soybean", "cotton", "onion"],
    hasFarmPond: false,
  });

  const [rankedList, setRankedList] = useState<RankedEnterpriseResult[]>([]);
  const [integratedPlan, setIntegratedPlan] =
    useState<IntegratedFarmPlanSummary | null>(null);

  // Initial fetch from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/diversification?budget=${budgetSlider}`);
        if (res.ok) {
          const data = await res.json();
          if (data.rankedEnterprises) setRankedList(data.rankedEnterprises);
          if (data.integratedPlan) setIntegratedPlan(data.integratedPlan);
          if (data.farmerProfile) setFarmerProfile(data.farmerProfile);
        } else {
          runLocalCalculations(budgetSlider, farmerProfile, selectedEnterpriseForFlow);
        }
      } catch (err) {
        console.warn("Fallback to local diversification calculations:", err);
        runLocalCalculations(budgetSlider, farmerProfile, selectedEnterpriseForFlow);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runLocalCalculations = (
    budget: number,
    prof: FarmerDiversificationProfile,
    targetEnterprise: SideBusinessDef
  ) => {
    const updatedProf = { ...prof, availableBudget: budget };
    const ranked = rankSideBusinesses(updatedProf, VERIFIED_SIDE_BUSINESSES);
    setRankedList(ranked);
    const flow = calculateIntegratedCashFlow(85000, 65000, targetEnterprise);
    setIntegratedPlan(flow);
  };

  // Re-calculate when budget slider moves
  const handleBudgetChange = (newBudget: number) => {
    setBudgetSlider(newBudget);
    const updatedProf = { ...farmerProfile, availableBudget: newBudget };
    setFarmerProfile(updatedProf);
    const ranked = rankSideBusinesses(updatedProf, VERIFIED_SIDE_BUSINESSES);
    setRankedList(ranked);
  };

  // Switch enterprise for cash flow simulation
  const handleSelectEnterpriseForFlow = (ent: SideBusinessDef) => {
    setSelectedEnterpriseForFlow(ent);
    const flow = calculateIntegratedCashFlow(85000, 65000, ent);
    setIntegratedPlan(flow);
  };

  // Filter list
  const filteredList = rankedList.filter((item) => {
    if (selectedCategory !== "all" && item.enterprise.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const unlockableCount = rankedList.filter((r) => r.isWithinBudget).length;

  const ttsOverview = isMr
    ? `पूरक शेती व्यवसाय आणि उत्पन्न विविधता इंजिन. आपल्या ₹${budgetSlider.toLocaleString("en-IN")} बजेटमध्ये एकूण ${unlockableCount} पूरक उद्योग सुरू करता येतात. दुग्धव्यवसाय, शेळीपालन, गावरान पोल्ट्री किंवा डाळ मिल जोडून पिकांच्या दुष्काळातही दरमहा खात्रीशीर उत्पन्न मिळवा.`
    : isHi
      ? `पूरक कृषि व्यवसाय और आय विविधीकरण। आपके ₹${budgetSlider.toLocaleString("en-IN")} के बजट में कुल ${unlockableCount} पूरक उद्योग शुरू किए जा सकते हैं। डेयरी, बकरी पालन, पोल्ट्री या दाल मिल जोड़कर हर महीने सुनिश्चित आय प्राप्त करें।`
      : `Allied agricultural enterprises and income diversification engine. Within your budget of ₹${budgetSlider.toLocaleString("en-IN")}, you can start ${unlockableCount} enterprises like dairy, goat farming, poultry, or dal processing to ensure reliable year-round cash flow.`;

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
            <ProvenanceBadge type="live" sourceText="ICAR & KVK 2026" />
            <AudioReaderButton text={ttsOverview} lang={isMr ? "mr" : isHi ? "hi" : "en"} compact />
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <span>
              {isMr
                ? "पूरक शेती व्यवसाय व उत्पन्न विविधता"
                : isHi
                  ? "पूरक व्यवसाय एवं आय विविधीकरण"
                  : "Allied Enterprises & Diversification"}
            </span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 pl-11">
            {isMr
              ? "पिकांसोबत बारमाही खात्रीशीर रोख उत्पन्न देणारे १०+ प्रमाणित व्यवसाय"
              : isHi
                ? "फसलों के साथ साल भर सुनिश्चित नकद आय देने वाले १०+ प्रमाणित व्यवसाय"
                : "10+ verified allied enterprises for continuous monthly cash flow"}
          </p>
        </div>

        {/* Interactive Budget Capacity Slider Card */}
        <div className="bg-gradient-to-br from-[#1B4332] via-[#24543F] to-[#0F281E] text-white rounded-3xl p-5 shadow-lg border border-[#2D6A4F]/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-300" />
              {isMr ? "माझे उपलब्ध भांडवल (बजेट)" : isHi ? "उपलब्ध निवेश बजट" : "Available Investment Budget"}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20">
              {unlockableCount} {isMr ? "व्यवसाय उपलब्ध" : isHi ? "विकल्प उपलब्ध" : "Options Open"}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              ₹{budgetSlider.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-stone-200 bg-white/10 px-2 py-0.5 rounded-md">
              {isMr ? "+२०% शासकीय अनुदान/कर्ज मर्यादा" : isHi ? "+20% वित्तीय सहायता" : "+20% financing margin"}
            </span>
          </div>

          {/* Range Slider */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="25000"
              max="300000"
              step="5000"
              value={budgetSlider}
              onChange={(e) => handleBudgetChange(parseInt(e.target.value, 10))}
              className="w-full accent-[#DF9115] cursor-pointer h-2 bg-[#0F281E] rounded-lg"
              aria-label="Investment budget slider"
            />
            <div className="flex justify-between text-[11px] text-stone-300 font-medium font-mono">
              <span>₹२५,००० (अल्प)</span>
              <span>₹१.५ लाख (मध्यम)</span>
              <span>₹३.० लाख (प्रकल्प)</span>
            </div>
          </div>

          {/* Quick Budget Jump Pills */}
          <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            {[
              { label: "₹35k (पोल्ट्री/अळंबी)", val: 35000 },
              { label: "₹45k (मत्स्य/मधमाशी)", val: 45000 },
              { label: "₹90k (शेळीपालन)", val: 90000 },
              { label: "₹1.6L (दुग्धव्यवसाय)", val: 160000 },
              { label: "₹2.5L (डाळ मिल)", val: 250000 },
            ].map((pill) => (
              <button
                key={pill.val}
                type="button"
                onClick={() => handleBudgetChange(pill.val)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all min-h-[36px] ${
                  budgetSlider === pill.val
                    ? "bg-[#DF9115] text-stone-950 shadow-md font-bold"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrated Cash Flow Visualizer Banner */}
        {integratedPlan && (
          <div className="bg-white dark:bg-[#1E221B] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 md:p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm text-stone-900 dark:text-stone-100 leading-tight">
                    {isMr
                      ? "एकात्मिक शेती रोकड प्रवाह मॉडेल (Cash Flow Buffer)"
                      : isHi
                        ? "एकीकृत कृषि नकदी प्रवाह मॉडल"
                        : "Integrated Cash Flow & Dry Spell Buffer"}
                  </h3>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {isMr ? "पीक + " : isHi ? "फसल + " : "Crop + "}
                    {isMr
                      ? integratedPlan.enterprise.titleMr.split(" ")[0]
                      : isHi
                        ? integratedPlan.enterprise.titleHi?.split(" ")[0] || integratedPlan.enterprise.titleEn.split(" ")[0]
                        : integratedPlan.enterprise.titleEn.split(" ")[0]}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-xl shrink-0">
                +{integratedPlan.profitBoostPercent}% {isMr ? "उत्पन्न वाढ" : isHi ? "आय वृद्धि" : "Profit Boost"}
              </span>
            </div>

            {/* Contrast Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Crop Only (Dry season risk) */}
              <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-3 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    {isMr ? "केवळ पीक शेती" : isHi ? "केवल फसल खेती" : "Crop Only Farming"}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">
                    {isMr ? "जोखमीचे" : "High Risk"}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-rose-950 dark:text-rose-100 tabular-nums">
                  ₹{integratedPlan.annualCropProfit.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-stone-500"> /वर्ष</span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-snug">
                  {isMr
                    ? `काढणीपूर्वीचे ${integratedPlan.cropDeficitMonthsCount} महिने खिशातील भांडवल उणे (तुटवडा), सावकारी कर्जाचा धोका.`
                    : isHi
                      ? `कटाई से पहले के ${integratedPlan.cropDeficitMonthsCount} महीने नकदी की कमी, कर्ज लेने का जोखिम।`
                      : `${integratedPlan.cropDeficitMonthsCount} months negative cash flow pre-harvest; working capital shortfall.`}
                </p>
              </div>

              {/* Crop + Side Business (Resilient) */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    {isMr ? "एकात्मिक शेती" : isHi ? "एकीकृत कृषि" : "Crop + Enterprise"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                    {isMr ? "खात्रीशीर" : "Resilient"}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-950 dark:text-emerald-100 tabular-nums">
                  ₹{integratedPlan.totalIntegratedAnnualProfit.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-stone-500"> /वर्ष</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                  {isMr
                    ? `दरमहा ₹${integratedPlan.enterprise.expectedMonthlyProfit.toLocaleString("en-IN")} नियमित रोकड मिळाल्याने तुटवड्याचे महिने शून्य!`
                    : isHi
                      ? `हर महीने ₹${integratedPlan.enterprise.expectedMonthlyProfit.toLocaleString("en-IN")} नियमित आय से नकदी संकट समाप्त!`
                      : `Monthly steady ₹${integratedPlan.enterprise.expectedMonthlyProfit.toLocaleString("en-IN")} completely wipes out cash deficits!`}
                </p>
              </div>
            </div>

            {/* Biological Synergy Pill */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3 rounded-2xl flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="text-amber-950 dark:text-amber-200 font-medium">
                  {isMr
                    ? "चक्रीय जैव-अर्थव्यवस्था (Bio-Synergy) वार्षिक बचत:"
                    : isHi
                      ? "चक्रीय जैव-अर्थव्यवस्था वार्षिक बचत:"
                      : "Circular bio-economy input savings:"}
                </span>
              </div>
              <span className="font-black font-mono text-amber-900 dark:text-amber-100 text-sm tabular-nums shrink-0">
                ₹{integratedPlan.annualBioSynergySavings.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: "all", labelMr: "सर्व व्यवसाय", labelEn: "All Enterprises" },
            { id: "Livestock", labelMr: "दूध व शेळीपालन", labelEn: "Dairy & Goat" },
            { id: "Poultry", labelMr: "गावरान कुक्कुटपालन", labelEn: "Desi Poultry" },
            { id: "Fisheries", labelMr: "शेततळे मत्स्यपालन", labelEn: "Fish Culture" },
            { id: "Organic_Inputs", labelMr: "गांडूळ खत निर्मिती", labelEn: "Vermicompost" },
            { id: "Agro_Processing", labelMr: "डाळ मिल प्रक्रिया", labelEn: "Dal Mill Processing" },
            { id: "Apiary", labelMr: "मधमाशी पालन", labelEn: "Beekeeping" },
            { id: "Horticulture", labelMr: "अळंबी उत्पादन", labelEn: "Mushroom" },
            { id: "Mechanization", labelMr: "अवजारे भाडे केंद्र", labelEn: "Machinery Hiring" },
            { id: "Nursery", labelMr: "रोपवाटिका", labelEn: "Nursery" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap text-xs transition-colors min-h-[40px] ${
                selectedCategory === cat.id
                  ? "bg-[#1B4332] text-white shadow-sm font-bold"
                  : "bg-white dark:bg-[#1E221B] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              {isMr ? cat.labelMr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Enterprise Cards List */}
        <div className="space-y-4">
          {filteredList.map((item) => {
            const ent = item.enterprise;
            const isExpanded = expandedId === ent.id;
            const title = isMr ? ent.titleMr : isHi ? ent.titleHi || ent.titleEn : ent.titleEn;
            const desc = isMr ? ent.descriptionMr : ent.descriptionEn;

            return (
              <div
                key={ent.id}
                className={`bg-white dark:bg-[#1E221B] rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  item.isWithinBudget
                    ? "border-emerald-300/80 dark:border-emerald-800/80 ring-1 ring-emerald-500/10"
                    : "border-stone-200 dark:border-stone-800 opacity-85"
                }`}
              >
                <div className="p-4 md:p-5 space-y-3.5">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.totalFitScore >= 80
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                        }`}
                      >
                        {item.totalFitScore}% {isMr ? "जुळणी गुण" : isHi ? "सटीकता स्कोर" : "Fit Score"}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        {isMr ? ent.categoryLabelMr : ent.categoryLabelEn}
                      </span>
                      {!item.isWithinBudget && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          {isMr ? "अतिरिक्त भांडवल हवे" : "Higher Capital"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <AudioReaderButton
                        text={`${title}. भांडवल ₹${ent.setupCost}. मासिक नफा ₹${ent.expectedMonthlyProfit}. ${desc}`}
                        lang={isMr ? "mr" : isHi ? "hi" : "en"}
                        compact
                      />
                    </div>
                  </div>

                  {/* Title & Space requirement */}
                  <div>
                    <h3 className="font-bold font-heading text-base text-stone-900 dark:text-stone-100 leading-snug">
                      {title}
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block pt-0.5">
                      {isMr ? ent.spaceRequiredDescMr : ent.spaceRequiredDescEn}
                    </span>
                  </div>

                  {/* Core Financial Metric Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-800/80">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block font-semibold">
                        {isMr ? "भांडवल खर्च" : isHi ? "लागत" : "Setup Cost"}
                      </span>
                      <span className="text-sm md:text-base font-black font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                        ₹{ent.setupCost.toLocaleString("en-IN")}
                      </span>
                      {ent.subsidyPercent > 0 && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                          {ent.subsidyPercent}% {isMr ? "अनुदान" : "Subsidy"}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block font-semibold">
                        {isMr ? "मासिक नफा" : isHi ? "मासिक लाभ" : "Monthly Profit"}
                      </span>
                      <span className="text-sm md:text-base font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                        ₹{ent.expectedMonthlyProfit.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {isMr ? "दरमहा खात्रीशीर" : "Net / Month"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block font-semibold">
                        {isMr ? "भांडवल परतावा" : isHi ? "पेबैक अवधि" : "Payback"}
                      </span>
                      <span className="text-sm md:text-base font-black font-mono text-blue-700 dark:text-blue-400 tabular-nums">
                        {item.effectivePaybackMonthsWithSubsidy}{" "}
                        <span className="text-xs font-normal text-stone-500">{isMr ? "महिने" : "mo"}</span>
                      </span>
                      <span className="text-[10px] text-stone-500 block font-mono">
                        {ent.roiPercent.toFixed(0)}% ROI
                      </span>
                    </div>
                  </div>

                  {/* Operational Quick Badges */}
                  <div className="flex items-center gap-3.5 text-xs text-stone-600 dark:text-stone-400 flex-wrap pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {ent.dailyLabourHours} {isMr ? "तास/दिवस" : "hrs/day"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-sky-500" />
                      <span>
                        {isMr
                          ? `पाणी: ${ent.waterNeed === "Low" ? "अल्प" : ent.waterNeed === "Medium" ? "मध्यम" : "शून्य"}`
                          : `Water: ${ent.waterNeed}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {isMr
                          ? `पहिले उत्पन्न: ${ent.gestationPeriodDays} दिवस`
                          : `First income: ${ent.gestationPeriodDays}d`}
                      </span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {desc}
                  </p>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleSelectEnterpriseForFlow(ent)}
                      className="text-xs font-bold text-[#1B4332] dark:text-[#52B788] hover:underline flex items-center gap-1.5 py-2 min-h-[40px]"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{isMr ? "रोकड प्रवाहात तपासा" : isHi ? "नकदी प्रवाह में देखें" : "Simulate in Cash Flow"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ent.id)}
                      className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-h-[40px]"
                    >
                      <span>{isExpanded ? (isMr ? "लपवा" : isHi ? "छुपाएं" : "Hide") : (isMr ? "सविस्तर तपशील" : isHi ? "विस्तृत विवरण" : "Details")}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Deep Dive Drawer */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-4">
                      {/* Itemized Capital Setup Cost Breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold font-heading text-stone-900 dark:text-stone-100">
                            {isMr ? "भांडवली खर्च तपशील (Setup Breakdown):" : "Capital Cost Breakdown:"}
                          </h4>
                          <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300 tabular-nums">
                            {isMr ? "एकूण:" : "Total:"} ₹{ent.setupCost.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 divide-y divide-stone-200 dark:divide-stone-800 text-xs">
                          {ent.capitalCostBreakdown.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-2 flex justify-between items-center first:pt-0 last:pb-0"
                            >
                              <span className="text-stone-700 dark:text-stone-300">
                                {isMr ? item.nameMr : item.nameEn}
                              </span>
                              <span className="font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                                ₹{item.cost.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Circular Bio-Economy Synergies */}
                      {item.synergyMatches.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold font-heading text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Repeat className="w-4 h-4 text-amber-600" />
                            <span>{isMr ? "पिकांसोबत चक्रीय जैव-बचत (Synergies):" : "Agro-Ecological Synergies:"}</span>
                          </h4>
                          <div className="space-y-1.5">
                            {item.synergyMatches.map((syn, idx) => (
                              <div
                                key={idx}
                                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-3 rounded-2xl text-xs space-y-1"
                              >
                                <div className="flex justify-between items-center font-bold text-amber-950 dark:text-amber-200">
                                  <span>{syn.title}</span>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-mono font-black tabular-nums">
                                    +₹{syn.annualSavingsEst.toLocaleString("en-IN")} {isMr ? "बचत" : "saved"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                                  {isMr ? syn.descriptionMr : syn.descriptionEn}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Market Sales Channels */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold font-heading text-stone-900 dark:text-stone-100">
                          {isMr ? "उत्पादन विक्री बाजारपेठ (Market Channels):" : "Market Channels:"}
                        </h4>
                        <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-disc pl-4">
                          {(isMr ? ent.marketChannelsMr : ent.marketChannelsEn).map(
                            (mkt, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {mkt}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Step-by-Step Implementation Guide */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold font-heading text-stone-900 dark:text-stone-100">
                          {isMr ? "सुरुवात कशी करावी (पायऱ्या):" : "How to Start (Steps):"}
                        </h4>
                        <ol className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-decimal pl-4">
                          {(isMr ? ent.setupStepsMr : ent.setupStepsEn).map(
                            (step, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {step}
                              </li>
                            )
                          )}
                        </ol>
                      </div>

                      {/* Government Subsidy Action Button */}
                      {ent.subsidySchemeNameMr && (
                        <div className="pt-1">
                          <a
                            href={ent.officialSchemePortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-sm min-h-[48px] transition-colors"
                          >
                            <span>
                              {isMr
                                ? `${ent.subsidySchemeNameMr} अर्ज करा`
                                : `Apply for ${ent.subsidySchemeNameEn}`}
                            </span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
