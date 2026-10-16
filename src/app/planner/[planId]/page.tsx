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

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();

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
    const cropName = language === "en" ? cropData.nameEn : cropData.nameMr;
    const summaryText =
      language === "en"
        ? `${cropName} crop plan on ${plan.areaAcre} acres. Estimated total cost is ${calc.totalCost} rupees. Expected harvest yield is ${calc.totalExpectedYieldQuintals} quintals. Net profit forecast is ${calc.netProfit} rupees with ${calc.roiPercent}% return on investment.`
        : `${cropName} पीक नियोजन. एकूण क्षेत्र ${plan.areaAcre} एकर. अंदाजित उत्पादन खर्च ${calc.totalCost} रुपये. अपेक्षित एकूण उत्पादन ${calc.totalExpectedYieldQuintals} क्विंटल. अपेक्षित निव्वळ नफा ${calc.netProfit} रुपये असून नफा परतावा दर ${calc.roiPercent}% आहे.`;

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
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-stone-900 dark:text-white leading-tight">
                  {language === "en" ? cropData.nameEn : cropData.nameMr}
                </h1>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {plan.status === "active" ? (language === "en" ? "Active" : "चालू") : plan.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {plan.farm.name} • {calc.areaAcre} एकर ({calc.areaGuntha} गुंठे) • {calc.varietyName}
              </p>
            </div>

            <button
              onClick={handleReadSummary}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 active:scale-95 shadow-sm"
              aria-label="Read Summary"
              title="Read Summary"
            >
              🔊
            </button>
          </div>

          {/* Dates Bar */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 dark:bg-stone-850 dark:text-stone-300 border border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">पेरणी तारीख:</span>
              <span className="font-bold">{calc.sowingDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">कालावधी:</span>
              <span className="font-bold">{calc.durationDays} दिवस</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block">काढणी तारीख:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{calc.harvestDate}</span>
            </div>
          </div>
        </div>

        {/* 4 Financial Highlight KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {language === "en" ? "Net Profit:" : "अपेक्षित निव्वळ नफा:"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              ₹{calc.netProfit.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              ROI: <span className="font-bold text-emerald-600">{calc.roiPercent}%</span> (₹{calc.profitPerAcre.toLocaleString("en-IN")}/एकर)
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {language === "en" ? "Total Cultivation Cost:" : "एकूण उत्पादन खर्च:"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-base font-extrabold text-stone-900 dark:text-white">
              ₹{calc.totalCost.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              ₹{calc.costPerAcre.toLocaleString("en-IN")}/एकर (१२ घटक)
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {language === "en" ? "Expected Yield:" : "अपेक्षित एकूण उत्पादन:"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-base font-extrabold text-stone-900 dark:text-white">
              {calc.totalExpectedYieldQuintals} <span className="text-xs font-normal">क्विंटल</span>
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              {calc.effectiveYieldPerAcre} Q/एकर (गुणांक {calc.multipliers.combinedFactor}×)
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {language === "en" ? "Break-Even Price:" : "तोटा न होणारा किमान भाव:"}
              </span>
              <ProvenanceBadge type="estimate" />
            </div>
            <p className="text-base font-extrabold text-amber-700 dark:text-amber-400">
              ₹{calc.breakEvenPricePerQuintal.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              प्रति क्विंटल किमान विक्री भाव
            </p>
          </div>
        </div>

        {/* Show Math Transparency Button */}
        <button
          onClick={() => setShowCalcModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-xs font-bold text-emerald-800 border border-emerald-250 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 active:scale-95 transition-all shadow-sm min-h-[48px]"
        >
          <span>🧮</span>
          <span>{language === "en" ? "How was this calculated? (View Math & Sources)" : "हिशोब कसा केला? (पारदर्शक सूत्रे व आधार पहा)"}</span>
        </button>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-stone-200 p-1 dark:bg-stone-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("stages")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === "stages"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
            }`}
          >
            🌱 {language === "en" ? "Stages & Tasks" : "टप्पे व कामे"}
          </button>

          <button
            onClick={() => setActiveTab("water")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === "water"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
            }`}
          >
            💧 {language === "en" ? "Water & Pump" : "पाणी व सिंचन"}
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === "financials"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
            }`}
          >
            📊 {language === "en" ? "Scenarios & Cost" : "आर्थिक विश्लेषण"}
          </button>
        </div>

        {/* ================= TAB 1: GROWTH STAGES & TASKS ================= */}
        {activeTab === "stages" && (
          <div className="space-y-4 animate-fade-in">
            {/* Growth Stages Timeline Cards */}
            {cropData.stages.map((stg) => {
              const stageTasks = tasks.filter((t) => t.category && t.dueDate);

              return (
                <div
                  key={stg.stageNumber}
                  className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                        {stg.stageNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                          {language === "en" ? stg.nameEn : stg.nameMr}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          दिवस {stg.startDay} ते {stg.endDay} (Kc: {stg.kcFactor})
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                      मजूर: {Math.round(stg.labourDaysPerAcre * calc.areaAcre)} दिवस
                    </span>
                  </div>

                  {/* Fertilizer Dose Schedule */}
                  {(stg.fertilizerDose.ureaKg > 0 || stg.fertilizerDose.dapKg > 0 || stg.fertilizerDose.mopKg > 0) && (
                    <div className="rounded-xl bg-emerald-50/80 p-3 text-xs border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1 mb-1">
                        <span>🧪</span>
                        {language === "en" ? "Fertilizer Schedule (Per Acre):" : "खत नियोजन (प्रति एकर):"}
                      </p>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                        {stg.fertilizerDose.descriptionMr}
                      </p>
                      <div className="mt-2 flex gap-3 font-semibold text-[11px] text-emerald-800 dark:text-emerald-300">
                        {stg.fertilizerDose.ureaKg > 0 && <span>युरिया: {stg.fertilizerDose.ureaKg} kg</span>}
                        {stg.fertilizerDose.dapKg > 0 && <span>DAP: {stg.fertilizerDose.dapKg} kg</span>}
                        {stg.fertilizerDose.mopKg > 0 && <span>MOP: {stg.fertilizerDose.mopKg} kg</span>}
                      </div>
                    </div>
                  )}

                  {/* Pest Watchlist */}
                  {stg.pestWatch && stg.pestWatch.length > 0 && (
                    <div className="rounded-xl bg-rose-50/80 p-3 text-xs border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50">
                      <p className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1 mb-1.5">
                        <span>🐛</span>
                        {language === "en" ? "Pest & Disease Watchlist:" : "कीड व रोग दक्षता सूची:"}
                      </p>
                      {stg.pestWatch.map((pw, idx) => (
                        <div key={idx} className="space-y-1 mb-2 text-[11px] last:mb-0">
                          <p className="font-bold text-rose-800 dark:text-rose-300">
                            • {pw.pestNameMr} ({pw.pestNameEn})
                          </p>
                          <p className="text-stone-700 dark:text-stone-300">
                            <span className="font-semibold">लक्षणे:</span> {pw.symptomsMr}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400">
                            <span className="font-semibold">सेंद्रिय उपाय:</span> {pw.organicControlMr}
                          </p>
                          <p className="text-stone-600 dark:text-stone-400">
                            <span className="font-semibold">रासायनिक उपाय:</span> {pw.chemicalControlMr}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks for this stage */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      {language === "en" ? "Scheduled Tasks:" : "नियोजित कामे:"}
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
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            task.isCompleted
                              ? "bg-stone-100 border-stone-200 text-stone-400 line-through dark:bg-stone-850 dark:border-stone-800"
                              : "bg-stone-50 border-stone-200 text-stone-900 hover:border-emerald-500 dark:bg-stone-800 dark:border-stone-700 dark:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => {}}
                            className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-semibold leading-tight">
                              {language === "en" ? task.titleEn : task.titleMr}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                              तारीख: {new Date(task.dueDate).toLocaleDateString("en-IN", {
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
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>💧</span>
                  {language === "en" ? "Farm Water Requirement & Advisory" : "पाणी व सिंचन सल्ला"}
                </h3>
                <ProvenanceBadge type="estimate" />
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {language === "en" ? irrigation.summaryEn : irrigation.summaryMr}
              </p>

              {/* Water Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">एकूण पाण्याची गरज:</span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {irrigation.totalLitresFarm.toLocaleString("en-IN")} लिटर
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    ({irrigation.waterReqMm} mm depth)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">५ HP पंप रनटाईम:</span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white">
                    {irrigation.totalPumpHours} तास
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    (दर आठवड्याला ~{irrigation.weeklyPumpHoursAverage} तास)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">अंदाजित वीज खर्च:</span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white">
                    ₹{irrigation.estimatedCostElectricityRupees.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    ({irrigation.estimatedEnergyKwh} kWh युनिट्स)
                  </span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">पाटपाण्याच्या तुलनेत बचत:</span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {irrigation.waterSavingPercent}% पाणी बचत
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    ({(irrigation.waterSavingVsFloodLitres / 1000).toFixed(0)} हजार लिटर)
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
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                {language === "en" ? "3 Future Market Scenarios" : "३ संभाव्य बाजार परिस्थिती (जोखीम पडताळणी)"}
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: "pessimistic", name: "प्रतिकूल", sub: "-20%/-15%", color: "rose" },
                  { id: "expected", name: "अपेक्षित", sub: "पायाभूत", color: "emerald" },
                  { id: "optimistic", name: "अनुकूल", sub: "+15%/+15%", color: "amber" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id as any)}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      selectedScenario === s.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-300"
                    }`}
                  >
                    <p className="text-xs font-bold">{s.name}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">{s.sub}</p>
                  </button>
                ))}
              </div>

              {/* Active Scenario Details Card */}
              <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">अपेक्षित भाव:</span>
                  <span className="font-bold">₹{activeScenarioData.pricePerQuintal.toLocaleString("en-IN")}/Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">अपेक्षित एकूण उत्पादन:</span>
                  <span className="font-bold">{activeScenarioData.totalYieldQuintals} क्विंटल</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">एकूण बाजार उत्पन्न:</span>
                  <span className="font-bold">₹{activeScenarioData.grossRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5 dark:border-stone-750">
                  <span className="font-bold text-stone-900 dark:text-white">निव्वळ नफा/तोटा:</span>
                  <span className={`font-extrabold ${activeScenarioData.netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                    ₹{activeScenarioData.netProfit.toLocaleString("en-IN")} ({activeScenarioData.roiPercent}% ROI)
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Cost Table */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2 dark:border-stone-800">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    {language === "en" ? "Cost Breakdown (12 Line Items)" : "उत्पादन खर्च तपशील (१२ घटक)"}
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    {language === "en" ? "Every figure can be customized by you" : "प्रत्येक आकडा आपण स्वतः बदलू शकता"}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingCosts(!isEditingCosts)}
                  className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 active:scale-95"
                >
                  {isEditingCosts ? "पूर्ण झाले" : "बदला ✏️"}
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
                      className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800 last:border-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-700 dark:text-stone-300">
                          {language === "en" ? item.labelEn : item.labelMr}
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
                          className="w-24 rounded border border-stone-300 p-1 text-right font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                      ) : (
                        <span className="font-bold text-stone-900 dark:text-white">
                          ₹{val?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2 border-t-2 border-stone-300 dark:border-stone-700 flex justify-between font-extrabold text-sm text-stone-900 dark:text-white">
                  <span>एकूण उत्पादन खर्च:</span>
                  <span>
                    ₹
                    {Object.values(editedCosts)
                      .reduce((sum, n) => sum + (Number(n) || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 5x5 Sensitivity Matrix */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 overflow-x-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                {language === "en" ? "5×5 Sensitivity Matrix (Yield vs Price)" : "५×५ संवेदनशीलता तक्ता (भाव व उत्पादनाचा नफ्यावर परिणाम)"}
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mb-3">
                उभे: उत्पादन बदल (-20% ते +20%) | आडवे: बाजारभाव बदल (-20% ते +20%)
              </p>

              <table className="w-full text-center text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-750">
                    <th className="p-1.5 text-stone-500">उतारा \ भाव</th>
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
                        <td className="p-1.5 font-bold text-stone-700 dark:text-stone-300">
                          {yDelta > 0 ? `+${yDelta}%` : `${yDelta}%`}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-1.5 font-bold rounded ${
                              cell.isProfitable
                                ? cell.yieldDeltaPercent === 0 && cell.priceDeltaPercent === 0
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
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
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                {language === "en" ? "Monthly Cash Flow Schedule" : "महिन्यानुसार रोख प्रवाह (कधी खर्च, कधी उत्पन्न)"}
              </h3>

              <div className="space-y-2 text-xs">
                {calc.monthlyCashFlow.map((cf) => (
                  <div
                    key={cf.monthIndex}
                    className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-850 space-y-1"
                  >
                    <div className="flex justify-between font-bold text-stone-900 dark:text-white">
                      <span>महिना {cf.monthIndex} ({cf.monthNameMr})</span>
                      <span className={cf.netCashFlow >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}>
                        {cf.netCashFlow >= 0 ? `+₹${cf.netCashFlow.toLocaleString("en-IN")}` : `-₹${Math.abs(cf.netCashFlow).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400">
                      <span>खर्च: ₹{cf.outflowCost.toLocaleString("en-IN")}</span>
                      <span>उत्पन्न: ₹{cf.inflowRevenue.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 italic">
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
        cropName={language === "en" ? cropData.nameEn : cropData.nameMr}
      />

      <BottomNav />
    </div>
  );
}
