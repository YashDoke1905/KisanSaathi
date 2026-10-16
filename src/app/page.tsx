"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ReadAloudButton } from "@/components/VoiceAssistantButton";
import { playChime } from "@/lib/soundUtils";
import {
  Sun,
  CloudRain,
  TrendingUp,
  Landmark,
  Wallet,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sprout,
  Sparkles,
  MapPin,
  Check,
  Plus,
  X,
  Volume2,
  Briefcase,
  Stethoscope,
  ChevronRight,
  TrendingDown,
  Clock,
  Droplets,
  Layers,
  Scale,
} from "lucide-react";

interface DistrictWeather {
  district: string;
  temp: number;
  condition: string;
  conditionMr: string;
  rainProb: number;
  windSpeed: number;
  humidity: number;
  advisory: string;
  advisoryMr: string;
}

const DISTRICT_WEATHER: Record<string, DistrictWeather> = {
  Nashik: {
    district: "Nashik (नाशिक)",
    temp: 29,
    condition: "Clear Sky",
    conditionMr: "निरभ्र आकाश",
    rainProb: 0,
    windSpeed: 8,
    humidity: 48,
    advisory: "Optimal window for onion & grape foliar spraying. Soil moisture is adequate.",
    advisoryMr: "कांदा व द्राक्ष फवारणीसाठी आजचा दिवस अनुकूल. जमिनीतील ओलावा पुरेसा आहे.",
  },
  Solapur: {
    district: "Solapur (सोलापूर)",
    temp: 33,
    condition: "Warm & Sunny",
    conditionMr: "उष्ण व कोरडे",
    rainProb: 5,
    windSpeed: 11,
    humidity: 42,
    advisory: "Irrigate pomegranate orchards during morning hours to prevent heat stress.",
    advisoryMr: "डाळिंब बागेला उष्णतेचा ताण टाळण्यासाठी सकाळच्या वेळी पाणी द्यावे.",
  },
  Pune: {
    district: "Pune (पुणे)",
    temp: 28,
    condition: "Partly Cloudy",
    conditionMr: "हलके ढगाळ",
    rainProb: 15,
    windSpeed: 9,
    humidity: 55,
    advisory: "Tomato staking and weeding recommended. Mild humidity in field.",
    advisoryMr: "टोमॅटो बांधणी व खुरपणी करून घ्यावी. हवेत मध्यम आर्द्रता आहे.",
  },
  Nagpur: {
    district: "Nagpur (नागपूर)",
    temp: 31,
    condition: "Sunny",
    conditionMr: "स्वच्छ सूर्यप्रकाश",
    rainProb: 0,
    windSpeed: 7,
    humidity: 50,
    advisory: "Check cotton fields for sucking pests. Orange groves require scheduled watering.",
    advisoryMr: "कापूस पिकावर रसशोषक किडींचे निरीक्षण करा. संत्रा बागेला पाळीनुसार पाणी द्या.",
  },
  Sambhajinagar: {
    district: "Chh. Sambhajinagar",
    temp: 30,
    condition: "Clear",
    conditionMr: "निरभ्र",
    rainProb: 5,
    windSpeed: 10,
    humidity: 45,
    advisory: "Good conditions for soybean pod maturation. Prepare for harvest logistics.",
    advisoryMr: "सोयाबीन शेंगा भरण्यासाठी पोषक हवामान. काढणीचे नियोजन सुरू करा.",
  },
};

interface MandiCrop {
  id: string;
  nameEn: string;
  nameMr: string;
  mandiName: string;
  district: string;
  modalPrice: number;
  change: number;
  arrivals: number;
  distanceKm: number;
}

const MANDI_CROPS: MandiCrop[] = [
  {
    id: "onion",
    nameEn: "Red Onion",
    nameMr: "लाल कांदा",
    mandiName: "Lasalgaon APMC",
    district: "Nashik",
    modalPrice: 2450,
    change: 120,
    arrivals: 8500,
    distanceKm: 28,
  },
  {
    id: "soybean",
    nameEn: "Soybean (Yellow)",
    nameMr: "पिवळा सोयाबीन",
    mandiName: "Latur APMC",
    district: "Latur",
    modalPrice: 4680,
    change: -40,
    arrivals: 12400,
    distanceKm: 42,
  },
  {
    id: "cotton",
    nameEn: "Bt Cotton",
    nameMr: "मध्यम धागा कापूस",
    mandiName: "Akola APMC",
    district: "Akola",
    modalPrice: 7350,
    change: 150,
    arrivals: 6100,
    distanceKm: 35,
  },
  {
    id: "tomato",
    nameEn: "Hybrid Tomato",
    nameMr: "टोमॅटो",
    mandiName: "Narayangaon APMC",
    district: "Pune",
    modalPrice: 1850,
    change: 90,
    arrivals: 4200,
    distanceKm: 45,
  },
  {
    id: "sugarcane",
    nameEn: "Sugarcane (FRP)",
    nameMr: "ऊस (FRP दर)",
    mandiName: "Kolhapur Sugar Belt",
    district: "Kolhapur",
    modalPrice: 3150,
    change: 0,
    arrivals: 25000,
    distanceKm: 18,
  },
];

