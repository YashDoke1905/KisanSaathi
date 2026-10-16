"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Sprout, Phone, Lock, User, MapPin, ArrowRight, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

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
    <div className="space-y-5 py-2">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-kisan-green-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {t("auth.signup")}
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          60-second registration for Indian farmers
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Full Name (नाव)
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="उदा. तुकाराम पाटील"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {t("auth.phone")}
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            District (जिल्हा)
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            >
              {maharashtraDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Taluka (तालुका)
            </label>
            <input
              type="text"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              placeholder="e.g. Niphad"
              className="w-full px-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Village (गाव)
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Pimpalgaon"
              className="w-full px-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {t("auth.username")}
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="tukaram_patil"
            className="w-full px-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {t("auth.password")}
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
        >
          <span>{isLoading ? t("common.loading") : t("auth.signup")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t("auth.already_have_account")}{" "}
          <Link
            href="/login"
            className="font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline inline-flex items-center min-h-[44px]"
          >
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
