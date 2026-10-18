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
import {
  TrendingUp,
  Volume2,
  Share2,
  MapPin,
  Scale,
  Building2,
  Bell,
  Clock,
  ArrowRight,
  ExternalLink,
  Phone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MarketIntelligencePage() {
  const { t, language } = useLanguage();
  const isMr = language === "mr";

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

    const text = isMr
      ? `${selectedDistrict} जिल्ह्यातील ${marketData.cropNameMr} बाजार अहवाल: राज्यातील सरासरी भाव ₹${marketData.stateAverageModalPrice} प्रति क्विंटल आहे. सर्वोच्च भाव ${marketData.bestMandi.mandiNameMr} येथे ₹${marketData.bestMandi.modalPrice} आहे. निर्णय सल्लागार: ${sellOrWait.recommendationLabelMr}. ${sellOrWait.reasoningMr}`
      : `Market Report for ${marketData.cropNameEn} in ${selectedDistrict}: State average modal price is ${marketData.stateAverageModalPrice} rupees per quintal. Highest price is at ${marketData.bestMandi.mandiNameEn} at ${marketData.bestMandi.modalPrice} rupees. Advisor recommendation: ${sellOrWait.recommendationLabelEn}. ${sellOrWait.reasoningEn}`;

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

    const msg = isMr
      ? `🌾 *किसानसाथी दैनिक बाजारभाव बुलेटिन* (${todayDate})\n\n📍 *पीक:* ${marketData.cropNameMr} (${marketData.cropNameEn})\n📊 *राज्य सरासरी भाव:* ₹${marketData.stateAverageModalPrice}/क्विंटल (${marketData.stateChange7dPercent >= 0 ? "+" : ""}${marketData.stateChange7dPercent}% या आठवड्यात)\n🏆 *सर्वोच्च भाव:* ${marketData.bestMandi.mandiNameMr} - ₹${marketData.bestMandi.modalPrice}/क्विं\n📍 *जवळची बाजार समिती:* ${marketData.nearestMandi.mandiNameMr} (${marketData.nearestMandi.distanceKm} किमी) - ₹${marketData.nearestMandi.modalPrice}/क्विं\n\n💡 *विकायचा की थांबायचा सल्ला:* ${sellOrWait.recommendationLabelMr}\n${sellOrWait.reasoningMr}\n\n📲 *किसानसाथी ॲपवर लाईव्ह बाजारभाव पहा:* http://localhost:3000/market`
      : `🌾 *KisanSaathi Daily Mandi Report* (${todayDate})\n\n📍 *Crop:* ${marketData.cropNameEn} (${marketData.cropNameMr})\n📊 *State Avg Price:* ₹${marketData.stateAverageModalPrice}/qtl (${marketData.stateChange7dPercent >= 0 ? "+" : ""}${marketData.stateChange7dPercent}% this week)\n🏆 *Best Price:* ${marketData.bestMandi.mandiNameEn} - ₹${marketData.bestMandi.modalPrice}/qtl\n📍 *Nearest Mandi:* ${marketData.nearestMandi.mandiNameEn} (${marketData.nearestMandi.distanceKm} km) - ₹${marketData.nearestMandi.modalPrice}/qtl\n\n💡 *Sell-or-Wait Advisor:* ${sellOrWait.recommendationLabelEn}\n${sellOrWait.reasoningEn}\n\n📲 *Check live Mandi rates on KisanSaathi:* http://localhost:3000/market`;

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
        <div className="h-44 flex items-center justify-center text-xs text-stone-400 font-medium">
          {isMr ? "माहिती उपलब्ध होत आहे..." : "Loading chart data..."}
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

          {/* Background Arrival Bars */}
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
                className="fill-forest-600/15 dark:fill-forest-400/20"
                rx="1"
              />
            );
          })}

          {/* Gradient area fill */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B4332" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1B4332" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#1B4332"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="dark:stroke-forest-400"
          />

          {/* Latest Point Dot & Value */}
          {activeTrendPoints.length > 0 && (
            <g>
              <circle
                cx={getX(activeTrendPoints.length - 1)}
                cy={getY(prices[prices.length - 1])}
                r="4.5"
                className="fill-forest-800 stroke-white dark:stroke-stone-900 stroke-2 dark:fill-forest-300"
              />
              <text
                x={getX(activeTrendPoints.length - 1)}
                y={getY(prices[prices.length - 1]) - 8}
                textAnchor="end"
                className="text-[10px] font-black fill-forest-900 dark:fill-forest-300 font-mono"
              >
                ₹{prices[prices.length - 1]}
              </text>
            </g>
          )}

          {/* Start and End date labels */}
          <text
            x={padding}
            y={height - 8}
            className="text-[9px] fill-stone-400 font-mono"
          >
            {activeTrendPoints[0]?.date.slice(5)}
          </text>
          <text
            x={width - padding}
            y={height - 8}
            textAnchor="end"
            className="text-[9px] fill-stone-400 font-bold font-mono"
          >
            {activeTrendPoints[activeTrendPoints.length - 1]?.date.slice(5)}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1.5 border-t border-stone-100 dark:border-stone-800 px-1 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-forest-800 dark:bg-forest-400 inline-block rounded" />
            <span>{isMr ? "सरासरी बाजारभाव (₹/क्विं)" : "Modal Price (₹/Qtl)"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-forest-600/30 inline-block rounded-xs" />
            <span>{isMr ? "दैनिक आवक (क्विंटल)" : "Daily Arrivals (Q)"}</span>
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
        <div className="card-warm p-4.5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-card border border-forest-700/40">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-stone-900 dark:text-stone-100 leading-tight">
                  {isMr ? "बाजारभाव व विक्री सल्लागार" : "APMC Mandi Intelligence"}
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  {isMr ? "थेट बाजारभाव, साठवणूक हिशोब व विक्री निर्णय" : "Live mandi rates, trends & Sell-or-Wait optimizer"}
                </p>
              </div>
            </div>
            <ProvenanceBadge
              type={marketData?.provenance.type || "demo"}
              sourceText={marketData?.provenance.sourceText || "Maharashtra APMC Data"}
              dateText={marketData?.provenance.lastUpdated || "Today"}
            />
          </div>

          {/* Quick Actions: Audio & WhatsApp Share */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={handleReadMarketSummary}
              className="text-xs font-bold text-forest-800 dark:text-forest-300 hover:underline flex items-center gap-1.5 min-h-[36px]"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isMr ? "बाजार अहवाल ऐका" : "Listen Report"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-9 rounded-xl bg-forest-800 hover:bg-forest-900 text-white px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isMr ? "व्हाट्सॲपवर पाठवा" : "Share WhatsApp"}</span>
            </button>
          </div>
        </div>

        {/* 1. Crop Selector Filter (18 Seed Crops) */}
        <div className="card-warm p-3.5 space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            {isMr ? "बाजारभावासाठी पीक निवडा:" : "Select Crop for Rates:"}
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {allCrops.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCropId(c.id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
                  selectedCropId === c.id
                    ? "bg-forest-800 text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                <span>{c.nameMr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. District Filter Selector */}
        <div className="card-warm p-3.5 space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            {isMr ? "आपला जिल्हा (वाहतूक अंतरासाठी):" : "Farmer District (for Transport Calculation):"}
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            {districts.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 font-bold transition-all min-h-[36px] ${
                  selectedDistrict === dist
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
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
            <div className="rounded-2xl bg-forest-900 p-4 text-white shadow-card border border-forest-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-200 block">
                {isMr ? "महाराष्ट्र सरासरी भाव" : "State Average Rate"}
              </span>
              <p className="text-2xl font-black font-mono money-numeral text-cream-100">
                ₹{marketData.stateAverageModalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-forest-200">/Q</span>
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-harvest-400 font-mono">
                <span>{marketData.stateChange7dPercent >= 0 ? "▲" : "▼"}</span>
                <span>
                  {marketData.stateChange7dPercent >= 0 ? "+" : ""}
                  {marketData.stateChange7dPercent}% {isMr ? "या आठवड्यात" : "this week"}
                </span>
              </div>
            </div>

            {/* Best Mandi */}
            <div className="card-warm p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                {isMr ? "सर्वोच्च भाव मिळणारी मंडी" : "Highest Paying Mandi"}
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {isMr ? marketData.bestMandi.mandiNameMr : marketData.bestMandi.mandiNameEn}
              </p>
              <p className="text-xl font-black text-forest-800 dark:text-forest-300 font-mono money-numeral">
                ₹{marketData.bestMandi.modalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-[10px] font-normal text-stone-400">/Q</span>
              </p>
              <span className="text-[10px] text-stone-500 block font-mono">
                {marketData.bestMandi.distanceKm} km {isMr ? "अंतर" : "away"}
              </span>
            </div>
          </div>
        )}

        {/* 4. CORE FEATURE: SELL-OR-WAIT DECISION OPTIMIZER (विकायचा की थांबायचा?) */}
        {sellOrWait && (
          <div className="card-warm p-4.5 space-y-3.5 border-2 border-forest-600/30">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div>
                <h2 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                  <span>{isMr ? "विकायचा की थांबायचा? निर्णय सल्लागार" : "Sell-or-Wait Decision Optimizer"}</span>
                </h2>
                <p className="text-[11px] text-stone-500 font-medium">
                  {isMr ? "वाहतूक, साठवणूक व घट वजा करून निव्वळ नफा तुलना" : "Net realization after transport, storage & loss"}
                </p>
              </div>
              <ProvenanceBadge type="estimate" />
            </div>

            {/* Interactive Inputs: Quantity & Holding Days */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {isMr ? "आपला शेतमाल (क्विंटल):" : "Your Quantity (Quintals):"}
                </label>
                <div className="flex items-center gap-1 font-mono">
                  {[25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setLotQuantity(qty)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        lotQuantity === qty
                          ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      {qty} Q
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {isMr ? "साठवणूक कालावधी:" : "Storage Period:"}
                </label>
                <div className="flex items-center gap-1 font-mono">
                  {[15, 30, 45].map((d) => (
                    <button
                      key={d}
                      onClick={() => setHoldingDays(d)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        holdingDays === d
                          ? "bg-forest-800 text-white border-forest-800 shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      {d} {isMr ? "दिवस" : "d"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Recommendation Banner */}
            <div className={`rounded-xl border p-3.5 space-y-1.5 ${sellOrWait.recommendationBadgeColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-700" />
                  <span>{isMr ? sellOrWait.recommendationLabelMr : sellOrWait.recommendationLabelEn}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">
                  {sellOrWait.confidenceLevel === "HIGH" ? (isMr ? "अतिशय खात्रीशीर" : "High Confidence") : (isMr ? "मध्यम अंदाज" : "Moderate")}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {isMr ? sellOrWait.reasoningMr : sellOrWait.reasoningEn}
              </p>
            </div>

            {/* Side-by-Side Comparison Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Sell Today */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                  {isMr ? "पर्याय १: आजच विक्री" : "Option 1: Sell Today"}
                </span>
                <p className="text-base font-black text-stone-900 dark:text-white font-mono money-numeral">
                  ₹{sellOrWait.netRevenueToday.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "निव्वळ हाती: " : "Net/Qtl: "}
                  <strong className="font-mono text-stone-800 dark:text-stone-200">₹{sellOrWait.netPricePerQuintalToday}</strong> / Q
                </p>
                <div className="pt-1 text-[10px] text-stone-400 space-y-0.5 border-t border-stone-200 dark:border-stone-700 font-mono">
                  <p>{isMr ? "वाहतूक:" : "Transport:"} -₹{sellOrWait.transportCostToday}</p>
                  <p>{isMr ? "हमाली व सेस:" : "Mandi Fees:"} -₹{sellOrWait.mandiFeesToday + sellOrWait.hamaliCostToday}</p>
                </div>
              </div>

              {/* Hold in Storage */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-850 p-3 border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                  {isMr ? `पर्याय २: ${holdingDays} दिवस साठवणूक` : `Option 2: Hold ${holdingDays} Days`}
                </span>
                <p
                  className={`text-base font-black font-mono money-numeral ${
                    sellOrWait.netGainTotal > 0
                      ? "text-forest-800 dark:text-forest-300"
                      : "text-rose-600"
                  }`}
                >
                  ₹{sellOrWait.netRevenueFuture.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-stone-500 font-medium">
                  {isMr ? "निव्वळ हाती: " : "Net/Qtl: "}
                  <strong className="font-mono text-stone-800 dark:text-stone-200">₹{sellOrWait.netPricePerQuintalFuture}</strong> / Q
                </p>
                <div className="pt-1 text-[10px] text-stone-400 space-y-0.5 border-t border-stone-200 dark:border-stone-700 font-mono">
                  <p>{isMr ? "साठवणूक भाडे:" : "Storage Rent:"} -₹{sellOrWait.storageCostTotal}</p>
                  <p>{isMr ? "घट (वजन नुकसान):" : "Shrinkage Loss:"} {sellOrWait.weightLossQuintals} Q</p>
                </div>
              </div>
            </div>

            {/* Net Difference & Explainer Link */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 font-mono">
                {isMr ? "अपेक्षित फरक:" : "Net Difference:"}{" "}
                <strong
                  className={
                    sellOrWait.netGainTotal >= 0
                      ? "text-forest-800 dark:text-forest-300"
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
                className="text-[11px] font-bold text-forest-800 dark:text-forest-300 hover:underline flex items-center gap-1"
              >
                <span>{showExplainer ? (isMr ? "हिशोब लपवा" : "Hide Math") : (isMr ? "हिशोब कसा केला?" : "View Math")}</span>
                {showExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step-by-Step Mathematical Explainer */}
            {showExplainer && (
              <div className="rounded-xl bg-stone-100 dark:bg-stone-850 p-3 text-xs space-y-2 border border-stone-200 dark:border-stone-700 animate-fade-in">
                <p className="font-bold text-stone-800 dark:text-stone-200">
                  {isMr ? "पारदर्शक गणितीय सूत्र व पद्धत:" : "Calculation Transparency:"}
                </p>
                {sellOrWait.transparencySteps.map((step, idx) => (
                  <div key={idx} className="pb-1.5 border-b border-stone-200 dark:border-stone-700 last:border-0 last:pb-0">
                    <p className="font-bold text-stone-900 dark:text-white">
                      {idx + 1}. {isMr ? step.titleMr : step.titleEn}
                    </p>
                    <p className="font-mono text-[10px] text-stone-500 mt-0.5">{step.formula}</p>
                    <p className="text-[11px] font-semibold text-forest-800 dark:text-forest-300 mt-0.5 font-mono">
                      = {step.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Historical Price Trend Chart (Lightweight SVG) */}
        <div className="card-warm p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                {isMr ? "बाजारभाव कल व दैनिक आवक" : "Price Trend & Daily Arrivals"}
              </h2>
              <span className="text-[10px] text-stone-500 font-medium block">
                {chartTimeframe === "7d"
                  ? marketData?.trend7d.directionLabelMr
                  : chartTimeframe === "30d"
                  ? marketData?.trend30d.directionLabelMr
                  : marketData?.trend90d.directionLabelMr}
              </span>
            </div>

            {/* Timeframe switch */}
            <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800 text-[11px] font-bold">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
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
          <div className="card-warm p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                {isMr ? "प्रमुख बाजार समित्यांची तुलना" : "Mandi Comparison (Ranked by Rate)"}
              </h2>
              <span className="text-[10px] text-stone-500 font-medium">
                {marketData.allMandis.length} {isMr ? "बाजार समित्या" : "mandis"}
              </span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {marketData.allMandis.map((mandi, idx) => (
                <div
                  key={mandi.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-stone-50/70 dark:hover:bg-stone-850 px-1 rounded-xl transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-xs font-mono">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "📍"}</span>
                      <span>{isMr ? mandi.mandiNameMr : mandi.mandiNameEn}</span>
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      {isMr ? "अंतर:" : "Distance:"} <strong>{mandi.distanceKm} km</strong> • {isMr ? "आवक:" : "Arrival:"} {mandi.arrivalQuintals.toLocaleString("en-IN")} Q
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Min: ₹{mandi.minPrice} • Max: ₹{mandi.maxPrice}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-black text-base text-forest-800 dark:text-forest-300 font-mono money-numeral">
                      ₹{mandi.modalPrice.toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] font-normal text-stone-400">/Q</span>
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        mandi.mandiNameEn + " Maharashtra"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-forest-700 dark:text-forest-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>{isMr ? "मार्ग नकाशा" : "Directions"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Cold Storage & Certified Warehouses Directory */}
        {marketData && marketData.warehousesNearby.length > 0 && (
          <div className="card-warm p-4.5 space-y-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                <span>{isMr ? "जवळची प्रमाणित शीतगृहे व वखारी" : "Certified Cold Storages & Warehouses"}</span>
              </h2>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                {isMr
                  ? "WDRA मान्यताप्राप्त गोदामांमध्ये शेतमाल तारण ठेवून ७% सवलतीच्या दराने कर्ज मिळते"
                  : "WDRA accredited warehouses offer Negotiable Warehouse Receipts (e-NWR) for 7% loans"}
              </p>
            </div>

            <div className="space-y-2.5">
              {marketData.warehousesNearby.map((wh) => (
                <div
                  key={wh.id}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 p-3 bg-stone-50/70 dark:bg-stone-850 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{isMr ? wh.nameMr : wh.nameEn}</p>
                      <p className="text-[10px] text-stone-500 font-medium">{wh.address}</p>
                    </div>
                    {wh.hasWdraAccreditation && (
                      <span className="text-[9px] font-bold bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full dark:bg-forest-950 dark:text-forest-300 shrink-0">
                        ✓ WDRA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-600 dark:text-stone-400">
                      {isMr ? "मासिक भाडे:" : "Monthly Rent:"} <strong className="font-mono">₹{wh.monthlyRatePerQuintal}/Q</strong>
                    </span>
                    <a
                      href={`tel:${wh.contactPhone}`}
                      className="font-bold text-forest-800 dark:text-forest-300 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{wh.contactPhone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Price Alert Trigger Banner */}
        <div className="rounded-2xl bg-forest-900 text-white p-4 shadow-card border border-forest-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-forest-200">
              {isMr ? "भाव सूचना (Price Alert) सेट करा" : "Target Price Alert Notification"}
            </p>
            <p className="text-[11px] text-stone-300 mt-0.5 font-medium">
              {isMr
                ? `${marketData?.cropNameMr} चे दर अपेक्षित भावावर पोहोचताच सूचना मिळवा`
                : `Get notified when ${marketData?.cropNameEn} reaches your target rate`}
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="h-11 px-4 rounded-xl bg-soil-700 hover:bg-soil-800 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0"
          >
            <Bell className="w-4 h-4 text-harvest-300" />
            <span>{isMr ? "सूचना लावा" : "Set Alert"}</span>
          </button>
        </div>
      </main>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-warm p-5 max-w-sm w-full space-y-3.5 shadow-floating">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-forest-700" />
                <span>{isMr ? "लक्ष्य भाव सूचना सेट करा" : "Set Target Price Alert"}</span>
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-stone-400 font-bold p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 font-medium">
              {isMr
                ? `${marketData?.cropNameMr} साठी किमान अपेक्षित दर (₹/क्विंटल) टाका:`
                : `Enter minimum price per quintal for ${marketData?.cropNameEn}:`}
            </p>

            <input
              type="number"
              value={targetAlertPrice}
              onChange={(e) => setTargetAlertPrice(e.target.value)}
              className="w-full h-12 rounded-xl border border-stone-300 dark:border-stone-700 px-3 text-base font-black text-stone-900 dark:bg-stone-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-forest-600"
            />

            {alertSuccess ? (
              <div className="p-3 rounded-xl bg-forest-50 text-forest-800 text-xs font-bold text-center dark:bg-forest-950/40 dark:text-forest-300 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>{isMr ? "सूचना सेट झाली! SMS द्वारे कळवले जाईल." : "Alert activated! SMS will notify you."}</span>
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
                className="w-full h-12 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs shadow-card active:scale-[0.98] transition-all"
              >
                {isMr ? "जतन करा (Activate Alert)" : "Activate Alert"}
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
