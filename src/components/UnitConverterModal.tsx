"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/languageContext";
import { Calculator, X } from "lucide-react";

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (acre: number) => void;
}

export function UnitConverterModal({
  isOpen,
  onClose,
  onApply,
}: UnitConverterModalProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState<number>(1);
  const [inputUnit, setInputUnit] = useState<"acre" | "guntha" | "hectare" | "bigha">("guntha");

  if (!isOpen) return null;

  // Convert input value to normalized acres
  let acres = 0;
  if (inputUnit === "acre") acres = inputValue;
  else if (inputUnit === "guntha") acres = inputValue / 40;
  else if (inputUnit === "hectare") acres = inputValue * 2.47105;
  else if (inputUnit === "bigha") acres = inputValue * 0.625;

  const gunthas = acres * 40;
  const hectares = acres * 0.404686;
  const bighas = acres * 1.6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-kisan-green-700 text-white">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <h3 className="font-bold text-base">{t("farm.unit_converter")}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              {t("farm.area")}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={inputValue || ""}
                onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
                placeholder="0"
              />
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[48px]"
              >
                <option value="guntha">{t("farm.guntha")} (गुंठे)</option>
                <option value="acre">{t("farm.acre")} (एकर)</option>
                <option value="hectare">{t("farm.hectare")} (हेक्टर)</option>
                <option value="bigha">{t("farm.bigha")} (बीघा)</option>
              </select>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Equivalent Values
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-xs text-zinc-500 block">{t("farm.acre")}</span>
                <span className="font-bold text-kisan-green-800 dark:text-kisan-green-400 text-base">
                  {acres.toFixed(2)}
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-xs text-zinc-500 block">{t("farm.guntha")}</span>
                <span className="font-bold text-kisan-soil-800 dark:text-kisan-soil-300 text-base">
                  {gunthas.toFixed(1)}
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-xs text-zinc-500 block">{t("farm.hectare")}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  {hectares.toFixed(3)}
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-xs text-zinc-500 block">{t("farm.bigha")}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  {bighas.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-700 text-center">
              {t("farm.converter_formula")}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {onApply && (
              <button
                type="button"
                onClick={() => {
                  onApply(parseFloat(acres.toFixed(2)));
                  onClose();
                }}
                className="flex-1 bg-kisan-green-700 hover:bg-kisan-green-800 text-white font-bold py-3 px-4 rounded-xl min-h-[48px] shadow-sm active:scale-98 transition-transform"
              >
                Apply ({acres.toFixed(2)} {t("farm.acre")})
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold min-h-[48px]"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
