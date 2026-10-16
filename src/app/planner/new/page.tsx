"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { UnitConverterModal } from "@/components/UnitConverterModal";
import { CalculationModal } from "@/components/CalculationModal";
import { CROPS_MASTER, getAllCropsList, CropMasterData } from "@/data/crops";
import { calculateCropPlan } from "@/engine";
import { playChime, speakWithFallback } from "@/lib/soundUtils";

function WizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [farms, setFarms] = useState<any[]>([]);

  // Wizard state
  const [selectedCropId, setSelectedCropId] = useState<string>("onion");
  const [selectedVarietyId, setSelectedVarietyId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [areaAcre, setAreaAcre] = useState<number>(2.5);
  const [isCustomArea, setIsCustomArea] = useState<boolean>(false);

  const [sowingDate, setSowingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [irrigationMethod, setIrrigationMethod] = useState<"drip" | "sprinkler" | "flood" | "rainfed">("drip");
  const [soilType, setSoilType] = useState<string>("Medium_Black");

  // Modals
  const [showConverter, setShowConverter] = useState<boolean>(false);
  const [showCalcModal, setShowCalcModal] = useState<boolean>(false);

  // Read URL search params (e.g. from comparison page ?crop=soybean&area=2)
  useEffect(() => {
    const cropParam = searchParams.get("crop");
    const areaParam = searchParams.get("area");
    if (cropParam && CROPS_MASTER[cropParam]) {
      setSelectedCropId(cropParam);
    }
    if (areaParam && !isNaN(parseFloat(areaParam))) {
      setAreaAcre(parseFloat(areaParam));
    }
  }, [searchParams]);

  // Fetch farmer plots
  useEffect(() => {
    async function fetchFarms() {
      try {
        const res = await fetch("/api/farm");
        if (res.ok) {
          const data = await res.json();
          if (data.farms && data.farms.length > 0) {
            setFarms(data.farms);
            setSelectedFarmId(data.farms[0].id);
            setAreaAcre(data.farms[0].areaAcre || 2.5);
            if (data.farms[0].soilType) setSoilType(data.farms[0].soilType);
          }
        }
      } catch (e) {
        console.error("Error fetching farms:", e);
      }
    }
    fetchFarms();
  }, []);

  const allCrops = getAllCropsList();
  const activeCrop: CropMasterData = CROPS_MASTER[selectedCropId] || CROPS_MASTER.onion;

  // Set default variety when crop changes
  useEffect(() => {
    if (activeCrop.varieties && activeCrop.varieties.length > 0) {
      setSelectedVarietyId(activeCrop.varieties[0].id);
    }
  }, [selectedCropId, activeCrop.varieties]);

  // Handle farm selection
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (farmId === "custom") {
      setIsCustomArea(true);
    } else {
      setIsCustomArea(false);
      const chosen = farms.find((f) => f.id === farmId);
      if (chosen) {
        setAreaAcre(chosen.areaAcre);
        if (chosen.soilType) setSoilType(chosen.soilType);
        // If farm has drip water source, default to drip
        const hasDrip = chosen.waterSources?.some((w: any) => w.hasDrip);
        if (hasDrip) setIrrigationMethod("drip");
      }
    }
  };

  // Run real-time calculation preview
  const liveCalculation = calculateCropPlan({
    cropId: selectedCropId,
    varietyId: selectedVarietyId,
    areaAcre: Number(areaAcre) || 1.0,
    sowingDate,
    irrigationMethod,
    soilType,
  });

  // Seasonal Sowing Window Validation
  const checkSowingWindow = () => {
    if (!sowingDate) return { inSeason: true, message: "" };
    const date = new Date(sowingDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    const sw = activeCrop.sowingWindow;
    let inWindow = false;

    if (sw.startMonth <= sw.endMonth) {
      if (
        (month > sw.startMonth || (month === sw.startMonth && day >= sw.startDay)) &&
        (month < sw.endMonth || (month === sw.endMonth && day <= sw.endDay))
      ) {
        inWindow = true;
      }
    } else {
      // Crosses calendar year (e.g. Oct to Feb)
      if (
        (month > sw.startMonth || (month === sw.startMonth && day >= sw.startDay)) ||
        (month < sw.endMonth || (month === sw.endMonth && day <= sw.endDay))
      ) {
        inWindow = true;
      }
    }

    return {
      inSeason: inWindow,
      message: language === "en" ? sw.descriptionEn : sw.descriptionMr,
    };
  };

  const windowCheck = checkSowingWindow();

  // Filter crops
  const filteredCrops = allCrops.filter((c) => {
    const matchCat = selectedCategory === "All" || c.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      c.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameHi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Handle plan submission
  const handleSubmitPlan = async () => {
    setLoading(true);
    playChime();

    try {
      // Determine farm ID: if custom or no farms, use first available farm or default
      let targetFarmId = selectedFarmId;
      if (!targetFarmId || targetFarmId === "custom") {
        if (farms.length > 0) {
          targetFarmId = farms[0].id;
        } else {
          // Fetch or trigger fallback
          const farmRes = await fetch("/api/farm");
          const farmData = await farmRes.json();
          targetFarmId = farmData.farms?.[0]?.id;
        }
      }

      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: targetFarmId || undefined,
          cropId: selectedCropId,
          varietyId: selectedVarietyId,
          areaAcre: Number(areaAcre),
          sowingDate,
          irrigationMethod,
          soilType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/planner/${data.planId}`);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to create crop plan"}`);
      }
    } catch (e) {
      console.error("Submit plan error:", e);
      alert("Network error while creating plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4">
        {/* Wizard Progress Bar */}
        <div className="mb-4 rounded-2xl bg-white p-3.5 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2">
            <span>{language === "en" ? `Step ${step} of 4` : `पायरी ${step} पैकी ४`}</span>
            <span className="text-emerald-700 dark:text-emerald-400">
              {step === 1 && (language === "en" ? "Select Crop" : "पीक व वाण")}
              {step === 2 && (language === "en" ? "Select Land" : "शेत जमीन व क्षेत्र")}
              {step === 3 && (language === "en" ? "Sowing Date" : "पेरणी तारीख")}
              {step === 4 && (language === "en" ? "Review & Plan" : "सिंचन व अंतिम हिशोब")}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* ================= STEP 1: CROP & VARIETY ================= */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1">
                <span>🌱</span>
                {language === "en" ? "Choose Crop & Variety" : "पीक व सुधारित वाण निवडा"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                {language === "en"
                  ? "Select from 18 scientifically verified crops tailored for Maharashtra"
                  : "महाराष्ट्रातील हवामानास अनुकूल १८ प्रमाणित पिकांमधून निवडा"}
              </p>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
                {["All", "Vegetables", "Pulses", "Oilseeds", "Cereals", "Fruits", "Cash_Crops", "Spices"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {cat === "All" && (language === "en" ? "All Crops" : "सर्व पिके")}
                    {cat === "Vegetables" && (language === "en" ? "Vegetables" : "भाजीपाला")}
                    {cat === "Pulses" && (language === "en" ? "Pulses" : "कडधान्ये")}
                    {cat === "Oilseeds" && (language === "en" ? "Oilseeds" : "गळीत धान्य")}
                    {cat === "Cereals" && (language === "en" ? "Cereals" : "तृणधान्ये")}
                    {cat === "Fruits" && (language === "en" ? "Fruits" : "फळबागा")}
                    {cat === "Cash_Crops" && (language === "en" ? "Cash Crops" : "नगदी पिके")}
                    {cat === "Spices" && (language === "en" ? "Spices" : "मसाले पिके")}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "en" ? "Search crop (e.g. Onion, Soybean)..." : "पीक शोधा (उदा. कांदा, सोयाबीन, कापूस)..."}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-stone-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
              {filteredCrops.map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button
                    key={crop.id}
                    onClick={() => {
                      setSelectedCropId(crop.id);
                      playChime();
                    }}
                    className={`flex flex-col text-left rounded-xl p-3 border transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-500"
                        : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                        {language === "en" ? crop.nameEn : crop.nameMr}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-emerald-600 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {crop.season} • {crop.durationDaysMin}-{crop.durationDaysMax} d
                    </span>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                      <span>उत्पादन:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {crop.baseYieldQuintalsPerAcre} Q/ac
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Crop Variety Selector */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <label className="block text-xs font-bold text-stone-900 dark:text-white mb-1.5">
                {language === "en" ? "Select Variety:" : "सुधारित / संकरित वाण निवडा:"}
              </label>
              <select
                value={selectedVarietyId}
                onChange={(e) => setSelectedVarietyId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-medium text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              >
                {activeCrop.varieties.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.durationDays} दिवस | क्षमता: {v.yieldPotentialQuintals} Q/एकर)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PLOT & AREA ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1">
                <span>📍</span>
                {language === "en" ? "Assign Farm Plot & Area" : "शेत गट व क्षेत्रफळ निवडा"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                {language === "en"
                  ? "Choose from your registered land parcels or enter custom acreage"
                  : "आपल्या नोंदणीकृत शेतांपैकी गट निवडा किंवा क्षेत्रफळ टाका"}
              </p>

              {/* Registered Farm Plots */}
              <div className="space-y-2 mb-3">
                {farms.map((f) => {
                  const isSelected = selectedFarmId === f.id && !isCustomArea;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleFarmSelect(f.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-850"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-white">
                          {f.name}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {f.soilType} • {f.ownershipType === "owned" ? "स्वतःची जमीन" : "भाडेतत्त्वावर"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {f.areaAcre} एकर
                        </span>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleFarmSelect("custom")}
                  className={`w-full p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    isCustomArea
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-dashed border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  + {language === "en" ? "Enter Custom Acreage" : "इतर नवीन क्षेत्रफळ टाका"}
                </button>
              </div>

              {/* Acreage Input & Unit Converter */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-850">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {language === "en" ? "Total Cultivation Area (Acres):" : "लागवड क्षेत्रफळ (एकर):"}
                  </label>
                  <button
                    onClick={() => setShowConverter(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    🔄 {language === "en" ? "Unit Converter" : "गुंठे/हेक्टर रूपांतरक"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={areaAcre}
                    onChange={(e) => setAreaAcre(Math.max(0.1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-base font-bold text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                  <span className="font-bold text-sm text-stone-600 dark:text-stone-400">
                    {language === "en" ? "Acres" : "एकर"}
                  </span>
                </div>

                {/* Instant Converted Equivalents */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-750">
                  <span>= {(areaAcre * 40).toFixed(1)} गुंठे</span>
                  <span>= {(areaAcre * 0.4047).toFixed(2)} हेक्टर</span>
                  <span>= {(areaAcre * 1.6).toFixed(1)} बीघा</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SOWING DATE & SEASON ================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1">
                <span>📅</span>
                {language === "en" ? "Target Sowing / Planting Date" : "नियोजित पेरणी / पुनर्लागवड तारीख"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                {language === "en"
                  ? "Sowing date dictates your entire growth schedule and harvest window"
                  : "पेरणीच्या तारखेवरून खतांचे हप्ते, पाणी व काढणीचे वेळापत्रक आपोआप तयार होते"}
              </p>

              <div className="mb-4">
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm font-bold text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              {/* Sowing Window Alert */}
              <div
                className={`rounded-xl p-3.5 border ${
                  windowCheck.inSeason
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200"
                    : "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{windowCheck.inSeason ? "✅" : "⚠️"}</span>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {windowCheck.inSeason
                        ? language === "en"
                          ? "Optimal Recommended Sowing Window!"
                          : "योग्य शिफारशीत पेरणी कालावधी!"
                        : language === "en"
                        ? "Notice: Selected date is outside optimal window"
                        : "सूचना: निवडलेली तारीख शिफारशीत पेरणी कालावधीच्या बाहेर आहे"}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {windowCheck.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="mt-4 rounded-xl bg-stone-50 p-3 text-xs text-stone-700 dark:bg-stone-850 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                <div className="flex justify-between py-1">
                  <span>पिकाचा कालावधी:</span>
                  <span className="font-bold">{liveCalculation.durationDays} दिवस</span>
                </div>
                <div className="flex justify-between py-1 border-t border-stone-200 dark:border-stone-800">
                  <span>अंदाजित काढणी सुरू:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {liveCalculation.harvestDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: IRRIGATION & LIVE REVIEW ================= */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            {/* Irrigation Selector */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                {language === "en" ? "Irrigation Method" : "सिंचन पद्धत निवडा"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "drip", nameMr: "ठिबक सिंचन (Drip)", nameEn: "Drip Irrigation", icon: "💧", badge: "+15% Yield" },
                  { id: "sprinkler", nameMr: "तुषार सिंचन", nameEn: "Sprinkler", icon: "🚿", badge: "+5% Yield" },
                  { id: "flood", nameMr: "पाटपाणी (Flood)", nameEn: "Flood / Furrow", icon: "🌊", badge: "Standard" },
                  { id: "rainfed", nameMr: "कोरडवाहू (जिरायत)", nameEn: "Rainfed", icon: "🌧️", badge: "Monsoon" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setIrrigationMethod(item.id as any)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      irrigationMethod === item.id
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-850"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {language === "en" ? item.nameEn : item.nameMr}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Financial Engine Preview Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-700/60 pb-2">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-1.5">
                    <span>📊</span>
                    {language === "en" ? "Instant Financial Forecast" : "अपेक्षित आर्थिक अंदाज"}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {language === "en" ? activeCrop.nameEn : activeCrop.nameMr} • {areaAcre} एकर
                  </p>
                </div>
                <ProvenanceBadge type="estimate" />
              </div>

              {/* 4 KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                  <p className="text-[11px] text-emerald-200">
                    {language === "en" ? "Total Cultivation Cost:" : "एकूण उत्पादन खर्च:"}
                  </p>
                  <p className="text-base font-extrabold text-white">
                    ₹{liveCalculation.totalCost.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    ₹{liveCalculation.costPerAcre.toLocaleString("en-IN")}/एकर
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                  <p className="text-[11px] text-emerald-200">
                    {language === "en" ? "Expected Net Profit:" : "अपेक्षित निव्वळ नफा:"}
                  </p>
                  <p className="text-base font-extrabold text-amber-300">
                    ₹{liveCalculation.netProfit.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    ROI: {liveCalculation.roiPercent}% परतावा
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                  <p className="text-[11px] text-emerald-200">
                    {language === "en" ? "Expected Yield:" : "अपेक्षित एकूण उत्पादन:"}
                  </p>
                  <p className="text-base font-extrabold text-white">
                    {liveCalculation.totalExpectedYieldQuintals} <span className="text-xs font-normal">क्विंटल</span>
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    {liveCalculation.effectiveYieldPerAcre} Q/एकर
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                  <p className="text-[11px] text-emerald-200">
                    {language === "en" ? "Break-Even Price:" : "तोटा न होणारा किमान भाव:"}
                  </p>
                  <p className="text-base font-extrabold text-white">
                    ₹{liveCalculation.breakEvenPricePerQuintal.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    प्रति क्विंटल किमान
                  </p>
                </div>
              </div>

              {/* Show Math Transparency Button */}
              <button
                onClick={() => setShowCalcModal(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700/80 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <span>🧮</span>
                {language === "en" ? "Show Calculation (How was this derived?)" : "हिशोब कसा केला? (पारदर्शक सूत्रे पहा)"}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-stone-300 bg-white py-3 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-300 active:scale-95"
            >
              ← {language === "en" ? "Previous Step" : "मागील पायरी"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/planner")}
              className="flex-1 rounded-xl border border-stone-300 bg-white py-3 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-300 active:scale-95"
            >
              ✕ {language === "en" ? "Cancel" : "रद्द करा"}
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                setStep(step + 1);
                playChime();
              }}
              className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95"
            >
              {language === "en" ? "Next Step →" : "पुढील पायरी →"}
            </button>
          ) : (
            <button
              onClick={handleSubmitPlan}
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{language === "en" ? "Creating Plan..." : "नियोजन तयार करत आहे..."}</span>
              ) : (
                <>
                  <span>🌾</span>
                  <span>{language === "en" ? "Generate Full Plan" : "पीक नियोजन तयार करा"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </main>

      {/* Unit Converter Modal */}
      <UnitConverterModal
        isOpen={showConverter}
        onClose={() => setShowConverter(false)}
      />

      {/* Math Calculation Transparency Modal */}
      <CalculationModal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        steps={liveCalculation.transparencySteps}
        language={language}
        cropName={language === "en" ? activeCrop.nameEn : activeCrop.nameMr}
      />

      <BottomNav />
    </div>
  );
}

export default function NewCropPlanWizard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600 dark:bg-stone-950 dark:text-stone-300">
          <p className="text-sm font-bold">लोड होत आहे... / Loading Planner...</p>
        </div>
      }
    >
      <WizardInner />
    </Suspense>
  );
}

