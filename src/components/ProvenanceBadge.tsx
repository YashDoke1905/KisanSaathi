"use client";

import React from "react";
import { useLanguage } from "@/lib/languageContext";

export type ProvenanceType = "live" | "estimate" | "user" | "demo";

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  sourceText?: string;
  dateText?: string;
  className?: string;
}

export function ProvenanceBadge({
  type,
  sourceText,
  dateText,
  className = "",
}: ProvenanceBadgeProps) {
  const { t } = useLanguage();

  const config = {
    live: {
      bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      dot: "bg-emerald-500",
      label: t("badges.live"),
    },
    estimate: {
      bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      dot: "bg-amber-500",
      label: t("badges.estimate"),
    },
    user: {
      bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      dot: "bg-blue-500",
      label: t("badges.user"),
    },
    demo: {
      bg: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      dot: "bg-purple-500",
      label: t("badges.demo"),
    },
  };

  const item = config[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${item.bg} ${className}`}
      title={sourceText ? `${item.label} (${sourceText}${dateText ? ` • ${dateText}` : ""})` : item.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
      <span>{item.label}</span>
      {sourceText && (
        <span className="text-[10px] opacity-80 border-l border-current/30 pl-1 ml-0.5">
          {sourceText}
        </span>
      )}
    </span>
  );
}
