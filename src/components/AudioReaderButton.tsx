"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioReaderButtonProps {
  text: string;
  lang?: "mr" | "hi" | "en";
  label?: string;
  className?: string;
  compact?: boolean;
}

export function AudioReaderButton({
  text,
  lang = "mr",
  label,
  className = "",
  compact = false,
}: AudioReaderButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      // Clean up when unmounting
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported || typeof window === "undefined" || !window.speechSynthesis) {
      alert("तुमच्या ब्राउझरमध्ये ऑडिओ वाचन (Text-to-Speech) सपोर्ट उपलब्ध नाही.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any active audio
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_~`>]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Resolve optimal voice code
    const targetLangCode = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    utterance.lang = targetLangCode;
    utterance.rate = 0.95; // slightly slower for rural clarity
    utterance.pitch = 1.0;

    // Pick voice if loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchedVoice =
        voices.find((v) => v.lang.startsWith(targetLangCode.slice(0, 2))) ||
        voices.find((v) => v.lang.includes("IN")) ||
        voices[0];
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (err) => {
      console.warn("SpeechSynthesis error:", err);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  const defaultLabel =
    isPlaying
      ? lang === "mr"
        ? "थांबवा"
        : lang === "hi"
          ? "रोकें"
          : "Stop"
      : lang === "mr"
        ? "ऐका"
        : lang === "hi"
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
          isPlaying
            ? "bg-rose-500 text-white animate-pulse shadow-md"
            : "bg-kisan-green-100 dark:bg-kisan-green-950/60 text-kisan-green-800 dark:text-kisan-green-300 hover:bg-kisan-green-200"
        } ${className}`}
      >
        {isPlaying ? (
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
        isPlaying
          ? "bg-rose-600 text-white border-rose-600 shadow-md animate-pulse"
          : "bg-white dark:bg-zinc-800 text-kisan-green-800 dark:text-kisan-green-300 border-kisan-green-300 dark:border-kisan-green-700 hover:bg-kisan-green-50 dark:hover:bg-zinc-700"
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-white" />
          <span>{label || defaultLabel}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-kisan-green-700 dark:text-kisan-green-400" />
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
}
