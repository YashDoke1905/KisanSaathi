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
} from "lucide-react";

export default function MorePage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

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
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        {t("nav.more")} & Account
      </h1>

      {/* User Card */}
      {user ? (
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-kisan-green-100 dark:bg-kisan-green-950/60 text-kisan-green-800 dark:text-kisan-green-300 rounded-2xl flex items-center justify-center font-bold text-lg">
              {user.profile?.fullName?.[0] || "U"}
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                {user.profile?.fullName || user.username}
              </h2>
              <p className="text-xs text-zinc-500">
                {user.phone ? `+91 ${user.phone}` : `@${user.username}`} • {user.profile?.district || "Maharashtra"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t("auth.logout")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                Guest Farmer
              </h2>
              <p className="text-xs text-zinc-500">
                Login to save farm profiles & custom plans
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-2 bg-kisan-green-700 text-white rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center shadow-xs"
          >
            {t("auth.login")}
          </Link>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700/60 overflow-hidden shadow-xs">
        {/* Language Selection */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-kisan-green-700 dark:text-kisan-green-400" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Language / भाषा
            </span>
          </div>
          <div className="flex gap-1">
            {(["mr", "hi", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg min-h-[40px] min-w-[40px] ${
                  language === l
                    ? "bg-kisan-green-700 text-white font-bold"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {l === "mr" ? "मराठी" : l === "hi" ? "हिंदी" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Converter Trigger */}
        <button
          onClick={() => setIsConverterOpen(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-kisan-soil-700 dark:text-kisan-soil-300" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {t("farm.unit_converter")}
              </span>
              <span className="text-[10px] text-zinc-500">
                Acre ⇄ Guntha ⇄ Hectare ⇄ Bigha
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-zinc-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Theme Display
              </span>
              <span className="text-[10px] text-zinc-500">
                {theme === "light" ? "Light Mode (Daylight high contrast)" : "Dark Mode (Night viewing)"}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {theme === "light" ? "Light" : "Dark"}
          </span>
        </button>

        {/* Phase 3 Tools Links */}
        <Link
          href="/planner"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {t("planner.title")}
              </span>
              <span className="text-[10px] text-zinc-500">
                End-to-End scientific crop plans & task calendar
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/planner/compare"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {t("planner.compare_crops")}
              </span>
              <span className="text-[10px] text-zinc-500">
                Side-by-side comparison of 2-3 crops
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/ledger"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Farm Ledger (हिशोब वही)
              </span>
              <span className="text-[10px] text-zinc-500">
                Actual vs planned expense & income tracking
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        {/* Phase 6: Side Businesses & Income Diversification */}
        <Link
          href="/diversification"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {language === "mr"
                  ? "पूरक व्यवसाय व उत्पन्न विविधता"
                  : "Allied Enterprises & Diversification"}
              </span>
              <span className="text-[10px] text-zinc-500">
                Dairy, Goat, Poultry, Vermicompost & Agro-Processing models
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        {/* Phase 7: Crop Doctor Plant Pathology */}
        <Link
          href="/doctor"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {language === "mr"
                  ? "पीक डॉक्टर (रोगनिदान व उपचार)"
                  : "Crop Doctor (Plant Pathology)"}
              </span>
              <span className="text-[10px] text-zinc-500">
                AI Vision + Rule-based dual remedies & 15L knapsack pump dosage
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        {/* Phase 5: Schemes & KCC */}
        <Link
          href="/schemes"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {language === "mr"
                  ? "शासकीय योजना व KCC कॅल्क्युलेटर"
                  : "Government Schemes & KCC"}
              </span>
              <span className="text-[10px] text-zinc-500">
                21 verified Maharashtra schemes & Document Wallet
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        {/* Admin Console */}
        <Link
          href="/admin"
          className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/40 text-left min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {language === "mr"
                  ? "प्रशासकीय नियंत्रण कक्ष (Admin)"
                  : "Admin Console (Protected)"}
              </span>
              <span className="text-[10px] text-zinc-500">
                Crop master data, APMC price overrides & telemetry
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>

      {/* App Version & Production Provenance */}
      <div className="p-4 text-center text-[11px] text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-600 dark:text-zinc-300">
          KisanSaathi PWA • v1.0.0
        </p>
        <p>Built for Indian Smallholder Farmers • Open Agricultural Intelligence</p>
      </div>

      <UnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
      />
    </div>
  );
}
