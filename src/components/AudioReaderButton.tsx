"use client";

import React from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

interface AudioReaderButtonProps {
  text: string;
  lang?: "mr" | "hi" | "en";
  label?: string;
  className?: string;
  compact?: boolean;
}

export function AudioReaderButton({
  text,
  lang,
  label,
  className = "",
  compact = false,
}: AudioReaderButtonProps) {
  const {
    speakText,
    stopSpeaking,
    isSpeaking,
    isLoadingAudio,
    currentSpeakingText,
    language,
  } = useLanguage();

  const cleanText = text
    .replace(/[*#_~`>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();

  const isCurrent = currentSpeakingText === text || currentSpeakingText === cleanText;
  const isPlayingThis = isSpeaking && isCurrent;
  const isLoadingThis = isLoadingAudio && isCurrent;

  const activeLang = lang || language;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlayingThis) {
      stopSpeaking();
    } else {
      speakText(cleanText);
    }
  };

  const defaultLabel = isPlayingThis
    ? activeLang === "mr"
      ? "थांबवा"
      : activeLang === "hi"
      ? "रोकें"
      : "Stop"
    : activeLang === "mr"
    ? "ऐका"
    : activeLang === "hi"
    ? "सुनें"
    : "Listen";

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={label || defaultLabel}
        title={label || defaultLabel}
        className={`p-2 rounded-full transition-all duration-150 flex items-center justify-center min-w-[36px] min-h-[36px] ${
          isPlayingThis
            ? "bg-rose-500 text-white animate-pulse shadow-md"
            : isLoadingThis
            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60"
        } ${className}`}
      >
        {isLoadingThis ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
        ) : isPlayingThis ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 min-h-[40px] ${
        isPlayingThis
          ? "bg-rose-600 text-white border-rose-600 shadow-md animate-pulse"
          : isLoadingThis
          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
          : "bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-stone-700"
      } ${className}`}
    >
      {isLoadingThis ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
          <span>{activeLang === "mr" ? "लोड होत आहे..." : activeLang === "hi" ? "लोड हो रहा है..." : "Loading..."}</span>
        </>
      ) : isPlayingThis ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-white" />
          <span>{label || defaultLabel}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
}
