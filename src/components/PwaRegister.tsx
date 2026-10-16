"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[KisanSaathi] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[KisanSaathi] Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
