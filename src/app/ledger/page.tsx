"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { playChime, speakWithFallback } from "@/lib/soundUtils";

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
            ? "✓ Entry successfully saved to Farmer Diary!"
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
    if (!confirm(language === "en" ? "Delete this entry?" : "ही नोंद वहीखात्यातून वगळायची आहे का?")) {
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
    <div className="flex min-h-screen flex-col bg-stone-50 pb-28 dark:bg-stone-950">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-3 py-4 space-y-4">
        {/* Header Card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <span>📖</span>
              {language === "en" ? "Farmer Khata & Diary (वहीखाते)" : "शेतकरी वहीखाते व रोजनिशी"}
            </h1>
            <ProvenanceBadge type="user" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            {language === "en"
              ? "Your digital farm khata: track every rupee spent on seeds, fertilizer, labour, diesel, and sales income."
              : "आपली डिजिटल शेत वही: बियाणे, खते, मजुरी, डिझेल व शेतमाल विक्रीच्या प्रत्येक रुपयाचा अचूक हिशोब ठेवा."}
          </p>

          {/* Top 3 Financial Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Balance */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-2.5 text-white shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                {language === "en" ? "Cash Balance" : "एकूण शिल्लक"}
              </span>
              <p className="text-base font-extrabold mt-0.5">
                ₹{summary.netBalance.toLocaleString("en-IN")}
              </p>
              <span className="text-[9px] text-emerald-300 font-medium block">
                {summary.netBalance >= 0 ? "✓ बचत/शिल्लक" : "तुटवडा"}
              </span>
            </div>

            {/* Total Expense */}
            <div className="rounded-xl bg-rose-50 p-2.5 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">
                {language === "en" ? "Total Spent" : "एकूण खर्च"}
              </span>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                ₹{summary.totalExpense.toLocaleString("en-IN")}
              </p>
              <span className="text-[9px] text-stone-500 block">
                {transactions.filter((t) => t.type === "expense").length} नोंदी
              </span>
            </div>

            {/* Total Income */}
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                {language === "en" ? "Total Income" : "एकूण जमा"}
              </span>
              <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                ₹{summary.totalIncome.toLocaleString("en-IN")}
              </p>
              <span className="text-[9px] text-stone-500 block">
                {transactions.filter((t) => t.type === "income").length} विक्री नोंदी
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={handleReadLedger}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
            >
              <span>🔊</span>
              <span>{language === "en" ? "Listen to Balance" : "हिशोब ऐका (बोला)"}</span>
            </button>
            <span className="text-[11px] text-stone-500">
              {transactions.length} {language === "en" ? "total transactions" : "एकूण व्यवहार नोंदवले"}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-stone-200/80 p-1 dark:bg-stone-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("diary")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "diary"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
            }`}
          >
            <span>📝</span>
            <span>{language === "en" ? "Farmer Diary (रोजनिशी)" : "शेतकरी डायरी (सर्व नोंदी)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("variance")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "variance"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
            }`}
          >
            <span>📊</span>
            <span>{language === "en" ? "Crop Plan vs Actual" : "पीकनिहाय ताळेबंद (Variance)"}</span>
          </button>
        </div>

        {/* ================= TAB 1: FARMER DIARY (वहीखाते रोजनिशी) ================= */}
        {activeTab === "diary" && (
          <div className="space-y-4 animate-fade-in">
            {/* Add New Transaction Entry Form */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span>➕</span>
                  {language === "en" ? "Record New Entry in Khata" : "वहीखात्यात नवीन नोंद करा"}
                </h2>
                {feedbackMsg && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40">
                    {feedbackMsg}
                  </span>
                )}
              </div>

              {/* Type Toggle: Expense vs Income */}
              <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEntryType("expense")}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    entryType === "expense"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
                  }`}
                >
                  💸 {language === "en" ? "Record Expense" : "झालेला खर्च नोंदवा"}
                </button>

                <button
                  type="button"
                  onClick={() => setEntryType("income")}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    entryType === "income"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900 dark:text-stone-400"
                  }`}
                >
                  💰 {language === "en" ? "Record Sales Income" : "शेतमाल विक्री / जमा"}
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-3 pt-1">
                {/* Crop / Plan Linker (Optional: can be general farm or specific plan) */}
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === "en" ? "Link to Crop / Activity:" : "पीक किंवा खाते निवडा:"}
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-semibold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  >
                    <option value="">🌾 सामान्य शेती खर्च (General Farm Diary)</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        🌱 {p.cropNameMr} ({p.areaAcre} एकर)
                      </option>
                    ))}
                  </select>
                </div>

                {entryType === "expense" ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          खर्च प्रकार (Category):
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
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
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          रक्कम (₹ Amount): *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="उदा. २५००"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2 text-xs font-bold text-stone-900 focus:border-rose-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          विक्री प्रमाण (क्विंटल):
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="उदा. १५.५"
                          value={quantityQtl}
                          onChange={(e) => setQuantityQtl(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          दर (₹ प्रति क्विंटल):
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="उदा. २४५०"
                          value={ratePerQtl}
                          onChange={(e) => setRatePerQtl(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        बाजार समिती / व्यापारी नाव:
                      </label>
                      <input
                        type="text"
                        value={mandiName}
                        onChange={(e) => setMandiName(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      तारीख (Date):
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      तपशील / पावती (Notes):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. २ पोती DAP किंवा ट्रॅक्टर"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow active:scale-95 transition-all min-h-[48px] ${
                    entryType === "expense" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {saving
                    ? "नोंद जतन करत आहे..."
                    : entryType === "expense"
                    ? "💸 वहीखात्यात खर्च जतन करा (Save Expense)"
                    : "💰 वहीखात्यात विक्री जमा करा (Save Sale Income)"}
                </button>
              </form>
            </div>

            {/* Transaction Passbook & Filter Feed */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {language === "en" ? "Diary Passbook History" : "रोजनिशी व्यवहार नोंदवही"}
                </h3>
                {/* Filter Pills */}
                <div className="flex gap-1 text-[11px]">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`rounded-lg px-2 py-0.5 font-bold transition-all ${
                      filterType === "all"
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                    }`}
                  >
                    सर्व ({transactions.length})
                  </button>
                  <button
                    onClick={() => setFilterType("expense")}
                    className={`rounded-lg px-2 py-0.5 font-bold transition-all ${
                      filterType === "expense"
                        ? "bg-rose-600 text-white"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                    }`}
                  >
                    खर्च
                  </button>
                  <button
                    onClick={() => setFilterType("income")}
                    className={`rounded-lg px-2 py-0.5 font-bold transition-all ${
                      filterType === "income"
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                    }`}
                  >
                    जमा
                  </button>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  <span className="text-2xl block mb-1">📖</span>
                  {language === "en"
                    ? "No transactions recorded yet. Use the form above to record your first farm expense or income!"
                    : "अद्याप कोणतीही नोंद नाही. वर दिलेला फॉर्म वापरून पहिला खर्च किंवा शेतमाल विक्री नोंदवा!"}
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredTransactions.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-850 px-1 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800">
                          {getCategoryIcon(item.category, item.type)}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                            <span>
                              {item.type === "expense"
                                ? item.category || "इतर खर्च"
                                : item.mandiName
                                ? `विक्री (${item.mandiName})`
                                : "शेतमाल विक्री"}
                            </span>
                            {item.cropNameMr ? (
                              <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-semibold dark:bg-emerald-950 dark:text-emerald-300">
                                {item.cropNameMr}
                              </span>
                            ) : (
                              <span className="text-[10px] rounded-full bg-stone-100 text-stone-600 px-1.5 py-0.2 font-normal dark:bg-stone-800 dark:text-stone-400">
                                सामान्य शेत
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            {item.notes && <span className="font-medium mr-1.5">{item.notes} •</span>}
                            {item.quantityQuintal && (
                              <span className="mr-1.5">{item.quantityQuintal} क्विंटल @ ₹{item.ratePerQuintal} •</span>
                            )}
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p
                            className={`font-extrabold text-sm ${
                              item.type === "expense"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {item.type === "expense" ? "-" : "+"}₹{item.amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(item.id, item.type)}
                          title="नोंद वगळा"
                          className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                        >
                          ✕
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
          <div className="space-y-4 animate-fade-in">
            {/* Select Active Plan */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                {language === "en" ? "Select Crop Plan to Analyze:" : "तपासणीसाठी पीक नियोजन निवडा:"}
              </label>
              {plans.length > 0 ? (
                <select
                  value={variancePlanId}
                  onChange={(e) => setVariancePlanId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-bold text-stone-900 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cropNameMr} ({p.areaAcre} एकर)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-stone-500 py-2">
                  कोणतेही पीक नियोजन उपलब्ध नाही.{" "}
                  <Link href="/planner/new" className="text-emerald-700 font-bold underline">
                    नवीन पीक नियोजन तयार करा →
                  </Link>
                </div>
              )}
            </div>

            {/* Variance Details */}
            {variancePlanDetail && (
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-stone-200 dark:bg-stone-900 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {language === "en" ? "Planned vs Actual Variance" : "नियोजित वि. प्रत्यक्ष ताळेबंद"}
                  </h2>
                  <span className="text-xs font-bold text-emerald-700">
                    {variancePlanDetail.cropData?.nameMr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Cost Variance */}
                  <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500 block">प्रत्यक्ष खर्च:</span>
                    <p className="font-extrabold text-sm text-stone-900 dark:text-white mt-0.5">
                      ₹{variancePlanDetail.ledger.actualExpenseTotal.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      नियोजित: ₹{variancePlanDetail.calculation.totalCost.toLocaleString("en-IN")}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-1 ${
                        variancePlanDetail.ledger.actualExpenseTotal <= variancePlanDetail.calculation.totalCost
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      तफावत: {variancePlanDetail.ledger.varianceCost >= 0 ? `+₹${variancePlanDetail.ledger.varianceCost}` : `-₹${Math.abs(variancePlanDetail.ledger.varianceCost)}`}
                    </p>
                  </div>

                  {/* Income Realized */}
                  <div className="rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] text-stone-500 block">विक्री उत्पन्न:</span>
                    <p className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                      ₹{variancePlanDetail.ledger.actualIncomeTotal.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      अपेक्षित: ₹{variancePlanDetail.calculation.grossRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] font-bold mt-1 text-stone-700 dark:text-stone-300">
                      निव्वळ नफा: ₹{variancePlanDetail.ledger.actualNetProfit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Self-Calibrating Learning Banner */}
                <div className="rounded-xl bg-emerald-50 p-3 text-xs border border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200">
                  <p className="font-bold flex items-center gap-1">
                    <span>🧠</span>
                    {language === "en" ? "Self-Learning Soil Calibration:" : "शेतकरी डेटा आधारित अचूक अंदाज:"}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    {language === "en"
                      ? "Every ledger entry trains your farm's unique performance profile for more accurate next-season planning."
                      : "आपण नोंदवलेला प्रत्येक प्रत्यक्ष खर्च व शेतमाल उतारा आपल्या जमिनीच्या गुणवत्तेची नोंद ठेवतो, ज्यामुळे पुढील हंगामात आणखी अचूक अंदाज मिळतो."}
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
