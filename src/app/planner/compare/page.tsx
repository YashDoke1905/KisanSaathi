"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { CROPS_MASTER, getAllCropsList } from "@/data/crops";
import { calculateCropPlan, calculateIrrigationRequirements, getCropRiskProfile, CropRiskProfile } from "@/engine";
import { playChime, speakWithFallback } from "@/lib/soundUtils";
import {
  Scale,
  Volume2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Droplets,
  DollarSign,
  CloudRain,
  Bug,
  Sprout,
} from "lucide-react";

export default function CropComparisonPage() {
  const { t, language } = useLanguage();
  const isMr = language === "mr";

  const [areaAcre, setAreaAcre] = useState<number>(2.0);
  const [cropAId, setCropAId] = useState<string>("onion");
  const [cropBId, setCropBId] = useState<string>("soybean");
  const [cropCId, setCropCId] = useState<string>("cotton");
  const [showThirdCrop, setShowThirdCrop] = useState<boolean>(true);

  const allCrops = getAllCropsList();

  // Run calculation engine for all candidates
  const now = new Date();
  const calcA = calculateCropPlan({ cropId: cropAId, areaAcre, sowingDate: now });
  const waterA = calculateIrrigationRequirements(cropAId, areaAcre, "drip");
  const riskA = getCropRiskProfile(cropAId, calcA.totalCost);

  const calcB = calculateCropPlan({ cropId: cropBId, areaAcre, sowingDate: now });
  const waterB = calculateIrrigationRequirements(cropBId, areaAcre, "drip");
  const riskB = getCropRiskProfile(cropBId, calcB.totalCost);

  const calcC = calculateCropPlan({ cropId: cropCId, areaAcre, sowingDate: now });
  const waterC = calculateIrrigationRequirements(cropCId, areaAcre, "drip");
  const riskC = getCropRiskProfile(cropCId, calcC.totalCost);

  const handleReadComparison = () => {
    playChime();
    const text = isMr
      ? `${areaAcre} एकरासाठी पिकांची तुलना: ${calcA.cropNameMr} मध्ये अंदाजित नफा ${calcA.netProfit} रुपये, कालावधी ${calcA.durationDays} दिवस, आणि जोखीम ${riskA.overallRatingLabelMr} आहे. ${calcB.cropNameMr} मध्ये अंदाजित नफा ${calcB.netProfit} रुपये, कालावधी ${calcB.durationDays} दिवस आणि जोखीम ${riskB.overallRatingLabelMr} आहे. आपण खाली दिलेल्या कोणत्याही पिकाची निवड करू शकता.`
      : `Comparison for ${areaAcre} acres: ${calcA.cropNameEn} has estimated net profit of ${calcA.netProfit} rupees with ${calcA.durationDays} days duration and ${riskA.overallRatingLabelEn}. ${calcB.cropNameEn} has estimated profit of ${calcB.netProfit} rupees with ${calcB.durationDays} days duration and ${riskB.overallRatingLabelEn}. You can select and proceed with any crop of your choice below.`;

    speakWithFallback(text, language);
  };

  const renderRiskBar = (score: number) => {
    const color =
      score === 1
        ? "bg-forest-700"
        : score === 2
        ? "bg-harvest-500"
        : "bg-rose-500";
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <div className="h-2 w-14 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${(score / 3) * 100}%` }} />
        </div>
        <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300">
          {score === 1 ? (isMr ? "कमी" : "Low") : score === 2 ? (isMr ? "मध्यम" : "Med") : (isMr ? "उच्च" : "High")}
        </span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Header & Description Hero */}
        <div className="card-warm p-4.5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-card border border-forest-700/40">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-stone-900 dark:text-stone-100 leading-tight">
                  {isMr ? "पिकांची तुलना व जोखीम विश्लेषण" : "Crop Comparison & Risk Engine"}
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  {isMr ? "भांडवली खर्च, नफा, पाणी व बाजार जोखीम" : "Side-by-side profit, water & risk analysis"}
                </p>
              </div>
            </div>
            <ProvenanceBadge type="estimate" />
          </div>

          {/* Area Selector */}
          <div className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-850 p-2.5 border border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {isMr ? "लागवड क्षेत्र (एकर):" : "Cultivation Area (Acres):"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 2.5, 5].map((a) => (
                <button
                  key={a}
                  onClick={() => setAreaAcre(a)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    areaAcre === a
                      ? "bg-forest-800 text-white shadow-xs font-mono"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-mono"
                  }`}
                >
                  {a} ac
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Crop Selectors */}
        <div className="card-warm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isMr ? "तुलनेसाठी पिके निवडा" : "Select Crops to Compare"}
            </h2>
            <button
              onClick={handleReadComparison}
              className="text-xs font-bold text-forest-800 dark:text-forest-300 hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isMr ? "तुलना ऐका" : "Listen"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-forest-800 dark:text-forest-400 block mb-1">
                {isMr ? "पीक १ (Crop A):" : "Crop A:"}
              </label>
              <select
                value={cropAId}
                onChange={(e) => setCropAId(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                {allCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameMr} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block mb-1">
                {isMr ? "पीक २ (Crop B):" : "Crop B:"}
              </label>
              <select
                value={cropBId}
                onChange={(e) => setCropBId(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                {allCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameMr} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {isMr ? "तिसरे पीक तुलना समाविष्ट करा:" : "Include 3rd Crop:"}
            </span>
            <button
              onClick={() => setShowThirdCrop(!showThirdCrop)}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                showThirdCrop
                  ? "bg-soil-800 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
              }`}
            >
              {showThirdCrop ? (isMr ? "✓ ३ पिके चालू" : "✓ 3 Crops Active") : (isMr ? "+ पीक ३ जोडा" : "+ Add Crop C")}
            </button>
          </div>

          {showThirdCrop && (
            <div className="pt-1">
              <label className="text-[11px] font-bold text-soil-800 dark:text-harvest-400 block mb-1">
                {isMr ? "पीक ३ (Crop C):" : "Crop C:"}
              </label>
              <select
                value={cropCId}
                onChange={(e) => setCropCId(e.target.value)}
                className="w-full h-11 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                {allCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameMr} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 1. SELECTION OPTIONS FOR ALL 3 CROPS (Direct User Choice) */}
        <div className="card-warm p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-forest-700 dark:text-forest-400" />
              <span>{isMr ? "पसंतीचे पीक निवडा व नियोजन सुरू करा:" : "Choose Any Crop to Plan:"}</span>
            </h2>
            <span className="text-[11px] text-stone-500 font-medium">
              {isMr ? "टॅप करून पुढे जा" : "Tap to start plan"}
            </span>
          </div>

          <div className="space-y-3">
            {/* Option A */}
            <div className="card-warm p-4 border-2 border-forest-600/40 bg-forest-50/40 dark:bg-forest-950/20 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-forest-900 dark:text-forest-200">
                      {calcA.cropNameMr} ({calcA.cropNameEn})
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskA.overallBadgeColor}`}>
                      {isMr ? riskA.overallRatingLabelMr : riskA.overallRatingLabelEn}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {isMr ? "निव्वळ नफा: " : "Net Profit: "}
                    <strong className="text-forest-800 dark:text-forest-300 font-black font-mono money-numeral">
                      ₹{calcA.netProfit.toLocaleString("en-IN")}
                    </strong>{" "}
                    • {isMr ? "खर्च:" : "Cost:"} ₹{calcA.totalCost.toLocaleString("en-IN")} • {calcA.durationDays} {isMr ? "दिवस" : "days"}
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    {isMr ? riskA.verdictMr : riskA.verdictEn}
                  </p>
                </div>
              </div>
              <Link
                href={`/planner/new?crop=${cropAId}&area=${areaAcre}`}
                className="w-full h-12 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-card transition-all"
              >
                <Sprout className="w-4 h-4" />
                <span>
                  {isMr
                    ? `पर्याय १ निवडा: ${calcA.cropNameMr} नियोजन सुरू करा`
                    : `Select ${calcA.cropNameEn} (Start Full Plan)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Option B */}
            <div className="card-warm p-4 border-2 border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-blue-950 dark:text-blue-200">
                      {calcB.cropNameMr} ({calcB.cropNameEn})
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskB.overallBadgeColor}`}>
                      {isMr ? riskB.overallRatingLabelMr : riskB.overallRatingLabelEn}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {isMr ? "निव्वळ नफा: " : "Net Profit: "}
                    <strong className="text-blue-700 dark:text-blue-300 font-black font-mono money-numeral">
                      ₹{calcB.netProfit.toLocaleString("en-IN")}
                    </strong>{" "}
                    • {isMr ? "खर्च:" : "Cost:"} ₹{calcB.totalCost.toLocaleString("en-IN")} • {calcB.durationDays} {isMr ? "दिवस" : "days"}
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    {isMr ? riskB.verdictMr : riskB.verdictEn}
                  </p>
                </div>
              </div>
              <Link
                href={`/planner/new?crop=${cropBId}&area=${areaAcre}`}
                className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sprout className="w-4 h-4" />
                <span>
                  {isMr
                    ? `पर्याय २ निवडा: ${calcB.cropNameMr} नियोजन सुरू करा`
                    : `Select ${calcB.cropNameEn} (Start Full Plan)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Option C */}
            {showThirdCrop && (
              <div className="card-warm p-4 border-2 border-soil-600/40 bg-soil-500/5 dark:bg-soil-950/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-soil-900 dark:text-soil-200">
                        {calcC.cropNameMr} ({calcC.cropNameEn})
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskC.overallBadgeColor}`}>
                        {isMr ? riskC.overallRatingLabelMr : riskC.overallRatingLabelEn}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      {isMr ? "निव्वळ नफा: " : "Net Profit: "}
                      <strong className="text-soil-800 dark:text-harvest-400 font-black font-mono money-numeral">
                        ₹{calcC.netProfit.toLocaleString("en-IN")}
                      </strong>{" "}
                      • {isMr ? "खर्च:" : "Cost:"} ₹{calcC.totalCost.toLocaleString("en-IN")} • {calcC.durationDays} {isMr ? "दिवस" : "days"}
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {isMr ? riskC.verdictMr : riskC.verdictEn}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/planner/new?crop=${cropCId}&area=${areaAcre}`}
                  className="w-full h-12 rounded-xl bg-soil-800 hover:bg-soil-900 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sprout className="w-4 h-4" />
                  <span>
                    {isMr
                      ? `पर्याय ३ निवडा: ${calcC.cropNameMr} नियोजन सुरू करा`
                      : `Select ${calcC.cropNameEn} (Start Full Plan)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 2. MULTI-FACTOR RISK COMPARISON SECTION */}
        <div className="card-warm p-4.5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                <span>{isMr ? "तुलनात्मक जोखीम व सुरक्षितता विश्लेषण" : "Multi-Factor Risk Analysis"}</span>
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                {isMr ? "बाजारभाव, पाणीटंचाई आणि रोगांची जोखीम तपासा" : "Evaluate market volatility, drought and pest risk"}
              </p>
            </div>
            <ProvenanceBadge type="estimate" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Risk Category 1: Price Volatility */}
            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-forest-700" />
                  <span>{isMr ? "बाजारभाव चढ-उतार जोखीम" : "Market Price Volatility Risk"}</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "कमी जोखीम अधिक सुरक्षित" : "Lower is safer"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-forest-800 dark:text-forest-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.priceVolatility.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskA.priceVolatility.descMr : riskA.priceVolatility.descEn}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.priceVolatility.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskB.priceVolatility.descMr : riskB.priceVolatility.descEn}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-soil-800 dark:text-harvest-400 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.priceVolatility.score)}
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                      {isMr ? riskC.priceVolatility.descMr : riskC.priceVolatility.descEn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 2: Weather & Water Risk */}
            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isMr ? "पावसाचा ताण व सिंचन जोखीम" : "Weather & Drought Sensitivity"}</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "पाणी टंचाईत परिणाम" : "Water deficit impact"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-forest-800 dark:text-forest-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.weatherSensitivity.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskA.weatherSensitivity.descMr : riskA.weatherSensitivity.descEn}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.weatherSensitivity.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskB.weatherSensitivity.descMr : riskB.weatherSensitivity.descEn}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-soil-800 dark:text-harvest-400 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.weatherSensitivity.score)}
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                      {isMr ? riskC.weatherSensitivity.descMr : riskC.weatherSensitivity.descEn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 3: Pest & Disease Exposure */}
            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isMr ? "रोग-कीड प्रादुर्भाव जोखीम" : "Pest & Disease Vulnerability"}</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "फवारणी व देखरेख" : "Spraying & care required"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-forest-800 dark:text-forest-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.pestDiseaseRisk.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskA.pestDiseaseRisk.descMr : riskA.pestDiseaseRisk.descEn}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.pestDiseaseRisk.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskB.pestDiseaseRisk.descMr : riskB.pestDiseaseRisk.descEn}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-soil-800 dark:text-harvest-400 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.pestDiseaseRisk.score)}
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                      {isMr ? riskC.pestDiseaseRisk.descMr : riskC.pestDiseaseRisk.descEn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 4: Capital at Risk */}
            <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-harvest-600" />
                  <span>{isMr ? "भांडवली नुकसान जोखीम" : "Capital Investment at Risk"}</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "आवश्यक सुरुवातीचे भांडवल" : "Total outflow needed"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-forest-800 dark:text-forest-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.capitalExposure.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskA.capitalExposure.descMr : riskA.capitalExposure.descEn}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.capitalExposure.score)}
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                    {isMr ? riskB.capitalExposure.descMr : riskB.capitalExposure.descEn}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-2 border border-stone-200 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-soil-800 dark:text-harvest-400 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.capitalExposure.score)}
                    <p className="text-[10px] text-stone-500 mt-1 leading-snug font-medium">
                      {isMr ? riskC.capitalExposure.descMr : riskC.capitalExposure.descEn}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDE-BY-SIDE METRICS TABLE */}
        <div className="card-warm overflow-hidden">
          <div className="p-3 bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 font-bold text-xs text-stone-800 dark:text-stone-200">
            {isMr ? "तुलनात्मक आर्थिक व कृषी निर्देशांक" : "Side-by-Side Economic & Agronomic Metrics"}
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs font-medium">
            {/* Net Profit Row */}
            <div className="grid grid-cols-4 p-3 bg-forest-50/50 dark:bg-forest-950/20 font-bold">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "निव्वळ नफा:" : "Net Profit:"}</span>
              <span className="text-forest-800 dark:text-forest-300 font-mono money-numeral">
                ₹{calcA.netProfit.toLocaleString("en-IN")}
              </span>
              <span className="text-blue-700 dark:text-blue-400 font-mono money-numeral">
                ₹{calcB.netProfit.toLocaleString("en-IN")}
              </span>
              {showThirdCrop && (
                <span className="text-soil-800 dark:text-harvest-400 font-mono money-numeral">
                  ₹{calcC.netProfit.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Total Cost Row */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "भांडवली खर्च:" : "Total Cost:"}</span>
              <span className="font-mono text-stone-900 dark:text-white">
                ₹{calcA.totalCost.toLocaleString("en-IN")}
              </span>
              <span className="font-mono text-stone-900 dark:text-white">
                ₹{calcB.totalCost.toLocaleString("en-IN")}
              </span>
              {showThirdCrop && (
                <span className="font-mono text-stone-900 dark:text-white">
                  ₹{calcC.totalCost.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* ROI % */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "परतावा (ROI):" : "ROI (%):"}</span>
              <span className="font-bold text-forest-800 dark:text-forest-300 font-mono">{calcA.roiPercent}%</span>
              <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">{calcB.roiPercent}%</span>
              {showThirdCrop && (
                <span className="font-bold text-soil-800 dark:text-harvest-400 font-mono">{calcC.roiPercent}%</span>
              )}
            </div>

            {/* Profit per Day */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "नफा/दिवस:" : "Profit/Day:"}</span>
              <span className="font-mono font-bold">₹{calcA.profitPerDay}/d</span>
              <span className="font-mono font-bold">₹{calcB.profitPerDay}/d</span>
              {showThirdCrop && <span className="font-mono font-bold">₹{calcC.profitPerDay}/d</span>}
            </div>

            {/* Duration Days */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "कालावधी:" : "Duration:"}</span>
              <span className="font-mono">{calcA.durationDays} {isMr ? "दिवस" : "days"}</span>
              <span className="font-mono">{calcB.durationDays} {isMr ? "दिवस" : "days"}</span>
              {showThirdCrop && <span className="font-mono">{calcC.durationDays} {isMr ? "दिवस" : "days"}</span>}
            </div>

            {/* Water Required */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "पाणी (लिटर):" : "Water (L):"}</span>
              <span className="font-mono">{(waterA.totalLitresFarm / 1000).toFixed(0)}k L</span>
              <span className="font-mono">{(waterB.totalLitresFarm / 1000).toFixed(0)}k L</span>
              {showThirdCrop && <span className="font-mono">{(waterC.totalLitresFarm / 1000).toFixed(0)}k L</span>}
            </div>

            {/* Labour Days */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "मजूर गरज:" : "Labour Days:"}</span>
              <span className="font-mono">{calcA.totalLabourDays} {isMr ? "दिवस" : "days"}</span>
              <span className="font-mono">{calcB.totalLabourDays} {isMr ? "दिवस" : "days"}</span>
              {showThirdCrop && <span className="font-mono">{calcC.totalLabourDays} {isMr ? "दिवस" : "days"}</span>}
            </div>

            {/* Break-Even Price */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">{isMr ? "किमान भाव:" : "Break-Even:"}</span>
              <span className="font-mono">₹{calcA.breakEvenPricePerQuintal}/Q</span>
              <span className="font-mono">₹{calcB.breakEvenPricePerQuintal}/Q</span>
              {showThirdCrop && <span className="font-mono">₹{calcC.breakEvenPricePerQuintal}/Q</span>}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
