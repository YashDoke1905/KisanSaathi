"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Sprout, Phone, Lock, User, ArrowRight, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const isMr = language === "mr";

  const [tab, setTab] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("auth.invalid_credentials"));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        setOtpSent(true);
        if (data.debugOtp) {
          setDebugOtp(data.debugOtp);
        }
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP code");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Tap Demo Login
  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Demo login failed");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Failed to start demo session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 py-4">
      {/* Brand Hero Card */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-16 h-16 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-elevated border border-forest-700/40 relative">
          <Sprout className="w-8 h-8 text-white" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-harvest-500 border-2 border-white dark:border-stone-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {t("app.name")}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            {isMr
              ? "महाराष्ट्रातील शेतकऱ्यांचे विश्वासू डिजिटल साथी"
              : "Calm, Scientific Farm Management & Decision Advisory"}
          </p>
        </div>
      </div>

      {/* 1-Tap Instant Demo Login Hero Pill */}
      <div className="card-warm p-3.5 border-harvest-500/30 dark:border-harvest-500/30 bg-harvest-500/5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-soil-800 dark:text-harvest-400">
            <Sparkles className="w-4 h-4 text-harvest-600 animate-pulse" />
            <span>{isMr ? "झटपट चाचणी (पासवर्डशिवाय)" : "Quick Test (1-Tap)"}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-harvest-500/15 text-soil-800 dark:text-harvest-300">
            {isMr ? "१-क्लिक लॉगिन" : "Instant"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-soil-700 hover:bg-soil-800 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-harvest-300" />
          <span>{t("auth.demo_login")}</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Login Card */}
      <div className="card-warm p-5 space-y-4">
        {/* Login Tab Switcher */}
        <div className="grid grid-cols-2 bg-stone-100 dark:bg-stone-800/70 p-1 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
          <button
            type="button"
            onClick={() => {
              setTab("password");
              setError(null);
            }}
            className={`h-10 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === "password"
                ? "bg-white dark:bg-stone-900 text-forest-800 dark:text-forest-300 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isMr ? "पासवर्ड लॉगिन" : "Password"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("otp");
              setError(null);
            }}
            className={`h-10 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === "otp"
                ? "bg-white dark:bg-stone-900 text-forest-800 dark:text-forest-300 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{isMr ? "मोबाईल ओटीपी" : "Mobile OTP"}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Mode 1: Username & Password */}
        {tab === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.username")} / {t("auth.phone")}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isMr ? "demo किंवा मोबाईल क्रमांक" : "demo or 9876543210"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {t("auth.password")}
                </label>
                <Link
                  href={identifier ? `/forgot-password?identifier=${encodeURIComponent(identifier)}` : "/forgot-password"}
                  className="text-xs font-bold text-forest-700 dark:text-forest-400 hover:underline min-h-[36px] flex items-center"
                >
                  {t("auth.forgot_password")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all"
            >
              <span>{isLoading ? t("common.loading") : t("auth.login")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 2: Mobile OTP Login */}
        {tab === "otp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all"
                >
                  <span>{isLoading ? t("common.loading") : t("auth.send_otp")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {debugOtp && (
                  <div className="p-3.5 bg-harvest-500/10 border border-harvest-500/30 rounded-xl text-soil-900 dark:text-harvest-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-soil-800 dark:text-harvest-300">
                      <ShieldCheck className="w-4 h-4 text-harvest-600" />
                      <span>{t("auth.dev_otp_notice")}:</span>
                    </div>
                    <div className="font-mono text-2xl font-black tracking-widest text-forest-800 dark:text-forest-300 text-center py-1">
                      {debugOtp}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-center">
                    {t("auth.otp_code")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-14 text-center tracking-widest text-2xl font-black rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:border-forest-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all"
                >
                  <span>{isLoading ? t("common.loading") : t("auth.verify_otp")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-medium min-h-[40px] flex items-center"
                  >
                    ← {isMr ? "क्रमांक बदला" : "Change phone number"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-forest-700 dark:text-forest-400 font-bold hover:underline min-h-[40px] flex items-center"
                  >
                    {t("auth.resend_otp")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Signup Link */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {t("auth.dont_have_account")}{" "}
            <Link
              href="/signup"
              className="font-bold text-forest-800 dark:text-forest-400 hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              <span>{t("auth.signup")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
