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
import { playChime } from "@/lib/soundUtils";
import {
  Sprout,
  Calendar,
  MapPin,
  Scale,
  Sparkles,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Check,
  Calculator,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

function WizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const isMr = language === "mr";

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

  // Read URL search params
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
            const hasDrip = data.farms[0].waterSources?.some((w: any) => w.hasDrip);
            if (hasDrip) setIrrigationMethod("drip");
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
    const month = date.getMonth() + 1;
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
      if (
        (month > sw.startMonth || (month === sw.startMonth && day >= sw.startDay)) ||
        (month < sw.endMonth || (month === sw.endMonth && day <= sw.endDay))
      ) {
        inWindow = true;
      }
    }

    return {
      inSeason: inWindow,
      message: isMr ? sw.descriptionMr : sw.descriptionEn,
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
      let targetFarmId = selectedFarmId;
      if (!targetFarmId || targetFarmId === "custom") {
        if (farms.length > 0) {
          targetFarmId = farms[0].id;
        } else {
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

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Wizard Progress Bar */}
        <div className="card-warm p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
            <span>{isMr ? `पायरी ${step} पैकी ४` : `Step ${step} of 4`}</span>
            <span className="text-forest-800 dark:text-forest-300 font-extrabold">
              {step === 1 && (isMr ? "पीक व वाण निवड" : "Select Crop & Variety")}
              {step === 2 && (isMr ? "शेत जमीन व क्षेत्र" : "Farm Plot & Acreage")}
              {step === 3 && (isMr ? "पेरणी तारीख व हंगाम" : "Sowing Date & Season")}
              {step === 4 && (isMr ? "सिंचन व अंतिम हिशोब" : "Irrigation & Live Review")}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full bg-forest-800 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* ================= STEP 1: CROP & VARIETY ================= */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card-warm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-950/60 text-forest-800 dark:text-forest-300 flex items-center justify-center font-bold">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                    {isMr ? "पीक व सुधारित वाण निवडा" : "Choose Crop & Variety"}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {isMr
                      ? "महाराष्ट्रातील हवामानास अनुकूल १८ प्रमाणित पिके"
                      : "18 scientifically verified crops for Maharashtra"}
                  </p>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1">
                {["All", "Vegetables", "Pulses", "Oilseeds", "Cereals", "Fruits", "Cash_Crops", "Spices"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                      selectedCategory === cat
                        ? "bg-forest-800 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {cat === "All" && (isMr ? "सर्व पिके" : "All Crops")}
                    {cat === "Vegetables" && (isMr ? "भाजीपाला" : "Vegetables")}
                    {cat === "Pulses" && (isMr ? "कडधान्ये" : "Pulses")}
                    {cat === "Oilseeds" && (isMr ? "गळीत धान्य" : "Oilseeds")}
                    {cat === "Cereals" && (isMr ? "तृणधान्ये" : "Cereals")}
                    {cat === "Fruits" && (isMr ? "फळबागा" : "Fruits")}
                    {cat === "Cash_Crops" && (isMr ? "नगदी पिके" : "Cash Crops")}
                    {cat === "Spices" && (isMr ? "मसाले पिके" : "Spices")}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isMr ? "पीक शोधा (उदा. कांदा, सोयाबीन, कापूस)..." : "Search crop (e.g. Onion, Soybean)..."}
                  className="w-full h-11 pl-9 pr-8 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[46vh] overflow-y-auto pr-0.5">
              {filteredCrops.map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button
                    key={crop.id}
                    onClick={() => {
                      setSelectedCropId(crop.id);
                      playChime();
                    }}
                    className={`flex flex-col text-left rounded-2xl p-3 border transition-all ${
                      isSelected
                        ? "border-forest-700 bg-forest-50/90 dark:bg-forest-950/40 shadow-sm ring-2 ring-forest-600/30"
                        : "card-warm hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-extrabold text-stone-900 dark:text-white leading-tight">
                        {isMr ? crop.nameMr : crop.nameEn}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-forest-800 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {crop.season} • {crop.durationDaysMin}-{crop.durationDaysMax} d
                    </span>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-stone-500">{isMr ? "उत्पादन:" : "Yield:"}</span>
                      <span className="text-forest-800 dark:text-forest-300 font-bold font-mono">
                        {crop.baseYieldQuintalsPerAcre} Q/ac
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Crop Variety Selector */}
            <div className="card-warm p-4 space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                {isMr ? "सुधारित / संकरित वाण निवडा:" : "Select Certified Variety:"}
              </label>
              <select
                value={selectedVarietyId}
                onChange={(e) => setSelectedVarietyId(e.target.value)}
                className="w-full h-12 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
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
            <div className="card-warm p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-950/60 text-forest-800 dark:text-forest-300 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                    {isMr ? "शेत गट व क्षेत्रफळ निवडा" : "Assign Farm Plot & Area"}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {isMr ? "नोंदणीकृत गट निवडा किंवा क्षेत्रफळ प्रविष्ट करा" : "Choose registered parcel or enter custom acreage"}
                  </p>
                </div>
              </div>

              {/* Registered Farm Plots */}
              <div className="space-y-2">
                {farms.map((f) => {
                  const isSelected = selectedFarmId === f.id && !isCustomArea;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleFarmSelect(f.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-forest-700 bg-forest-50/90 dark:bg-forest-950/40 shadow-sm ring-2 ring-forest-600/30"
                          : "card-warm hover:border-stone-300 dark:hover:border-stone-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-white">
                          {f.name}
                        </p>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {f.soilType} • {f.ownershipType === "owned" ? (isMr ? "स्वतःची जमीन" : "Owned") : (isMr ? "भाडेतत्त्वावर" : "Leased")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-lg bg-forest-100 dark:bg-forest-900/60 px-2.5 py-1 text-xs font-black text-forest-800 dark:text-forest-300 font-mono">
                          {f.areaAcre} एकर
                        </span>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleFarmSelect("custom")}
                  className={`w-full p-3 rounded-xl border text-center text-xs font-bold transition-all min-h-[44px] ${
                    isCustomArea
                      ? "border-forest-700 bg-forest-50 text-forest-800 dark:bg-forest-950/40 dark:text-forest-300"
                      : "border-dashed border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  + {isMr ? "इतर नवीन क्षेत्रफळ टाका" : "Enter Custom Acreage"}
                </button>
              </div>

              {/* Acreage Input & Unit Converter */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {isMr ? "लागवड क्षेत्रफळ (एकर):" : "Total Cultivation Area (Acres):"}
                  </label>
                  <button
                    onClick={() => setShowConverter(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-700 dark:text-forest-400 hover:underline"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{isMr ? "गुंठे/हेक्टर रूपांतरक" : "Unit Converter"}</span>
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
                    className="w-full h-12 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-base font-black text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                  />
                  <span className="font-bold text-xs text-stone-600 dark:text-stone-400 shrink-0">
                    {isMr ? "एकर" : "Acres"}
                  </span>
                </div>

                {/* Instant Converted Equivalents */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium pt-2 border-t border-stone-200 dark:border-stone-750 font-mono">
                  <span>= {(areaAcre * 40).toFixed(1)} {isMr ? "गुंठे" : "Guntha"}</span>
                  <span>= {(areaAcre * 0.4047).toFixed(2)} {isMr ? "हेक्टर" : "Ha"}</span>
                  <span>= {(areaAcre * 1.6).toFixed(1)} {isMr ? "बिघा" : "Bigha"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SOWING DATE & SEASON ================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card-warm p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-950/60 text-forest-800 dark:text-forest-300 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                    {isMr ? "नियोजित पेरणी तारीख" : "Target Sowing Date"}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {isMr ? "पेरणीवरून खते, पाणी व काढणीचे वेळापत्रक ठरते" : "Sowing date dictates calendar & harvest"}
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full h-12 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                />
              </div>

              {/* Sowing Window Alert */}
              <div
                className={`rounded-xl p-3.5 border ${
                  windowCheck.inSeason
                    ? "bg-forest-50 border-forest-300 text-forest-900 dark:bg-forest-950/30 dark:border-forest-800 dark:text-forest-200"
                    : "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {windowCheck.inSeason ? (
                    <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {windowCheck.inSeason
                        ? isMr
                          ? "योग्य शिफारशीत पेरणी कालावधी!"
                          : "Optimal Recommended Sowing Window!"
                        : isMr
                        ? "सूचना: निवडलेली तारीख शिफारशीत कालावधीच्या बाहेर आहे"
                        : "Notice: Date is outside optimal window"}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed font-medium">
                      {windowCheck.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 text-xs text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 space-y-1.5 font-medium">
                <div className="flex justify-between py-1">
                  <span>{isMr ? "पिकाचा कालावधी:" : "Crop Duration:"}</span>
                  <span className="font-bold">{liveCalculation.durationDays} {isMr ? "दिवस" : "days"}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-stone-200 dark:border-stone-800">
                  <span>{isMr ? "अंदाजित काढणी सुरू:" : "Est. Harvest Date:"}</span>
                  <span className="font-black text-forest-800 dark:text-forest-300 font-mono">
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
            <div className="card-warm p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {isMr ? "सिंचन पद्धत निवडा" : "Irrigation Method"}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "drip", nameMr: "ठिबक सिंचन (Drip)", nameEn: "Drip Irrigation", badge: "+15% Yield" },
                  { id: "sprinkler", nameMr: "तुषार सिंचन", nameEn: "Sprinkler", badge: "+5% Yield" },
                  { id: "flood", nameMr: "पाटपाणी (Flood)", nameEn: "Flood / Furrow", badge: "Standard" },
                  { id: "rainfed", nameMr: "कोरडवाहू (जिरायत)", nameEn: "Rainfed", badge: "Monsoon" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setIrrigationMethod(item.id as any)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      irrigationMethod === item.id
                        ? "border-forest-700 bg-forest-50 dark:bg-forest-950/40 ring-2 ring-forest-600/30"
                        : "card-warm hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Droplets className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                      <span className="rounded-md bg-forest-100 dark:bg-forest-900/60 px-1.5 py-0.5 text-[10px] font-bold text-forest-800 dark:text-forest-300 font-mono">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {isMr ? item.nameMr : item.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Financial Engine Preview Card */}
            <div className="rounded-2xl bg-forest-900 text-white p-4.5 shadow-elevated border border-forest-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-forest-800/80 pb-2.5">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-1.5 text-cream-100">
                    <TrendingUp className="w-4 h-4 text-harvest-400" />
                    <span>{isMr ? "अपेक्षित आर्थिक अंदाज" : "Instant Financial Forecast"}</span>
                  </h3>
                  <p className="text-[11px] text-forest-200 font-medium">
                    {isMr ? activeCrop.nameMr : activeCrop.nameEn} • {areaAcre} एकर
                  </p>
                </div>
                <ProvenanceBadge type="estimate" />
              </div>

              {/* 4 KPIs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-forest-800/60 p-2.5 border border-forest-700/40">
                  <p className="text-[10px] text-forest-200 font-medium">
                    {isMr ? "एकूण उत्पादन खर्च" : "Total Cost"}
                  </p>
                  <p className="text-base font-black text-white font-mono money-numeral">
                    ₹{liveCalculation.totalCost.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-forest-300 font-mono">
                    ₹{liveCalculation.costPerAcre.toLocaleString("en-IN")}/ac
                  </p>
                </div>

                <div className="rounded-xl bg-forest-800/60 p-2.5 border border-forest-700/40">
                  <p className="text-[10px] text-harvest-300 font-medium">
                    {isMr ? "अपेक्षित निव्वळ नफा" : "Expected Net Profit"}
                  </p>
                  <p className="text-base font-black text-harvest-300 font-mono money-numeral">
                    ₹{liveCalculation.netProfit.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-harvest-200 font-mono">
                    ROI: {liveCalculation.roiPercent}%
                  </p>
                </div>

                <div className="rounded-xl bg-forest-800/60 p-2.5 border border-forest-700/40">
                  <p className="text-[10px] text-forest-200 font-medium">
                    {isMr ? "अपेक्षित एकूण उत्पादन" : "Expected Yield"}
                  </p>
                  <p className="text-base font-black text-white font-mono">
                    {liveCalculation.totalExpectedYieldQuintals} <span className="text-xs font-normal">Q</span>
                  </p>
                  <p className="text-[10px] text-forest-300 font-mono">
                    {liveCalculation.effectiveYieldPerAcre} Q/ac
                  </p>
                </div>

                <div className="rounded-xl bg-forest-800/60 p-2.5 border border-forest-700/40">
                  <p className="text-[10px] text-forest-200 font-medium">
                    {isMr ? "किमान तोटा न होणारा भाव" : "Break-Even Price"}
                  </p>
                  <p className="text-base font-black text-white font-mono money-numeral">
                    ₹{liveCalculation.breakEvenPricePerQuintal.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-forest-300 font-mono">
                    {isMr ? "प्रति क्विंटल" : "per quintal"}
                  </p>
                </div>
              </div>

              {/* Show Math Transparency Button */}
              <button
                type="button"
                onClick={() => setShowCalcModal(true)}
                className="w-full h-11 rounded-xl bg-forest-800 hover:bg-forest-700 active:scale-[0.98] text-xs font-bold text-cream-100 flex items-center justify-center gap-2 border border-forest-700/60 transition-all"
              >
                <Calculator className="w-4 h-4 text-harvest-400" />
                <span>{isMr ? "हिशोब कसा केला? (पारदर्शक सूत्रे पहा)" : "Show Calculation Formulae"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-solid-secondary flex-1 h-13 flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isMr ? "मागील पायरी" : "Previous Step"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/planner")}
              className="btn-solid-secondary flex-1 h-13 flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <X className="w-4 h-4" />
              <span>{isMr ? "रद्द करा" : "Cancel"}</span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                setStep(step + 1);
                playChime();
              }}
              className="btn-solid-primary flex-1 h-13 flex items-center justify-center gap-1.5 text-xs font-bold shadow-card"
            >
              <span>{isMr ? "पुढील पायरी" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitPlan}
              disabled={loading}
              className="btn-solid-primary flex-1 h-13 flex items-center justify-center gap-2 text-xs font-bold shadow-card"
            >
              {loading ? (
                <span>{isMr ? "नियोजन तयार करत आहे..." : "Creating Plan..."}</span>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>{isMr ? "पीक नियोजन तयार करा" : "Generate Full Plan"}</span>
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
        cropName={isMr ? activeCrop.nameMr : activeCrop.nameEn}
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
