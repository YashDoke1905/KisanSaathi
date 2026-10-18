"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { CalculationModal } from "@/components/CalculationModal";
import { PlannerOutput } from "@/engine/types";
import { IrrigationWaterEstimate } from "@/engine/irrigation";
import { CropMasterData } from "@/data/crops";
import { playChime, speakWithFallback } from "@/lib/soundUtils";
import {
  Sprout,
  Volume2,
  Calendar,
  Droplets,
  TrendingUp,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Edit3,
  Check,
  Zap,
  DollarSign,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isMr = language === "mr";

  const planId = params?.planId as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"stages" | "water" | "financials">("stages");
  const [selectedScenario, setSelectedScenario] = useState<"expected" | "pessimistic" | "optimistic">("expected");

  const [plan, setPlan] = useState<any>(null);
  const [cropData, setCropData] = useState<CropMasterData | null>(null);
  const [calc, setCalc] = useState<PlannerOutput | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationWaterEstimate | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  // Show math modal
  const [showCalcModal, setShowCalcModal] = useState<boolean>(false);

  // Editable custom costs
  const [isEditingCosts, setIsEditingCosts] = useState<boolean>(false);
  const [editedCosts, setEditedCosts] = useState<Record<string, number>>({});
  const [userCustomCostKeys, setUserCustomCostKeys] = useState<Set<string>>(new Set());

  const fetchPlanDetails = useCallback(async () => {
    if (!planId) return;
    try {
      const res = await fetch(`/api/planner/${planId}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setCropData(data.cropData);
        setCalc(data.calculation);
        setIrrigation(data.irrigation);
        setTasks(data.plan.tasks || []);
        if (data.calculation?.costBreakdown) {
          setEditedCosts(data.calculation.costBreakdown);
        }
      } else {
        alert("Failed to load plan details");
      }
    } catch (e) {
      console.error("Error loading plan:", e);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlanDetails();
  }, [fetchPlanDetails]);

  // Toggle task complete
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    playChime();
    const updatedStatus = !currentStatus;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: updatedStatus } : t))
    );

    try {
      await fetch(`/api/planner/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: updatedStatus }),
      });
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  // Read aloud summary
  const handleReadSummary = () => {
    if (!calc || !cropData) return;
    playChime();
    const cropName = isMr ? cropData.nameMr : cropData.nameEn;
    const summaryText = isMr
      ? `${cropName} पीक नियोजन. एकूण क्षेत्र ${plan.areaAcre} एकर. अंदाजित उत्पादन खर्च ${calc.totalCost} रुपये. अपेक्षित एकूण उत्पादन ${calc.totalExpectedYieldQuintals} क्विंटल. अपेक्षित निव्वळ नफा ${calc.netProfit} रुपये असून नफा परतावा दर ${calc.roiPercent}% आहे.`
      : `${cropName} crop plan on ${plan.areaAcre} acres. Estimated total cost is ${calc.totalCost} rupees. Expected harvest yield is ${calc.totalExpectedYieldQuintals} quintals. Net profit forecast is ${calc.netProfit} rupees with ${calc.roiPercent}% return on investment.`;

    speakWithFallback(summaryText, language);
  };

  if (loading || !calc || !cropData) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
        <Header />
        <main className="mx-auto w-full max-w-lg p-4 space-y-4">
          <div className="h-44 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </main>
        <BottomNav />
      </div>
    );
  }

  const activeScenarioData = calc.scenarios[selectedScenario];

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Top Header Card */}
        <div className="card-warm p-4.5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 leading-tight">
                  {isMr ? cropData.nameMr : cropData.nameEn}
                </h1>
                <span className="rounded-full bg-forest-100 dark:bg-forest-950/60 px-2.5 py-0.5 text-[10px] font-bold text-forest-800 dark:text-forest-300 uppercase">
                  {plan.status === "active" ? (isMr ? "चालू" : "Active") : plan.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {plan.farm.name} • {calc.areaAcre} एकर ({calc.areaGuntha} गुंठे) • {calc.varietyName}
              </p>
            </div>

            <button
              onClick={handleReadSummary}
              className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-800 dark:text-forest-300 flex items-center justify-center hover:bg-forest-100 transition-colors shadow-xs active:scale-95"
              aria-label="Read Summary"
              title="Read Summary"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Dates Bar */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 dark:bg-stone-850 p-2.5 text-center text-xs text-stone-700 dark:text-stone-300 border border-stone-100 dark:border-stone-800 font-medium">
            <div>
              <span className="text-[10px] text-stone-500 block font-medium">{isMr ? "पेरणी तारीख:" : "Sowing:"}</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{calc.sowingDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-medium">{isMr ? "कालावधी:" : "Duration:"}</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{calc.durationDays} {isMr ? "दिवस" : "days"}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-medium">{isMr ? "काढणी तारीख:" : "Harvest:"}</span>
              <span className="font-black text-forest-800 dark:text-forest-300 font-mono">{calc.harvestDate}</span>
            </div>
          </div>
        </div>

        {/* 4 Financial Highlight KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="card-warm p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">
                {isMr ? "अपेक्षित निव्वळ नफा" : "Net Profit"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-lg font-black text-forest-800 dark:text-forest-300 font-mono money-numeral">
              ₹{calc.netProfit.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 font-medium">
              ROI: <span className="font-bold text-forest-700 dark:text-forest-400 font-mono">{calc.roiPercent}%</span> (₹{calc.profitPerAcre.toLocaleString("en-IN")}/ac)
            </p>
          </div>

          <div className="card-warm p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">
                {isMr ? "एकूण उत्पादन खर्च" : "Total Cost"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-lg font-black text-stone-900 dark:text-white font-mono money-numeral">
              ₹{calc.totalCost.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 font-medium font-mono">
              ₹{calc.costPerAcre.toLocaleString("en-IN")}/ac (12 {isMr ? "घटक" : "items"})
            </p>
          </div>

          <div className="card-warm p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">
                {isMr ? "अपेक्षित एकूण उत्पादन" : "Expected Yield"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-lg font-black text-stone-900 dark:text-white font-mono">
              {calc.totalExpectedYieldQuintals} <span className="text-xs font-normal">Q</span>
            </p>
            <p className="text-[10px] text-stone-500 font-medium font-mono">
              {calc.effectiveYieldPerAcre} Q/ac ({calc.multipliers.combinedFactor}× factor)
            </p>
          </div>

          <div className="card-warm p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">
                {isMr ? "किमान आधार भाव" : "Break-Even Price"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-lg font-black text-harvest-600 dark:text-harvest-400 font-mono money-numeral">
              ₹{calc.breakEvenPricePerQuintal.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 font-medium">
              {isMr ? "प्रति क्विंटल किमान विक्री" : "min per quintal"}
            </p>
          </div>
        </div>

        {/* Show Math Transparency Button */}
        <button
          onClick={() => setShowCalcModal(true)}
          className="w-full h-12 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 text-forest-800 dark:text-forest-300 font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
        >
          <Calculator className="w-4 h-4 text-forest-700" />
          <span>{isMr ? "हिशोब कसा केला? (पारदर्शक सूत्रे व आधार पहा)" : "How was this calculated? (View Formulae & Sources)"}</span>
        </button>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-stone-100 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <button
            onClick={() => setActiveTab("stages")}
            className={`h-10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "stages"
                ? "bg-white dark:bg-stone-900 text-forest-800 dark:text-forest-300 shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>{isMr ? "टप्पे व कामे" : "Stages"}</span>
          </button>

          <button
            onClick={() => setActiveTab("water")}
            className={`h-10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "water"
                ? "bg-white dark:bg-stone-900 text-forest-800 dark:text-forest-300 shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isMr ? "पाणी व पंप" : "Water"}</span>
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`h-10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "financials"
                ? "bg-white dark:bg-stone-900 text-forest-800 dark:text-forest-300 shadow-sm"
                : "text-stone-600 dark:text-stone-400"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isMr ? "आर्थिक हिशोब" : "Financials"}</span>
          </button>
        </div>

        {/* ================= TAB 1: GROWTH STAGES & TASKS ================= */}
        {activeTab === "stages" && (
          <div className="space-y-4 animate-fade-in">
            {cropData.stages.map((stg) => {
              return (
                <div
                  key={stg.stageNumber}
                  className="card-warm p-4 space-y-3"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-forest-800 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {stg.stageNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
                          {isMr ? stg.nameMr : stg.nameEn}
                        </h3>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {isMr ? `दिवस ${stg.startDay} ते ${stg.endDay}` : `Days ${stg.startDay} to ${stg.endDay}`} (Kc: {stg.kcFactor})
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                      {isMr ? "मजूर: " : "Labour: "}
                      <span className="font-mono">{Math.round(stg.labourDaysPerAcre * calc.areaAcre)}</span> {isMr ? "दिवस" : "days"}
                    </span>
                  </div>

                  {/* Fertilizer Dose Schedule */}
                  {(stg.fertilizerDose.ureaKg > 0 || stg.fertilizerDose.dapKg > 0 || stg.fertilizerDose.mopKg > 0) && (
                    <div className="rounded-xl bg-forest-50/80 dark:bg-forest-950/30 p-3 text-xs border border-forest-200/80 dark:border-forest-900/60 space-y-1.5">
                      <p className="font-bold text-forest-900 dark:text-forest-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-forest-700 dark:text-forest-400" />
                        <span>{isMr ? "खत नियोजन (प्रति एकर):" : "Fertilizer Schedule (Per Acre):"}</span>
                      </p>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                        {stg.fertilizerDose.descriptionMr}
                      </p>
                      <div className="flex gap-3 font-mono font-bold text-[11px] text-forest-800 dark:text-forest-300 pt-0.5">
                        {stg.fertilizerDose.ureaKg > 0 && <span>युरिया: {stg.fertilizerDose.ureaKg} kg</span>}
                        {stg.fertilizerDose.dapKg > 0 && <span>DAP: {stg.fertilizerDose.dapKg} kg</span>}
                        {stg.fertilizerDose.mopKg > 0 && <span>MOP: {stg.fertilizerDose.mopKg} kg</span>}
                      </div>
                    </div>
                  )}

                  {/* Pest Watchlist */}
                  {stg.pestWatch && stg.pestWatch.length > 0 && (
                    <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs border border-rose-200 dark:border-rose-900/50 space-y-2">
                      <p className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isMr ? "कीड व रोग दक्षता सूची:" : "Pest & Disease Watchlist:"}</span>
                      </p>
                      {stg.pestWatch.map((pw, idx) => (
                        <div key={idx} className="space-y-1 text-[11px]">
                          <p className="font-bold text-rose-800 dark:text-rose-300">
                            • {pw.pestNameMr} ({pw.pestNameEn})
                          </p>
                          <p className="text-stone-700 dark:text-stone-300 font-medium">
                            <span className="font-bold">{isMr ? "लक्षणे:" : "Symptoms:"}</span> {pw.symptomsMr}
                          </p>
                          <p className="text-forest-800 dark:text-forest-300 font-medium">
                            <span className="font-bold">{isMr ? "सेंद्रिय उपाय:" : "Organic:"}</span> {pw.organicControlMr}
                          </p>
                          <p className="text-stone-600 dark:text-stone-400 font-medium">
                            <span className="font-bold">{isMr ? "रासायनिक उपाय:" : "Chemical:"}</span> {pw.chemicalControlMr}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks for this stage */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      {isMr ? "नियोजित कृषी कामे:" : "Scheduled Tasks:"}
                    </p>
                    {tasks
                      .filter((t) => {
                        const taskDate = new Date(t.dueDate);
                        const sowing = new Date(calc.sowingDate);
                        const daysDiff = Math.round((taskDate.getTime() - sowing.getTime()) / (1000 * 3600 * 24));
                        return daysDiff >= stg.startDay - 2 && daysDiff <= stg.endDay + 2;
                      })
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id, task.isCompleted)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            task.isCompleted
                              ? "bg-stone-50 border-stone-200 text-stone-400 line-through dark:bg-stone-850 dark:border-stone-800"
                              : "card-warm text-stone-900 hover:border-forest-600 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => {}}
                            className="mt-0.5 h-4 w-4 rounded accent-forest-700 focus:ring-forest-600"
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-bold leading-tight">
                              {isMr ? task.titleMr : task.titleEn}
                            </p>
                            <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                              {isMr ? "तारीख: " : "Date: "}
                              {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAB 2: WATER & IRRIGATION ================= */}
        {activeTab === "water" && irrigation && (
          <div className="space-y-4 animate-fade-in">
            <div className="card-warm p-4.5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                  <span>{isMr ? "पाणी व सिंचन सल्ला" : "Water Requirement & Advisory"}</span>
                </h3>
                <ProvenanceBadge type="estimate" />
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {isMr ? irrigation.summaryMr : irrigation.summaryEn}
              </p>

              {/* Water Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {isMr ? "एकूण पाण्याची गरज:" : "Total Water Volume:"}
                  </span>
                  <span className="text-sm font-black text-forest-800 dark:text-forest-300 font-mono">
                    {irrigation.totalLitresFarm.toLocaleString("en-IN")} L
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    ({irrigation.waterReqMm} mm depth)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {isMr ? "५ HP पंप रनटाईम:" : "5 HP Pump Runtime:"}
                  </span>
                  <span className="text-sm font-black text-stone-900 dark:text-white font-mono">
                    {irrigation.totalPumpHours} {isMr ? "तास" : "hrs"}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    (~{irrigation.weeklyPumpHoursAverage} hrs/week)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {isMr ? "अंदाजित वीज खर्च:" : "Est. Energy Cost:"}
                  </span>
                  <span className="text-sm font-black text-stone-900 dark:text-white font-mono money-numeral">
                    ₹{irrigation.estimatedCostElectricityRupees.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    ({irrigation.estimatedEnergyKwh} kWh)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    {isMr ? "पाटपाण्याच्या तुलनेत बचत:" : "Water Savings vs Flood:"}
                  </span>
                  <span className="text-sm font-black text-forest-800 dark:text-forest-300 font-mono">
                    {irrigation.waterSavingPercent}% {isMr ? "बचत" : "saved"}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    ({(irrigation.waterSavingVsFloodLitres / 1000).toFixed(0)}k L)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FINANCIALS & SCENARIOS ================= */}
        {activeTab === "financials" && (
          <div className="space-y-4 animate-fade-in">
            {/* 3 Scenario Switcher Cards */}
            <div className="card-warm p-4.5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {isMr ? "३ संभाव्य बाजार परिस्थिती (जोखीम पडताळणी)" : "3 Market Scenarios (Risk Analysis)"}
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "pessimistic", name: isMr ? "प्रतिकूल" : "Pessimistic", sub: "-20%/-15%" },
                  { id: "expected", name: isMr ? "अपेक्षित" : "Expected", sub: "Base Plan" },
                  { id: "optimistic", name: isMr ? "अनुकूल" : "Optimistic", sub: "+15%/+15%" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id as any)}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      selectedScenario === s.id
                        ? "border-forest-700 bg-forest-50/90 text-forest-900 dark:bg-forest-950/40 dark:border-forest-600 dark:text-forest-200 ring-2 ring-forest-600/30"
                        : "card-warm hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <p className="text-xs font-black">{s.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{s.sub}</p>
                  </button>
                ))}
              </div>

              {/* Active Scenario Details Card */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 text-xs border border-stone-200 dark:border-stone-800 space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">{isMr ? "अपेक्षित भाव:" : "Expected Price:"}</span>
                  <span className="font-bold font-mono">₹{activeScenarioData.pricePerQuintal.toLocaleString("en-IN")}/Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">{isMr ? "अपेक्षित एकूण उत्पादन:" : "Expected Yield:"}</span>
                  <span className="font-bold font-mono">{activeScenarioData.totalYieldQuintals} Q</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">{isMr ? "एकूण बाजार उत्पन्न:" : "Gross Revenue:"}</span>
                  <span className="font-bold font-mono">₹{activeScenarioData.grossRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 dark:border-stone-750 pt-2">
                  <span className="font-bold text-stone-900 dark:text-white">{isMr ? "निव्वळ नफा/तोटा:" : "Net Profit/Loss:"}</span>
                  <span className={`font-black font-mono money-numeral ${activeScenarioData.netProfit >= 0 ? "text-forest-800 dark:text-forest-300" : "text-rose-600"}`}>
                    ₹{activeScenarioData.netProfit.toLocaleString("en-IN")} ({activeScenarioData.roiPercent}% ROI)
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Cost Table */}
            <div className="card-warm p-4.5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    {isMr ? "उत्पादन खर्च तपशील (१२ घटक)" : "Cost Breakdown (12 Items)"}
                  </h3>
                  <p className="text-[10px] text-stone-500 font-medium">
                    {isMr ? "प्रत्येक आकडा आपण स्वतः बदलू शकता" : "Customize any figure according to your actual expense"}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingCosts(!isEditingCosts)}
                  className="rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200 transition-colors flex items-center gap-1 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingCosts ? (isMr ? "पूर्ण झाले" : "Done") : (isMr ? "बदला" : "Edit")}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: "seed", labelMr: "बियाणे खर्च", labelEn: "Seed" },
                  { key: "seedTreatment", labelMr: "बीजप्रक्रिया", labelEn: "Seed Treatment" },
                  { key: "landPrep", labelMr: "नांगरणी व रानबांधणी", labelEn: "Land Prep" },
                  { key: "fertilizers", labelMr: "रासायनिक व सेंद्रिय खते", labelEn: "Fertilizers" },
                  { key: "pesticides", labelMr: "कीटकनाशके व बुरशीनाशके", labelEn: "Pesticides" },
                  { key: "irrigationEnergy", labelMr: "सिंचन व वीज/डिझेल", labelEn: "Irrigation Energy" },
                  { key: "labour", labelMr: "मजुरी खर्च", labelEn: "Labour" },
                  { key: "machineryRental", labelMr: "ट्रॅक्टर/यंत्रसामग्री भाडे", labelEn: "Machinery Rental" },
                  { key: "harvesting", labelMr: "काढणी व तोडणी", labelEn: "Harvesting" },
                  { key: "transport", labelMr: "वाहतूक खर्च", labelEn: "Transport" },
                  { key: "marketFees", labelMr: "बाजार शुल्क व हमाली", labelEn: "Market Fees" },
                  { key: "interestOnLoan", labelMr: "पीक कर्ज व्याज (KCC ७%)", labelEn: "Loan Interest" },
                  { key: "contingency", labelMr: "आकस्मिक बफर (५%)", labelEn: "5% Contingency" },
                ].map((item) => {
                  const val = editedCosts[item.key] ?? (calc.costBreakdown as any)[item.key];
                  const isUserEntered = userCustomCostKeys.has(item.key);

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-850 last:border-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-700 dark:text-stone-300 font-medium">
                          {isMr ? item.labelMr : item.labelEn}
                        </span>
                        {isUserEntered ? (
                          <ProvenanceBadge type="user" />
                        ) : (
                          <ProvenanceBadge type="estimate" />
                        )}
                      </div>

                      {isEditingCosts ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => {
                            const newNum = Number(e.target.value) || 0;
                            setEditedCosts((prev) => ({ ...prev, [item.key]: newNum }));
                            setUserCustomCostKeys((prev) => new Set(prev).add(item.key));
                          }}
                          className="w-24 h-8 rounded-lg border border-stone-300 dark:border-stone-700 px-2 text-right font-mono font-bold text-stone-900 dark:bg-stone-800 dark:text-white text-xs"
                        />
                      ) : (
                        <span className="font-bold text-stone-900 dark:text-white font-mono">
                          ₹{val?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2 border-t-2 border-stone-200 dark:border-stone-700 flex justify-between font-extrabold text-sm text-stone-900 dark:text-white">
                  <span>{isMr ? "एकूण उत्पादन खर्च:" : "Total Cultivation Cost:"}</span>
                  <span className="font-mono money-numeral text-forest-800 dark:text-forest-300">
                    ₹
                    {Object.values(editedCosts)
                      .reduce((sum, n) => sum + (Number(n) || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 5x5 Sensitivity Matrix */}
            <div className="card-warm p-4.5 overflow-x-auto space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {isMr ? "५×५ संवेदनशीलता तक्ता (भाव व उत्पादनाचा नफ्यावर परिणाम)" : "5×5 Sensitivity Matrix (Yield vs Price)"}
              </h3>
              <p className="text-[10px] text-stone-500 font-medium">
                {isMr ? "उभे: उत्पादन बदल (-20% ते +20%) | आडवे: बाजारभाव बदल (-20% ते +20%)" : "Vertical: Yield Delta (-20% to +20%) | Horizontal: Price Delta"}
              </p>

              <table className="w-full text-center text-[10px] border-collapse mt-2 font-mono">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-750">
                    <th className="p-1.5 text-stone-500 font-sans">{isMr ? "उतारा \\ भाव" : "Yield \\ Price"}</th>
                    {[-20, -10, 0, 10, 20].map((p) => (
                      <th key={p} className="p-1.5 font-bold text-stone-700 dark:text-stone-300">
                        {p > 0 ? `+${p}%` : `${p}%`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.sensitivityMatrix.map((row, rIdx) => {
                    const yDelta = [-20, -10, 0, 10, 20][rIdx];
                    return (
                      <tr key={rIdx} className="border-b border-stone-100 dark:border-stone-850">
                        <td className="p-1.5 font-bold text-stone-700 dark:text-stone-300 font-mono">
                          {yDelta > 0 ? `+${yDelta}%` : `${yDelta}%`}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-1.5 font-bold rounded ${
                              cell.isProfitable
                                ? cell.yieldDeltaPercent === 0 && cell.priceDeltaPercent === 0
                                  ? "bg-forest-800 text-white"
                                  : "bg-forest-50 text-forest-800 dark:bg-forest-950/40 dark:text-forest-300"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            }`}
                          >
                            ₹{(cell.netProfit / 1000).toFixed(0)}k
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Monthly Cash Flow Schedule */}
            <div className="card-warm p-4.5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {isMr ? "महिन्यानुसार रोख प्रवाह (कधी खर्च, कधी उत्पन्न)" : "Monthly Cash Flow Roadmap"}
              </h3>

              <div className="space-y-2 text-xs">
                {calc.monthlyCashFlow.map((cf) => (
                  <div
                    key={cf.monthIndex}
                    className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-stone-900 dark:text-white">
                      <span>{isMr ? `महिना ${cf.monthIndex} (${cf.monthNameMr})` : `Month ${cf.monthIndex} (${cf.monthNameEn})`}</span>
                      <span className={`font-mono font-black ${cf.netCashFlow >= 0 ? "text-forest-800 dark:text-forest-300" : "text-rose-600"}`}>
                        {cf.netCashFlow >= 0 ? `+₹${cf.netCashFlow.toLocaleString("en-IN")}` : `-₹${Math.abs(cf.netCashFlow).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                      <span>{isMr ? "खर्च:" : "Outflow:"} ₹{cf.outflowCost.toLocaleString("en-IN")}</span>
                      <span>{isMr ? "उत्पन्न:" : "Inflow:"} ₹{cf.inflowRevenue.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 italic font-medium">
                      {cf.activitiesMr.join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Math Calculation Transparency Modal */}
      <CalculationModal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        steps={calc.transparencySteps}
        language={language}
        cropName={isMr ? cropData.nameMr : cropData.nameEn}
      />

      <BottomNav />
    </div>
  );
}
