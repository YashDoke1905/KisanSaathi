"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { AudioReaderButton } from "@/components/AudioReaderButton";
import {
  Briefcase,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Droplet,
  Users,
  Coins,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Repeat,
  ShieldCheck,
  Zap,
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
  SideBusinessCategory,
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
    : `Allied agricultural enterprises and income diversification engine. Within your budget of ₹${budgetSlider.toLocaleString("en-IN")}, you can start ${unlockableCount} enterprises like dairy, goat farming, poultry, or dal processing to ensure reliable year-round cash flow.`;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-kisan-green-700 dark:text-kisan-green-400" />
            <span>
              {isMr
                ? "पूरक शेती व्यवसाय व उत्पन्न विविधता"
                : isHi
                  ? "पूरक व्यवसाय एवं आय विविधीकरण"
                  : "Allied Enterprises & Diversification"}
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            {isMr
              ? "पिकांसोबत बारमाही खात्रीशीर रोख उत्पन्न देणारे १०+ प्रमाणित व्यवसाय"
              : "10+ verified allied enterprises for continuous monthly cash flow"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <AudioReaderButton text={ttsOverview} lang={isMr ? "mr" : "en"} compact />
          <ProvenanceBadge type="live" sourceText="ICAR & KVK 2026" />
        </div>
      </div>

      {/* Interactive Budget Capacity Slider Card */}
      <div className="bg-gradient-to-br from-kisan-green-800 to-kisan-green-950 text-white rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-kisan-green-200 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            {isMr ? "माझे उपलब्ध भांडवल (बजेट)" : "Available Investment Budget"}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {unlockableCount} {isMr ? "व्यवसाय उपलब्ध" : "Options Open"}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black tracking-tight text-white">
            ₹{budgetSlider.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-kisan-green-200">
            {isMr ? "+२०% शासकीय अनुदान/कर्ज मर्यादा" : "+20% financing margin"}
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="25000"
            max="300000"
            step="5000"
            value={budgetSlider}
            onChange={(e) => handleBudgetChange(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-kisan-green-950/60 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-kisan-green-300 font-semibold">
            <span>₹२५,००० (अल्प भांडवल)</span>
            <span>₹१.५ लाख (मध्यम)</span>
            <span>₹३.० लाख (प्रकल्प)</span>
          </div>
        </div>

        {/* Quick Budget Jump Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 scrollbar-none">
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
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${
                budgetSlider === pill.val
                  ? "bg-amber-400 text-kisan-green-950 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integrated Cash Flow Visualizer Banner */}
      {integratedPlan && (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                  {isMr
                    ? "एकात्मिक शेती रोकड प्रवाह मॉडेल (Cash Flow Buffer)"
                    : "Integrated Cash Flow & Dry Spell Buffer"}
                </h3>
                <span className="text-[10px] text-zinc-500">
                  {isMr ? "पीक + " : "Crop + "}
                  {isMr
                    ? integratedPlan.enterprise.titleMr.split(" ")[0]
                    : integratedPlan.enterprise.titleEn.split(" ")[0]}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
              +{integratedPlan.profitBoostPercent}% {isMr ? "उत्पन्न वाढ" : "Profit Boost"}
            </span>
          </div>

          {/* Contrast Comparison Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Crop Only (Dry season risk) */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-2.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">
                {isMr ? "केवळ पीक शेती (Crop Only)" : "Crop Only Farming"}
              </span>
              <div className="text-base font-black text-rose-950 dark:text-rose-200">
                ₹{integratedPlan.annualCropProfit.toLocaleString("en-IN")}
                <span className="text-[10px] font-normal text-zinc-500"> /वर्ष</span>
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-snug">
                {isMr
                  ? `काढणीपूर्वीचे ${integratedPlan.cropDeficitMonthsCount} महिने खिशातील भांडवल उणे (तुटवडा), सावकारी कर्ज घेण्याचा धोका.`
                  : `${integratedPlan.cropDeficitMonthsCount} months negative cash flow pre-harvest.`}
              </p>
            </div>

            {/* Crop + Side Business (Resilient) */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                {isMr ? "एकात्मिक शेती (Integrated)" : "Crop + Enterprise"}
              </span>
              <div className="text-base font-black text-emerald-950 dark:text-emerald-200">
                ₹{integratedPlan.totalIntegratedAnnualProfit.toLocaleString("en-IN")}
                <span className="text-[10px] font-normal text-zinc-500"> /वर्ष</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                {isMr
                  ? `दरमहा ₹${integratedPlan.enterprise.expectedMonthlyProfit.toLocaleString("en-IN")} नियमित रोकड मिळाल्याने तुटवड्याचे महिने शून्य!`
                  : `Monthly steady ₹${integratedPlan.enterprise.expectedMonthlyProfit.toLocaleString("en-IN")} completely wipes out cash deficits!`}
              </p>
            </div>
          </div>

          {/* Biological Synergy Pill */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-2.5 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 dark:text-amber-200 font-medium">
                {isMr
                  ? `चक्रीय जैव-अर्थव्यवस्था (Bio-Synergy) वार्षिक बचत:`
                  : `Circular bio-economy input savings:`}
              </span>
            </div>
            <span className="font-extrabold text-amber-900 dark:text-amber-100">
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
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap text-xs transition-colors min-h-[36px] ${
              selectedCategory === cat.id
                ? "bg-kisan-green-700 text-white shadow"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {isMr ? cat.labelMr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Enterprise Cards List */}
      <div className="space-y-3.5">
        {filteredList.map((item) => {
          const ent = item.enterprise;
          const isExpanded = expandedId === ent.id;
          const title = isMr ? ent.titleMr : ent.titleEn;
          const desc = isMr ? ent.descriptionMr : ent.descriptionEn;

          return (
            <div
              key={ent.id}
              className={`bg-white dark:bg-zinc-800 rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                item.isWithinBudget
                  ? "border-emerald-300 dark:border-emerald-800/80"
                  : "border-zinc-200 dark:border-zinc-700 opacity-85"
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Top Badges Row */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        item.totalFitScore >= 80
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300"
                      }`}
                    >
                      {item.totalFitScore}% {isMr ? "जुळणी गुण" : "Fit Score"}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {isMr ? ent.categoryLabelMr : ent.categoryLabelEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <AudioReaderButton
                      text={`${title}. भांडवल ₹${ent.setupCost}. मासिक नफा ₹${ent.expectedMonthlyProfit}. ${desc}`}
                      lang={isMr ? "mr" : "en"}
                      compact
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                    {title}
                  </h3>
                  <span className="text-[11px] text-zinc-500 block pt-0.5">
                    {isMr ? ent.spaceRequiredDescMr : ent.spaceRequiredDescEn}
                  </span>
                </div>

                {/* Core Financial Metric Matrix */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-750 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      {isMr ? "भांडवल खर्च" : "Setup Cost"}
                    </span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">
                      ₹{ent.setupCost.toLocaleString("en-IN")}
                    </span>
                    {ent.subsidyPercent > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        {ent.subsidyPercent}% {isMr ? "अनुदान" : "Subsidy"}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      {isMr ? "मासिक निव्वळ नफा" : "Monthly Profit"}
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{ent.expectedMonthlyProfit.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {isMr ? "दरमहा खात्रीशीर" : "Net / Month"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-medium">
                      {isMr ? "भांडवल परतावा" : "Payback"}
                    </span>
                    <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                      {item.effectivePaybackMonthsWithSubsidy}{" "}
                      {isMr ? "महिने" : "months"}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {ent.roiPercent.toFixed(0)}% ROI
                    </span>
                  </div>
                </div>

                {/* Operational Quick Badges */}
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap pt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {ent.dailyLabourHours} {isMr ? "तास/दिवस" : "hrs/day"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {isMr
                        ? `पाणी: ${ent.waterNeed === "Low" ? "अल्प" : ent.waterNeed === "Medium" ? "मध्यम" : "शून्य"}`
                        : `Water: ${ent.waterNeed}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {isMr
                        ? `पहिले उत्पन्न: ${ent.gestationPeriodDays} दिवस`
                        : `First income: ${ent.gestationPeriodDays}d`}
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {desc}
                </p>

                {/* Simulate in Combined Cash Flow button */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => handleSelectEnterpriseForFlow(ent)}
                    className="text-xs font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline flex items-center gap-1 py-1"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{isMr ? "रोकड प्रवाहात तपासा" : "Simulate in Cash Flow"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : ent.id)}
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1 py-1"
                  >
                    <span>{isExpanded ? (isMr ? "लपवा" : "Hide") : (isMr ? "सविस्तर तपशील" : "Details")}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expandable Deep Dive Drawer */}
                {isExpanded && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                    {/* Itemized Capital Setup Cost Breakdown */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>{isMr ? "भांडवली खर्च तपशील (Setup Breakdown):" : "Capital Cost Breakdown:"}</span>
                        <span className="text-[11px] text-zinc-500">
                          {isMr ? "एकूण:" : "Total:"} ₹{ent.setupCost.toLocaleString("en-IN")}
                        </span>
                      </h4>
                      <div className="bg-zinc-50 dark:bg-zinc-700/40 rounded-xl p-2.5 divide-y divide-zinc-200 dark:divide-zinc-600 text-xs">
                        {ent.capitalCostBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-1.5 flex justify-between items-center first:pt-0 last:pb-0"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {isMr ? item.nameMr : item.nameEn}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              ₹{item.cost.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Circular Bio-Economy Synergies */}
                    {item.synergyMatches.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isMr ? "पिकांसोबत चक्रीय जैव-बचत (Synergies):" : "Agro-Ecological Synergies:"}</span>
                        </h4>
                        <div className="space-y-1">
                          {item.synergyMatches.map((syn, idx) => (
                            <div
                              key={idx}
                              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-xl text-xs space-y-0.5"
                            >
                              <div className="flex justify-between items-center font-bold text-amber-950 dark:text-amber-200">
                                <span>{syn.title}</span>
                                <span className="text-emerald-700 dark:text-emerald-400">
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
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        {isMr ? "उत्पादन विक्री बाजारपेठ (Market Channels):" : "Market Channels:"}
                      </h4>
                      <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 list-disc pl-4">
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
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        {isMr ? "सुरुवात कशी करावी (पायऱ्या):" : "How to Start (Steps):"}
                      </h4>
                      <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 list-decimal pl-4">
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
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm min-h-[44px] transition-colors"
                        >
                          <span>
                            {isMr
                              ? `${ent.subsidySchemeNameMr} अर्ज करा`
                              : `Apply for ${ent.subsidySchemeNameEn}`}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
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
      <Link
        href="/"
        className="block text-center text-xs font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline py-3 min-h-[44px]"
      >
        ← {isMr ? "मुख्य डॅशबोर्डवर परत जा" : "Return to Home Dashboard"}
      </Link>
    </div>
  );
}
