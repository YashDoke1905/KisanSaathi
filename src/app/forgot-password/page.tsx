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
  User,
  ShieldAlert,
} from "lucide-react";

function ForgotPasswordContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="space-y-4 py-2">
      {/* Back button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-kisan-green-700 min-h-[40px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login (लॉगिनवर परत जा)</span>
      </Link>

      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-kisan-soil-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {t("auth.reset_password")}
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Enter your registered Mobile Number or Username to receive a reset OTP.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Step 1: Request OTP Form */}
      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t("auth.phone")} / {t("auth.username")}
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="उदा. 9876543210 किंवा demo"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              />
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Tip: You can enter your 10-digit phone number or your username (e.g. `demo`).
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
          >
            <span>{isLoading ? t("common.loading") : t("auth.send_otp")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Step 2: Verify OTP & Enter New Password Form */
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold">OTP Dispatched</span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Code sent to registered mobile: {maskedPhone || targetPhone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
              }}
              className="text-xs font-semibold text-kisan-green-800 dark:text-kisan-green-300 underline min-h-[36px]"
            >
              Change
            </button>
          </div>

          {/* Dev Mode 1-Tap Auto-fill Button */}
          {debugOtp && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
              <div className="text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>
                  <strong>Dev Mode Verification OTP: </strong>
                  <span className="font-mono text-base font-black tracking-widest text-kisan-amber-900 dark:text-amber-300">
                    {debugOtp}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(debugOtp)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 min-h-[40px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>१-टॅप OTP भरा (1-Tap Auto-Fill: {debugOtp})</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t("auth.otp_code")} *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-2xl font-bold py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t("auth.new_password")} *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t("auth.confirm_password")} *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
          >
            <span>{isLoading ? t("common.loading") : t("auth.reset_password")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
