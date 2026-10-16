"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage, Language } from "@/lib/languageContext";
import { useTheme } from "@/lib/themeContext";
import { Sprout, Sun, Moon, WifiOff, VolumeX } from "lucide-react";

export function Header() {
  const { language, setLanguage, t, isSpeaking, stopSpeaking } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: "mr", label: "मराठी" },
    { code: "hi", label: "हिंदी" },
    { code: "en", label: "EN" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/90 dark:bg-[#131814]/90 backdrop-blur-md border-b border-cream-200/80 dark:border-forest-900/60 shadow-xs transition-colors">
      <div className="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-forest-600 rounded-xl p-1 min-h-[48px] group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-900 text-white flex items-center justify-center shadow-md shadow-forest-900/15 border border-forest-700/40 group-active:scale-95 transition-transform">
            <Sprout className="w-5 h-5 text-harvest-300 drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-tight tracking-tight text-forest-900 dark:text-cream-50 font-sans">
              {t("app.name")}
            </span>
            <span className="text-[10px] text-soil-600 dark:text-cream-400 font-semibold tracking-wider uppercase">
              SmartHarvest
            </span>
          </div>
        </Link>

        {/* Right Action Cluster: Language Switcher, Offline status, Theme */}
        <div className="flex items-center gap-1.5">
          {/* Audio Stop Button if actively reading */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-2.5 text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center animate-pulse shadow-xs"
              title={t("common.stop_reading")}
              aria-label={t("common.stop_reading")}
            >
              <VolumeX className="w-4 h-4 text-rose-600" />
            </button>
          )}

          {/* Network offline badge */}
          {!isOnline && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-800"
              title={t("app.offline_notice")}
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="text-[10px]">ऑफलाइन</span>
            </div>
          )}

          {/* Language Selector Pill */}
          <div className="flex items-center bg-cream-100 dark:bg-[#1A221C] p-1 rounded-xl border border-cream-200 dark:border-forest-900/60 shadow-xs">
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all min-h-[38px] flex items-center justify-center ${
                    isSelected
                      ? "bg-forest-800 text-cream-50 shadow-xs dark:bg-forest-600"
                      : "text-soil-700 dark:text-cream-300 hover:text-forest-900 dark:hover:text-white"
                  }`}
                  aria-label={`Switch language to ${item.label}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Dark/Light mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-soil-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-[#1A221C] border border-transparent hover:border-cream-200 dark:hover:border-forest-900/60 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle display theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-soil-700 hover:text-forest-900" />
            ) : (
              <Sun className="w-4 h-4 text-harvest-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
