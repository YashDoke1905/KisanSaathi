"use client";

import React from "react";
import { StepExplanation } from "@/engine/types";
import { playChime, speakWithFallback } from "@/lib/soundUtils";

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: StepExplanation[];
  language?: string;
  cropName: string;
}

export function CalculationModal({
  isOpen,
  onClose,
  steps,
  language = "mr",
  cropName,
}: CalculationModalProps) {
  if (!isOpen) return null;

  const handleReadAloud = () => {
    playChime();
    const narrationText = steps
      .map(
        (s) =>
          `पायरी ${s.stepNumber}: ${language === "en" ? s.titleEn : s.titleMr}. ${s.inputsDesc}. निष्कर्ष: ${s.calculatedValue}.`
      )
      .join(" ");

    speakWithFallback(`हिशोब कसा केला? ${cropName} पिकाचे आर्थिक विश्लेषण. ${narrationText}`, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-fade-in">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
              🧮
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                {language === "en" ? "How was this calculated?" : "हिशोब कसा केला? (पारदर्शक सूत्रे)"}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {cropName} • {language === "en" ? "ICAR & MPKV Formula Driven" : "कृषी विद्यापीठ प्रमाणके"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200/70 text-stone-700 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Listen Button */}
        <div className="flex items-center justify-between px-4 py-2 bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800">
          <span className="text-xs text-stone-600 dark:text-stone-400">
            {language === "en" ? "Listen to full breakdown" : "संपूर्ण हिशोब आवाजात ऐका"}
          </span>
          <button
            onClick={handleReadAloud}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-800 active:scale-95"
          >
            🔊 {language === "en" ? "Read Aloud" : "ऐका"}
          </button>
        </div>

        {/* Scrollable Steps */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-850"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold dark:bg-emerald-900/60 dark:text-emerald-300">
                    {step.stepNumber}
                  </span>
                  {language === "en" ? step.titleEn : step.titleMr}
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {step.calculatedValue}
                </span>
              </div>

              {/* Math Formula */}
              <div className="rounded bg-white/90 p-2 font-mono text-[11px] text-stone-800 border border-stone-200 dark:bg-stone-900/80 dark:border-stone-750 dark:text-stone-200 my-1.5">
                <span className="text-stone-400 select-none">📐 </span>
                {step.formula}
              </div>

              {/* Input values */}
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {step.inputsDesc}
              </p>

              {/* Source verification */}
              <div className="mt-2 flex items-center gap-1 text-[10px] text-stone-500 dark:text-stone-400">
                <span>📚 आधार:</span>
                <span className="font-medium italic">{step.sourceNote}</span>
              </div>
            </div>
          ))}

          {/* Trust Guarantee Note */}
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-250 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
            <p className="font-semibold flex items-center gap-1 mb-1">
              <span>🌾</span>
              {language === "en" ? "KisanSaathi Honest Farmer Promise:" : "किसानसाथी पारदर्शकता हमी:"}
            </p>
            <p className="text-[11px] leading-relaxed">
              {language === "en"
                ? "No number is hidden. These figures use state agricultural university packages of practices and 3-year mandi price averages. Please verify with your local KVK or Agriculture Officer before major capital outlays."
                : "कोणताही आकडा मनात तयार केलेला नाही. हे सर्व हिशोब राज्य कृषी विद्यापीठांचे सुधारित तंत्रज्ञान व ३ वर्षांच्या सरासरी बाजारभावावर आधारित आहेत. प्रत्यक्ष पेरणीपूर्वी स्थानिक कृषी विज्ञान केंद्र (KVK) कडून तपासणी करावी."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 p-3 bg-stone-50 dark:bg-stone-850 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-900 dark:bg-stone-700 active:scale-95"
          >
            {language === "en" ? "Understood / Close" : "समजले / बंद करा"}
          </button>
        </div>
      </div>
    </div>
  );
}
