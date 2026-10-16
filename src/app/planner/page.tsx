"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { playChime, speakWithFallback } from "@/lib/soundUtils";

interface PlanItem {
  id: string;
  farmId: string;
  cropId: string;
  areaAcre: number;
  sowingDate: string;
  harvestDate: string;
  irrigationMethod: string;
  status: string;
  estTotalCost: number;
  estExpectedYield: number;
  estExpectedPrice: number;
  estGrossRevenue: number;
  estNetProfit: number;
  farm: {
    name: string;
    surveyNumber?: string;
    soilType: string;
  };
  cropDetails: {
    nameMr: string;
    nameEn: string;
    category: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    upcomingTask?: {
      id: string;
      titleMr: string;
      titleEn: string;
      dueDate: string;
      category: string;
    };
  };
}

export default function PlannerListPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/planner");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error("Error loading plans:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playChime();
    try {
      await fetch(`/api/planner/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      fetchPlans();
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Title & Quick Actions */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>🌾</span>
              {language === "en" ? "End-to-End Crop Planner" : "पीक नियोजन व व्यवस्थापन"}
            </h1>
            <ProvenanceBadge type="estimate" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3.5">
            {language === "en"
              ? "Scientific crop lifecycle plans, automated task calendar, and financial models"
              : "पूर्वमशागत ते काढणीपर्यंतचे शास्त्रीय नियोजन, कामांचे वेळापत्रक व नफा-तोटा अंदाज"}
          </p>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/planner/new"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 p-3 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95 transition-all min-h-[48px]"
            >
              <span>+</span>
              <span>{language === "en" ? "New Crop Plan" : "नवीन पीक नियोजन"}</span>
            </Link>

            <Link
              href="/planner/compare"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-stone-100 p-3 text-xs font-bold text-stone-800 shadow-sm hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 active:scale-95 transition-all min-h-[48px]"
            >
              <span>⚖️</span>
              <span>{language === "en" ? "Compare Crops" : "पिकांची तुलना करा"}</span>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
            <span className="text-4xl">🌱</span>
            <h3 className="mt-2 text-sm font-bold text-stone-900 dark:text-white">
              {language === "en" ? "No crop plans yet" : "अद्याप कोणतेही पीक नियोजन नाही"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {language === "en"
                ? "Create your first scientific crop plan to get stage-wise fertilizer, irrigation, and financial forecasts."
                : "आपल्या शेतासाठी पहिले पीक नियोजन तयार करा आणि खतांचे हप्ते, पाणी व नफ्याचा अचूक अंदाज मिळवा."}
            </p>
            <Link
              href="/planner/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95 min-h-[48px]"
            >
              <span>+</span>
              <span>{language === "en" ? "Start Season Plan" : "हंगाम नियोजन सुरू करा"}</span>
            </Link>
          </div>
        )}

        {/* Plans List */}
        {!loading && plans.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400 px-1">
              <span>{language === "en" ? "Your Crop Plans" : "आपली चालू पीक नियोजने"} ({plans.length})</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {plans.filter((p) => p.status === "active").length} {language === "en" ? "Active" : "चालू"}
              </span>
            </div>

            {plans.map((plan) => {
              const sowingStr = new Date(plan.sowingDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
              const harvestStr = new Date(plan.harvestDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/planner/${plan.id}`)}
                  className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all dark:bg-stone-900 dark:border-stone-800"
                >
                  {/* Top Bar: Crop Name & Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-stone-900 dark:text-white leading-tight">
                          {language === "en" ? plan.cropDetails.nameEn : plan.cropDetails.nameMr}
                        </h2>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 uppercase">
                          {plan.status === "active" ? (language === "en" ? "Active" : "चालू") : plan.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {plan.farm.name} • {plan.areaAcre} एकर ({plan.irrigationMethod.toUpperCase()})
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        {language === "en" ? "Est. Net Profit:" : "अपेक्षित निव्वळ नफा:"}
                      </p>
                      <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                        ₹{plan.estNetProfit.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Dates & Yield Grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-2.5 text-center text-xs text-stone-700 dark:bg-stone-850 dark:text-stone-300 my-2.5 border border-stone-100 dark:border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">पेरणी:</span>
                      <span className="font-bold">{sowingStr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">काढणी:</span>
                      <span className="font-bold">{harvestStr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">अपेक्षित उत्पादन:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {plan.estExpectedYield} Q
                      </span>
                    </div>
                  </div>

                  {/* Task Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      <span>कामांची प्रगती (Tasks)</span>
                      <span>
                        {plan.stats.completedTasks} / {plan.stats.totalTasks} पूर्ण ({plan.stats.progressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${plan.stats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Upcoming Next Task (if pending) */}
                  {plan.stats.upcomingTask && (
                    <div className="mt-3 rounded-xl border border-amber-250 bg-amber-50/70 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-sm">📌</span>
                          <div className="truncate">
                            <p className="text-[11px] font-bold text-amber-950 dark:text-amber-200 truncate">
                              {language === "en"
                                ? plan.stats.upcomingTask.titleEn
                                : plan.stats.upcomingTask.titleMr}
                            </p>
                            <p className="text-[10px] text-amber-800 dark:text-amber-300">
                              तारीख: {new Date(plan.stats.upcomingTask.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleToggleTask(plan.stats.upcomingTask!.id, e)}
                          className="shrink-0 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95"
                        >
                          ✓ {language === "en" ? "Done" : "पूर्ण"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Details Link */}
                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>{language === "en" ? "View Full Plan & Timeline →" : "सविस्तर योजना व वेळापत्रक पहा →"}</span>
                    <span>➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
