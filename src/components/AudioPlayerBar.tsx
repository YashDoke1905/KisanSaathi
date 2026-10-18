"use client";

import React from "react";
import { useLanguage } from "@/lib/languageContext";
import { Volume2, VolumeX, Pause, Play, X, Gauge, Sparkles, Loader2 } from "lucide-react";

export function AudioPlayerBar() {
  const {
    isSpeaking,
    isPaused,
    isLoadingAudio,
    audioProvider,
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
      <div className="max-w-md mx-auto bg-stone-900 text-stone-100 rounded-2xl p-3 shadow-2xl border border-emerald-600/40 flex flex-col gap-2">
        {/* Top Header: Title + Engine Badge + Speed + Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1B4332] text-emerald-400 flex items-center justify-center shrink-0">
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-emerald-400">
                {language === "mr"
                  ? "कृषी ऑडिओ मार्गदर्शक"
                  : language === "hi"
                  ? "कृषि ऑडियो गाइड"
                  : "Audio Guide"}
              </span>

              {/* Provider Badge */}
              {audioProvider === "sarvamai" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Sarvam AI</span>
                </span>
              )}

              {/* Animated audio equalizer bars */}
              {!isPaused && !isLoadingAudio && (
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
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 min-h-[32px] flex items-center gap-0.5"
              title="Speech Speed"
            >
              <Gauge className="w-3 h-3 text-stone-400" />
              <span>{speechRate}x</span>
            </button>

            {/* Stop button */}
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close Audio Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spoken text subtitles */}
        <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed bg-stone-800/80 p-2 rounded-xl border border-stone-700/50">
          {isLoadingAudio ? (
            <span className="italic text-stone-400 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>
                {language === "mr"
                  ? "Sarvam AI आवाज तयार होत आहे..."
                  : language === "hi"
                  ? "Sarvam AI आवाज लोड हो रहा है..."
                  : "Synthesizing Sarvam AI voice..."}
              </span>
            </span>
          ) : (
            <>&ldquo;{currentSpeakingText}&rdquo;</>
          )}
        </p>

        {/* Control bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {isPaused ? (
              <button
                type="button"
                onClick={resumeSpeaking}
                className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-emerald-100 font-bold rounded-lg text-xs flex items-center gap-1.5 min-h-[36px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === "mr" ? "चालू करा" : language === "hi" ? "शुरू करें" : "Resume"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseSpeaking}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 min-h-[36px]"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{language === "mr" ? "थांबवा" : language === "hi" ? "रोकें" : "Pause"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 text-stone-400 hover:text-rose-400 text-xs min-h-[36px]"
            >
              {language === "mr" ? "बंद करा" : language === "hi" ? "बंद करें" : "Stop"}
            </button>
          </div>

          <span className="text-[10px] text-stone-400">
            {audioProvider === "sarvamai"
              ? "Sarvam AI Bulbul"
              : language === "mr"
              ? "मराठी आवाज"
              : language === "hi"
              ? "हिंदी आवाज"
              : "English Audio"}
          </span>
        </div>
      </div>
    </div>
  );
}
