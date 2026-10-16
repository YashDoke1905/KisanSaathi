"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import en from "@/locales/en.json";
import mr from "@/locales/mr.json";
import hi from "@/locales/hi.json";
import { playChime, findBestVoice } from "./soundUtils";

export type Language = "en" | "mr" | "hi";

type TranslationDict = typeof en;

const translations: Record<Language, TranslationDict> = {
  en,
  mr: mr as unknown as TranslationDict,
  hi: hi as unknown as TranslationDict,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
  speakText: (text: string) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  currentSpeakingText: string;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  stopSpeaking: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("mr"); // Default to Marathi
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState("");
  const [speechRate, setSpeechRateState] = useState(0.9);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and cache voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        voicesRef.current = v;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load persisted language
    const saved = localStorage.getItem("kisansaathi_lang") as Language | null;
    if (saved && (saved === "en" || saved === "mr" || saved === "hi")) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kisansaathi_lang", lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const keys = keyPath.split(".");
      let current: unknown = translations[language] || translations.en;

      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          // Fallback to English
          let fallbackVal: unknown = translations.en;
          for (const fk of keys) {
            if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
              fallbackVal = (fallbackVal as Record<string, unknown>)[fk];
            } else {
              return fallback || keyPath;
            }
          }
          return typeof fallbackVal === "string" ? fallbackVal : fallback || keyPath;
        }
      }

      return typeof current === "string" ? current : fallback || keyPath;
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSpeakingText("");
    playChime("stop");
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;

      // Instant audible chime so the farmer receives immediate feedback
      playChime("start");
      setCurrentSpeakingText(text);

      if (!("speechSynthesis" in window)) {
        console.warn("Speech synthesis is not supported on this browser.");
        setIsSpeaking(true);
        // Automatically hide the visual speaker after reading duration
        setTimeout(() => setIsSpeaking(false), 5000);
        return;
      }

      // Workaround for Chromium speech synthesis freeze:
      // 1. Cancel previous speech
      window.speechSynthesis.cancel();
      // 2. Unpause/resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      setTimeout(() => {
        try {
          const cleanText = text
            .replace(/[*#_~`>]/g, "")
            .replace(/[\n\r]+/g, ". ")
            .trim();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utteranceRef.current = utterance;
          // Retain on window to prevent V8 garbage collector cancellation
          (window as any).__activeSpeechUtterance = utterance;

          const voices =
            voicesRef.current.length > 0
              ? voicesRef.current
              : window.speechSynthesis.getVoices();

          const { voice, langTag } = findBestVoice(voices, language);

          if (voice) {
            utterance.voice = voice;
          }
          utterance.lang = langTag;
          utterance.rate = speechRate;
          utterance.pitch = 1.0;

          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentSpeakingText("");
            delete (window as any).__activeSpeechUtterance;
          };

          utterance.onerror = (e) => {
            console.warn("Speech synthesis error or fallback:", e);
            delete (window as any).__activeSpeechUtterance;
            setIsSpeaking(false);
            setCurrentSpeakingText("");
          };

          window.speechSynthesis.speak(utterance);
          // Chromium bug: ensure synthesis isn't left in paused state
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err) {
          console.error("Failed to start speech synthesis:", err);
          setIsSpeaking(false);
        }
      }, 50);
    },
    [language, speechRate]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        speakText,
        isSpeaking,
        isPaused,
        currentSpeakingText,
        speechRate,
        setSpeechRate,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
