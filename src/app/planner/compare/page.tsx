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


export default function CropComparisonPage() {
  const { t, language } = useLanguage();

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
    const text =
      language === "en"
        ? `Comparison for ${areaAcre} acres: ${calcA.cropNameEn} has estimated net profit of ${calcA.netProfit} rupees with ${calcA.durationDays} days duration and ${riskA.overallRatingLabelEn}. ${calcB.cropNameEn} has estimated profit of ${calcB.netProfit} rupees with ${calcB.durationDays} days duration and ${riskB.overallRatingLabelEn}. You can select and proceed with any crop of your choice below.`
        : `${areaAcre} एकरासाठी पिकांची तुलना: ${calcA.cropNameMr} मध्ये अंदाजित नफा ${calcA.netProfit} रुपये, कालावधी ${calcA.durationDays} दिवस, आणि जोखीम ${riskA.overallRatingLabelMr} आहे. ${calcB.cropNameMr} मध्ये अंदाजित नफा ${calcB.netProfit} रुपये, कालावधी ${calcB.durationDays} दिवस आणि जोखीम ${riskB.overallRatingLabelMr} आहे. आपण खाली दिलेल्या कोणत्याही पिकाची निवड करू शकता.`;

    speakWithFallback(text, language);
  };

  const getBestProfitCrop = () => {
    const list = [calcA, calcB];
    if (showThirdCrop) list.push(calcC);
    return list.reduce((best, curr) => (curr.netProfit > best.netProfit ? curr : best), list[0]);
  };

  const bestProfitCrop = getBestProfitCrop();

  const renderRiskBar = (score: number) => {
    const color =
      score === 1
        ? "bg-emerald-500"
        : score === 2
        ? "bg-amber-500"
        : "bg-rose-500";
    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="h-1.5 w-12 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${(score / 3) * 100}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
          {score === 1 ? (language === "en" ? "Low" : "कमी") : score === 2 ? (language === "en" ? "Med" : "मध्यम") : (language === "en" ? "High" : "उच्च")}
        </span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Header & Description */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>⚖️</span>
              {language === "en" ? "Crop Comparison & Risk Engine" : "पिकांची तुलना व जोखीम विश्लेषण"}
            </h1>
            <ProvenanceBadge type="estimate" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            {language === "en"
              ? "Compare investment, profit, water requirement, and multi-factor risks side-by-side to choose the safest or most profitable crop."
              : "एकाच जमिनीसाठी २-३ पिकांचा भांडवली खर्च, नफा, पाण्याची गरज आणि बाजारातील जोखमीची समोरासमोर तुलना करून हव्या त्या पिकाची निवड करा."}
          </p>

          {/* Area Selector */}
          <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {language === "en" ? "Cultivation Area (Acres):" : "लागवड क्षेत्र (एकर):"}
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 2.5, 5].map((a) => (
                <button
                  key={a}
                  onClick={() => setAreaAcre(a)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    areaAcre === a
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-stone-700 border border-stone-300 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  {a} ac
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Crop Selectors */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {language === "en" ? "Select Crops to Compare" : "तुलनेसाठी पिके निवडा"}
            </h2>
            <button
              onClick={handleReadComparison}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              🔊 {language === "en" ? "Listen" : "ऐका"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                पीक १ (Crop A):
              </label>
              <select
                value={cropAId}
                onChange={(e) => setCropAId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
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
                पीक २ (Crop B):
              </label>
              <select
                value={cropBId}
                onChange={(e) => setCropBId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
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
              {language === "en" ? "Compare 3rd Crop:" : "तिसरे पीक तुलना समाविष्ट करा:"}
            </span>
            <button
              onClick={() => setShowThirdCrop(!showThirdCrop)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                showThirdCrop
                  ? "bg-purple-700 text-white"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {showThirdCrop ? (language === "en" ? "✓ 3 Crops Active" : "✓ ३ पिके चालू") : (language === "en" ? "+ Add Crop C" : "+ पीक ३ जोडा")}
            </button>
          </div>

          {showThirdCrop && (
            <div className="pt-1">
              <label className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block mb-1">
                पीक ३ (Crop C):
              </label>
              <select
                value={cropCId}
                onChange={(e) => setCropCId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
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
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>🎯</span>
              {language === "en" ? "Choose Any Crop to Plan:" : "पसंतीचे पीक निवडा व नियोजन सुरू करा:"}
            </h2>
            <span className="text-[11px] text-stone-500 font-medium">
              {language === "en" ? "Click to start plan" : "नियोजन सुरू करण्यासाठी टॅप करा"}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Option A */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20 flex flex-col justify-between gap-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">
                      {calcA.cropNameMr} ({calcA.cropNameEn})
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskA.overallBadgeColor}`}>
                      {language === "en" ? riskA.overallRatingLabelEn : riskA.overallRatingLabelMr}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    नफा: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">₹{calcA.netProfit.toLocaleString("en-IN")}</strong> • खर्च: ₹{calcA.totalCost.toLocaleString("en-IN")} • {calcA.durationDays} दिवस
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {language === "en" ? riskA.verdictEn : riskA.verdictMr}
                  </p>
                </div>
              </div>
              <Link
                href={`/planner/new?crop=${cropAId}&area=${areaAcre}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95 transition-all min-h-[44px]"
              >
                <span>🌾</span>
                <span>
                  {language === "en"
                    ? `Select ${calcA.cropNameEn} (Start Full Plan) →`
                    : `पर्याय १ निवडा: ${calcA.cropNameMr} नियोजन सुरू करा →`}
                </span>
              </Link>
            </div>

            {/* Option B */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-3 dark:border-blue-900/60 dark:bg-blue-950/20 flex flex-col justify-between gap-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-blue-900 dark:text-blue-300">
                      {calcB.cropNameMr} ({calcB.cropNameEn})
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskB.overallBadgeColor}`}>
                      {language === "en" ? riskB.overallRatingLabelEn : riskB.overallRatingLabelMr}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    नफा: <strong className="text-blue-700 dark:text-blue-400 font-bold">₹{calcB.netProfit.toLocaleString("en-IN")}</strong> • खर्च: ₹{calcB.totalCost.toLocaleString("en-IN")} • {calcB.durationDays} दिवस
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {language === "en" ? riskB.verdictEn : riskB.verdictMr}
                  </p>
                </div>
              </div>
              <Link
                href={`/planner/new?crop=${cropBId}&area=${areaAcre}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-blue-800 active:scale-95 transition-all min-h-[44px]"
              >
                <span>🌾</span>
                <span>
                  {language === "en"
                    ? `Select ${calcB.cropNameEn} (Start Full Plan) →`
                    : `पर्याय २ निवडा: ${calcB.cropNameMr} नियोजन सुरू करा →`}
                </span>
              </Link>
            </div>

            {/* Option C */}
            {showThirdCrop && (
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50/40 p-3 dark:border-purple-900/60 dark:bg-purple-950/20 flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-purple-900 dark:text-purple-300">
                        {calcC.cropNameMr} ({calcC.cropNameEn})
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskC.overallBadgeColor}`}>
                        {language === "en" ? riskC.overallRatingLabelEn : riskC.overallRatingLabelMr}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      नफा: <strong className="text-purple-700 dark:text-purple-400 font-bold">₹{calcC.netProfit.toLocaleString("en-IN")}</strong> • खर्च: ₹{calcC.totalCost.toLocaleString("en-IN")} • {calcC.durationDays} दिवस
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {language === "en" ? riskC.verdictEn : riskC.verdictMr}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/planner/new?crop=${cropCId}&area=${areaAcre}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-700 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-purple-800 active:scale-95 transition-all min-h-[44px]"
                >
                  <span>🌾</span>
                  <span>
                    {language === "en"
                      ? `Select ${calcC.cropNameEn} (Start Full Plan) →`
                      : `पर्याय ३ निवडा: ${calcC.cropNameMr} नियोजन सुरू करा →`}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 2. MULTI-FACTOR RISK COMPARISON SECTION */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>🛡️</span>
                {language === "en" ? "Multi-Factor Risk Analysis" : "तुलनात्मक जोखीम व सुरक्षितता विश्लेषण"}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {language === "en" ? "Evaluate market, weather, and pest vulnerabilities" : "बाजारभाव, पाणीटंचाई आणि रोगांची जोखीम तपासा"}
              </p>
            </div>
            <ProvenanceBadge type="estimate" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Risk Category 1: Price Volatility */}
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>📈</span>
                  {language === "en" ? "Market Price Volatility Risk" : "बाजारभाव चढ-उतार जोखीम"}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  {language === "en" ? "Lower is safer" : "कमी जोखीम अधिक सुरक्षित"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.priceVolatility.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskA.priceVolatility.descEn : riskA.priceVolatility.descMr}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.priceVolatility.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskB.priceVolatility.descEn : riskB.priceVolatility.descMr}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.priceVolatility.score)}
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                      {language === "en" ? riskC.priceVolatility.descEn : riskC.priceVolatility.descMr}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 2: Weather & Water Risk */}
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>🌦️</span>
                  {language === "en" ? "Weather & Drought Sensitivity" : "पावसाचा ताण व सिंचन जोखीम"}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  {language === "en" ? "Water deficit impact" : "पाणी टंचाईत परिणाम"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.weatherSensitivity.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskA.weatherSensitivity.descEn : riskA.weatherSensitivity.descMr}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.weatherSensitivity.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskB.weatherSensitivity.descEn : riskB.weatherSensitivity.descMr}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.weatherSensitivity.score)}
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                      {language === "en" ? riskC.weatherSensitivity.descEn : riskC.weatherSensitivity.descMr}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 3: Pest & Disease Exposure */}
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>🐛</span>
                  {language === "en" ? "Pest & Disease Vulnerability" : "रोग-कीड प्रादुर्भाव जोखीम"}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  {language === "en" ? "Spraying workload" : "फवारणी व देखरेख"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.pestDiseaseRisk.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskA.pestDiseaseRisk.descEn : riskA.pestDiseaseRisk.descMr}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.pestDiseaseRisk.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskB.pestDiseaseRisk.descEn : riskB.pestDiseaseRisk.descMr}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.pestDiseaseRisk.score)}
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                      {language === "en" ? riskC.pestDiseaseRisk.descEn : riskC.pestDiseaseRisk.descMr}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Category 4: Capital at Risk */}
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
              <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>💰</span>
                  {language === "en" ? "Capital Investment at Risk" : "भांडवली नुकसान जोखीम"}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  {language === "en" ? "Total outflow required" : "आवश्यक भांडवल"}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">{calcA.cropNameMr}:</span>
                  {renderRiskBar(riskA.capitalExposure.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskA.capitalExposure.descEn : riskA.capitalExposure.descMr}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block">{calcB.cropNameMr}:</span>
                  {renderRiskBar(riskB.capitalExposure.score)}
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                    {language === "en" ? riskB.capitalExposure.descEn : riskB.capitalExposure.descMr}
                  </p>
                </div>
                {showThirdCrop && (
                  <div className="rounded-lg bg-white p-2 border border-stone-200 dark:bg-stone-900 dark:border-stone-800 col-span-2 md:col-span-1">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block">{calcC.cropNameMr}:</span>
                    {renderRiskBar(riskC.capitalExposure.score)}
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                      {language === "en" ? riskC.capitalExposure.descEn : riskC.capitalExposure.descMr}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDE-BY-SIDE METRICS TABLE */}
        <div className="rounded-2xl bg-white shadow-sm border border-stone-200 overflow-hidden dark:bg-stone-900 dark:border-stone-800">
          <div className="p-3 bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 font-bold text-xs text-stone-800 dark:text-stone-200">
            {language === "en" ? "Side-by-Side Economic & Agronomic Metrics" : "तुलनात्मक आर्थिक व कृषी निर्देशांक"}
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {/* Net Profit Row */}
            <div className="grid grid-cols-4 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold">
              <span className="text-stone-600 dark:text-stone-400">निव्वळ नफा:</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                ₹{calcA.netProfit.toLocaleString("en-IN")}
              </span>
              <span className="text-blue-700 dark:text-blue-400">
                ₹{calcB.netProfit.toLocaleString("en-IN")}
              </span>
              {showThirdCrop && (
                <span className="text-purple-700 dark:text-purple-400">
                  ₹{calcC.netProfit.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Total Cost Row */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">भांडवली खर्च:</span>
              <span className="font-semibold text-stone-900 dark:text-white">
                ₹{calcA.totalCost.toLocaleString("en-IN")}
              </span>
              <span className="font-semibold text-stone-900 dark:text-white">
                ₹{calcB.totalCost.toLocaleString("en-IN")}
              </span>
              {showThirdCrop && (
                <span className="font-semibold text-stone-900 dark:text-white">
                  ₹{calcC.totalCost.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* ROI % */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">परतावा (ROI):</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{calcA.roiPercent}%</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{calcB.roiPercent}%</span>
              {showThirdCrop && (
                <span className="font-bold text-purple-700 dark:text-purple-400">{calcC.roiPercent}%</span>
              )}
            </div>

            {/* Profit per Day */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">नफा/दिवस:</span>
              <span className="font-semibold">₹{calcA.profitPerDay}/d</span>
              <span className="font-semibold">₹{calcB.profitPerDay}/d</span>
              {showThirdCrop && <span className="font-semibold">₹{calcC.profitPerDay}/d</span>}
            </div>

            {/* Duration Days */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">कालावधी:</span>
              <span>{calcA.durationDays} दिवस</span>
              <span>{calcB.durationDays} दिवस</span>
              {showThirdCrop && <span>{calcC.durationDays} दिवस</span>}
            </div>

            {/* Water Required */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">पाणी (Litres):</span>
              <span className="font-semibold">{(waterA.totalLitresFarm / 1000).toFixed(0)}k L</span>
              <span className="font-semibold">{(waterB.totalLitresFarm / 1000).toFixed(0)}k L</span>
              {showThirdCrop && <span className="font-semibold">{(waterC.totalLitresFarm / 1000).toFixed(0)}k L</span>}
            </div>

            {/* Labour Days */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">मजूर गरज:</span>
              <span>{calcA.totalLabourDays} दिवस</span>
              <span>{calcB.totalLabourDays} दिवस</span>
              {showThirdCrop && <span>{calcC.totalLabourDays} दिवस</span>}
            </div>

            {/* Break-Even Price */}
            <div className="grid grid-cols-4 p-3">
              <span className="text-stone-600 dark:text-stone-400">किमान भाव:</span>
              <span className="font-semibold">₹{calcA.breakEvenPricePerQuintal}/Q</span>
              <span className="font-semibold">₹{calcB.breakEvenPricePerQuintal}/Q</span>
              {showThirdCrop && <span className="font-semibold">₹{calcC.breakEvenPricePerQuintal}/Q</span>}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
