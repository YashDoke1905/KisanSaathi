"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";
import { Home, Sprout, TrendingUp, Landmark, MoreHorizontal } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: "/",
      label: t("nav.home"),
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/farm",
      label: t("nav.farms"),
      icon: Sprout,
      isActive:
        pathname.startsWith("/farm") ||
        pathname.startsWith("/planner") ||
        pathname.startsWith("/ledger"),
    },
    {
      href: "/market",
      label: t("nav.market"),
      icon: TrendingUp,
      isActive: pathname.startsWith("/market"),
    },
    {
      href: "/schemes",
      label: t("nav.schemes"),
      icon: Landmark,
      isActive: pathname.startsWith("/schemes"),
    },
    {
      href: "/more",
      label: t("nav.more"),
      icon: MoreHorizontal,
      isActive:
        pathname.startsWith("/more") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/doctor") ||
        pathname.startsWith("/diversification"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F4]/95 dark:bg-[#131814]/95 backdrop-blur-md border-t border-cream-200/90 dark:border-forest-900/60 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-bottom"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[54px] min-w-[48px] py-1 rounded-2xl transition-all relative ${
                item.isActive
                  ? "text-forest-900 dark:text-cream-50 font-bold"
                  : "text-soil-600 dark:text-cream-400 hover:text-forest-800 dark:hover:text-cream-200"
              }`}
              aria-current={item.isActive ? "page" : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  item.isActive
                    ? "bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-harvest-300 shadow-xs scale-105"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    item.isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span className="text-[10.5px] leading-tight tracking-tight text-center truncate max-w-[62px] mt-0.5">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-forest-700 dark:bg-harvest-400 absolute bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
