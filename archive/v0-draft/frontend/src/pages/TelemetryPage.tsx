import React, { useState } from 'react';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Power,
  Layers,
  History
} from 'lucide-react';
import type { SensorReading, IrrigationState, FarmAlert } from '../types';

interface TelemetryPageProps {
  reading: SensorReading | null;
  irrigation: IrrigationState | null;
  history: SensorReading[];
  alerts: FarmAlert[];
  onUpdateIrrigation: (control: Partial<IrrigationState>) => void;
  onResolveAlert: (id: number) => void;
  onRefresh: () => void;
}

export const TelemetryPage: React.FC<TelemetryPageProps> = ({
  reading,
  irrigation,
  history,
  alerts,
  onUpdateIrrigation,
  onResolveAlert,
  onRefresh,
}) => {
  const [speedInput, setSpeedInput] = useState<number>(irrigation?.pump_speed ?? 100);
  const [thresholdInput, setThresholdInput] = useState<number>(irrigation?.auto_threshold_moisture ?? 32);
  const [targetInput, setTargetInput] = useState<number>(irrigation?.target_moisture ?? 70);
  const [filterAlerts, setFilterAlerts] = useState<'all' | 'unresolved'>('unresolved');

  const displayedAlerts = filterAlerts === 'unresolved' 
    ? alerts.filter(a => !a.resolved) 
    : alerts;

  const moisture = reading?.soil_moisture ?? 40.0;
  const temp = reading?.temperature ?? 25.0;
  const hum = reading?.humidity ?? 64.0;

  // Simple SVG sparkline generator
  const renderSparkline = (data: number[], color: string, minVal: number, maxVal: number) => {
    if (!data.length) return null;
    const width = 300;
    const height = 70;
    const padding = 10;
    const range = maxVal - minVal || 1;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-20 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((val, idx) => {
          const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
          const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3"
              className="fill-white stroke-2"
              style={{ stroke: color }}
            />
          );
        })}
      </svg>
    );
  };

  const moistureHistory = history.map(h => h.soil_moisture);
  const tempHistory = history.map(h => h.temperature);
  const humHistory = history.map(h => h.humidity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">IoT Telemetry & Irrigation Control Console</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sensor telemetry and bidirectional irrigation actuator controls.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Poll Update
        </button>
      </div>

      {/* Actuator & Automation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Irrigation Pump Console */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${irrigation?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Sub-Surface Drip Pump (Line A)</h3>
                <p className="text-xs text-slate-500">Connected via LoRaWAN Node #04</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                irrigation?.is_active 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {irrigation?.is_active ? '● PUMPING (Active)' : '○ IDLE'}
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => onUpdateIrrigation({ mode: 'auto' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                irrigation?.mode === 'auto'
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">Smart Automated Mode</span>
                {irrigation?.mode === 'auto' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Pump automatically activates when moisture drops below threshold, and halts when target is reached.
              </p>
            </div>

            <div 
              onClick={() => onUpdateIrrigation({ mode: 'manual' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                irrigation?.mode === 'manual'
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">Manual Operator Override</span>
                {irrigation?.mode === 'manual' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Direct operator switch. You decide precisely when to turn the pump ON or OFF.
              </p>
            </div>
          </div>

          {/* Sliders & Thresholds */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Auto Trigger Moisture Threshold</span>
                <span className="text-emerald-700">{thresholdInput}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(Number(e.target.value))}
                onMouseUp={() => onUpdateIrrigation({ auto_threshold_moisture: thresholdInput })}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Pump starts when soil moisture drops below this value.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Target Moisture Capacity</span>
                <span className="text-emerald-700">{targetInput}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={targetInput}
                onChange={(e) => setTargetInput(Number(e.target.value))}
                onMouseUp={() => onUpdateIrrigation({ target_moisture: targetInput })}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Pump shuts down when soil reaches this hydration level.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Pump Operating Speed</span>
                <span className="text-emerald-700">{speedInput}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={speedInput}
                onChange={(e) => setSpeedInput(Number(e.target.value))}
                onMouseUp={() => onUpdateIrrigation({ pump_speed: speedInput })}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Master Pump Switch Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Manual Toggle Override
            </span>
            <button
              onClick={() => onUpdateIrrigation({ is_active: !irrigation?.is_active })}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                irrigation?.is_active
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
              }`}
            >
              <Power className="w-4 h-4" />
              {irrigation?.is_active ? 'Disengage Pump' : 'Engage Pump Now'}
            </button>
          </div>
        </div>

        {/* NPK & Soil Chemistry Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Soil Macronutrients (NPK)</h3>
                <p className="text-xs text-slate-500">Optical spectrometer probe</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Nitrogen (N)</span>
                  <span className="font-bold text-emerald-700">{reading?.nitrogen || 45} mg/kg</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Good for vegetative foliar vigor</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Phosphorus (P)</span>
                  <span className="font-bold text-teal-700">{reading?.phosphorus || 32} mg/kg</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '35%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Supports deep root establishment</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Potassium (K)</span>
                  <span className="font-bold text-blue-700">{reading?.potassium || 41} mg/kg</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '42%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Disease resistance & fruit sizing</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Sensor health: 98% calibration fidelity</span>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Moisture Sparkline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Moisture Trend</h4>
            </div>
            <span className="text-xs font-bold text-blue-600">{moisture.toFixed(1)}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">Past 20 readings cycle</p>
          {renderSparkline(moistureHistory, '#2563eb', 10, 90)}
        </div>

        {/* Temperature Sparkline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-bold text-slate-900">Temperature Trend</h4>
            </div>
            <span className="text-xs font-bold text-orange-600">{temp.toFixed(1)}°C</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">Past 20 readings cycle</p>
          {renderSparkline(tempHistory, '#ea580c', 15, 38)}
        </div>

        {/* Humidity Sparkline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">Air Humidity Trend</h4>
            </div>
            <span className="text-xs font-bold text-teal-600">{hum.toFixed(1)}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">Past 20 readings cycle</p>
          {renderSparkline(humHistory, '#0d9488', 35, 95)}
        </div>
      </div>

      {/* Farm Alerts Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-900">Farm Alerts & Incidents</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterAlerts('unresolved')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                filterAlerts === 'unresolved' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Unresolved Only
            </button>
            <button
              onClick={() => setFilterAlerts('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                filterAlerts === 'all' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All History
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {displayedAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No active alerts. All environmental variables are within safe thresholds!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Severity</th>
                  <th className="py-2.5 px-4">Title & Details</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        alert.level === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.level === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{alert.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{alert.message}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{alert.source}</td>
                    <td className="py-3 px-4">
                      {alert.resolved ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Open
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!alert.resolved && (
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
