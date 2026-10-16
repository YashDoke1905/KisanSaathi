import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Scale, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import type { YieldPredictionResponse } from '../types';

export const YieldPredictorPage: React.FC = () => {
  const [formData, setFormData] = useState({
    crop_name: 'Wheat',
    farm_area_hectares: 4.5,
    fertilizer_usage_kg_per_ha: 140,
    rainfall_annual_mm: 750,
    soil_type: 'Loamy',
    irrigation_type: 'Drip',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const crops = ['Wheat', 'Rice', 'Maize', 'Tomato', 'Potato', 'Cotton', 'Soybean', 'Chickpea', 'Banana'];
  const soils = ['Loamy', 'Alluvial', 'Black', 'Clay', 'Sandy'];
  const irrigations = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.predictYield(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Yield prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Crop Yield & Revenue Forecaster</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical agronomic regression estimating harvest tonnage and market value based on input factors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <form onSubmit={handlePredict} className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Farm & Agronomic Profile</h3>

          {/* Crop Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Crop</label>
            <select
              value={formData.crop_name}
              onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Farm Area */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Farm Land Area</span>
              <span className="text-amber-700">{formData.farm_area_hectares} Hectares (~{(formData.farm_area_hectares * 2.471).toFixed(1)} Acres)</span>
            </div>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="500"
              value={formData.farm_area_hectares}
              onChange={(e) => setFormData({ ...formData, farm_area_hectares: Number(e.target.value) })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          {/* Fertilizer usage */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Fertilizer Application</span>
              <span className="text-amber-700">{formData.fertilizer_usage_kg_per_ha} kg / ha</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={formData.fertilizer_usage_kg_per_ha}
              onChange={(e) => setFormData({ ...formData, fertilizer_usage_kg_per_ha: Number(e.target.value) })}
              className="w-full accent-amber-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rainfall */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Annual / Seasonal Rainfall</span>
              <span className="text-blue-700">{formData.rainfall_annual_mm} mm</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={formData.rainfall_annual_mm}
              onChange={(e) => setFormData({ ...formData, rainfall_annual_mm: Number(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Soil & Irrigation Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Soil Classification</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {soils.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Irrigation System</label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {irrigations.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Computing Yield Model...' : 'Calculate Predicted Yield'}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="bg-white rounded-3xl p-16 border border-slate-200/80 text-center text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-xs">Enter your farm details on the left and click "Calculate Predicted Yield" to view production estimates.</p>
            </div>
          )}

          {result && (
            <>
              {/* Primary Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Unit Productivity</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {result.predicted_yield_tons_per_ha}
                    <span className="text-xs font-semibold text-slate-500 ml-1">tons / ha</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    Based on {result.crop_name}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Total Harvest</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {result.total_expected_yield_tons}
                    <span className="text-xs font-semibold text-slate-500 ml-1">Tons</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Across {result.farm_area_hectares} hectares
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>Est. Gross Revenue</span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 mt-2">
                    ${result.market_value_estimate_usd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Current wholesale average
                  </span>
                </div>
              </div>

              {/* Agronomic Factor Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Agronomic Factor Multipliers</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-slate-400 block text-[10px]">Soil Multiplier</span>
                    <span className="font-bold text-slate-800 text-sm">{result.factors_impact.soil_impact}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-slate-400 block text-[10px]">Irrigation Efficiency</span>
                    <span className="font-bold text-slate-800 text-sm">{result.factors_impact.irrigation_impact}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-slate-400 block text-[10px]">Fertilizer Response</span>
                    <span className="font-bold text-slate-800 text-sm">{result.factors_impact.fertilizer_efficiency}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-slate-400 block text-[10px]">Rainfall Rating</span>
                    <span className="font-bold text-slate-800 text-sm">{result.factors_impact.rainfall_adequacy}</span>
                  </div>
                </div>
              </div>

              {/* Optimization Recommendations */}
              <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl">
                <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider mb-2">
                  Agronomic Optimization Advice
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
