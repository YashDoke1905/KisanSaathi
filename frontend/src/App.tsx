import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TelemetryPage } from './pages/TelemetryPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { YieldPredictorPage } from './pages/YieldPredictorPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { api } from './services/api';
import type { SensorReading, IrrigationState, FarmAlert, WeatherResponse } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationState | null>(null);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      const [telemetryData, weatherData] = await Promise.all([
        api.getLatestTelemetry(),
        api.getWeather(),
      ]);
      setReading(telemetryData.latest);
      setIrrigation(telemetryData.irrigation);
      setAlerts(telemetryData.active_alerts);
      setHistory(telemetryData.history);
      setWeather(weatherData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Setup live Server-Sent Events (SSE) connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/iot/stream');
      
      eventSource.onopen = () => {
        setIsStreaming(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.reading) {
            setReading(data.reading);
            setHistory((prev) => {
              const updated = [...prev, data.reading];
              return updated.slice(-25);
            });
          }
          if (data.irrigation) {
            setIrrigation(data.irrigation);
          }
        } catch (e) {
          console.error('Error parsing SSE payload:', e);
        }
      };

      eventSource.onerror = () => {
        setIsStreaming(false);
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect, falling back to interval:', e);
    }

    // Fallback polling for alerts and backup sync
    const pollInterval = setInterval(() => {
      api.getAlerts().then(setAlerts).catch(() => {});
    }, 6000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Handlers
  const handleTogglePump = async (active: boolean) => {
    try {
      const res = await api.controlIrrigation({ is_active: active });
      setIrrigation(res.irrigation);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMode = async (mode: 'auto' | 'manual') => {
    try {
      const res = await api.controlIrrigation({ mode });
      setIrrigation(res.irrigation);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateIrrigation = async (control: Partial<IrrigationState>) => {
    try {
      const res = await api.controlIrrigation(control);
      setIrrigation(res.irrigation);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await api.resolveAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
      />

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            reading={reading}
            irrigation={irrigation}
            alerts={alerts}
            weather={weather}
            onTogglePump={handleTogglePump}
            onToggleMode={handleToggleMode}
            onResolveAlert={handleResolveAlert}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryPage
            reading={reading}
            irrigation={irrigation}
            history={history}
            alerts={alerts}
            onUpdateIrrigation={handleUpdateIrrigation}
            onResolveAlert={handleResolveAlert}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'ai-advisor' && <AiAdvisorPage />}

        {activeTab === 'yield' && <YieldPredictorPage />}

        {activeTab === 'marketplace' && <MarketplacePage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SmartHarvest Precision Platform • Built with FastAPI, PyTorch-ready ML & React</span>
          <div className="flex gap-4">
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
              API Documentation (/docs)
            </a>
            <span>•</span>
            <span className="text-slate-400">Environment: Local Active Workstation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
