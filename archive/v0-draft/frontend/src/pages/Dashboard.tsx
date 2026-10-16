import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  FlaskConical, 
  Sun, 
  BatteryMedium, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  BrainCircuit,
  TrendingUp,
  ShoppingBag,
  Power
} from 'lucide-react';
import type { SensorReading, IrrigationState, FarmAlert, WeatherResponse } from '../types';

interface DashboardProps {
  reading: SensorReading | null;
  irrigation: IrrigationState | null;
  alerts: FarmAlert[];
  weather: WeatherResponse | null;
  onTogglePump: (active: boolean) => void;
  onToggleMode: (mode: 'auto' | 'manual') => void;
  onResolveAlert: (id: number) => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reading,
  irrigation,
  alerts,
  weather,
  onTogglePump,
  onToggleMode,
  onResolveAlert,
  onNavigate,
}) => {
  const moisture = reading?.soil_moisture ?? 42.0;
  const temp = reading?.temperature ?? 24.5;
  const hum = reading?.humidity ?? 65.0;
  const ph = reading?.soil_ph ?? 6.6;
  const lux = reading?.light_lux ?? 45000;
  const battery = reading?.battery_level ?? 95;

  const getMoistureStatus = (val: number) => {
    if (val < 30) return { label: 'Dry (Needs Water)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (val > 75) return { label: 'Saturated', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'Optimal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const moistureStatus = getMoistureStatus(moisture);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert (if any active critical or warning alert) */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{alerts[0].title}</h4>
              <p className="text-xs text-slate-600">{alerts[0].message}</p>
            </div>
          </div>
          <button
            onClick={() => onResolveAlert(alerts[0].id)}
            className="self-end sm:self-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100/80 hover:bg-amber-200/80 rounded-md transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Acknowledge
          </button>
        </div>
      )}

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Soil Moisture */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Soil Moisture</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{moisture.toFixed(1)}%</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  moisture < 30 ? 'bg-amber-500' : moisture > 75 ? 'bg-blue-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, moisture))}%` }}
              />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${moistureStatus.color}`}>
              {moistureStatus.label}
            </span>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Temperature</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{temp.toFixed(1)}°C</div>
            <p className="text-xs text-slate-500 mt-1">Field ambient canopy</p>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Ideal range: 20-30°C
            </span>
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Air Humidity</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{hum.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">Atmospheric vapor</p>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Moderate Vigor
            </span>
          </div>
        </div>

        {/* Soil pH */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Soil pH</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{ph.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Optimal: 6.0 - 7.2</p>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Slightly Acidic (Good)
            </span>
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sunlight</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{(lux / 1000).toFixed(1)}k Lux</div>
            <p className="text-xs text-slate-500 mt-1">Canopy irradiance</p>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Active Photosynthesis
            </span>
          </div>
        </div>

        {/* Sensor Node Battery */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Node Battery</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BatteryMedium className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{battery.toFixed(0)}%</div>
            <p className="text-xs text-slate-500 mt-1">Solar charged</p>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Full Health
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Weather Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Irrigation Actuator Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Irrigation Pump</h3>
                  <p className="text-xs text-slate-400">Main Line Actuator (Sector 1)</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                irrigation?.is_active 
                  ? 'bg-emerald-500 text-white animate-pulse' 
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {irrigation?.is_active ? 'PUMP ACTIVE' : 'STANDBY'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-300">Control Mode</span>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => onToggleMode('auto')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      irrigation?.mode === 'auto'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => onToggleMode('manual')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      irrigation?.mode === 'manual'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Auto Threshold</span>
                  <span className="font-semibold text-emerald-400">{irrigation?.auto_threshold_moisture}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Target Shutoff</span>
                  <span>{irrigation?.target_moisture}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {irrigation?.mode === 'auto' 
                ? 'Automation triggers below threshold' 
                : 'Manual override active'}
            </span>
            <button
              onClick={() => onTogglePump(!irrigation?.is_active)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                irrigation?.is_active
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
              }`}
            >
              <Power className="w-4 h-4" />
              {irrigation?.is_active ? 'Stop Pump' : 'Start Pump'}
            </button>
          </div>
        </div>

        {/* Agro-Weather & Spray Advisory */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Agro-Meteorological Forecast</h3>
                <p className="text-xs text-slate-500">{weather?.current?.location || 'GreenValley Agricultural Zone'}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900">{weather?.current?.temperature || 27.5}°C</span>
                <p className="text-xs text-slate-500">{weather?.current?.condition || 'Partly Cloudy'}</p>
              </div>
            </div>

            {/* 5-Day Strip */}
            <div className="grid grid-cols-5 gap-2 my-4">
              {weather?.daily_forecast?.map((day, idx) => (
                <div key={idx} className="bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl text-center border border-slate-100 transition-colors">
                  <span className="text-xs font-semibold text-slate-700 block">{day.day_name}</span>
                  <span className="text-xs text-slate-500 my-1 block">{day.condition.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-slate-900 block">{day.temp_max}° / {day.temp_min}°</span>
                  <span className="text-[10px] text-blue-600 mt-1 block">💧 {day.rain_probability}%</span>
                </div>
              ))}
            </div>

            {/* Advisory Highlight */}
            {weather?.advisories && weather.advisories.length > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-200/60 p-3.5 rounded-2xl flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-emerald-900">{weather.advisories[0].category}</h5>
                  <p className="text-xs text-emerald-800 mt-0.5">{weather.advisories[0].message}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigate('telemetry')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View Detailed Telemetry & Charts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('ai-advisor')}
          className="group bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100/70 hover:to-emerald-100/70 p-5 rounded-2xl border border-teal-200/60 cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="mt-3 font-semibold text-slate-900">AI Plant Disease Scanner</h4>
          <p className="text-xs text-slate-600 mt-1">Upload a leaf photo to diagnose pathogens, early/late blight, and receive treatments.</p>
        </div>

        <div 
          onClick={() => onNavigate('yield')}
          className="group bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100/70 hover:to-orange-100/70 p-5 rounded-2xl border border-amber-200/60 cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="mt-3 font-semibold text-slate-900">Harvest Yield Predictor</h4>
          <p className="text-xs text-slate-600 mt-1">Predict harvest tonnage, market value, and fertilizer curves calibrated for your acreage.</p>
        </div>

        <div 
          onClick={() => onNavigate('marketplace')}
          className="group bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100/70 hover:to-blue-100/70 p-5 rounded-2xl border border-indigo-200/60 cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="mt-3 font-semibold text-slate-900">Produce Marketplace</h4>
          <p className="text-xs text-slate-600 mt-1">Connect directly with buyers, list fresh harvest batches, and manage orders with zero middlemen.</p>
        </div>
      </div>
    </div>
  );
};
