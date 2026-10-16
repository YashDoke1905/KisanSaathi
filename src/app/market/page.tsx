"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { CROPS_MASTER, getAllCropsList } from "@/data/crops";
import { playChime, speakWithFallback } from "@/lib/soundUtils";
import { MandiDashboardResponse, MandiPriceRecord, WarehouseFacility } from "@/services/mandi/types";
import { SellOrWaitOutput } from "@/engine/market";

export default function MarketIntelligencePage() {
  const { t, language } = useLanguage();

  // Selected filters
  const [selectedCropId, setSelectedCropId] = useState<string>("onion");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Nashik");
  const [lotQuantity, setLotQuantity] = useState<number>(50);
  const [holdingDays, setHoldingDays] = useState<number>(30);
  const [chartTimeframe, setChartTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [marketData, setMarketData] = useState<MandiDashboardResponse | null>(null);
  const [sellOrWait, setSellOrWait] = useState<SellOrWaitOutput | null>(null);

  // Modals
  const [showExplainer, setShowExplainer] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [targetAlertPrice, setTargetAlertPrice] = useState<string>("2800");
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);

  // Crop list
  const allCrops = getAllCropsList();

  // District list
  const districts = [
    "Nashik",
    "Pune",
    "Solapur",
    "Latur",
    "Akola",
    "Nagpur",
    "Kolhapur",
    "Ahmednagar",
    "Jalna",
    "Sangli",
    "Amravati",
  ];

  // Fetch market intelligence data
  useEffect(() => {
    async function loadMarketData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/mandi?cropId=${selectedCropId}&district=${selectedDistrict}&quantity=${lotQuantity}&holdingDays=${holdingDays}`
        );
        if (res.ok) {
          const json = await res.json();
          setMarketData(json.mandi);
          setSellOrWait(json.sellOrWait);
        }
      } catch (e) {
        console.error("Error fetching mandi data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMarketData();
  }, [selectedCropId, selectedDistrict, lotQuantity, holdingDays]);

  // Read aloud market summary
  const handleReadMarketSummary = () => {
    if (!marketData || !sellOrWait) return;
    playChime();

    const text =
      language === "en"
        ? `Market Report for ${marketData.cropNameEn} in ${selectedDistrict}: State average modal price is ${marketData.stateAverageModalPrice} rupees per quintal. Highest price is at ${marketData.bestMandi.mandiNameEn} at ${marketData.bestMandi.modalPrice} rupees. Advisor recommendation: ${sellOrWait.recommendationLabelEn}. ${sellOrWait.reasoningEn}`
        : `${selectedDistrict} जिल्ह्यातील ${marketData.cropNameMr} बाजार अहवाल: राज्यातील सरासरी भाव ₹${marketData.stateAverageModalPrice} प्रति क्विंटल आहे. सर्वोच्च भाव ${marketData.bestMandi.mandiNameMr} येथे ₹${marketData.bestMandi.modalPrice} आहे. निर्णय सल्लागार: ${sellOrWait.recommendationLabelMr}. ${sellOrWait.reasoningMr}`;

    speakWithFallback(text, language);
  };

  // WhatsApp share generator
  const handleShareWhatsApp = () => {
    if (!marketData || !sellOrWait) return;
    playChime();

    const todayDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const msg =
      language === "en"
        ? `🌾 *KisanSaathi Daily Mandi Report* (${todayDate})\n\n📍 *Crop:* ${marketData.cropNameEn} (${marketData.cropNameMr})\n📊 *State Avg Price:* ₹${marketData.stateAverageModalPrice}/qtl (${marketData.stateChange7dPercent >= 0 ? "+" : ""}${marketData.stateChange7dPercent}% this week)\n🏆 *Best Price:* ${marketData.bestMandi.mandiNameEn} - ₹${marketData.bestMandi.modalPrice}/qtl\n📍 *Nearest Mandi:* ${marketData.nearestMandi.mandiNameEn} (${marketData.nearestMandi.distanceKm} km) - ₹${marketData.nearestMandi.modalPrice}/qtl\n\n💡 *Sell-or-Wait Advisor:* ${sellOrWait.recommendationLabelEn}\n${sellOrWait.reasoningEn}\n\n📲 *Check live Mandi rates on KisanSaathi:* http://localhost:3000/market`
        : `🌾 *किसानसाथी दैनिक बाजारभाव बुलेटिन* (${todayDate})\n\n📍 *पीक:* ${marketData.cropNameMr} (${marketData.cropNameEn})\n📊 *राज्य सरासरी भाव:* ₹${marketData.stateAverageModalPrice}/क्विंटल (${marketData.stateChange7dPercent >= 0 ? "+" : ""}${marketData.stateChange7dPercent}% या आठवड्यात)\n🏆 *सर्वोच्च भाव:* ${marketData.bestMandi.mandiNameMr} - ₹${marketData.bestMandi.modalPrice}/क्विं\n📍 *जवळची बाजार समिती:* ${marketData.nearestMandi.mandiNameMr} (${marketData.nearestMandi.distanceKm} किमी) - ₹${marketData.nearestMandi.modalPrice}/क्विं\n\n💡 *विकायचा की थांबायचा सल्ला:* ${sellOrWait.recommendationLabelMr}\n${sellOrWait.reasoningMr}\n\n📲 *किसानसाथी ॲपवर लाईव्ह बाजारभाव पहा:* http://localhost:3000/market`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  // Active chart points based on timeframe
  const activeTrendPoints =
    chartTimeframe === "7d"
      ? marketData?.trend7d.points || []
      : chartTimeframe === "30d"
      ? marketData?.trend30d.points || []
      : marketData?.trend90d.points || [];

  // SVG Chart Dimensions & Math
  const renderSvgTrendChart = () => {
    if (!activeTrendPoints || activeTrendPoints.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-stone-400">
          माहिती उपलब्ध होत आहे...
        </div>
      );
    }

    const prices = activeTrendPoints.map((p) => p.modalPrice);
    const arrivals = activeTrendPoints.map((p) => p.arrivalQuintals);

    const minP = Math.floor(Math.min(...prices) * 0.95);
    const maxP = Math.ceil(Math.max(...prices) * 1.05);
    const maxArrival = Math.max(...arrivals, 1);

    const width = 330;
    const height = 150;
    const padding = 25;

    const getX = (idx: number) =>
      padding + (idx / (activeTrendPoints.length - 1)) * (width - 2 * padding);
    const getY = (val: number) =>
      height - padding - ((val - minP) / (maxP - minP || 1)) * (height - 2 * padding);

    // Build SVG Path
    const pathD = activeTrendPoints
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(p.modalPrice).toFixed(1)}`)
      .join(" ");

    const areaD = `${pathD} L ${getX(activeTrendPoints.length - 1).toFixed(1)} ${height - padding} L ${getX(0).toFixed(1)} ${height - padding} Z`;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Subtle horizontal grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const priceVal = Math.round(minP + ratio * (maxP - minP));
            const yPos = getY(priceVal);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={yPos}
                  x2={width - padding}
                  y2={yPos}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding - 2}
                  y={yPos + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono"
                >
                  ₹{priceVal}
                </text>
              </g>
            );
          })}

          {/* Background Arrival Bars (Light blue/gray bars) */}
          {activeTrendPoints.map((p, idx) => {
            const barW = Math.max(2, (width - 2 * padding) / activeTrendPoints.length - 2);
            const barH = (p.arrivalQuintals / maxArrival) * (height - 2 * padding) * 0.45;
            const xPos = getX(idx) - barW / 2;
            const yPos = height - padding - barH;
            return (
              <rect
                key={p.date}
                x={xPos}
                y={yPos}
                width={barW}
                height={barH}
                className="fill-sky-400/25 dark:fill-sky-400/20"
                rx="1"
              />
            );
          })}

          {/* Gradient area fill */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Latest Point Dot & Value */}
          {activeTrendPoints.length > 0 && (
            <g>
              <circle
                cx={getX(activeTrendPoints.length - 1)}
                cy={getY(prices[prices.length - 1])}
                r="4.5"
                className="fill-emerald-600 stroke-white dark:stroke-stone-900 stroke-2"
              />
              <text
                x={getX(activeTrendPoints.length - 1)}
                y={getY(prices[prices.length - 1]) - 8}
                textAnchor="end"
                className="text-[10px] font-extrabold fill-emerald-800 dark:fill-emerald-300"
              >
                ₹{prices[prices.length - 1]}
              </text>
            </g>
          )}

          {/* Start and End date labels */}
          <text
            x={padding}
            y={height - 8}
            className="text-[9px] fill-stone-400"
          >
            {activeTrendPoints[0]?.date.slice(5)}
          </text>
          <text
            x={width - padding}
            y={height - 8}
            textAnchor="end"
            className="text-[9px] fill-stone-400 font-semibold"
          >
            {activeTrendPoints[activeTrendPoints.length - 1]?.date.slice(5)}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block rounded" />
            <span>{language === "en" ? "Modal Price (₹/Qtl)" : "सरासरी बाजारभाव"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-sky-400/40 inline-block rounded-xs" />
            <span>{language === "en" ? "Daily Arrivals" : "दैनिक आवक (क्विंटल)"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Page Title & Provenance Header */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>📈</span>
              {language === "en" ? "APMC Mandi Intelligence" : "बाजारभाव व विक्री सल्लागार"}
            </h1>
            <ProvenanceBadge
              type={marketData?.provenance.type || "demo"}
              sourceText={marketData?.provenance.sourceText || "Maharashtra APMC Data"}
              dateText={marketData?.provenance.lastUpdated || "Today"}
            />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            {language === "en"
              ? "Live market rates across Maharashtra APMCs, 90-day seasonal trends, and net-in-hand Sell-or-Wait optimizer."
              : "महाराष्ट्रातील बाजार समित्यांचे थेट भाव, ९० दिवसांचे कल आणि साठवणूक करून विकायचा की आजच विकायचा याचा निर्णय."}
          </p>

          {/* Quick Actions: Audio & WhatsApp Share */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={handleReadMarketSummary}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5 min-h-[36px]"
            >
              <span>🔊</span>
              <span>{language === "en" ? "Listen Market Advisory" : "बाजारभाव अहवाल ऐका"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[36px]"
            >
              <span>💬</span>
              <span>{language === "en" ? "Share on WhatsApp" : "व्हाट्सॲपवर पाठवा"}</span>
            </button>
          </div>
        </div>

        {/* 1. Crop Selector Filter (18 Seed Crops) */}
        <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            {language === "en" ? "Select Crop for Rates:" : "बाजारभावासाठी पीक निवडा:"}
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {allCrops.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCropId(c.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
                  selectedCropId === c.id
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                <span>{c.nameMr.includes("कांदा") ? "🧅" : c.nameMr.includes("टोमॅटो") ? "🍅" : c.nameMr.includes("कापूस") ? "⚪" : c.nameMr.includes("ऊस") ? "🎋" : c.nameMr.includes("सोयाबीन") ? "🌱" : "🌾"}</span>
                <span>{c.nameMr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. District Filter Selector */}
        <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            {language === "en" ? "Farmer District (for Distance & Transport):" : "आपला जिल्हा (वाहतूक अंतरासाठी):"}
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            {districts.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                  selectedDistrict === dist
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Top Market KPI Cards */}
        {marketData && (
          <div className="grid grid-cols-2 gap-2.5">
            {/* State Modal Average */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-3.5 text-white shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                {language === "en" ? "State Average Rate" : "महाराष्ट्र सरासरी भाव"}
              </span>
              <p className="text-xl font-black mt-1">
                ₹{marketData.stateAverageModalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-emerald-200">/ क्विंटल</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-300">
                <span>{marketData.stateChange7dPercent >= 0 ? "▲" : "▼"}</span>
                <span>
                  {marketData.stateChange7dPercent >= 0 ? "+" : ""}
                  {marketData.stateChange7dPercent}% {language === "en" ? "this week" : "या आठवड्यात"}
                </span>
              </div>
            </div>

            {/* Best Mandi */}
            <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                {language === "en" ? "Highest Paying Mandi" : "सर्वोच्च भाव मिळणारी मंडी"}
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-white mt-1 truncate">
                {marketData.bestMandi.mandiNameMr}
              </p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                ₹{marketData.bestMandi.modalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-[10px] font-normal text-stone-400">/क्विं</span>
              </p>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {marketData.bestMandi.distanceKm} किमी अंतर
              </span>
            </div>
          </div>
        )}

        {/* 4. CORE FEATURE: SELL-OR-WAIT DECISION OPTIMIZER (विकायचा की थांबायचा?) */}
        {sellOrWait && (
          <div className="rounded-2xl bg-white p-4 shadow-md border-2 border-emerald-500/30 dark:bg-stone-900 dark:border-emerald-600/30 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 dark:border-stone-800">
              <div>
                <h2 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <span>⚖️</span>
                  {language === "en" ? "Sell-or-Wait Decision Optimizer" : "विकायचा की थांबायचा? निर्णय सल्लागार"}
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {language === "en"
                    ? "Net cash comparison after transport, APMC cess, storage cost & weight loss"
                    : "वाहतूक, हमाली, सेस, साठवणूक खर्च व घट वजा करून निव्वळ नफा तुलना"}
                </p>
              </div>
              <ProvenanceBadge type="estimate" />
            </div>

            {/* Interactive Inputs: Quantity & Holding Days */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === "en" ? "Your Quantity (Quintals):" : "आपला शेतमाल (क्विंटल):"}
                </label>
                <div className="flex items-center gap-1">
                  {[25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setLotQuantity(qty)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        lotQuantity === qty
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {qty} Q
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === "en" ? "Storage Waiting Period:" : "साठवणूक कालावधी:"}
                </label>
                <div className="flex items-center gap-1">
                  {[15, 30, 45].map((d) => (
                    <button
                      key={d}
                      onClick={() => setHoldingDays(d)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        holdingDays === d
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {d} {language === "en" ? "Days" : "दिवस"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Recommendation Banner */}
            <div className={`rounded-xl border p-3.5 space-y-1.5 ${sellOrWait.recommendationBadgeColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span>{sellOrWait.recommendation === "HOLD_STORAGE" ? "🟡" : "🟢"}</span>
                  <span>{language === "en" ? sellOrWait.recommendationLabelEn : sellOrWait.recommendationLabelMr}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">
                  {sellOrWait.confidenceLevel === "HIGH" ? "अतिशय खात्रीशीर" : "मध्यम अंदाज"}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {language === "en" ? sellOrWait.reasoningEn : sellOrWait.reasoningMr}
              </p>
            </div>

            {/* Side-by-Side Comparison Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Sell Today */}
              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                  {language === "en" ? "Option 1: Sell Today" : "पर्याय १: आजच विक्री"}
                </span>
                <p className="text-sm font-black text-stone-900 dark:text-white">
                  ₹{sellOrWait.netRevenueToday.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-stone-500">
                  निव्वळ हाती: <strong>₹{sellOrWait.netPricePerQuintalToday}</strong> / क्विं
                </p>
                <div className="pt-1 text-[10px] text-stone-400 space-y-0.5 border-t border-stone-200 dark:border-stone-700">
                  <p>वाहतूक: -₹{sellOrWait.transportCostToday}</p>
                  <p>सेस व हमाली: -₹{sellOrWait.mandiFeesToday + sellOrWait.hamaliCostToday}</p>
                </div>
              </div>

              {/* Hold in Storage */}
              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                  {language === "en" ? `Option 2: Hold ${holdingDays} Days` : `पर्याय २: ${holdingDays} दिवस साठवणूक`}
                </span>
                <p
                  className={`text-sm font-black ${
                    sellOrWait.netGainTotal > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  ₹{sellOrWait.netRevenueFuture.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-stone-500">
                  निव्वळ हाती: <strong>₹{sellOrWait.netPricePerQuintalFuture}</strong> / क्विं
                </p>
                <div className="pt-1 text-[10px] text-stone-400 space-y-0.5 border-t border-stone-200 dark:border-stone-700">
                  <p>साठवणूक भाडे: -₹{sellOrWait.storageCostTotal}</p>
                  <p>घट (वजन नुकसान): {sellOrWait.weightLossQuintals} क्विं</p>
                </div>
              </div>
            </div>

            {/* Net Difference & Explainer Link */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {language === "en" ? "Net Difference:" : "अपेक्षित फरक (नफा/तोटा):"}{" "}
                <strong
                  className={
                    sellOrWait.netGainTotal >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-600"
                  }
                >
                  {sellOrWait.netGainTotal >= 0 ? "+₹" : "-₹"}
                  {Math.abs(sellOrWait.netGainTotal).toLocaleString("en-IN")} (
                  {sellOrWait.netGainPerQuintal >= 0 ? "+₹" : "-₹"}
                  {Math.abs(sellOrWait.netGainPerQuintal)}/Q)
                </strong>
              </span>

              <button
                onClick={() => setShowExplainer(!showExplainer)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {showExplainer ? "हिशोब लपवा ▲" : "हिशोब कसा केला? ▼"}
              </button>
            </div>

            {/* Step-by-Step Mathematical Explainer */}
            {showExplainer && (
              <div className="rounded-xl bg-stone-100 p-3 text-xs space-y-2 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 animate-fade-in">
                <p className="font-bold text-stone-800 dark:text-stone-200">
                  {language === "en"
                    ? "Mathematical Calculation Transparency:"
                    : "पारदर्शक गणितीय सूत्र व पद्धत:"}
                </p>
                {sellOrWait.transparencySteps.map((step, idx) => (
                  <div key={idx} className="pb-1.5 border-b border-stone-200 dark:border-stone-700 last:border-0 last:pb-0">
                    <p className="font-bold text-stone-900 dark:text-white">
                      {idx + 1}. {language === "en" ? step.titleEn : step.titleMr}
                    </p>
                    <p className="font-mono text-[10px] text-stone-500 mt-0.5">{step.formula}</p>
                    <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                      = {step.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Historical Price Trend Chart (Lightweight SVG) */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                {language === "en" ? "Price Trend & Daily Arrivals" : "बाजारभाव कल व दैनिक आवक"}
              </h2>
              <span className="text-[10px] text-stone-400 block">
                {chartTimeframe === "7d"
                  ? marketData?.trend7d.directionLabelMr
                  : chartTimeframe === "30d"
                  ? marketData?.trend30d.directionLabelMr
                  : marketData?.trend90d.directionLabelMr}
              </span>
            </div>

            {/* Timeframe switch */}
            <div className="flex rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800 text-[11px] font-bold">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    chartTimeframe === tf
                      ? "bg-white text-stone-900 shadow-xs dark:bg-stone-700 dark:text-white"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {tf === "7d" ? "७ दिवस" : tf === "30d" ? "३० दिवस" : "९० दिवस"}
                </button>
              ))}
            </div>
          </div>

          {/* Render SVG chart */}
          {renderSvgTrendChart()}
        </div>

        {/* 6. Competitor APMC Mandis Comparison */}
        {marketData && marketData.allMandis.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                {language === "en" ? "Mandi Comparison (Ranked by Rate)" : "प्रमुख बाजार समित्यांची तुलना"}
              </h2>
              <span className="text-[10px] text-stone-400">
                {marketData.allMandis.length} बाजार समित्या
              </span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {marketData.allMandis.map((mandi, idx) => (
                <div
                  key={mandi.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-850 px-1 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "📍"}</span>
                      <span>{mandi.mandiNameMr}</span>
                    </p>
                    <p className="text-[10px] text-stone-500">
                      अंतर: <strong>{mandi.distanceKm} किमी</strong> • आवक: {mandi.arrivalQuintals.toLocaleString("en-IN")} क्विं
                    </p>
                    <p className="text-[10px] text-stone-400">
                      किमान: ₹{mandi.minPrice} • कमाल: ₹{mandi.maxPrice}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                      ₹{mandi.modalPrice.toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] font-normal text-stone-400">/क्विं</span>
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        mandi.mandiNameEn + " Maharashtra"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-stone-500 hover:text-emerald-700 underline block"
                    >
                      मार्ग नकाशा (Map) ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Cold Storage & Certified Warehouses Directory */}
        {marketData && marketData.warehousesNearby.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span>🏢</span>
                  {language === "en" ? "Nearby Certified Warehouses & Cold Storages" : "जवळची प्रमाणित शीतगृहे व वखारी"}
                </h2>
                <p className="text-[10px] text-stone-400">
                  {language === "en"
                    ? "WDRA accredited warehouses offer Negotiable Warehouse Receipts (e-NWR) for 7% loans"
                    : "WDRA मान्यताप्राप्त गोदामांमध्ये शेतमाल तारण ठेवून ७% सवलतीच्या दराने कर्ज मिळते"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {marketData.warehousesNearby.map((wh) => (
                <div
                  key={wh.id}
                  className="rounded-xl border border-stone-200 p-3 bg-stone-50 text-xs dark:bg-stone-850 dark:border-stone-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{wh.nameMr}</p>
                      <p className="text-[10px] text-stone-500">{wh.address}</p>
                    </div>
                    {wh.hasWdraAccreditation && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                        ✓ WDRA मान्यता
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-600 dark:text-stone-400">
                      मासिक भाडे: <strong>₹{wh.monthlyRatePerQuintal}/क्विंटल</strong>
                    </span>
                    <a
                      href={`tel:${wh.contactPhone}`}
                      className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      📞 {wh.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Price Alert Trigger Button */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-stone-900 p-4 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-200">
              {language === "en" ? "Target Price Alert Notification" : "भाव सूचना (Price Alert) सेट करा"}
            </p>
            <p className="text-[11px] text-stone-300 mt-0.5">
              {language === "en"
                ? `Get notified when ${marketData?.cropNameEn} reaches your target rate`
                : `${marketData?.cropNameMr} चे दर आपण ठरवलेल्या भावावर पोहोचताच सूचना मिळवा`}
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 px-3 py-2 text-xs font-black shadow-sm active:scale-95 transition-all min-h-[44px]"
          >
            🔔 {language === "en" ? "Set Alert" : "सूचना लावा"}
          </button>
        </div>
      </main>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 max-w-sm w-full space-y-3 border border-stone-200 dark:border-stone-800 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>🔔</span>
                <span>{language === "en" ? "Set Target Price Alert" : "लक्ष्य भाव सूचना सेट करा"}</span>
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-stone-400 font-bold p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              {language === "en"
                ? `Enter minimum price per quintal for ${marketData?.cropNameEn}:`
                : `${marketData?.cropNameMr} साठी किमान अपेक्षित दर (₹/क्विंटल) टाका:`}
            </p>

            <input
              type="number"
              value={targetAlertPrice}
              onChange={(e) => setTargetAlertPrice(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-base font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />

            {alertSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center dark:bg-emerald-950/40 dark:text-emerald-300">
                ✓ सूचना सेट झाली! भाव ₹{targetAlertPrice} च्या वर जाताच आपल्याला SMS / Notification द्वारे कळवले जाईल.
              </div>
            ) : (
              <button
                onClick={() => {
                  playChime();
                  setAlertSuccess(true);
                  setTimeout(() => {
                    setShowAlertModal(false);
                    setAlertSuccess(false);
                  }, 2500);
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
              >
                जतन करा (Activate Alert)
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
