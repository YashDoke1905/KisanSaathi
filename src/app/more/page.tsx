"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { useTheme } from "@/lib/themeContext";
import { UnitConverterModal } from "@/components/UnitConverterModal";
import {
  User,
  Globe,
  Moon,
  Sun,
  LogOut,
  Calculator,
  Shield,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Sprout,
  Landmark,
  Briefcase,
  Stethoscope,
  ShieldCheck,
  Scale,
  MapPin,
  Calendar,
} from "lucide-react";

export default function MorePage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const isMr = language === "mr";

  const [user, setUser] = useState<any>(null);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100">
            {t("nav.more")} & {isMr ? "खाते माहिती" : "Account"}
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            {isMr ? "वैयक्तिक सेटिंग्ज, शेती साधने व सर्व सेवा" : "Settings, utilities & all agronomy engines"}
          </p>
        </div>
      </div>

      {/* User / Farmer Account Profile Card */}
      {user ? (
        <div className="card-warm p-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-black text-xl shadow-elevated border border-forest-700/50">
                {user.profile?.fullName?.[0] || user.username?.[0]?.toUpperCase() || "श"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {user.profile?.fullName || user.username}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-950/70 text-forest-800 dark:text-forest-300">
                    {isMr ? "नोंदणीकृत शेतकरी" : "Verified Farmer"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                  <span>{user.phone ? `+91 ${user.phone}` : `@${user.username}`}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {user.profile?.district || "Maharashtra"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={t("auth.logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="card-warm p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {isMr ? "अतिथी शेतकरी (Guest)" : "Guest Farmer"}
              </h2>
              <p className="text-xs text-stone-500">
                {isMr ? "शेती गट, पीक नियोजन व वही जतन करण्यासाठी लॉगिन करा" : "Login to save farm profiles & crop ledgers"}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-card hover:bg-forest-900 transition-all min-h-[44px] flex items-center justify-center"
          >
            {t("auth.login")}
          </Link>
        </div>
      )}

      {/* Group 1: Preferences (Language & Theme) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
          {isMr ? "प्राधान्ये व भाषा" : "Preferences"}
        </span>
        <div className="card-warm divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
          {/* Language Selection */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Language / भाषा
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "mr" ? "मराठी निवडलेली आहे" : language === "hi" ? "हिंदी चुनी गई है" : "English selected"}
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 bg-stone-100 dark:bg-stone-800/70 p-1 rounded-xl">
              {(["mr", "hi", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                    language === l
                      ? "bg-forest-800 text-white shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  {l === "mr" ? "मराठी" : l === "hi" ? "हिंदी" : "EN"}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Display Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-soil-50 dark:bg-soil-950/60 text-soil-700 dark:text-soil-300 flex items-center justify-center">
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-stone-700" />
                ) : (
                  <Sun className="w-5 h-5 text-harvest-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "स्क्रीन डिस्प्ले (थीम)" : "Theme Display"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {theme === "light"
                    ? (isMr ? "दिवसाचा उजेड मोड (Daylight contrast)" : "Light mode (Daylight contrast)")
                    : (isMr ? "रात्रीचा मोड (Night viewing)" : "Dark mode (Night viewing)")}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {theme === "light" ? (isMr ? "दिवस" : "Light") : (isMr ? "रात्र" : "Dark")}
            </span>
          </button>
        </div>
      </div>

      {/* Group 2: Farm Utilities */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
          {isMr ? "शेती उपयुक्त साधने" : "Farm Utilities"}
        </span>
        <div className="card-warm divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
          {/* Land Area Unit Converter */}
          <button
            onClick={() => setIsConverterOpen(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t("farm.unit_converter")}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "एकर ⇄ गुंठा ⇄ हेक्टर ⇄ बिघा झटपट रूपांतरण" : "Acre ⇄ Guntha ⇄ Hectare ⇄ Bigha calculator"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Group 3: Core Agronomy Services Quick Jump */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
          {isMr ? "सर्व कृषी सल्लागार सेवा" : "Agronomy Services"}
        </span>
        <div className="card-warm divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
          {/* Crop Planner */}
          <Link
            href="/planner"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t("planner.title")}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "हंगामी पीक नियोजन व दैनंदिन कृषी दिनदर्शिका" : "Scientific crop plans & task calendar"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Crop Compare */}
          <Link
            href="/planner/compare"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t("planner.compare_crops")}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "२-३ पिकांची नफा व जोखीम तुलना" : "Side-by-side comparison of 2-3 crops"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Farm Ledger */}
          <Link
            href="/ledger"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-harvest-500/10 text-harvest-700 dark:text-harvest-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "शेतकरी हिशोब वही (Farm Ledger)" : "Farm Financial Ledger"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "खर्च, उत्पन्न व नफा ट्रॅकिंग" : "Actual vs planned expense & income tracking"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Allied Enterprises */}
          <Link
            href="/diversification"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "पूरक व्यवसाय व उत्पन्न विविधता" : "Allied Enterprises & Diversification"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "डेअरी, शेळीपालन, कुक्कुटपालन, गांडूळखत मॉडेल" : "Dairy, Goat, Poultry & Vermicompost economics"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Crop Doctor */}
          <Link
            href="/doctor"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "पीक डॉक्टर (रोगनिदान व उपचार)" : "Crop Doctor (Plant Pathology)"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "१५ लिटर पंपाचे अचूक औषध प्रमाण व जैविक उपाय" : "Dual chemical + organic remedies with pump dosage"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          {/* Government Schemes & KCC */}
          <Link
            href="/schemes"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "शासकीय योजना व KCC कॅल्क्युलेटर" : "Government Schemes & KCC"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "२१ शासकीय योजना व कागदपत्र तपासणी" : "21 Maharashtra schemes & Document Wallet"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Group 4: Administrative & Governance */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
          {isMr ? "प्रणाली व सुरक्षा" : "System & Governance"}
        </span>
        <div className="card-warm divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
          <Link
            href="/admin"
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40 text-left min-h-[50px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-forest-700 dark:text-forest-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {isMr ? "प्रशासकीय नियंत्रण कक्ष (Admin)" : "Admin Console"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {isMr ? "पीक मास्टर डेटा, बाजारभाव बदल व ऑडिट लॉग्स" : "Crop master data, APMC price overrides & audit logs"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* App Provenance Badge */}
      <div className="text-center py-4 text-[11px] text-stone-500 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/60 font-semibold text-stone-700 dark:text-stone-300">
          <Sprout className="w-3.5 h-3.5 text-forest-700 dark:text-forest-400" />
          <span>KisanSaathi PWA • v1.0.0</span>
        </div>
        <p className="text-[10px] text-stone-400">
          {isMr
            ? "भारतीय शेतीसाठी समर्पित • पारदर्शक कृषी बुद्धिमत्ता"
            : "Dedicated to Indian Farmers • Transparent Agronomic Intelligence"}
        </p>
      </div>

      <UnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
      />
    </div>
  );
}