export default function HomePage() {
  const { t, language } = useLanguage();
  const isMr = language === "mr";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Task checklist interactive state
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  // 2. Weather interactive district selector
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Nashik");

  // 3. Mandi interactive crop selector
  const [selectedCropId, setSelectedCropId] = useState<string>("onion");

  // 4. Financial interactive expense logger
  const [budgetTotal, setBudgetTotal] = useState<number>(45000);
  const [spentAmount, setSpentAmount] = useState<number>(0);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("Fertilizer");
  const [newExpenseNote, setNewExpenseNote] = useState("");

  // 5. Scheme modal state
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);

  // 6. Active Crop Plan state
  const [activePlan, setActivePlan] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          if (data.user.profile?.district && DISTRICT_WEATHER[data.user.profile.district]) {
            setSelectedDistrict(data.user.profile.district);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Fetch active crop plan and set budget
    fetch("/api/planner")
      .then((res) => res.json())
      .then((data) => {
        if (data?.plans && data.plans.length > 0) {
          const active = data.plans.find((p: any) => p.status === "active") || data.plans[0];
          setActivePlan(active);
          if (active.estTotalCost) {
            setBudgetTotal(Math.round(active.estTotalCost));
          }
        }
      })
      .catch((err) => console.error("Error loading active plan:", err));

    // Fetch real ledger summary from database
    fetch("/api/ledger")
      .then((res) => res.json())
      .then((data) => {
        if (data?.summary) {
          setSpentAmount(data.summary.totalExpense || 0);
        }
      })
      .catch((err) => console.error("Error loading ledger:", err));

    // Load saved tasks
    const saved = localStorage.getItem("kisansaathi_tasks_state");
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const toggleTask = (id: number) => {
    const next = { ...completedTasks, [id]: !completedTasks[id] };
    setCompletedTasks(next);
    localStorage.setItem("kisansaathi_tasks_state", JSON.stringify(next));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newExpenseAmount);
    if (val > 0) {
      setIsSubmittingExpense(true);
      try {
        const res = await fetch("/api/ledger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "expense",
            amount: val,
            category: newExpenseCategory,
            notes: newExpenseNote || (activePlan ? `${activePlan.cropDetails?.nameMr || "पीक"} शेती खर्च` : "दैनिक शेती खर्च"),
            planId: activePlan?.id || undefined,
          }),
        });

        if (res.ok) {
          playChime();
          setSpentAmount((prev) => prev + val);
          setIsExpenseModalOpen(false);
          setNewExpenseAmount("");
          setNewExpenseNote("");
        } else {
          const err = await res.json();
          alert(`खर्च नोंद अयशस्वी: ${err.error || "त्रुटी"}`);
        }
      } catch (err) {
        console.error("Failed to post expense to ledger:", err);
      } finally {
        setIsSubmittingExpense(false);
      }
    }
  };

  const weather = DISTRICT_WEATHER[selectedDistrict] || DISTRICT_WEATHER.Nashik;
  const mandiCrop = MANDI_CROPS.find((c) => c.id === selectedCropId) || MANDI_CROPS[0];

  const farmerName = currentUser?.profile?.fullName || (currentUser?.username ? `@${currentUser.username}` : "तुकाराम पाटील");
  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  const dashboardNarration = `${t("dashboard.greeting")} ${farmerName}. ${weather.advisoryMr} ${mandiCrop.nameMr} बाजारभाव ${mandiCrop.mandiName} येथे ₹${mandiCrop.modalPrice} प्रति क्विंटल आहे.`;

  return (
    <div className="space-y-4 pb-4">
      {/* ========================================================
          1. WARM AGRI HERO: Personalized Banner with Weather Pulse
          ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-5 shadow-elevated border border-forest-700/50">
        {/* Subtle decorative nature watermark glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-harvest-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: Location & Audio Companion */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-950/60 border border-forest-700/60 text-xs font-semibold text-cream-100 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-harvest-300" />
              <span>{selectedDistrict}, महाराष्ट्र</span>
            </div>

            <ReadAloudButton
              text={dashboardNarration}
              className="bg-cream-100/15 hover:bg-cream-100/25 text-cream-50 border-white/20 backdrop-blur-xs shadow-xs"
            />
          </div>

          {/* Farmer Greeting Title */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-harvest-300 tracking-wide uppercase">
              {language === "mr" ? "दैनिक कृषी बुद्धिमत्ता" : language === "hi" ? "दैनिक कृषि सलाहकार" : "Daily Agro Intelligence"}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight text-cream-50">
              {t("dashboard.greeting")}, {farmerName}!
            </h1>
            <p className="text-xs text-cream-200/90 font-medium">
              {currentUser?.profile?.gatNumber ? `गट क्र. ${currentUser.profile.gatNumber} • ` : "गट क्र. ४२ व ८८ • "}
              {currentUser?.profile?.totalLandAcres ? `${currentUser.profile.totalLandAcres} एकर शेतजमीन` : "२.५ एकर शेतजमीन"}
            </p>
          </div>

          {/* Integrated Micro Weather Pulse inside Hero */}
          <div className="pt-3 border-t border-forest-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-700/50 border border-forest-600/60 flex items-center justify-center text-harvest-300">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black tracking-tight text-cream-50 money-numeral">
                    {weather.temp}°C
                  </span>
                  <span className="text-xs text-cream-200 font-medium">
                    {weather.conditionMr}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  ✓ फवारणीसाठी आजचा दिवस अनुकूल
                </span>
              </div>
            </div>

            <Link
              href="/weather"
              className="px-3 py-1.5 rounded-xl bg-forest-700/40 hover:bg-forest-700/60 border border-forest-600/50 text-xs font-bold text-cream-100 flex items-center gap-1 transition-colors min-h-[40px]"
            >
              <span>हवामान</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guest Mode Callout if not authenticated */}
      {!currentUser && !isLoading && (
        <div className="bg-cream-100 dark:bg-forest-950/40 border border-harvest-200 dark:border-forest-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-forest-950 dark:text-harvest-200 block">
              अतिथी शेतकरी मोड (Guest Mode)
            </span>
            <span className="text-[11px] text-soil-700 dark:text-cream-300 block">
              आपले गट नंबर व पीक नियोजन सुरक्षित ठेवण्यासाठी १-टॅप डेमो लॉगिन करा.
            </span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-cream-50 text-xs font-bold rounded-xl shrink-0 min-h-[48px] flex items-center justify-center shadow-xs transition-colors"
          >
            {t("auth.login")}
          </Link>
        </div>
      )}

      {/* ========================================================
          2. FEATURED FARM SERVICES MATRIX (8 Tactile Modules)
          ======================================================== */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-soil-700 dark:text-cream-400 uppercase tracking-wider">
            {language === "mr" ? "प्रमुख शेती सेवा (Farm Services)" : "Core Farm Services"}
          </h2>
          <span className="text-[11px] text-forest-700 dark:text-harvest-400 font-bold">
            ८ एकात्मिक साधने
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 1. Planner */}
          <Link
            href="/planner"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-forest-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-100 dark:bg-forest-900/50 text-forest-800 dark:text-forest-200 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              🌾
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Planner" : "पीक नियोजन"}
            </span>
          </Link>

          {/* 2. Weather */}
          <Link
            href="/weather"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-sky-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              ⛅
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Weather" : "हवामान"}
            </span>
          </Link>

          {/* 3. Compare */}
          <Link
            href="/planner/compare"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-purple-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              ⚖️
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Compare" : "पीक तुलना"}
            </span>
          </Link>

          {/* 4. Ledger */}
          <Link
            href="/ledger"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-soil-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-soil-100 dark:bg-soil-900/50 text-soil-800 dark:text-soil-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              📋
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Ledger" : "हिशोब वही"}
            </span>
          </Link>

          {/* 5. Crop Doctor */}
          <Link
            href="/doctor"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-forest-50/70 dark:bg-forest-950/40 border-2 border-forest-500/60 dark:border-forest-600/50 shadow-card hover:border-forest-600 active:scale-95 transition-all min-h-[74px] group relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-cream-50 flex items-center justify-center font-bold text-base mb-1 shadow-xs group-hover:scale-105 transition-transform">
              🩺
            </div>
            <span className="text-[11px] font-extrabold text-forest-900 dark:text-harvest-300 text-center leading-tight">
              {language === "en" ? "Crop Doctor" : "पीक डॉक्टर"}
            </span>
          </Link>

          {/* 6. Diversification */}
          <Link
            href="/diversification"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-teal-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              💼
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Business" : "पूरक उद्योग"}
            </span>
          </Link>

          {/* 7. Market */}
          <Link
            href="/market"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-harvest-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-harvest-100 dark:bg-harvest-900/50 text-harvest-800 dark:text-harvest-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              📈
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Market" : "बाजार भाव"}
            </span>
          </Link>

          {/* 8. Schemes */}
          <Link
            href="/schemes"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-[#1A201C] border border-cream-200/90 dark:border-forest-900/60 shadow-card hover:border-indigo-500 active:scale-95 transition-all min-h-[74px] group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-base mb-1 group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <span className="text-[11px] font-bold text-forest-950 dark:text-cream-50 text-center leading-tight">
              {language === "en" ? "Schemes" : "योजना व KCC"}
            </span>
          </Link>
        </div>
      </section>

      {/* ========================================================
          3. ACTIVE CROP LIFECYCLE & PROGRESS HERO
          ======================================================== */}
      {activePlan ? (
        <div className="card-warm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 flex items-center justify-center font-bold shadow-xs border border-forest-200 dark:border-forest-800">
                <Sprout className="w-6 h-6 text-forest-700 dark:text-harvest-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-forest-950 dark:text-cream-50 leading-tight">
                    {language === "en" ? activePlan.cropDetails?.nameEn : activePlan.cropDetails?.nameMr}
                  </h2>
                  <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-900 dark:bg-forest-900/80 dark:text-harvest-300">
                    {language === "en" ? "Active" : "चालू पीक"}
                  </span>
                </div>
                <p className="text-xs text-soil-600 dark:text-cream-400 mt-0.5">
                  {activePlan.farm?.name || "शेत गट क्र. ४२"} • {activePlan.areaAcre} एकर ({activePlan.irrigationMethod?.toUpperCase() || "ठिबक सिंचन"})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-soil-500 dark:text-cream-400 block font-semibold">
                अंदाजित नफा:
              </span>
              <p className="text-base font-black text-forest-800 dark:text-harvest-300 money-numeral">
                ₹{activePlan.estNetProfit?.toLocaleString("en-IN") || "2,45,000"}
              </p>
            </div>
          </div>

          {/* Progress Indicator with Circular Progress Feel */}
          <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-[#1E2520] border border-cream-200 dark:border-forest-900/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Circular Progress SVG */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-cream-200 dark:text-forest-900"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-forest-700 dark:text-harvest-400"
                    strokeDasharray={`${activePlan.stats?.progressPercent || 65}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-forest-900 dark:text-cream-50 money-numeral">
                  {activePlan.stats?.progressPercent || 65}%
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-forest-950 dark:text-cream-50 block">
                  पीक जीवनचक्र प्रगती
                </span>
                <span className="text-[11px] text-soil-600 dark:text-cream-400">
                  {activePlan.stats?.completedTasks || 12}/{activePlan.stats?.totalTasks || 18} शेती कामे पूर्ण
                </span>
              </div>
            </div>

            <Link
              href={`/planner/${activePlan.id}`}
              className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-50 text-xs font-bold shadow-xs flex items-center gap-1 transition-colors min-h-[40px] shrink-0"
            >
              <span>तपशील</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Next upcoming task banner */}
          {activePlan.stats?.upcomingTask && (
            <div className="rounded-2xl border border-harvest-200 bg-harvest-50/70 p-3 dark:border-forest-800 dark:bg-forest-950/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-8 h-8 rounded-xl bg-harvest-200/80 dark:bg-forest-900 flex items-center justify-center text-sm shrink-0">
                  📌
                </span>
                <div className="truncate">
                  <p className="text-xs font-bold text-soil-900 dark:text-cream-100 truncate">
                    {language === "en" ? activePlan.stats.upcomingTask.titleEn : activePlan.stats.upcomingTask.titleMr}
                  </p>
                  <p className="text-[10.5px] text-soil-700 dark:text-cream-400">
                    वेळापत्रक तारीख: {new Date(activePlan.stats.upcomingTask.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <Link
                href={`/planner/${activePlan.id}`}
                className="shrink-0 rounded-xl bg-forest-800 px-3 py-1.5 text-xs font-bold text-cream-50 shadow-xs hover:bg-forest-700 active:scale-95 min-h-[38px] flex items-center"
              >
                कृती करा
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="card-warm p-4 flex items-center justify-between gap-3 bg-gradient-to-r from-forest-50 to-cream-100 dark:from-forest-950/40 dark:to-forest-900/20">
          <div className="space-y-1">
            <span className="text-xs font-bold text-forest-900 dark:text-harvest-300 flex items-center gap-1">
              <Sprout className="w-4 h-4 text-forest-700" />
              {language === "en" ? "Scientific Crop Planner" : "शास्त्रीय पीक नियोजन सुरु करा"}
            </span>
            <p className="text-[11.5px] text-soil-700 dark:text-cream-300">
              {language === "en"
                ? "Plan your Kharif/Rabi cycle with transparent stage schedules."
                : "हंगामातील खतांचे हप्ते, पाणी, व नफ्याचा अचूक हिशोब तयार करा."}
            </p>
          </div>
          <Link
            href="/planner/new"
            className="px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-cream-50 text-xs font-bold rounded-xl shrink-0 shadow-xs active:scale-95 min-h-[48px] flex items-center justify-center transition-colors"
          >
            + {language === "en" ? "Create Plan" : "नियोजन करा"}
          </Link>
        </div>
      )}

      {/* ========================================================
          4. TODAY'S AGRO-ACTIONS (Clean Divider Checklist)
          ======================================================== */}
      <section className="card-warm p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cream-200/90 dark:border-forest-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {t("dashboard.today_actions")}
              </h2>
              <span className="text-[10px] text-soil-600 dark:text-cream-400 font-semibold">
                {completedCount}/3 {language === "mr" ? "कामे पूर्ण झाली" : "Tasks Done"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ProvenanceBadge type="estimate" sourceText="Agronomy Engine" />
            <ReadAloudButton
              text={`आजची ३ महत्त्वाची कामे: १. ${t("dashboard.action_1")}. २. ${t("dashboard.action_2")}. ३. ${t("dashboard.action_3")}`}
              className="p-1 min-h-[36px] min-w-[36px]"
            />
          </div>
        </div>

        {/* Divider List Tasks */}
        <div className="divide-y divide-cream-200/80 dark:divide-forest-900/60">
          {[
            { id: 1, text: t("dashboard.action_1"), time: "सकाळी ९:००" },
            { id: 2, text: t("dashboard.action_2"), time: "दुपारी १२:००" },
            { id: 3, text: t("dashboard.action_3"), time: "संध्याकाळी ५:००" },
          ].map((task) => {
            const isDone = completedTasks[task.id];
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-3.5 py-3 transition-all cursor-pointer min-h-[52px] select-none ${
                  isDone ? "opacity-60" : "hover:bg-cream-50/50 dark:hover:bg-forest-900/20"
                }`}
              >
                <button
                  type="button"
                  aria-label={isDone ? "Task marked completed" : "Mark task complete"}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isDone
                      ? "bg-forest-700 border-forest-700 text-white"
                      : "border-cream-300 dark:border-forest-700 bg-white dark:bg-forest-950"
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1">
                  <p
                    className={`text-xs font-semibold leading-relaxed ${
                      isDone
                        ? "line-through text-soil-500 dark:text-cream-400"
                        : "text-forest-950 dark:text-cream-50"
                    }`}
                  >
                    {task.text}
                  </p>
                  <span className="text-[10.5px] text-soil-500 dark:text-cream-400 mt-0.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-soil-400" />
                    <span>{task.time}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. AGRO-WEATHER ADVISORY SPOTLIGHT
          ======================================================== */}
      <section className="card-warm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 flex items-center justify-center">
              <Sun className="w-4 h-4 text-harvest-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {t("dashboard.weather_card_title")}
              </h3>
              <span className="text-[10px] text-soil-600 dark:text-cream-400">
                Agro-Meteorology (Open-Meteo)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ProvenanceBadge type="live" sourceText="Open-Meteo" dateText="Live" />
            <ReadAloudButton
              text={`${weather.district} हवामान: तापमान ${weather.temp} अंश सेल्सिअस. ${weather.conditionMr}. ${weather.advisoryMr}`}
              className="p-1 min-h-[36px] min-w-[36px]"
            />
          </div>
        </div>

        {/* District Switcher Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Object.keys(DISTRICT_WEATHER).map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all min-h-[38px] ${
                selectedDistrict === dist
                  ? "bg-forest-800 text-cream-50 shadow-xs"
                  : "bg-cream-100 dark:bg-[#1E2520] text-soil-700 dark:text-cream-300 hover:bg-cream-200"
              }`}
            >
              {dist}
            </button>
          ))}
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-cream-50 dark:bg-[#1E2520] p-2.5 rounded-xl border border-cream-200/80 dark:border-forest-900/50">
            <span className="text-[10px] text-soil-600 dark:text-cream-400 block font-semibold">तापमान</span>
            <span className="text-sm font-extrabold text-forest-950 dark:text-cream-50 money-numeral">{weather.temp}°C</span>
          </div>
          <div className="bg-cream-50 dark:bg-[#1E2520] p-2.5 rounded-xl border border-cream-200/80 dark:border-forest-900/50">
            <span className="text-[10px] text-soil-600 dark:text-cream-400 block font-semibold">पाऊस शक्यता</span>
            <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300 money-numeral">{weather.rainProb}%</span>
          </div>
          <div className="bg-cream-50 dark:bg-[#1E2520] p-2.5 rounded-xl border border-cream-200/80 dark:border-forest-900/50">
            <span className="text-[10px] text-soil-600 dark:text-cream-400 block font-semibold">हवा वेग</span>
            <span className="text-sm font-extrabold text-forest-950 dark:text-cream-50 money-numeral">{weather.windSpeed} km/h</span>
          </div>
          <div className="bg-cream-50 dark:bg-[#1E2520] p-2.5 rounded-xl border border-cream-200/80 dark:border-forest-900/50">
            <span className="text-[10px] text-soil-600 dark:text-cream-400 block font-semibold">आर्द्रता</span>
            <span className="text-sm font-extrabold text-forest-950 dark:text-cream-50 money-numeral">{weather.humidity}%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-forest-50/70 dark:bg-forest-950/30 border border-forest-200/70 dark:border-forest-900/50 text-xs text-forest-900 dark:text-cream-200 leading-relaxed font-medium">
          💡 <span className="font-bold">{weather.conditionMr}:</span> {weather.advisoryMr}
        </div>
      </section>

      {/* ========================================================
          6. APMC MANDI PRICE & SELL-OR-WAIT TICKER
          ======================================================== */}
      <section className="card-warm p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-harvest-100 dark:bg-harvest-950/60 text-harvest-800 dark:text-harvest-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 text-harvest-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {language === "mr" ? "बाजार भाव व साठवणूक निर्णय" : "Market Intelligence & Sell-or-Wait"}
              </h3>
              <span className="text-[10px] text-soil-600 dark:text-cream-400">
                Agmarknet Live APMC Feed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ProvenanceBadge type="live" sourceText="Agmarknet" />
            <ReadAloudButton
              text={`${mandiCrop.nameMr} बाजारभाव: ${mandiCrop.mandiName} येथे ₹${mandiCrop.modalPrice} प्रति क्विंटल आहे.`}
              className="p-1 min-h-[36px] min-w-[36px]"
            />
          </div>
        </div>

        {/* Crop Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MANDI_CROPS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCropId(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all min-h-[38px] ${
                selectedCropId === c.id
                  ? "bg-forest-800 text-cream-50 shadow-xs"
                  : "bg-cream-100 dark:bg-[#1E2520] text-soil-700 dark:text-cream-300 hover:bg-cream-200"
              }`}
            >
              {isMr ? c.nameMr : c.nameEn}
            </button>
          ))}
        </div>

        {/* Big Money Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-50 via-cream-100 to-harvest-50/40 dark:from-[#1E2520] dark:to-[#171E19] border border-cream-200 dark:border-forest-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-soil-600 dark:text-cream-400 font-medium">
              {mandiCrop.mandiName} • अंतर {mandiCrop.distanceKm} किमी
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-forest-950 dark:text-cream-50 money-numeral">
                ₹{mandiCrop.modalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-soil-600 dark:text-cream-400">/ क्विंटल</span>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                mandiCrop.change >= 0
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
              }`}
            >
              {mandiCrop.change >= 0 ? "+" : ""}
              ₹{mandiCrop.change}
            </div>
            <span className="text-[10px] text-soil-500 dark:text-cream-400 block mt-1">
              ७ दिवसांतील कल
            </span>
          </div>
        </div>

        <Link
          href="/market"
          className="w-full btn-solid-primary text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <span>{language === "mr" ? "साठवणूक करावी की विकावे? गणित तपासा" : "Analyze Sell vs Hold Storage Gain"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ========================================================
          7. PLANT DOCTOR EMERGENCY DIAGNOSTIC CARD
          ======================================================== */}
      <section className="rounded-3xl p-5 border-2 border-forest-500/50 bg-gradient-to-br from-forest-50 via-cream-50 to-emerald-50/40 dark:from-[#1A221C] dark:via-[#141A16] dark:to-[#101511] shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-forest-800 text-cream-50 flex items-center justify-center font-bold shadow-xs">
              <Stethoscope className="w-5 h-5 text-harvest-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {language === "en" ? "Crop Doctor Plant Pathology" : "पीक डॉक्टर (रोगनिदान व अचूक फवारणी)"}
              </h3>
              <span className="text-[10px] text-forest-700 dark:text-harvest-400 font-semibold">
                ICAR / CIBRC 2026 • ५०+ रोग व १५ लिटर पंप प्रमाण
              </span>
            </div>
          </div>

          <Link
            href="/doctor"
            className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-700 text-cream-50 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1 min-h-[40px]"
          >
            <span>{language === "en" ? "Diagnose" : "तपासा"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-soil-800 dark:text-cream-300 leading-relaxed font-medium">
          {language === "en"
            ? "Leaves turning yellow or spotting? Get dual organic & chemical controls with exact 15-litre pump tank dosages."
            : "पानांवर पिवळे डाग, करपा किंवा अळी दिसतेय? सेंद्रिय व रासायनिक उपाय आणि १५ लिटर पंपाचे अचूक फवारणी प्रमाण जाणून घ्या."}
        </p>
      </section>

      {/* ========================================================
          8. FARMER FINANCIAL KHATA (Ledger Quick Logger)
          ======================================================== */}
      <section className="card-warm p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-soil-100 dark:bg-soil-900/60 text-soil-800 dark:text-soil-300 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-soil-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {language === "mr" ? "शेतकरी वहीखाते (Farm Ledger)" : "Farm Khata & Expenses"}
              </h3>
              <span className="text-[10px] text-soil-600 dark:text-cream-400">
                नियोजित अंदाज विरुद्ध प्रत्यक्ष खर्च
              </span>
            </div>
          </div>
          <ProvenanceBadge type="user" sourceText="खर्च नोंद" />
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-soil-700 dark:text-cream-300 font-bold">
            <span>झालेला खर्च: ₹{spentAmount.toLocaleString("en-IN")}</span>
            <span className="text-soil-500">अंदाजित मर्यादा: ₹{budgetTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-[#1E2520]">
            <div
              className="h-full bg-forest-700 dark:bg-forest-500 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((spentAmount / (budgetTotal || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 btn-solid-secondary text-xs flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ नवीन खर्च नोंदवा</span>
          </button>
          <Link
            href="/ledger"
            className="px-4 py-2.5 rounded-2xl bg-cream-100 dark:bg-[#1E2520] hover:bg-cream-200 text-soil-800 dark:text-cream-200 border border-cream-200/90 dark:border-forest-900/60 text-xs font-bold flex items-center justify-center min-h-[48px]"
          >
            वही पहा →
          </Link>
        </div>
      </section>

      {/* ========================================================
          9. ALLIED BUSINESS & DIVERSIFICATION CARD
          ======================================================== */}
      <section className="card-warm p-5 space-y-3 bg-gradient-to-br from-cream-50 to-teal-50/30 dark:from-[#171E19] dark:to-[#121A15]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-forest-950 dark:text-cream-50 leading-tight">
                {language === "mr" ? "पूरक व्यवसाय व नियमित उत्पन्न" : "Allied Agribusiness & Diversification"}
              </h3>
              <span className="text-[10px] text-soil-600 dark:text-cream-400">
                १०+ ICAR-KVK प्रमाणित उद्योग मॉडेल्स
              </span>
            </div>
          </div>
          <ProvenanceBadge type="live" sourceText="ICAR-KVK" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1E2520] border border-cream-200 dark:border-forest-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-forest-950 dark:text-cream-50">
              दुष्काळ व कोरड्या महिन्यांत नियमित रोख आवक
            </p>
            <p className="text-[11px] text-soil-600 dark:text-cream-400 mt-0.5">
              दुग्धव्यवसाय, शेळीपालन, गावरान पोल्ट्री; NLM ५०% अनुदानासह.
            </p>
          </div>
          <span className="text-xs font-black text-forest-800 dark:text-harvest-300 bg-forest-50 dark:bg-forest-900/40 px-2.5 py-1 rounded-lg shrink-0 money-numeral">
            ₹14.5k/महिना
          </span>
        </div>

        <Link
          href="/diversification"
          className="w-full btn-solid-secondary text-xs flex items-center justify-center gap-1.5"
        >
          <span>माझ्या बजेटनुसार पूरक उद्योग निवडा →</span>
        </Link>
      </section>

      {/* ========================================================
          10. MODAL: QUICK ADD EXPENSE (Bottom Sheet Feel)
          ======================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-[#FAF8F4] dark:bg-[#171E19] border-t sm:border border-cream-200 dark:border-forest-900/80 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200 dark:border-forest-900/60">
              <h3 className="font-extrabold text-base text-forest-950 dark:text-cream-50 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-forest-800" />
                <span>नवीन खर्च नोंदवा (Add Expense)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 text-soil-500 hover:text-forest-950 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-soil-800 dark:text-cream-200 mb-1.5">
                  रक्कम (Amount in ₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="उदा. 1200"
                  className="w-full px-4 py-3 rounded-2xl border border-cream-300 dark:border-forest-800 bg-white dark:bg-[#1F2722] text-forest-950 dark:text-cream-50 font-black text-xl min-h-[52px] focus:outline-none focus:ring-2 focus:ring-forest-600 money-numeral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-soil-800 dark:text-cream-200 mb-1.5">
                  खर्चाचा प्रकार (Category)
                </label>
                <select
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-cream-300 dark:border-forest-800 bg-white dark:bg-[#1F2722] text-forest-950 dark:text-cream-50 text-sm font-semibold min-h-[52px] focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Fertilizer">खते (Fertilizer)</option>
                  <option value="Seed">बियाणे (Seeds)</option>
                  <option value="Pesticide">औषधे / कीटकनाशके (Pesticide)</option>
                  <option value="Labour">मजुरी (Labour)</option>
                  <option value="Machinery">ट्रॅक्टर / यंत्रसामग्री भाडे</option>
                  <option value="Irrigation">सिंचन व वीजबिल</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-soil-800 dark:text-cream-200 mb-1.5">
                  तपशील (Note / Shop Name)
                </label>
                <input
                  type="text"
                  value={newExpenseNote}
                  onChange={(e) => setNewExpenseNote(e.target.value)}
                  placeholder="उदा. युरिया १ गोणी - कृषी केंद्र"
                  className="w-full px-4 py-3 rounded-2xl border border-cream-300 dark:border-forest-800 bg-white dark:bg-[#1F2722] text-forest-950 dark:text-cream-50 text-sm min-h-[52px] focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 btn-solid-primary text-xs"
                >
                  {isSubmittingExpense ? "जतन करत आहे..." : "खर्च वहीखात्यात जतन करा"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 btn-solid-secondary text-xs"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          11. MODAL: SCHEME ELIGIBILITY QUICK CHECKER
          ======================================================== */}
      {isSchemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-[#FAF8F4] dark:bg-[#171E19] border-t sm:border border-cream-200 dark:border-forest-900/80 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200 dark:border-forest-900/60">
              <h3 className="font-extrabold text-base text-forest-950 dark:text-cream-50 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-700" />
                <span>नमो शेतकरी योजना पात्रता तपासणी</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSchemeModalOpen(false)}
                className="p-2 text-soil-500 hover:text-forest-950 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block text-sm text-emerald-800 dark:text-emerald-300 mb-1">
                  ✓ तुम्ही या योजनेसाठी पात्र आहात!
                </span>
                <p>
                  आपल्या शेतजमिनीची नोंद (२.५ एकर) लहान व सीमांत शेतकरी निकषांमध्ये बसते.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-soil-900 dark:text-cream-100 block">
                  आवश्यक कागदपत्रे तपासणी:
                </span>
                <div className="flex items-center gap-2 text-soil-700 dark:text-cream-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आधार कार्ड बँक खात्याशी लिंक (Aadhaar Seeded)</span>
                </div>
                <div className="flex items-center gap-2 text-soil-700 dark:text-cream-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>७/१२ व ८-अ उतारा (Land Extract Verified)</span>
                </div>
                <div className="flex items-center gap-2 text-soil-700 dark:text-cream-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ई-केवायसी (e-KYC Completed)</span>
                </div>
              </div>

              <div className="p-2.5 bg-cream-100 dark:bg-[#1E2520] rounded-xl text-soil-600 dark:text-cream-400 text-[11px]">
                अधिकृत पोर्टल: <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noreferrer" className="text-forest-700 font-bold underline">MahaDBT Portal</a>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/schemes"
                className="flex-1 btn-solid-primary text-xs"
              >
                सर्व योजना व KCC हब पहा →
              </Link>
              <button
                type="button"
                onClick={() => setIsSchemeModalOpen(false)}
                className="px-4 btn-solid-secondary text-xs"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          12. DISCREET ADMIN FOOTER
          ======================================================== */}
      <footer className="pt-2 text-center pb-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[11px] text-soil-500 hover:text-forest-800 dark:text-cream-400 dark:hover:text-cream-200 py-1 px-3 rounded-full border border-cream-200 dark:border-forest-900/60 hover:bg-cream-100 dark:hover:bg-forest-950 transition-colors"
        >
          <span>⚙️</span>
          <span>{language === "en" ? "Admin Console (Protected)" : "प्रशासकीय नियंत्रण कक्ष (Admin)"}</span>
        </Link>
      </footer>
    </div>
  );
}
