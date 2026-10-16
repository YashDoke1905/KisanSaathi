"use client";

import React from "react";
import { useLanguage } from "@/lib/languageContext";
import { Volume2, VolumeX, Pause, Play, X, Gauge } from "lucide-react";

export function AudioPlayerBar() {
  const {
    isSpeaking,
    isPaused,
    currentSpeakingText,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    speechRate,
    setSpeechRate,
    language,
    t,
  } = useLanguage();

  if (!isSpeaking && !isPaused && !currentSpeakingText) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 animate-in slide-in-from-bottom-4 duration-200">
      <div className="max-w-md mx-auto bg-zinc-900 text-white rounded-2xl p-3 shadow-2xl border border-kisan-green-600/50 flex flex-col gap-2">
        {/* Top Header: Title + Animated Soundwave + Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-kisan-green-600 flex items-center justify-center text-white">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-kisan-green-400">
                {language === "mr"
                  ? "कृषी ऑडिओ मार्गदर्शक"
                  : language === "hi"
                  ? "कृषि ऑडियो गाइड"
                  : "Audio Guide"}
              </span>
              {/* Animated audio equalizer bars */}
              {!isPaused && (
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.45s]" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={() => {
                const nextRate = speechRate === 0.9 ? 1.1 : speechRate === 1.1 ? 0.75 : 0.9;
                setSpeechRate(nextRate);
              }}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 min-h-[32px] flex items-center gap-0.5"
              title="Speech Speed"
            >
              <Gauge className="w-3 h-3 text-zinc-400" />
              <span>{speechRate}x</span>
            </button>

            {/* Stop button */}
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close Audio Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spoken text subtitles */}
        <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed bg-zinc-800/80 p-2 rounded-xl border border-zinc-700/50">
          &ldquo;{currentSpeakingText}&rdquo;
        </p>

        {/* Control bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {isPaused ? (
              <button
                type="button"
                onClick={resumeSpeaking}
                className="px-3 py-1.5 bg-kisan-green-600 hover:bg-kisan-green-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>चालू करा (Resume)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseSpeaking}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 min-h-[36px]"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>थांबवा (Pause)</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 text-zinc-400 hover:text-rose-400 text-xs min-h-[36px]"
            >
              बंद करा (Stop)
            </button>
          </div>

          <span className="text-[10px] text-zinc-400">
            {language === "mr" ? "मराठी आवाज" : language === "hi" ? "हिंदी आवाज" : "English Audio"}
          </span>
        </div>
      </div>
    </div>
  );
}
