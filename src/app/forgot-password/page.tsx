"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import {
  Lock,
  Phone,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

function ForgotPasswordContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMr = language === "mr";

  const [identifier, setIdentifier] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const prefill = searchParams.get("identifier");
    if (prefill) {
      setIdentifier(prefill);
    }
  }, [searchParams]);

  // Step 1: Send OTP to user's registered phone or username
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          isForgotPassword: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to find account or send OTP");
      } else {
        setOtpSent(true);
        setTargetPhone(data.phone || identifier);
        setMaskedPhone(data.maskedPhone || "");
        if (data.debugOtp) {
          setDebugOtp(data.debugOtp);
        }
      }
    } catch {
      setError("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: targetPhone,
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(data.message || "Password reset successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 py-3">
      {/* Back button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-forest-800 dark:hover:text-forest-300 min-h-[40px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isMr ? "← लॉगिनवर परत जा" : "← Back to Login"}</span>
      </Link>

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-soil-800 text-white flex items-center justify-center mx-auto shadow-elevated border border-soil-700/40">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
          {t("auth.reset_password")}
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium max-w-xs mx-auto">
          {isMr
            ? "आपला नोंदणीकृत मोबाईल किंवा युझरनेम टाका, आम्ही लगेच सुरक्षित ओटीपी पाठवू."
            : "Enter your registered Mobile Number or Username to receive a reset OTP."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-forest-50 dark:bg-forest-950/60 border border-forest-300 dark:border-forest-800 rounded-xl flex items-start gap-2.5 text-forest-800 dark:text-forest-200 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-forest-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="card-warm p-5 space-y-4">
        {/* Step 1: Request OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.phone")} / {t("auth.username")}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isMr ? "उदा. 9876543210 किंवा demo" : "e.g. 9876543210 or demo"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 block">
                {isMr
                  ? "नोंद: आपण १० अंकी मोबाईल किंवा 'demo' असे युझरनेम वापरू शकता."
                  : "Tip: Enter your 10-digit registered mobile or your username."}
              </span>
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
          /* Step 2: Verify OTP & Enter New Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 rounded-xl text-forest-900 dark:text-forest-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                  {isMr ? "ओटीपी पाठवला आहे" : "OTP Dispatched"}
                </span>
                <p className="text-[11px] text-forest-800 dark:text-forest-300 mt-0.5">
                  {maskedPhone || targetPhone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                }}
                className="text-xs font-bold text-forest-800 dark:text-forest-300 underline min-h-[36px]"
              >
                {isMr ? "बदला" : "Change"}
              </button>
            </div>

            {/* Dev Mode 1-Tap Auto-fill Button */}
            {debugOtp && (
              <div className="p-3 bg-harvest-500/10 border border-harvest-500/30 rounded-xl space-y-2">
                <div className="text-xs text-soil-900 dark:text-harvest-200 flex items-center justify-between">
                  <span className="font-medium">
                    {t("auth.dev_otp_notice")}:{" "}
                    <strong className="font-mono text-base font-black tracking-widest text-soil-900 dark:text-white">
                      {debugOtp}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(debugOtp)}
                  className="w-full h-10 rounded-lg bg-soil-700 hover:bg-soil-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-harvest-300" />
                  <span>{isMr ? `१-टॅप OTP भरा (${debugOtp})` : `1-Tap Auto-Fill (${debugOtp})`}</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 text-center">
                {t("auth.otp_code")} *
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

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.new_password")} *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isMr ? "किमान ६ अक्षरे" : "At least 6 characters"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t("auth.confirm_password")} *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isMr ? "पासवर्ड पुन्हा टाका" : "Re-enter password"}
                  className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all"
            >
              <span>{isLoading ? t("common.loading") : t("auth.reset_password")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs font-bold text-stone-500">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
