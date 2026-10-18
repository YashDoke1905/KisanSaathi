"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { UnitConverterModal } from "@/components/UnitConverterModal";
import { ReadAloudButton } from "@/components/VoiceAssistantButton";
import {
  Sprout,
  Plus,
  Trash2,
  Droplets,
  Layers,
  MapPin,
  CheckCircle,
  Calculator,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface WaterSourceItem {
  id?: string;
  sourceType: string;
  seasonality: string;
  hasDrip: boolean;
  hasSprinkler: boolean;
  electricityHoursDaily: number;
  pumpHorsepower: number;
}

interface FarmPlot {
  id: string;
  name: string;
  surveyNumber?: string | null;
  ulpin?: string | null;
  ownershipType: string;
  areaAcre: number;
  soilType: string;
  soilPh?: number | null;
  terrain: string;
  waterSources: WaterSourceItem[];
}

export default function FarmPage() {
  const { t, language } = useLanguage();
  const isMr = language === "mr";
  const isHi = language === "hi";

  const [farms, setFarms] = useState<FarmPlot[]>([]);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  // New plot form state
  const [plotName, setPlotName] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [ulpin, setUlpin] = useState("");
  const [areaInput, setAreaInput] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<"acre" | "guntha" | "hectare">("acre");
  const [soilType, setSoilType] = useState("Medium_Black");
  const [soilPh, setSoilPh] = useState<string>("7.0");
  const [terrain, setTerrain] = useState("Flat");

  // Water source form state
  const [hasWaterSource, setHasWaterSource] = useState(true);
  const [waterSourceType, setWaterSourceType] = useState("Open_Well");
  const [hasDrip, setHasDrip] = useState(true);
  const [hasSprinkler, setHasSprinkler] = useState(false);
  const [electricityHours, setElectricityHours] = useState(8);
  const [pumpHp, setPumpHp] = useState(5);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch farms and profile
  const fetchFarms = async () => {
    try {
      const res = await fetch("/api/farm");
      if (res.ok) {
        const data = await res.json();
        setFarms(data.profile?.farms || []);
        setFarmerProfile(data.profile);
        setCompletenessScore(data.completenessScore || 0);
      }
    } catch (e) {
      console.error("Failed to fetch farm plots:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const calculateNormalizedAcre = (val: number, unit: string) => {
    if (unit === "guntha") return val / 40;
    if (unit === "hectare") return val * 2.47105;
    return val;
  };

  const handleSavePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const calculatedAcre = calculateNormalizedAcre(areaInput, areaUnit);

    const waterSourcesPayload = hasWaterSource
      ? [
          {
            sourceType: waterSourceType,
            seasonality: "Perennial",
            hasDrip,
            hasSprinkler,
            electricityHoursDaily: electricityHours,
            pumpHorsepower: pumpHp,
          },
        ]
      : [];

    try {
      const res = await fetch("/api/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plotName,
          surveyNumber,
          ulpin: ulpin || undefined,
          areaAcre: calculatedAcre,
          soilType,
          soilPh: soilPh ? parseFloat(soilPh) : undefined,
          terrain,
          waterSources: waterSourcesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save plot");
      } else {
        setIsAddModalOpen(false);
        // Reset form
        setPlotName("");
        setSurveyNumber("");
        setUlpin("");
        setAreaInput(1);
        fetchFarms();
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlot = async (id: string) => {
    if (!confirm(isMr ? "हा शेत गट वगळायचा आहे का?" : "Are you sure you want to remove this farm plot?")) return;
    try {
      const res = await fetch(`/api/farm/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFarms();
      }
    } catch {
      alert("Failed to delete plot");
    }
  };

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

          <ReadAloudButton text={`${t("farm.title")}. ${t("farm.subtitle")}`} />
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <span>{t("farm.title")}</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 pl-11">
            {t("farm.subtitle")}
          </p>
        </div>

        {/* Farm Suite Hub: Plots | Crop Plans | Ledger */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-200/70 dark:bg-stone-900/80 p-1.5 rounded-2xl text-xs font-bold">
          <span className="py-2.5 px-2 text-center rounded-xl bg-white dark:bg-[#1E221B] text-[#1B4332] dark:text-[#52B788] shadow-sm font-extrabold min-h-[44px] flex items-center justify-center gap-1">
            🌱 {isMr ? "शेत गट (Plots)" : "Plots"}
          </span>
          <Link
            href="/planner"
            className="py-2.5 px-2 text-center rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors min-h-[44px] flex items-center justify-center gap-1"
          >
            🌾 {isMr ? "पीक नियोजन" : "Planner"}
          </Link>
          <Link
            href="/ledger"
            className="py-2.5 px-2 text-center rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors min-h-[44px] flex items-center justify-center gap-1"
          >
            📋 {isMr ? "हिशोब वही" : "Ledger"}
          </Link>
        </div>

        {/* Progressive Profile Completeness Meter */}
        <div className="bg-gradient-to-br from-[#1B4332] via-[#24543F] to-[#0F281E] text-white rounded-3xl p-5 border border-[#2D6A4F]/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{t("farm.completeness")}</span>
            </span>
            <span className="font-mono font-black text-lg text-emerald-300 tabular-nums">
              {completenessScore}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0F281E] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${completenessScore}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-200 leading-relaxed">
            {completenessScore >= 80 ? (
              <span className="text-emerald-200 font-medium">
                ✓ {isMr ? "उत्कृष्ट! अचूक पीक नियोजनासाठी आवश्यक माती व पाणी माहिती पूर्ण आहे." : "Excellent! Your farm profile has complete soil and water data for accurate crop planning."}
              </span>
            ) : (
              <span>💡 {t("farm.completeness_tip")}</span>
            )}
          </p>
        </div>

        {/* Action Buttons: Add Plot & Unit Converter */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all min-h-[52px]"
          >
            <Plus className="w-5 h-5 text-amber-300" />
            <span>{t("farm.add_farm")}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConverterOpen(true)}
            className="p-3.5 bg-white dark:bg-[#1E221B] hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-center gap-1.5 min-h-[52px] font-bold text-xs shadow-xs"
            title={t("farm.unit_converter")}
          >
            <Calculator className="w-4 h-4 text-[#DF9115]" />
            <span>{isMr ? "क्षेत्र रूपांतरक" : "Converter"}</span>
          </button>
        </div>

        {/* List of Farm Plots */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-stone-500">
            {t("common.loading")}
          </div>
        ) : farms.length === 0 ? (
          <div className="py-12 px-4 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl space-y-3 bg-white/50 dark:bg-[#1E221B]/40">
            <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
              <Layers className="w-7 h-7" />
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xs mx-auto">
              {t("farm.no_farms")}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-[#1B4332] dark:text-[#52B788] hover:underline min-h-[44px] inline-flex items-center"
            >
              + {t("farm.add_farm")}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {farms.map((farm) => {
              const gunthaEquiv = (farm.areaAcre * 40).toFixed(0);
              return (
                <div
                  key={farm.id}
                  className="bg-white dark:bg-[#1E221B] rounded-3xl p-4 md:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5"
                >
                  {/* Header & Area */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold font-heading text-base text-stone-900 dark:text-stone-100 leading-tight">
                        {farm.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {farm.surveyNumber && (
                          <span className="text-[11px] text-stone-500">
                            {isMr ? "गट क्र.:" : "Gat:"} {farm.surveyNumber}
                          </span>
                        )}
                        {farm.ulpin && (
                          <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md text-stone-700 dark:text-stone-300">
                            ULPIN: {farm.ulpin}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePlot(farm.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title={t("common.delete")}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Acreage & Soil Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-800/80">
                      <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-0.5">
                        {t("farm.area")}
                      </span>
                      <span className="font-black font-mono text-[#1B4332] dark:text-[#52B788] text-base tabular-nums">
                        {farm.areaAcre} {t("farm.acre")}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        ({gunthaEquiv} {t("farm.guntha")})
                      </span>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-800/80">
                      <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-0.5">
                        {t("farm.soil_type")}
                      </span>
                      <span className="font-bold text-amber-900 dark:text-amber-300 truncate block">
                        {t(`farm.soil_types.${farm.soilType}` as any, farm.soilType)}
                      </span>
                      {farm.soilPh && (
                        <span className="text-[10px] text-stone-500 block font-mono">
                          pH: {farm.soilPh}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Water Sources */}
                  {farm.waterSources && farm.waterSources.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                      {farm.waterSources.map((ws, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-900"
                        >
                          <span>{t(`farm.source_types.${ws.sourceType}` as any, ws.sourceType)}</span>
                          {ws.hasDrip && <span className="font-bold">• Drip</span>}
                          {ws.hasSprinkler && <span className="font-bold">• Sprinkler</span>}
                          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                            ({ws.electricityHoursDaily}h power)
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <ProvenanceBadge type="user" />
                      <span className="text-[10px] text-stone-400">
                        {farm.terrain}
                      </span>
                    </div>

                    <Link
                      href={`/planner/new?farmId=${farm.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[40px]"
                    >
                      <span>🌾</span>
                      <span>{isMr ? "पीक नियोजन करा" : "Plan Crops"}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
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

      {/* Modal: Add New Farm Plot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-[#1E221B] border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-bold font-heading text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#1B4332]" />
                <span>{t("farm.add_farm")}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-xl rounded-xl"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePlot} className="space-y-3.5">
              {/* Plot Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t("farm.plot_name")} *
                </label>
                <input
                  type="text"
                  required
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder={t("farm.plot_name_placeholder")}
                  className="w-full px-3.5 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[48px]"
                />
              </div>

              {/* Area & Unit Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {t("farm.area")} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsConverterOpen(true)}
                    className="text-xs text-[#1B4332] dark:text-[#52B788] font-bold hover:underline flex items-center gap-1 min-h-[36px]"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#DF9115]" />
                    <span>Unit Converter</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.1"
                    value={areaInput || ""}
                    onChange={(e) => setAreaInput(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 2.5"
                    className="w-full px-3.5 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[48px]"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[48px]"
                  >
                    <option value="acre">{t("farm.acre")} (एकर)</option>
                    <option value="guntha">{t("farm.guntha")} (गुंठे)</option>
                    <option value="hectare">{t("farm.hectare")} (हेक्टर)</option>
                  </select>
                </div>
              </div>

              {/* Survey / Gat Number & ULPIN */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t("farm.survey_number")}
                  </label>
                  <input
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    placeholder="e.g. 42/1"
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ULPIN (14-char)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={ulpin}
                    onChange={(e) => setUlpin(e.target.value.toUpperCase())}
                    placeholder="MH2614..."
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs uppercase font-mono min-h-[48px]"
                  />
                </div>
              </div>

              {/* Soil Type & pH */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t("farm.soil_type")}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs min-h-[48px]"
                  >
                    <option value="Medium_Black">Medium Black (मध्यम काळी)</option>
                    <option value="Black_Cotton">Black Cotton (काळी)</option>
                    <option value="Red_Sandy">Red Sandy (तांबडी)</option>
                    <option value="Loamy">Loamy (गाळाची)</option>
                    <option value="Laterite">Laterite (जांभी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Soil pH (सामू)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="10"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    placeholder="6.5 - 7.5"
                    className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-mono min-h-[48px]"
                  />
                </div>
              </div>

              {/* Water Source Configuration */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span>{t("farm.water_sources")}</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={waterSourceType}
                    onChange={(e) => setWaterSourceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs min-h-[48px]"
                  >
                    <option value="Open_Well">Open Well (विहीर)</option>
                    <option value="Borewell">Borewell (बोअरवेल)</option>
                    <option value="Canal">Canal (कालवा)</option>
                    <option value="Farm_Pond">Farm Pond (शेततळे)</option>
                    <option value="River">River (नदी)</option>
                    <option value="Rainfed">Rainfed (जिरायत)</option>
                  </select>

                  <div className="flex items-center gap-2 px-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={hasDrip}
                        onChange={(e) => setHasDrip(e.target.checked)}
                        className="w-4 h-4 text-[#1B4332] rounded"
                      />
                      <span>Drip</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={hasSprinkler}
                        onChange={(e) => setHasSprinkler(e.target.checked)}
                        className="w-4 h-4 text-[#1B4332] rounded"
                      />
                      <span>Sprinkler</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">
                      Power (hrs/day)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={electricityHours}
                      onChange={(e) => setElectricityHours(parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">
                      Motor HP
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="20"
                      value={pumpHp}
                      onChange={(e) => setPumpHp(parseFloat(e.target.value) || 5)}
                      className="w-full px-3 py-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-3.5 px-4 rounded-2xl min-h-[50px] shadow-sm active:scale-98 transition-all"
                >
                  {isSaving ? t("common.loading") : t("farm.save_plot")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3.5 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-300 font-semibold min-h-[50px]"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Unit Converter Modal */}
      <UnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        onApply={(acre) => {
          setAreaInput(acre);
          setAreaUnit("acre");
        }}
      />
    </div>
  );
}
