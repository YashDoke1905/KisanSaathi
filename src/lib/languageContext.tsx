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
  isLoadingAudio: boolean;
  audioProvider: "sarvamai" | "browser" | null;
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
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioProvider, setAudioProvider] = useState<"sarvamai" | "browser" | null>(null);
  const [currentSpeakingText, setCurrentSpeakingText] = useState("");
  const [speechRate, setSpeechRateState] = useState(0.9);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load and cache voices for browser fallback
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
    // Abort pending TTS fetch if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop HTML Audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop browser SpeechSynthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
    setCurrentSpeakingText("");
    setAudioProvider(null);
    playChime("stop");
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.warn);
      setIsPaused(false);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, []);

  // Helper for browser speech synthesis fallback
  const playBrowserFallback = useCallback(
    (cleanText: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance;
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
          setIsLoadingAudio(false);
          setAudioProvider("browser");
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentSpeakingText("");
          setAudioProvider(null);
          delete (window as any).__activeSpeechUtterance;
        };

        utterance.onerror = (e) => {
          console.warn("Speech synthesis error:", e);
          delete (window as any).__activeSpeechUtterance;
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          setCurrentSpeakingText("");
          setAudioProvider(null);
        };

        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error("Browser speech fallback failed:", err);
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      }
    },
    [language, speechRate]
  );

  const speakText = useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return;

      // Instant audible chime so the farmer receives immediate feedback
      playChime("start");
      setCurrentSpeakingText(text);
      setIsSpeaking(true);
      setIsPaused(false);
      setIsLoadingAudio(true);

      // Clean text
      const cleanText = text
        .replace(/[*#_~`>]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[\n\r]+/g, ". ")
        .trim();

      if (!cleanText) {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        return;
      }

      // Stop previous audio / speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Request TTS from Sarvam AI Python SDK API route
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            language,
            pace: speechRate,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (data.success && data.audioBase64) {
          // Play Sarvam AI audio output
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          audio.playbackRate = speechRate;
          audioRef.current = audio;
          setAudioProvider("sarvamai");
          setIsLoadingAudio(false);

          audio.onplay = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };

          audio.onpause = () => {
            if (!audio.ended) {
              setIsPaused(true);
            }
          };

          audio.onended = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentSpeakingText("");
            setAudioProvider(null);
          };

          audio.onerror = (e) => {
            console.warn("Audio playback error, falling back to browser speech:", e);
            playBrowserFallback(cleanText);
          };

          await audio.play();
          return;
        }

        // If Sarvam AI returned fallback (e.g. insufficient quota / 402 / offline)
        console.warn("Sarvam AI TTS fallback active:", data.message || data.error);
        playBrowserFallback(cleanText);
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.warn("Sarvam TTS request failed, falling back to browser speech:", err);
        playBrowserFallback(cleanText);
      }
    },
    [language, speechRate, playBrowserFallback]
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
        isLoadingAudio,
        audioProvider,
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
