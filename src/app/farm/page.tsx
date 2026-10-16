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
  HelpCircle,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Zap,
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
  const { t } = useLanguage();

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
    if (!confirm("Are you sure you want to remove this farm plot?")) return;
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
    <div className="space-y-4">
      {/* Page Title & Audio Reader */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-kisan-green-700 dark:text-kisan-green-400" />
            <span>{t("farm.title")}</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("farm.subtitle")}
          </p>
        </div>
        <ReadAloudButton text={`${t("farm.title")}. ${t("farm.subtitle")}`} />
      </div>

      {/* Farm Suite Hub: Plots | Crop Plans | Ledger */}
      <div className="flex rounded-xl bg-zinc-200/80 dark:bg-zinc-800 p-1 text-xs font-bold shadow-xs">
        <span className="flex-1 py-2 text-center rounded-lg bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white">
          🌱 शेत गट (Plots)
        </span>
        <Link
          href="/planner"
          className="flex-1 py-2 text-center rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          🌾 पीक नियोजन (Planner)
        </Link>
        <Link
          href="/ledger"
          className="flex-1 py-2 text-center rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          📋 हिशोब वही (Ledger)
        </Link>
      </div>

      {/* Progressive Profile Completeness Meter */}
      <div className="bg-linear-to-br from-kisan-green-50 to-emerald-100/50 dark:from-zinc-800 dark:to-zinc-800/60 rounded-2xl p-3.5 border border-kisan-green-200 dark:border-zinc-700 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-kisan-green-900 dark:text-kisan-green-300 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-kisan-green-700" />
            <span>{t("farm.completeness")}</span>
          </span>
          <span className="font-mono font-bold text-kisan-green-800 dark:text-kisan-green-400">
            {completenessScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-kisan-green-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completenessScore}%` }}
          />
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {completenessScore >= 80 ? (
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ Excellent! Your farm profile has complete soil and water data for accurate crop planning.
            </span>
          ) : (
            <span>💡 {t("farm.completeness_tip")}</span>
          )}
        </p>
      </div>

      {/* Action Buttons: Add Plot & Unit Converter */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-transform min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>{t("farm.add_farm")}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsConverterOpen(true)}
          className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 min-h-[48px] font-semibold text-xs"
          title={t("farm.unit_converter")}
        >
          <Calculator className="w-4 h-4 text-kisan-soil-700 dark:text-kisan-soil-300" />
          <span>Converter</span>
        </button>
      </div>

      {/* List of Farm Plots */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          {t("common.loading")}
        </div>
      ) : farms.length === 0 ? (
        <div className="py-10 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
            {t("farm.no_farms")}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline min-h-[44px] inline-flex items-center"
          >
            + {t("farm.add_farm")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {farms.map((farm) => {
            const gunthaEquiv = (farm.areaAcre * 40).toFixed(0);
            return (
              <div
                key={farm.id}
                className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700/80 shadow-xs space-y-3"
              >
                {/* Header & Area */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">
                      {farm.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {farm.surveyNumber && (
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Gat: {farm.surveyNumber}
                        </span>
                      )}
                      {farm.ulpin && (
                        <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                          ULPIN: {farm.ulpin}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlot(farm.id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                    title={t("common.delete")}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Acreage & Soil Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">
                      {t("farm.area")}
                    </span>
                    <span className="font-bold text-kisan-green-800 dark:text-kisan-green-400 text-sm">
                      {farm.areaAcre} {t("farm.acre")}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      ({gunthaEquiv} {t("farm.guntha")})
                    </span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">
                      {t("farm.soil_type")}
                    </span>
                    <span className="font-bold text-kisan-soil-800 dark:text-kisan-soil-300 truncate block">
                      {t(`farm.soil_types.${farm.soilType}` as any, farm.soilType)}
                    </span>
                    {farm.soilPh && (
                      <span className="text-[10px] text-zinc-500 block">
                        pH: {farm.soilPh}
                      </span>
                    )}
                  </div>
                </div>

                {/* Water Sources */}
                {farm.waterSources && farm.waterSources.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-wrap items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {farm.waterSources.map((ws, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900"
                      >
                        <span>{t(`farm.source_types.${ws.sourceType}` as any, ws.sourceType)}</span>
                        {ws.hasDrip && <span className="font-bold">• Drip</span>}
                        {ws.hasSprinkler && <span className="font-bold">• Sprinkler</span>}
                        <span className="text-[10px] text-blue-600 dark:text-blue-400">
                          ({ws.electricityHoursDaily}h power)
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <ProvenanceBadge type="user" />
                    <span className="text-[10px] text-zinc-400">
                      Terrain: {farm.terrain}
                    </span>
                  </div>

                  <Link
                    href={`/planner/new?farmId=${farm.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[36px]"
                  >
                    <span>🌾</span>
                    <span>पीक नियोजन करा</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Farm Plot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-kisan-green-700" />
                <span>{t("farm.add_farm")}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePlot} className="space-y-3.5">
              {/* Plot Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("farm.plot_name")} *
                </label>
                <input
                  type="text"
                  required
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder={t("farm.plot_name_placeholder")}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
                />
              </div>

              {/* Area & Unit Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {t("farm.area")} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsConverterOpen(true)}
                    className="text-xs text-kisan-green-700 dark:text-kisan-green-400 font-semibold hover:underline flex items-center gap-1 min-h-[36px]"
                  >
                    <Calculator className="w-3.5 h-3.5" />
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
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
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
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t("farm.survey_number")}
                  </label>
                  <input
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    placeholder="e.g. 42/1"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ULPIN (14-char)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={ulpin}
                    onChange={(e) => setUlpin(e.target.value.toUpperCase())}
                    placeholder="MH2614..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm uppercase font-mono min-h-[48px]"
                  />
                </div>
              </div>

              {/* Soil Type & pH */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t("farm.soil_type")}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs min-h-[48px]"
                  >
                    <option value="Medium_Black">Medium Black (मध्यम काळी)</option>
                    <option value="Black_Cotton">Black Cotton (काळी)</option>
                    <option value="Red_Sandy">Red Sandy (तांबडी)</option>
                    <option value="Loamy">Loamy (गाळाची)</option>
                    <option value="Laterite">Laterite (जांभी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm min-h-[48px]"
                  />
                </div>
              </div>

              {/* Water Source Configuration */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{t("farm.water_sources")}</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={waterSourceType}
                    onChange={(e) => setWaterSourceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs min-h-[48px]"
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
                        className="w-4 h-4 text-kisan-green-600 rounded"
                      />
                      <span>Drip</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={hasSprinkler}
                        onChange={(e) => setHasSprinkler(e.target.checked)}
                        className="w-4 h-4 text-kisan-green-600 rounded"
                      />
                      <span>Sprinkler</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">
                      Power (hrs/day)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={electricityHours}
                      onChange={(e) => setElectricityHours(parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">
                      Motor HP
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="20"
                      value={pumpHp}
                      onChange={(e) => setPumpHp(parseFloat(e.target.value) || 5)}
                      className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3.5 px-4 rounded-xl min-h-[48px] shadow-sm active:scale-98 transition-transform"
                >
                  {isSaving ? t("common.loading") : t("farm.save_plot")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold min-h-[48px]"
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
