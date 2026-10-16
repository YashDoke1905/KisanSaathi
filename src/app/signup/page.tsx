"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import {
  Sprout,
  Phone,
  Lock,
  User,
  MapPin,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const isMr = language === "mr";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Nashik");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maharashtraDistricts = [
    "Nashik",
    "Solapur",
    "Pune",
    "Ahmednagar",
    "Nagpur",
    "Amravati",
    "Akola",
    "Chhatrapati Sambhajinagar",
    "Jalna",
    "Latur",
    "Nanded",
    "Kolhapur",
    "Sangli",
    "Satara",
    "Yavatmal",
    "Buldhana",
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          username,
          password,
          district,
          taluka,
          village,
          preferredLanguage: language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
      } else {
        router.push("/farm"); // Direct to progressive farm plot setup
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 py-4">
      {/* Brand Hero */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-elevated border border-forest-700/40 relative">
          <Sprout className="w-7 h-7 text-white" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-harvest-500 border-2 border-white dark:border-stone-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
          {t("auth.signup")}
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium max-w-xs mx-auto">
          {isMr
            ? "फक्त ६० सेकंदात आपली मोफत शेती नोंदणी पूर्ण करा"
            : "60-second simple registration for Indian farmers"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Registration Card */}
      <div className="card-warm p-5">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Section: Farmer Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {isMr ? "शेतकऱ्याचे पूर्ण नाव" : "Full Name"}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isMr ? "उदा. तुकाराम पाटील" : "e.g. Tukaram Patil"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.phone")}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full h-12 pl-12 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              {isMr ? "स्थान माहिती" : "Farm Location"}
            </span>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {isMr ? "जिल्हा (District)" : "District"}
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 appearance-none font-medium"
                >
                  {maharashtraDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {isMr ? "तालुका (Taluka)" : "Taluka"}
                </label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder={isMr ? "उदा. निफाड" : "e.g. Niphad"}
                  className="w-full h-12 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {isMr ? "गाव (Village)" : "Village"}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={isMr ? "उदा. पिंपळगाव" : "e.g. Pimpalgaon"}
                  className="w-full h-12 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Section: Account Security */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              {isMr ? "खाते व पासवर्ड" : "Account Security"}
            </span>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.username")}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="tukaram_patil"
                className="w-full h-12 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isMr ? "किमान ६ अक्षरे" : "Min 6 characters"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all mt-2"
          >
            <span>{isLoading ? t("common.loading") : t("auth.signup")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {t("auth.already_have_account")}{" "}
            <Link
              href="/login"
              className="font-bold text-forest-800 dark:text-forest-400 hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              <span>{t("auth.login")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
