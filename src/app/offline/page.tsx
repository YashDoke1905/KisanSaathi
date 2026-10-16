"use client";

import React from "react";
import { useLanguage } from "@/lib/languageContext";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
        <WifiOff className="w-10 h-10 animate-bounce" />
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        {t("app.offline_notice")}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mb-6">
        KisanSaathi is designed to work offline. Your farm profiles and saved plans are safe on your device.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold px-6 py-3 rounded-xl min-h-[48px] shadow-sm active:scale-98 transition-transform"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Reconnecting</span>
      </button>
    </div>
  );
}
