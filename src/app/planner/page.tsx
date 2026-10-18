"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { playChime } from "@/lib/soundUtils";
import {
  Sprout,
  Plus,
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Droplets,
} from "lucide-react";

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
  const isMr = language === "mr";

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
        {/* Title & Quick Actions Hero */}
        <div className="card-warm p-4.5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-card border border-forest-700/40">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-stone-900 dark:text-stone-100 leading-tight">
                  {isMr ? "पीक नियोजन व वेळापत्रक" : "Crop Planner & Roadmap"}
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  {isMr ? "हंगामी नियोजन, खतांचे डोस व नफा अंदाज" : "Lifecycle management & profit forecast"}
                </p>
              </div>
            </div>
            <ProvenanceBadge type="estimate" />
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href="/planner/new"
              className="btn-solid-primary h-12 flex items-center justify-center gap-2 text-xs font-bold shadow-card active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isMr ? "नवीन पीक नियोजन" : "New Crop Plan"}</span>
            </Link>

            <Link
              href="/planner/compare"
              className="btn-solid-secondary h-12 flex items-center justify-center gap-2 text-xs font-bold active:scale-[0.98] transition-all"
            >
              <Scale className="w-4 h-4 text-forest-700 dark:text-forest-400 stroke-[2]" />
              <span>{isMr ? "पिकांची तुलना करा" : "Compare Crops"}</span>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <div className="card-warm p-8 text-center border-dashed border-2 border-stone-300 dark:border-stone-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                {isMr ? "अद्याप कोणतेही पीक नियोजन नाही" : "No crop plans created yet"}
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                {isMr
                  ? "आपल्या शेतासाठी पहिले वैज्ञानिक पीक नियोजन तयार करा आणि टप्प्याटप्प्याने कामांचे वेळापत्रक व नफ्याचा अंदाज मिळवा."
                  : "Create your first scientific plan to get stage-wise fertilizer schedules, irrigation guidance, and financial forecasts."}
              </p>
            </div>
            <Link
              href="/planner/new"
              className="btn-solid-primary h-12 inline-flex items-center gap-2 px-6 text-xs font-bold shadow-card active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isMr ? "हंगाम नियोजन सुरू करा" : "Start Season Plan"}</span>
            </Link>
          </div>
        )}

        {/* Plans List */}
        {!loading && plans.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400 px-1">
              <span>{isMr ? "आपली चालू पीक नियोजने" : "Your Active Plans"} ({plans.length})</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 font-bold">
                {plans.filter((p) => p.status === "active").length} {isMr ? "सक्रिय" : "Active"}
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
                  className="card-warm p-4 cursor-pointer hover:border-forest-600/60 dark:hover:border-forest-500 transition-all space-y-3 group"
                >
                  {/* Top Bar: Crop Name & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-stone-900 dark:text-white leading-tight group-hover:text-forest-800 dark:group-hover:text-forest-300 transition-colors">
                          {isMr ? plan.cropDetails.nameMr : plan.cropDetails.nameEn}
                        </h2>
                        <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-800 dark:bg-forest-900/50 dark:text-forest-300 uppercase">
                          {plan.status === "active" ? (isMr ? "चालू" : "Active") : plan.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {plan.farm.name}
                        </span>
                        <span>•</span>
                        <span>{plan.areaAcre} एकर</span>
                        <span>•</span>
                        <span className="capitalize">{plan.irrigationMethod}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                        {isMr ? "अपेक्षित निव्वळ नफा" : "Est. Net Profit"}
                      </p>
                      <p className="text-sm font-black text-forest-800 dark:text-forest-300 font-mono money-numeral">
                        ₹{plan.estNetProfit.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Dates & Yield Grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 text-center text-xs text-stone-700 dark:text-stone-300 border border-stone-100 dark:border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
                        {isMr ? "पेरणी:" : "Sowing:"}
                      </span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">{sowingStr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
                        {isMr ? "काढणी:" : "Harvest:"}
                      </span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">{harvestStr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">
                        {isMr ? "अपेक्षित उत्पादन:" : "Yield:"}
                      </span>
                      <span className="font-black text-forest-700 dark:text-forest-300 font-mono">
                        {plan.estExpectedYield} Q
                      </span>
                    </div>
                  </div>

                  {/* Task Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                      <span>{isMr ? "कामांची प्रगती" : "Task Roadmap"}</span>
                      <span className="font-mono text-forest-700 dark:text-forest-300">
                        {plan.stats.completedTasks} / {plan.stats.totalTasks} ({plan.stats.progressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full bg-forest-700 transition-all duration-300"
                        style={{ width: `${plan.stats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Upcoming Next Task Card (if pending) */}
                  {plan.stats.upcomingTask && (
                    <div className="rounded-xl border border-harvest-500/30 bg-harvest-500/5 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-6 h-6 rounded-lg bg-harvest-500/20 text-soil-800 dark:text-harvest-400 flex items-center justify-center shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </span>
                          <div className="truncate">
                            <p className="text-[11px] font-bold text-soil-900 dark:text-harvest-200 truncate">
                              {isMr
                                ? plan.stats.upcomingTask.titleMr
                                : plan.stats.upcomingTask.titleEn}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                              {isMr ? "तारीख: " : "Due: "}
                              {new Date(plan.stats.upcomingTask.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleTask(plan.stats.upcomingTask!.id, e)}
                          className="shrink-0 h-8 px-3 rounded-lg bg-forest-800 hover:bg-forest-900 active:scale-95 text-[11px] font-bold text-white shadow-xs flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isMr ? "पूर्ण" : "Done"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Details Link */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-forest-800 dark:text-forest-400">
                    <span>{isMr ? "सविस्तर योजना व दिनदर्शिका पहा" : "View Full Plan & Calendar"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
