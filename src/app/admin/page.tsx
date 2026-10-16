"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Wheat,
  Store,
  FileCheck2,
  Activity,
  Search,
  Edit2,
  Check,
  X,
  RefreshCw,
  LogOut,
  AlertCircle,
  Database,
  CloudSun,
  Smartphone,
  Server,
  ArrowLeft,
} from "lucide-react";

const DEMO_PASSCODE = "KISAN_ADMIN_2026";

export default function AdminPage() {
  const { language } = useLanguage();
  const isMr = language === "mr";

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("KISAN_ADMIN_2026");
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"crops" | "mandi" | "schemes" | "telemetry">("crops");

  // Data State
  const [loading, setLoading] = useState<boolean>(false);
  const [crops, setCrops] = useState<any[]>([]);
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any | null>(null);

  // Search & Edit Modal
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [editSeedCost, setEditSeedCost] = useState<number>(0);
  const [editYield, setEditYield] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const saved = sessionStorage.getItem("kisan_admin_passcode");
    if (saved === DEMO_PASSCODE) {
      setIsAuthenticated(true);
      fetchAdminData(saved);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === DEMO_PASSCODE) {
      sessionStorage.setItem("kisan_admin_passcode", DEMO_PASSCODE);
      setIsAuthenticated(true);
      setAuthError(null);
      fetchAdminData(DEMO_PASSCODE);
    } else {
      setAuthError(isMr ? "अवैध ॲडमिन पासवर्ड. कृपया KISAN_ADMIN_2026 वापरा." : "Invalid passcode. Use KISAN_ADMIN_2026.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("kisan_admin_passcode");
    setIsAuthenticated(false);
  };

  const fetchAdminData = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?passcode=${code}`);
      const json = await res.json();
      if (json.success) {
        setCrops(json.crops);
        setMandiPrices(json.mandiPrices);
        setSchemes(json.schemes);
        setTelemetry(json.telemetry);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCropEdit = async () => {
    if (!editingCrop) return;
    try {
      const res = await fetch("/api/admin?passcode=" + DEMO_PASSCODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CROP",
          cropId: editingCrop.id,
          updates: {
            seedCostPerKg: Number(editSeedCost),
            baseYieldQuintalsPerAcre: Number(editYield),
            basePricePerQuintal: Number(editPrice),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccessMsg(isMr ? "पीक मास्टर डेटा यशस्वीरित्या अद्यतनित झाला!" : "Crop master updated successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3000);
        setEditingCrop(null);
        fetchAdminData(DEMO_PASSCODE);
      }
    } catch (err) {
      console.error("Crop save error:", err);
    }
  };

  const handleQuickMandiPriceUpdate = async (mandiId: string, newPrice: number) => {
    try {
      const res = await fetch("/api/admin?passcode=" + DEMO_PASSCODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_MANDI",
          mandiId,
          updates: { benchmarkPricePerQtl: newPrice },
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAdminData(DEMO_PASSCODE);
      }
    } catch (err) {
      console.error("Mandi update error:", err);
    }
  };

  // FILTER CROPS
  const filteredCrops = crops.filter(
    (c) =>
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameMr.includes(searchTerm) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold">
              {isMr ? "प्रशासकीय नियंत्रण कक्ष (Admin)" : "KisanSaathi Admin Console"}
            </h1>
            <p className="text-xs text-zinc-400">
              {isMr
                ? "पीक मास्टर डेटा, बाजार भाव व योजना व्यवस्थापन"
                : "Master agronomy data, APMC price overrides & telemetry"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {isMr ? "ॲडमिन पासवर्ड (Admin Passcode):" : "Admin Passcode:"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full text-sm px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/50">
                💡 <span className="font-semibold text-emerald-400">Pair-Programming Demo Passcode:</span>{" "}
                <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-white font-mono">KISAN_ADMIN_2026</code>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>{isMr ? "कंसोलमध्ये प्रवेश करा" : "Unlock Admin Console"}</span>
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
                ← {isMr ? "शेतकरी ॲपवर परत जा" : "Back to Farmer App"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // MAIN ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              title="Back to App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">
                  {isMr ? "किसानसाथी ॲडमिन पॅनेल" : "KisanSaathi Admin Console"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  SECURE MODE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isMr
                  ? "केंद्रीय कृषी डेटाबेस व्यवस्थापन प्रणाली"
                  : "Central Agronomic Data & Mandi Management Engine"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAdminData(DEMO_PASSCODE)}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isMr ? "रिफ्रेश" : "Sync"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMr ? "बाहेर पडा" : "Logout"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 border-t border-zinc-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("crops")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "crops"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Wheat className="w-4 h-4" />
            <span>{isMr ? "🌾 पीक मास्टर डेटा" : "🌾 Crop Master Data"}</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
              {crops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("mandi")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "mandi"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isMr ? "🏪 बाजार भाव व्यवस्थापन" : "🏪 Mandi Benchmark Prices"}</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
              {mandiPrices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("schemes")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "schemes"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{isMr ? "📜 योजना पडताळणी" : "📜 Scheme Provenance"}</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
              {schemes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "telemetry"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isMr ? "📊 सिस्टीम टेलीमेट्री" : "📊 System Telemetry"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: CROP MASTER DATA
            ======================================================== */}
        {activeTab === "crops" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isMr ? "पीक शोधा (उदा. कापूस, कांदा)..." : "Search crops..."}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                />
              </div>
              <div className="text-xs text-zinc-400">
                {isMr ? `एकूण ${filteredCrops.length} पिके दर्शविली` : `Showing ${filteredCrops.length} crops`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCrops.map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 relative hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isMr ? c.nameMr : c.nameEn} ({c.nameEn})
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {c.category} • {c.season}
                      </div>
                    </div>
                    {c.isOverridden && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        MODIFIED
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div>
                      <div className="text-zinc-500">{isMr ? "बियाणे दर:" : "Seed Cost:"}</div>
                      <div className="font-bold text-emerald-400">₹{c.seedCostPerKg}/kg</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">{isMr ? "उत्पादन:" : "Yield:"}</div>
                      <div className="font-bold text-zinc-200">{c.baseYieldQuintalsPerAcre} Qtl</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">{isMr ? "भाव:" : "Price:"}</div>
                      <div className="font-bold text-zinc-200">₹{c.basePricePerQuintal}/Q</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-zinc-500">
                      कालावधी: {c.durationDaysMin}-{c.durationDaysMax} दिवस
                    </span>
                    <button
                      onClick={() => {
                        setEditingCrop(c);
                        setEditSeedCost(c.seedCostPerKg);
                        setEditYield(c.baseYieldQuintalsPerAcre);
                        setEditPrice(c.basePricePerQuintal);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isMr ? "संपादित करा" : "Edit"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* EDIT MODAL */}
            {editingCrop && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-sm text-white">
                      {isMr ? `मास्टर डेटा संपादन: ${editingCrop.nameMr}` : `Edit Crop: ${editingCrop.nameEn}`}
                    </h3>
                    <button
                      onClick={() => setEditingCrop(null)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">
                        {isMr ? "बियाणे दर (₹ प्रति किलो):" : "Seed Cost (₹/kg):"}
                      </label>
                      <input
                        type="number"
                        value={editSeedCost}
                        onChange={(e) => setEditSeedCost(Number(e.target.value))}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">
                        {isMr ? "सरासरी उत्पादन (क्विंटल प्रति एकर):" : "Base Yield (Qtl/Acre):"}
                      </label>
                      <input
                        type="number"
                        value={editYield}
                        onChange={(e) => setEditYield(Number(e.target.value))}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">
                        {isMr ? "हमी / आधारभूत भाव (₹ प्रति क्विंटल):" : "Base Price (₹/Quintal):"}
                      </label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleSaveCropEdit}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                    >
                      {isMr ? "बदल जतन करा" : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditingCrop(null)}
                      className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                    >
                      {isMr ? "रद्द करा" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: MANDI PRICES
            ======================================================== */}
        {activeTab === "mandi" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              {isMr
                ? "महाराष्ट्र कृषी पणन मंडळ (MSAMB) व ॲगमार्कनेट अधिकृत बाजारभाव व्यवस्थापन"
                : "Agmarknet Maharashtra APMC benchmark price management"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mandiPrices.map((m) => (
                <div
                  key={m.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isMr ? m.nameMr : m.nameEn}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {m.district} • सेस: {m.marketFeePercent}% • हमाली: ₹{m.hamaliPerQuintal}/Q
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                      {m.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400">
                    मुख्य पिके: {m.primaryCrops.join(", ")}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">बेंचमार्क भाव:</span>
                      <span className="text-base font-bold text-emerald-400">
                        ₹{m.benchmarkPricePerQtl} / क्विंटल
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleQuickMandiPriceUpdate(m.id, m.benchmarkPricePerQtl + 50)
                        }
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
                        title="+ ₹50"
                      >
                        +₹50
                      </button>
                      <button
                        onClick={() =>
                          handleQuickMandiPriceUpdate(m.id, Math.max(500, m.benchmarkPricePerQtl - 50))
                        }
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
                        title="- ₹50"
                      >
                        -₹50
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SCHEME PROVENANCE
            ======================================================== */}
        {activeTab === "schemes" && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-400">
              {isMr
                ? "२१ अधिकृत शासकीय योजना पडताळणी तारीख व शासकीय प्राधिकरण नोंद"
                : "21 verified central & state schemes with official audit authorities"}
            </div>

            <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-800 font-semibold">
                  <tr>
                    <th className="p-3">योजना (Scheme)</th>
                    <th className="p-3">प्रवर्ग</th>
                    <th className="p-3">पडताळणी तारीख</th>
                    <th className="p-3">प्राधिकरण</th>
                    <th className="p-3 text-right">कमाल लाभ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {schemes.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/30">
                      <td className="p-3">
                        <div className="font-bold text-white">{isMr ? s.nameMr : s.nameEn}</div>
                        <div className="text-[10px] text-zinc-500">{s.id}</div>
                      </td>
                      <td className="p-3 text-zinc-300">{s.category}</td>
                      <td className="p-3 text-emerald-400 font-mono text-[11px]">
                        {s.lastVerifiedDate}
                      </td>
                      <td className="p-3 text-zinc-400 text-[11px]">
                        {s.verificationAuthority}
                      </td>
                      <td className="p-3 text-right font-bold text-white">
                        ₹{s.maxBenefitAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: TELEMETRY & SYSTEM HEALTH
            ======================================================== */}
        {activeTab === "telemetry" && telemetry && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>नोंदणीकृत गट भूखंड</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {telemetry.registeredPlots.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-emerald-400">१००% सातबारा अचूकता</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>सक्रिय शेतकरी (या आठवड्यात)</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {telemetry.activeFarmersThisWeek.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-blue-400">दैनिक वाढ +१२.४%</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>पीक डॉक्टर तपासण्या</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {telemetry.cropDoctorDiagnosesTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-purple-400">
                  {telemetry.totalVerifiedDiseases} रोग डेटाबेस
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>सर्व्हर अपटाइम</span>
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  {telemetry.serverUptimePercent}
                </div>
                <div className="text-[10px] text-zinc-400">Zero Downtime</div>
              </div>
            </div>

            {/* Detailed System Health */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                तंत्रज्ञान व डेटाबेस आरोग्य (Infrastructure Health)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">स्थानिक SQLite डेटाबेस:</span>
                  <span className="font-mono text-emerald-400 font-bold">{telemetry.sqliteDbStatus}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">हवामान कॅश कार्यक्षमता:</span>
                  <span className="font-mono text-emerald-400 font-bold">{telemetry.weatherCacheHitRate}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">ऑफलाइन सिंक यश दर:</span>
                  <span className="font-mono text-emerald-400 font-bold">{telemetry.offlineSyncSuccessRate}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">सिस्टीम आवृत्ती:</span>
                  <span className="font-mono text-zinc-300">{telemetry.systemVersion}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
