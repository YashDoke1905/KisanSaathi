"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { playChime, speakWithFallback } from "@/lib/soundUtils";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Volume2,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  Store,
  DollarSign,
} from "lucide-react";

interface LedgerSummary {
  totalExpense: number;
  totalIncome: number;
  netBalance: number;
  expensesByCategory: Record<string, number>;
}

interface TransactionItem {
  id: string;
  type: "expense" | "income";
  date: string;
  category?: string;
  amount: number;
  notes?: string;
  farmName: string;
  cropId?: string | null;
  cropNameMr?: string | null;
  cropNameEn?: string | null;
  planId?: string | null;
  quantityQuintal?: number;
  ratePerQuintal?: number;
  mandiName?: string;
}

export default function LedgerPage() {
  const { t, language } = useLanguage();
  const isMr = language === "mr";
  const isHi = language === "hi";

  const [activeTab, setActiveTab] = useState<"diary" | "variance">("diary");
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<LedgerSummary>({
    totalExpense: 0,
    totalIncome: 0,
    netBalance: 0,
    expensesByCategory: {},
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);

  // Filter state
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");

  // Form states
  const [entryType, setEntryType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Fertilizer");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [quantityQtl, setQuantityQtl] = useState<string>("");
  const [ratePerQtl, setRatePerQtl] = useState<string>("");
  const [mandiName, setMandiName] = useState<string>("लासलगाव APMC");
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  // Variance view state
  const [variancePlanId, setVariancePlanId] = useState<string>("");
  const [variancePlanDetail, setVariancePlanDetail] = useState<any>(null);

  // Load universal ledger data
  const loadLedgerData = async () => {
    try {
      const res = await fetch("/api/ledger");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || { totalExpense: 0, totalIncome: 0, netBalance: 0, expensesByCategory: {} });
        setTransactions(data.transactions || []);
        setPlans(data.plans || []);
        setFarms(data.farms || []);

        if (data.plans && data.plans.length > 0 && !variancePlanId) {
          setVariancePlanId(data.plans[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading ledger:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch plan variance detail when variancePlanId changes
  useEffect(() => {
    async function loadPlanVariance() {
      if (!variancePlanId) return;
      try {
        const res = await fetch(`/api/planner/${variancePlanId}`);
        if (res.ok) {
          const data = await res.json();
          setVariancePlanDetail(data);
        }
      } catch (e) {
        console.error("Error loading variance detail:", e);
      }
    }
    if (activeTab === "variance" && variancePlanId) {
      loadPlanVariance();
    }
  }, [activeTab, variancePlanId]);

  // Submit new entry to universal ledger API
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg("");
    playChime();

    try {
      const payload: any = {
        type: entryType,
        date,
        notes,
        planId: selectedPlanId ? selectedPlanId : undefined,
        farmId: selectedFarmId ? selectedFarmId : undefined,
      };

      if (entryType === "expense") {
        payload.amount = Number(amount);
        payload.category = category;
      } else {
        const q = Number(quantityQtl);
        const r = Number(ratePerQtl);
        payload.quantityQuintal = q;
        payload.ratePerQuintal = r;
        payload.amount = q * r;
        payload.mandiName = mandiName;
      }

      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Reset form
        setAmount("");
        setNotes("");
        setQuantityQtl("");
        setRatePerQtl("");
        setFeedbackMsg(
          language === "en"
            ? "✓ Entry saved to Khata!"
            : isHi
              ? "✓ प्रविष्टि सफलतापूर्वक सहेजी गई!"
              : "✓ नोंद वहीखात्यात यशस्वीरित्या जतन झाली!"
        );
        setTimeout(() => setFeedbackMsg(""), 4000);
        await loadLedgerData();
      } else {
        const err = await res.json();
        alert(`त्रुटी: ${err.error || "नोंद जतन होऊ शकली नाही"}`);
      }
    } catch (err) {
      console.error("Ledger save error:", err);
      alert("Network error saving entry");
    } finally {
      setSaving(false);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: string, type: "expense" | "income") => {
    if (!confirm(language === "en" ? "Delete this entry?" : isHi ? "क्या आप यह प्रविष्टि हटाना चाहते हैं?" : "ही नोंद वहीखात्यातून वगळायची आहे का?")) {
      return;
    }
    try {
      const res = await fetch(`/api/ledger?id=${id}&type=${type}`, { method: "DELETE" });
      if (res.ok) {
        await loadLedgerData();
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // Voice Readout
  const handleReadLedger = () => {
    playChime();
    const text =
      language === "en"
        ? `Farmer Ledger Summary: Your total recorded expense is ${summary.totalExpense} rupees. Total recorded income from sales is ${summary.totalIncome} rupees. Your current cash balance is ${summary.netBalance} rupees.`
        : isHi
          ? `किसान बहीखाता सारांश: कुल दर्ज खर्च ${summary.totalExpense} रुपये है। बिक्री से कुल आय ${summary.totalIncome} रुपये है। वर्तमान नकद शेष ${summary.netBalance} रुपये है।`
          : `शेतकरी वहीखाते सारांश: आपला आतापर्यंतचा एकूण खर्च ${summary.totalExpense} रुपये आहे. शेतमाल विक्रीतून मिळालेले एकूण उत्पन्न ${summary.totalIncome} रुपये आहे. आपल्या वहीखात्यातील निव्वळ शिल्लक ${summary.netBalance} रुपये आहे.`;

    speakWithFallback(text, language);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "expense") return t.type === "expense";
    if (filterType === "income") return t.type === "income";
    return true;
  });

  const getCategoryIcon = (cat?: string, type?: string) => {
    if (type === "income") return "💰";
    switch (cat) {
      case "Fertilizer":
        return "🧪";
      case "Seed":
        return "🌱";
      case "Labour":
        return "👥";
      case "Pesticide":
        return "🧴";
      case "Machinery":
        return "🚜";
      case "Irrigation":
        return "💧";
      case "Harvesting":
        return "🌾";
      case "Transport":
        return "🚚";
      default:
        return "📋";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F4] dark:bg-[#121411] text-stone-900 dark:text-stone-100 transition-colors pb-28">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 space-y-4">
        {/* Top Title & Header Card */}
        <div className="bg-white dark:bg-[#1E221B] rounded-3xl p-4 md:p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>{isMr ? "शेतकरी वहीखाते व रोजनिशी" : isHi ? "किसान बहीखाता एवं डायरी" : "Farmer Khata & Diary"}</span>
            </h1>
            <ProvenanceBadge type="user" />
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 pl-10">
            {isMr
              ? "बियाणे, खते, मजुरी, डिझेल व शेतमाल विक्रीच्या प्रत्येक रुपयाचा अचूक हिशोब ठेवा."
              : isHi
                ? "बीज, उर्वरक, मजदूरी, डीजल व फसल बिक्री के हर रुपये का सटीक हिसाब।"
                : "Digital farm khata: track every rupee spent on seeds, fertilizer, labour, diesel, and sales."}
          </p>

          {/* Top 3 Financial Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Balance */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#0F281E] p-3 text-white shadow-sm border border-[#2D6A4F]/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                {isMr ? "एकूण शिल्लक" : isHi ? "शुद्ध शेष" : "Cash Balance"}
              </span>
              <p className="text-base md:text-lg font-black font-mono mt-0.5 tabular-nums">
                ₹{summary.netBalance.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-emerald-300 font-medium block">
                {summary.netBalance >= 0 ? (isMr ? "✓ बचत/शिल्लक" : "✓ Surplus") : (isMr ? "तुटवडा" : "Deficit")}
              </span>
            </div>

            {/* Total Expense */}
            <div className="rounded-2xl bg-rose-50/80 p-3 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">
                {isMr ? "एकूण खर्च" : isHi ? "कुल खर्च" : "Total Spent"}
              </span>
              <p className="text-sm md:text-base font-black font-mono text-rose-700 dark:text-rose-400 mt-0.5 tabular-nums">
                ₹{summary.totalExpense.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-stone-500 block">
                {transactions.filter((t) => t.type === "expense").length} {isMr ? "नोंदी" : "entries"}
              </span>
            </div>

            {/* Total Income */}
            <div className="rounded-2xl bg-emerald-50/80 p-3 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                {isMr ? "एकूण जमा" : isHi ? "कुल जमा" : "Total Income"}
              </span>
              <p className="text-sm md:text-base font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                ₹{summary.totalIncome.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-stone-500 block">
                {transactions.filter((t) => t.type === "income").length} {isMr ? "विक्री" : "sales"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={handleReadLedger}
              className="text-xs font-bold text-[#1B4332] dark:text-[#52B788] hover:underline flex items-center gap-1.5 py-1 min-h-[36px]"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isMr ? "हिशोब ऐका (बोला)" : isHi ? "हिसाब सुनें" : "Listen to Balance"}</span>
            </button>
            <span className="text-[11px] text-stone-500 font-medium">
              {transactions.length} {isMr ? "एकूण व्यवहार नोंदवले" : isHi ? "कुल प्रविष्टियां" : "total transactions"}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-stone-200/70 dark:bg-stone-900/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("diary")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === "diary"
                ? "bg-white dark:bg-[#1E221B] text-[#1B4332] dark:text-[#52B788] shadow-sm font-extrabold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isMr ? "शेतकरी डायरी (नोंदी)" : isHi ? "बहीखाता डायरी" : "Farmer Diary"}</span>
          </button>

          <button
            onClick={() => setActiveTab("variance")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === "variance"
                ? "bg-white dark:bg-[#1E221B] text-[#1B4332] dark:text-[#52B788] shadow-sm font-extrabold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isMr ? "पीकनिहाय ताळेबंद (Variance)" : isHi ? "फसल तुलना (Variance)" : "Plan vs Actual"}</span>
          </button>
        </div>

        {/* ================= TAB 1: FARMER DIARY (वहीखाते रोजनिशी) ================= */}
        {activeTab === "diary" && (
          <div className="space-y-4">
            {/* Add New Transaction Entry Form */}
            <div className="rounded-3xl bg-white dark:bg-[#1E221B] p-4 md:p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                  <span>{isMr ? "वहीखात्यात नवीन नोंद करा" : isHi ? "नई प्रविष्टि जोड़ें" : "Record New Entry"}</span>
                </h2>
                {feedbackMsg && (
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                    {feedbackMsg}
                  </span>
                )}
              </div>

              {/* Type Toggle: Expense vs Income */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType("expense")}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[48px] ${
                    entryType === "expense"
                      ? "bg-rose-700 text-white shadow-sm font-extrabold"
                      : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>{isMr ? "झालेला खर्च नोंदवा" : isHi ? "खर्च दर्ज करें" : "Record Expense"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEntryType("income")}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[48px] ${
                    entryType === "income"
                      ? "bg-[#1B4332] text-white shadow-sm font-extrabold"
                      : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{isMr ? "शेतमाल विक्री / जमा" : isHi ? "आय दर्ज करें" : "Record Sale Income"}</span>
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-3 pt-1">
                {/* Crop / Plan Linker */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {isMr ? "पीक किंवा खाते निवडा:" : isHi ? "फसल चुनें:" : "Link to Crop Plan:"}
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                  >
                    <option value="">🌾 सामान्य शेती खर्च (General Farm Diary)</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        🌱 {p.cropNameMr} ({p.areaAcre} {isMr ? "एकर" : "ac"})
                      </option>
                    ))}
                  </select>
                </div>

                {entryType === "expense" ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {isMr ? "खर्च प्रकार:" : isHi ? "श्रेणी:" : "Category:"}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[46px]"
                      >
                        <option value="Fertilizer">🧪 खते (Fertilizer)</option>
                        <option value="Seed">🌱 बियाणे (Seed)</option>
                        <option value="Labour">👥 मजुरी (Labour)</option>
                        <option value="Pesticide">🧴 कीटकनाशके (Pesticide)</option>
                        <option value="Machinery">🚜 ट्रॅक्टर / डिझेल (Machinery)</option>
                        <option value="Irrigation">💧 वीजबिल / पाणी (Irrigation)</option>
                        <option value="Harvesting">🌾 काढणी / तोडणी (Harvesting)</option>
                        <option value="Transport">🚚 वाहतूक / हमाली (Transport)</option>
                        <option value="Other">📋 इतर खर्च (Other)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {isMr ? "रक्कम (₹): *" : isHi ? "राशि (₹): *" : "Amount (₹): *"}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="उदा. २५००"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-black font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[46px]"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {isMr ? "विक्री प्रमाण (क्विंटल):" : isHi ? "मात्रा (क्विंटल):" : "Quantity (Qtl):"}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="उदा. १५.५"
                          value={quantityQtl}
                          onChange={(e) => setQuantityQtl(e.target.value)}
                          className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-bold font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {isMr ? "दर (₹ प्रति क्विंटल):" : isHi ? "दर (₹/क्विंटल):" : "Rate (₹/Qtl):"}
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="उदा. २४५०"
                          value={ratePerQtl}
                          onChange={(e) => setRatePerQtl(e.target.value)}
                          className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-bold font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {isMr ? "बाजार समिती / व्यापारी नाव:" : isHi ? "मंडी / व्यापारी:" : "Mandi / Buyer:"}
                      </label>
                      <input
                        type="text"
                        value={mandiName}
                        onChange={(e) => setMandiName(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {isMr ? "तारीख (Date):" : isHi ? "तारीख:" : "Date:"}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {isMr ? "तपशील / पावती (Notes):" : isHi ? "विवरण (Notes):" : "Notes:"}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. २ पोती DAP"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all min-h-[52px] ${
                    entryType === "expense" ? "bg-rose-700 hover:bg-rose-800" : "bg-[#1B4332] hover:bg-[#2D6A4F]"
                  }`}
                >
                  {saving
                    ? (isMr ? "नोंद जतन करत आहे..." : "Saving...")
                    : entryType === "expense"
                      ? (isMr ? "💸 वहीखात्यात खर्च जतन करा (Save Expense)" : "Save Expense")
                      : (isMr ? "💰 वहीखात्यात विक्री जमा करा (Save Sale Income)" : "Save Sale Income")}
                </button>
              </form>
            </div>

            {/* Transaction Passbook & Filter Feed */}
            <div className="rounded-3xl bg-white dark:bg-[#1E221B] p-4 md:p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {isMr ? "रोजनिशी व्यवहार नोंदवही" : isHi ? "व्यवहार इतिहास" : "Diary Passbook History"}
                </h3>
                {/* Filter Pills */}
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`rounded-xl px-2.5 py-1 font-bold transition-all min-h-[32px] ${
                      filterType === "all"
                        ? "bg-[#1B4332] text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {isMr ? "सर्व" : "All"} ({transactions.length})
                  </button>
                  <button
                    onClick={() => setFilterType("expense")}
                    className={`rounded-xl px-2.5 py-1 font-bold transition-all min-h-[32px] ${
                      filterType === "expense"
                        ? "bg-rose-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {isMr ? "खर्च" : "Spent"}
                  </button>
                  <button
                    onClick={() => setFilterType("income")}
                    className={`rounded-xl px-2.5 py-1 font-bold transition-all min-h-[32px] ${
                      filterType === "income"
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {isMr ? "जमा" : "Income"}
                  </button>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400 space-y-1">
                  <BookOpen className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold text-stone-600 dark:text-stone-400">
                    {isMr
                      ? "अद्याप कोणतीही नोंद नाही. वर दिलेला फॉर्म वापरून पहिला खर्च किंवा शेतमाल विक्री नोंदवा!"
                      : "No transactions recorded yet. Record your first farm expense or income above!"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredTransactions.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-900/40 px-1 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg p-2 rounded-2xl bg-stone-100 dark:bg-stone-800 shrink-0">
                          {getCategoryIcon(item.category, item.type)}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                            <span>
                              {item.type === "expense"
                                ? item.category || "इतर खर्च"
                                : item.mandiName
                                  ? `विक्री (${item.mandiName})`
                                  : "शेतमाल विक्री"}
                            </span>
                            {item.cropNameMr ? (
                              <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 font-bold">
                                {item.cropNameMr}
                              </span>
                            ) : (
                              <span className="text-[10px] rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 font-normal">
                                {isMr ? "सामान्य शेत" : "Farm"}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {item.notes && <span className="font-medium mr-1.5">{item.notes} •</span>}
                            {item.quantityQuintal && (
                              <span className="mr-1.5 font-mono">{item.quantityQuintal} qtl @ ₹{item.ratePerQuintal} •</span>
                            )}
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2.5">
                        <p
                          className={`font-black font-mono text-sm tabular-nums ${
                            item.type === "expense"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {item.type === "expense" ? "-" : "+"}₹{item.amount.toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={() => handleDeleteEntry(item.id, item.type)}
                          title="नोंद वगळा"
                          className="text-stone-400 hover:text-rose-600 p-1.5 text-xs rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CROP PLAN VARIANCE (पीकनिहाय ताळेबंद) ================= */}
        {activeTab === "variance" && (
          <div className="space-y-4">
            {/* Select Active Plan */}
            <div className="rounded-3xl bg-white dark:bg-[#1E221B] p-4 md:p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {isMr ? "तपासणीसाठी पीक नियोजन निवडा:" : isHi ? "पीक योजना चुनें:" : "Select Crop Plan to Analyze:"}
              </label>
              {plans.length > 0 ? (
                <select
                  value={variancePlanId}
                  onChange={(e) => setVariancePlanId(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cropNameMr} ({p.areaAcre} {isMr ? "एकर" : "ac"})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-stone-500 py-2">
                  {isMr ? "कोणतेही पीक नियोजन उपलब्ध नाही." : "No crop plan available."}{" "}
                  <Link href="/planner/new" className="text-[#1B4332] dark:text-[#52B788] font-bold underline">
                    {isMr ? "नवीन पीक नियोजन तयार करा →" : "Create new plan →"}
                  </Link>
                </div>
              )}
            </div>

            {/* Variance Details */}
            {variancePlanDetail && (
              <div className="rounded-3xl bg-white dark:bg-[#1E221B] p-4 md:p-5 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {isMr ? "नियोजित वि. प्रत्यक्ष ताळेबंद" : "Planned vs Actual Variance"}
                  </h2>
                  <span className="text-xs font-bold text-[#1B4332] dark:text-[#52B788]">
                    {variancePlanDetail.cropData?.nameMr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Cost Variance */}
                  <div className="rounded-2xl bg-stone-50 dark:bg-stone-900/60 p-3.5 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">{isMr ? "प्रत्यक्ष खर्च:" : "Actual Spent:"}</span>
                    <p className="font-black font-mono text-base text-stone-900 dark:text-stone-100 tabular-nums">
                      ₹{variancePlanDetail.ledger.actualExpenseTotal.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {isMr ? "नियोजित:" : "Planned:"} ₹{variancePlanDetail.calculation.totalCost.toLocaleString("en-IN")}
                    </p>
                    <p
                      className={`text-[11px] font-bold font-mono mt-1 ${
                        variancePlanDetail.ledger.actualExpenseTotal <= variancePlanDetail.calculation.totalCost
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-600"
                      }`}
                    >
                      {isMr ? "तफावत:" : "Diff:"} {variancePlanDetail.ledger.varianceCost >= 0 ? `+₹${variancePlanDetail.ledger.varianceCost}` : `-₹${Math.abs(variancePlanDetail.ledger.varianceCost)}`}
                    </p>
                  </div>

                  {/* Income Realized */}
                  <div className="rounded-2xl bg-stone-50 dark:bg-stone-900/60 p-3.5 text-xs border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">{isMr ? "विक्री उत्पन्न:" : "Actual Income:"}</span>
                    <p className="font-black font-mono text-base text-emerald-700 dark:text-emerald-400 tabular-nums">
                      ₹{variancePlanDetail.ledger.actualIncomeTotal.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {isMr ? "अपेक्षित:" : "Expected:"} ₹{variancePlanDetail.calculation.grossRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] font-bold font-mono mt-1 text-stone-700 dark:text-stone-300">
                      {isMr ? "निव्वळ नफा:" : "Net Profit:"} ₹{variancePlanDetail.ledger.actualNetProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Self-Calibrating Learning Banner */}
                <div className="rounded-2xl bg-emerald-50/80 p-3.5 text-xs border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200 dark:bg-emerald-950/30 space-y-1">
                  <p className="font-bold font-heading flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{isMr ? "शेतकरी डेटा आधारित अचूक अंदाज:" : "Self-Learning Soil Calibration:"}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300/90">
                    {isMr
                      ? "आपण नोंदवलेला प्रत्येक प्रत्यक्ष खर्च व शेतमाल उतारा आपल्या जमिनीच्या गुणवत्तेची नोंद ठेवतो, ज्यामुळे पुढील हंगामात आणखी अचूक अंदाज मिळतो."
                      : "Every ledger entry trains your farm's unique performance profile for more accurate next-season planning."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
