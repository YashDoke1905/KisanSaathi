"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Sprout, Phone, Lock, User, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

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
    <div className="space-y-5 py-2">
      {/* Brand Hero */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 bg-kisan-green-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t("app.name")}
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
          {t("app.tagline")}
        </p>
      </div>

      {/* 1-Tap Instant Demo Login Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 min-h-[48px]"
      >
        <Sparkles className="w-5 h-5 text-amber-200" />
        <span>{t("auth.demo_login")}</span>
      </button>

      {/* Login Tab Switcher */}
      <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setTab("password");
            setError(null);
          }}
          className={`py-2.5 text-xs font-bold rounded-lg transition-all min-h-[44px] ${
            tab === "password"
              ? "bg-white dark:bg-zinc-700 text-kisan-green-800 dark:text-kisan-green-300 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("otp");
            setError(null);
          }}
          className={`py-2.5 text-xs font-bold rounded-lg transition-all min-h-[44px] ${
            tab === "otp"
              ? "bg-white dark:bg-zinc-700 text-kisan-green-800 dark:text-kisan-green-300 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Mobile OTP
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Username & Password */}
      {tab === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t("auth.username")} / {t("auth.phone")}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="demo or 9876543210"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("auth.password")}
              </label>
              <Link
                href={identifier ? `/forgot-password?identifier=${encodeURIComponent(identifier)}` : "/forgot-password"}
                className="text-xs font-semibold text-kisan-green-700 dark:text-kisan-green-400 hover:underline min-h-[36px] flex items-center"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
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
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
              >
                <span>{isLoading ? t("common.loading") : t("auth.send_otp")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {debugOtp && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                  <span className="font-bold">{t("auth.dev_otp_notice")}: </span>
                  <span className="font-mono text-base font-black tracking-widest text-kisan-amber-900">
                    {debugOtp}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("auth.otp_code")}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-2xl font-bold py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
              >
                <span>{isLoading ? t("common.loading") : t("auth.verify_otp")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-zinc-500 hover:underline min-h-[40px] flex items-center"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-kisan-green-700 dark:text-kisan-green-400 font-semibold hover:underline min-h-[40px] flex items-center"
                >
                  {t("auth.resend_otp")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Signup Redirection */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t("auth.dont_have_account")}{" "}
          <Link
            href="/signup"
            className="font-bold text-kisan-green-700 dark:text-kisan-green-400 hover:underline inline-flex items-center min-h-[44px]"
          >
            {t("auth.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
