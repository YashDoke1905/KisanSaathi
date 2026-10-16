"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ReadAloudButton } from "@/components/VoiceAssistantButton";
import { WeatherDataResponse } from "@/services/weather/types";
import { getWeatherInfo } from "@/services/weather/weatherCodeMap";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Flame,
  Snowflake,
  ArrowLeft,
  RefreshCw,
  Navigation,
} from "lucide-react";

const MAHARASHTRA_DISTRICTS = [
  "Nashik",
  "Pune",
  "Solapur",
  "Nagpur",
  "Sambhajinagar",
  "Kolhapur",
  "Akola",
  "Amravati",
  "Latur",
  "Jalna",
  "Ahmednagar",
  "Sangli",
  "Satara",
  "Yavatmal",
  "Buldhana",
];

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState("Nashik");
  const [customCoords, setCustomCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  const fetchWeather = async (district: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    try {
      let url = `/api/weather?district=${encodeURIComponent(district)}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: WeatherDataResponse = await res.json();
        setWeatherData(data);
        // Cache to localStorage for offline access
        localStorage.setItem("kisansaathi_cached_weather", JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Failed to fetch weather, loading offline cache:", err);
      const cached = localStorage.getItem("kisansaathi_cached_weather");
      if (cached) {
        try {
          setWeatherData(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  // Use GPS location
  const handleUseLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomCoords({ lat: latitude, lon: longitude });
        fetchWeather("Custom Location", latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Could not access GPS location. Please choose a district from the list.");
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Weather Icon Component
  const renderWeatherIcon = (code: number, className = "w-6 h-6") => {
    const info = getWeatherInfo(code);
    if (info.icon === "sun") return <Sun className={`${className} text-amber-500`} />;
    if (info.icon === "cloud-sun") return <CloudSun className={`${className} text-amber-400`} />;
    if (info.icon === "cloud") return <Cloud className={`${className} text-zinc-400`} />;
    if (info.icon === "cloud-rain") return <CloudRain className={`${className} text-blue-500`} />;
    if (info.icon === "cloud-lightning") return <CloudLightning className={`${className} text-purple-500`} />;
    return <Sun className={`${className} text-amber-500`} />;
  };

  const weatherInfo = weatherData ? getWeatherInfo(weatherData.current.weatherCode) : null;

  // Narration text for TTS
  const speechNarration = weatherData
    ? `${weatherData.district} मधील आजचे हवामान. तापमान ${weatherData.current.temperature} अंश सेल्सिअस. ${weatherInfo?.mr || ""}. आर्द्रता ${weatherData.current.relativeHumidity} टक्के आणि वाऱ्याचा वेग ${weatherData.current.windSpeed} किमी प्रति तास. ${weatherData.agroAlerts?.[0]?.messageMr || ""}`
    : "";

  return (
    <div className="space-y-4 pb-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-kisan-green-700 min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पान (Home)</span>
        </Link>

        {weatherData && (
          <ReadAloudButton
            text={speechNarration}
            className="p-1.5 min-h-[40px] text-xs"
          />
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-500" />
          <span>कृषी हवामान व सल्ला (Agro-Weather)</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Open-Meteo कृषी मॉडेलवर आधारित अचूक फवारणी व सिंचन सल्ला
        </p>
      </div>

      {/* District Selector & Location Trigger */}
      <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCustomCoords(null);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kisan-green-600 min-h-[44px]"
            >
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District (जिल्हा)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="p-2.5 bg-kisan-green-50 dark:bg-kisan-green-950/40 text-kisan-green-800 dark:text-kisan-green-300 rounded-xl border border-kisan-green-200 dark:border-kisan-green-800 hover:bg-kisan-green-100 flex items-center gap-1.5 text-xs font-bold shrink-0 min-h-[44px]"
            title="Use GPS Coordinates"
          >
            <Navigation className={`w-4 h-4 text-kisan-green-700 dark:text-kisan-green-400 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating..." : "GPS स्थान"}</span>
          </button>
        </div>
      </div>

      {isLoading && !weatherData ? (
        <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-kisan-green-700" />
          <span>हवामान माहिती लोड होत आहे...</span>
        </div>
      ) : weatherData ? (
        <>
          {/* Main Weather Card */}
          <div className="bg-linear-to-br from-sky-600 to-sky-800 text-white rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{weatherData.district}</span>
              </span>
              <ProvenanceBadge
                type={weatherData.isLive ? "live" : "demo"}
                sourceText={weatherData.source}
                dateText={weatherData.timestamp}
                className="bg-white/20 text-white border-white/30"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-5xl font-black tracking-tight">
                  {weatherData.current.temperature}°
                  <span className="text-2xl font-normal text-sky-200">C</span>
                </div>
                <p className="text-sm font-semibold text-sky-100 mt-1">
                  {language === "mr" ? weatherInfo?.mr : language === "hi" ? weatherInfo?.hi : weatherInfo?.en}
                </p>
                <span className="text-xs text-sky-200">
                  वातावरणातील भास: {weatherData.current.apparentTemperature}°C
                </span>
              </div>

              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                {renderWeatherIcon(weatherData.current.weatherCode, "w-12 h-12")}
              </div>
            </div>

            {/* Weather Metrics Strip */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/20 text-center text-xs">
              <div className="bg-white/10 p-2 rounded-xl">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-sky-200" />
                <span className="text-[10px] text-sky-200 block">आर्द्रता</span>
                <span className="font-bold">{weatherData.current.relativeHumidity}%</span>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <Wind className="w-4 h-4 mx-auto mb-1 text-sky-200" />
                <span className="text-[10px] text-sky-200 block">वारा</span>
                <span className="font-bold">{weatherData.current.windSpeed} km/h</span>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <CloudRain className="w-4 h-4 mx-auto mb-1 text-sky-200" />
                <span className="text-[10px] text-sky-200 block">पाऊस</span>
                <span className="font-bold">{weatherData.current.precipitation} mm</span>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <Sun className="w-4 h-4 mx-auto mb-1 text-amber-300" />
                <span className="text-[10px] text-sky-200 block">बाष्पीभवन</span>
                <span className="font-bold">{weatherData.daily[0]?.et0Sum || 4.2} mm</span>
              </div>
            </div>
          </div>

          {/* Actionable Agro-Alerts Section */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-kisan-green-700 dark:text-kisan-green-400" />
              <span>आजचा कृषी सल्ला व फवारणी नियोजन</span>
            </h2>

            {weatherData.agroAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border shadow-xs space-y-1.5 ${
                  alert.severity === "danger"
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200"
                    : alert.severity === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                    : alert.severity === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                    : "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.severity === "danger" && <Flame className="w-4 h-4 text-rose-600 shrink-0" />}
                    {alert.severity === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {alert.severity === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {alert.severity === "info" && <Droplets className="w-4 h-4 text-blue-600 shrink-0" />}
                    <h3 className="font-bold text-xs">
                      {language === "mr" ? alert.titleMr : language === "hi" ? alert.titleHi : alert.titleEn}
                    </h3>
                  </div>
                  <ReadAloudButton
                    text={language === "mr" ? alert.messageMr : alert.messageEn}
                    className="p-1 min-h-[32px] min-w-[32px]"
                  />
                </div>

                <p className="text-xs leading-relaxed">
                  {language === "mr" ? alert.messageMr : language === "hi" ? alert.messageHi : alert.messageEn}
                </p>

                <div className="pt-1 border-t border-current/15 text-[11px] font-semibold flex items-center gap-1">
                  <span>👉 काय करावे:</span>
                  <span>{language === "mr" ? alert.actionMr : language === "hi" ? alert.actionHi : alert.actionEn}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 24-Hour Hourly Weather Scroll */}
          <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                पुढील २४ तासांचे अंदाज (Hourly Forecast)
              </h2>
              <span className="text-[10px] text-zinc-500">पावसाची शक्यता (%)</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {weatherData.hourly.map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center shrink-0 w-16 space-y-1.5"
                >
                  <span className="text-[10px] text-zinc-500 font-medium block">
                    {h.hourLabel}
                  </span>
                  <div className="flex justify-center">
                    {renderWeatherIcon(h.weatherCode, "w-5 h-5")}
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    {h.temperature}°
                  </span>
                  <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700">
                    <span
                      className={`text-[10px] font-bold block ${
                        h.precipitationProbability >= 40
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {h.precipitationProbability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Day-by-Day Forecast */}
          <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                ७ दिवसांचा कृषी अंदाज (7-Day Forecast)
              </h2>
              <ProvenanceBadge type="live" sourceText="Open-Meteo" />
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/60">
              {weatherData.daily.map((day, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="w-24">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      {day.dayLabel}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ET0: {day.et0Sum} mm
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {renderWeatherIcon(day.weatherCode, "w-4 h-4")}
                    {day.precipitationSum > 0 ? (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {day.precipitationSum} mm
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400">कोरडे</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {day.tempMax}°
                    </span>
                    <span className="text-zinc-400">
                      {day.tempMin}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rainfall Recorded vs Normal District Benchmark */}
          <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>हंगामातील पाऊस विरूद्ध सरासरी (Rainfall Tracking)</span>
              </span>
              <span className="text-[10px] text-zinc-500">IMD / कृषी विभाग</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">
                  झालेला पाऊस: <strong className="text-blue-600 dark:text-blue-400">{weatherData.rainfallSoFarMm} mm</strong>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  वार्षिक सरासरी: <strong>{weatherData.normalRainfallMm} mm</strong>
                </span>
              </div>

              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100))}%`,
                  }}
                />
              </div>

              <span className="text-[11px] text-zinc-500 block text-right">
                सरासरीच्या {Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100)}% पाऊस नोंदवला गेला आहे.
              </span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
