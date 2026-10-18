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
  const isMr = language === "mr";
  const isHi = language === "hi";

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
        alert(isMr ? "जीपीएस स्थान मिळवता आले नाही. कृपया यादीतून जिल्हा निवडा." : "Could not access GPS location. Please choose a district from the list.");
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Weather Icon Component
  const renderWeatherIcon = (code: number, className = "w-6 h-6") => {
    const info = getWeatherInfo(code);
    if (info.icon === "sun") return <Sun className={`${className} text-amber-400`} />;
    if (info.icon === "cloud-sun") return <CloudSun className={`${className} text-amber-300`} />;
    if (info.icon === "cloud") return <Cloud className={`${className} text-stone-300`} />;
    if (info.icon === "cloud-rain") return <CloudRain className={`${className} text-sky-400`} />;
    if (info.icon === "cloud-lightning") return <CloudLightning className={`${className} text-purple-400`} />;
    return <Sun className={`${className} text-amber-400`} />;
  };

  const weatherInfo = weatherData ? getWeatherInfo(weatherData.current.weatherCode) : null;

  // Narration text for TTS
  const speechNarration = weatherData
    ? `${weatherData.district} मधील आजचे हवामान. तापमान ${weatherData.current.temperature} अंश सेल्सिअस. ${weatherInfo?.mr || ""}. आर्द्रता ${weatherData.current.relativeHumidity} टक्के आणि वाऱ्याचा वेग ${weatherData.current.windSpeed} किमी प्रति तास. ${weatherData.agroAlerts?.[0]?.messageMr || ""}`
    : "";

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#121411] text-stone-900 dark:text-stone-100 transition-colors pb-24">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors py-1 min-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isMr ? "मुख्य डॅशबोर्ड" : isHi ? "होम डैशबोर्ड" : "Home Dashboard"}</span>
          </Link>

          {weatherData && (
            <ReadAloudButton
              text={speechNarration}
              className="py-1 px-3 min-h-[36px] text-xs rounded-xl"
            />
          )}
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <span>
              {isMr
                ? "कृषी हवामान व पीक सल्ला"
                : isHi
                  ? "कृषि मौसम एवं फसल परामर्श"
                  : "Agro-Weather & Spray Advisory"}
            </span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 pl-11">
            {isMr
              ? "Open-Meteo कृषी मॉडेलवर आधारित अचूक फवारणी, सिंचन व हवामान अंदाज"
              : isHi
                ? "Open-Meteo कृषि मॉडल पर आधारित छिड़काव व सिंचाई परामर्श"
                : "Hyperlocal weather forecasts and crop spray advisories via Open-Meteo"}
          </p>
        </div>

        {/* District Selector & Location Trigger */}
        <div className="bg-white dark:bg-[#1E221B] rounded-3xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCustomCoords(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B4332] min-h-[46px]"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District ({isMr ? "जिल्हा" : isHi ? "जिला" : "District"})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="px-3.5 py-2.5 bg-[#1B4332]/10 dark:bg-[#52B788]/20 text-[#1B4332] dark:text-[#52B788] rounded-2xl border border-[#1B4332]/20 dark:border-[#52B788]/30 hover:bg-[#1B4332]/20 flex items-center gap-1.5 text-xs font-bold shrink-0 min-h-[46px] transition-colors"
              title="Use GPS Coordinates"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? (isMr ? "शोधत आहे..." : "Locating...") : (isMr ? "GPS स्थान" : isHi ? "जीपीएस स्थान" : "Use GPS")}</span>
            </button>
          </div>
        </div>

        {isLoading && !weatherData ? (
          <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1B4332] dark:text-[#52B788]" />
            <span>{isMr ? "हवामान माहिती लोड होत आहे..." : isHi ? "मौसम जानकारी लोड हो रही है..." : "Loading agro-weather data..."}</span>
          </div>
        ) : weatherData ? (
          <>
            {/* Main Weather Hero Card */}
            <div className="bg-gradient-to-br from-[#163829] via-[#1E4B37] to-[#10291D] text-white rounded-3xl p-5 shadow-lg border border-[#2D6A4F]/40 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold bg-white/15 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{weatherData.district}</span>
                </span>
                <ProvenanceBadge
                  type={weatherData.isLive ? "live" : "demo"}
                  sourceText={weatherData.source}
                  dateText={weatherData.timestamp}
                  className="bg-white/15 text-white border-white/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-5xl md:text-6xl font-black font-mono tracking-tight tabular-nums">
                    {weatherData.current.temperature}°
                    <span className="text-2xl font-normal text-emerald-200">C</span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-100 mt-1">
                    {isMr ? weatherInfo?.mr : isHi ? weatherInfo?.hi : weatherInfo?.en}
                  </p>
                  <span className="text-xs text-emerald-200/90 font-medium">
                    {isMr ? "वातावरणातील भास:" : isHi ? "महसूस:" : "Feels like:"} {weatherData.current.apparentTemperature}°C
                  </span>
                </div>

                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/15 shadow-inner">
                  {renderWeatherIcon(weatherData.current.weatherCode, "w-12 h-12")}
                </div>
              </div>

              {/* Weather Metrics Strip */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/15 text-center text-xs">
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-sky-300" />
                  <span className="text-[10px] text-emerald-200 block">{isMr ? "आर्द्रता" : isHi ? "नमी" : "Humidity"}</span>
                  <span className="font-bold font-mono tabular-nums">{weatherData.current.relativeHumidity}%</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <Wind className="w-4 h-4 mx-auto mb-1 text-teal-200" />
                  <span className="text-[10px] text-emerald-200 block">{isMr ? "वारा" : isHi ? "हवा" : "Wind"}</span>
                  <span className="font-bold font-mono tabular-nums">{weatherData.current.windSpeed} <span className="text-[9px] font-normal">km/h</span></span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <CloudRain className="w-4 h-4 mx-auto mb-1 text-sky-300" />
                  <span className="text-[10px] text-emerald-200 block">{isMr ? "पाऊस" : isHi ? "वर्षा" : "Rain"}</span>
                  <span className="font-bold font-mono tabular-nums">{weatherData.current.precipitation} <span className="text-[9px] font-normal">mm</span></span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <Sun className="w-4 h-4 mx-auto mb-1 text-amber-300" />
                  <span className="text-[10px] text-emerald-200 block">{isMr ? "बाष्पीभवन" : isHi ? "वाष्पीकरण" : "ET0"}</span>
                  <span className="font-bold font-mono tabular-nums">{weatherData.daily[0]?.et0Sum || 4.2} <span className="text-[9px] font-normal">mm</span></span>
                </div>
              </div>
            </div>

            {/* Actionable Agro-Alerts Section */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                <span>
                  {isMr
                    ? "आजचा कृषी सल्ला व फवारणी नियोजन"
                    : isHi
                      ? "आज की कृषि सलाह व छिड़काव योजना"
                      : "Today's Agro-Advisory & Spray Planning"}
                </span>
              </h2>

              {weatherData.agroAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-3xl border shadow-xs space-y-2 transition-all ${
                    alert.severity === "danger"
                      ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-100"
                      : alert.severity === "warning"
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-100"
                      : alert.severity === "success"
                      ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100"
                      : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900 text-blue-950 dark:text-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {alert.severity === "danger" && <Flame className="w-4 h-4 text-rose-600 shrink-0" />}
                      {alert.severity === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      {alert.severity === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {alert.severity === "info" && <Droplets className="w-4 h-4 text-blue-600 shrink-0" />}
                      <h3 className="font-bold font-heading text-xs">
                        {isMr ? alert.titleMr : isHi ? alert.titleHi : alert.titleEn}
                      </h3>
                    </div>
                    <ReadAloudButton
                      text={isMr ? alert.messageMr : isHi ? alert.messageHi || alert.messageEn : alert.messageEn}
                      className="p-1 min-h-[34px] min-w-[34px] rounded-xl"
                    />
                  </div>

                  <p className="text-xs leading-relaxed opacity-90">
                    {isMr ? alert.messageMr : isHi ? alert.messageHi : alert.messageEn}
                  </p>

                  <div className="pt-2 border-t border-current/15 text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="font-bold">👉 {isMr ? "काय करावे:" : isHi ? "क्या करें:" : "Recommended action:"}</span>
                    <span>{isMr ? alert.actionMr : isHi ? alert.actionHi : alert.actionEn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 24-Hour Hourly Weather Scroll */}
            <div className="bg-white dark:bg-[#1E221B] rounded-3xl p-4 md:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100">
                  {isMr
                    ? "पुढील २४ तासांचे अंदाज (Hourly Forecast)"
                    : isHi
                      ? "अगले २४ घंटे का मौसम पूर्वानुमान"
                      : "Next 24 Hours Forecast"}
                </h2>
                <span className="text-[11px] text-stone-500 font-medium">
                  {isMr ? "पावसाची शक्यता (%)" : isHi ? "वर्षा संभावना (%)" : "Rain Prob (%)"}
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {weatherData.hourly.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-center shrink-0 w-20 space-y-2"
                  >
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold block">
                      {h.hourLabel}
                    </span>
                    <div className="flex justify-center">
                      {renderWeatherIcon(h.weatherCode, "w-6 h-6")}
                    </div>
                    <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100 block tabular-nums">
                      {h.temperature}°
                    </span>
                    <div className="pt-1.5 border-t border-stone-200 dark:border-stone-800">
                      <span
                        className={`text-[10px] font-black font-mono block tabular-nums ${
                          h.precipitationProbability >= 40
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-stone-400"
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
            <div className="bg-white dark:bg-[#1E221B] rounded-3xl p-4 md:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-heading text-stone-900 dark:text-stone-100">
                  {isMr
                    ? "७ दिवसांचा कृषी अंदाज (7-Day Forecast)"
                    : isHi
                      ? "७ दिनों का कृषि पूर्वानुमान"
                      : "7-Day Agro Forecast"}
                </h2>
                <ProvenanceBadge type="live" sourceText="Open-Meteo" />
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {weatherData.daily.map((day, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div className="w-28">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        {day.dayLabel}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        ET0: {day.et0Sum} mm
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderWeatherIcon(day.weatherCode, "w-5 h-5")}
                      {day.precipitationSum > 0 ? (
                        <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
                          {day.precipitationSum} mm
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">{isMr ? "कोरडे" : isHi ? "शुष्क" : "Dry"}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-black text-stone-900 dark:text-stone-100">
                        {day.tempMax}°
                      </span>
                      <span className="text-stone-400">
                        / {day.tempMin}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rainfall Recorded vs Normal District Benchmark */}
            <div className="bg-white dark:bg-[#1E221B] rounded-3xl p-4 md:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span>
                    {isMr
                      ? "हंगामातील पाऊस विरूद्ध सरासरी (Rainfall Tracking)"
                      : isHi
                        ? "मौसमी वर्षा बनाम सामान्य"
                        : "Rainfall Recorded vs District Benchmark"}
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-stone-500">IMD / कृषी विभाग</span>
              </div>

              <div className="p-3.5 bg-stone-50 dark:bg-stone-900/60 rounded-2xl space-y-2.5 border border-stone-100 dark:border-stone-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-700 dark:text-stone-300">
                    {isMr ? "झालेला पाऊस:" : isHi ? "दर्ज वर्षा:" : "Recorded Rain:"}{" "}
                    <strong className="text-sky-600 dark:text-sky-400 font-mono font-black tabular-nums">
                      {weatherData.rainfallSoFarMm} mm
                    </strong>
                  </span>
                  <span className="text-stone-700 dark:text-stone-300">
                    {isMr ? "वार्षिक सरासरी:" : isHi ? "वार्षिक औसत:" : "Normal Benchmark:"}{" "}
                    <strong className="font-mono font-black tabular-nums">{weatherData.normalRainfallMm} mm</strong>
                  </span>
                </div>

                <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-[#1B4332] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100))}%`,
                    }}
                  />
                </div>

                <span className="text-[11px] text-stone-500 dark:text-stone-400 block text-right font-medium">
                  {isMr
                    ? `सरासरीच्या ${Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100)}% पाऊस नोंदवला गेला आहे.`
                    : isHi
                      ? `औसत का ${Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100)}% वर्षा दर्ज की गई है।`
                      : `${Math.round((weatherData.rainfallSoFarMm / weatherData.normalRainfallMm) * 100)}% of normal seasonal rainfall received.`}
                </span>
              </div>
            </div>

            {/* Return to Dashboard */}
            <div className="pt-2">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-[#1B4332] dark:text-[#52B788] bg-white dark:bg-[#1E221B] border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 py-3 rounded-2xl min-h-[48px] transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isMr ? "मुख्य डॅशबोर्डवर परत जा" : isHi ? "मुख्य डैशबोर्ड पर वापस जाएं" : "Return to Home Dashboard"}</span>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
