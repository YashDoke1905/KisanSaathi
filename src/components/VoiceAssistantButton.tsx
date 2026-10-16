"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/languageContext";
import { Volume2, VolumeX, Mic, MicOff } from "lucide-react";

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export function ReadAloudButton({ text, className = "" }: ReadAloudButtonProps) {
  const { speakText, stopSpeaking, isSpeaking, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => {
        if (isSpeaking) {
          stopSpeaking();
        } else {
          speakText(text);
        }
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[44px] min-w-[44px] ${
        isSpeaking
          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 animate-pulse"
          : "bg-kisan-green-50 dark:bg-kisan-green-950/40 text-kisan-green-800 dark:text-kisan-green-300 border-kisan-green-200 dark:border-kisan-green-800 hover:bg-kisan-green-100"
      } ${className}`}
      aria-label={isSpeaking ? t("common.stop_reading") : t("common.read_aloud")}
      title={isSpeaking ? t("common.stop_reading") : t("common.read_aloud")}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 text-rose-600" />
          <span>{t("common.stop_reading")}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-kisan-green-700 dark:text-kisan-green-400" />
          <span>{t("common.read_aloud")}</span>
        </>
      )}
    </button>
  );
}

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className = "" }: VoiceInputButtonProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (typeof window === "undefined") return;

    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge on Android.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all min-h-[48px] min-w-[48px] ${
        isListening
          ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
      } ${className}`}
      aria-label={isListening ? t("common.listening") : t("common.voice_search")}
      title={isListening ? t("common.listening") : t("common.voice_search")}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-kisan-green-700 dark:text-kisan-green-400" />}
    </button>
  );
}
