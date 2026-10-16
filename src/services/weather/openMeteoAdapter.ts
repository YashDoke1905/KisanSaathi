import {
  WeatherDataResponse,
  WeatherCurrent,
  HourlyForecastItem,
  DailyForecastItem,
} from "./types";
import { generateAgroAdvisories } from "./agroAdvisoryEngine";

export interface DistrictCoordinates {
  name: string;
  lat: number;
  lon: number;
  normalAnnualRainfallMm: number;
}

export const MAHARASHTRA_DISTRICT_COORDS: Record<string, DistrictCoordinates> = {
  Nashik: { name: "Nashik", lat: 19.9975, lon: 73.7898, normalAnnualRainfallMm: 680 },
  Pune: { name: "Pune", lat: 18.5204, lon: 73.8567, normalAnnualRainfallMm: 720 },
  Solapur: { name: "Solapur", lat: 17.6599, lon: 75.9064, normalAnnualRainfallMm: 560 },
  Nagpur: { name: "Nagpur", lat: 21.1458, lon: 79.0882, normalAnnualRainfallMm: 1050 },
  Sambhajinagar: { name: "Chhatrapati Sambhajinagar", lat: 19.8762, lon: 75.3433, normalAnnualRainfallMm: 650 },
  Kolhapur: { name: "Kolhapur", lat: 16.705, lon: 74.2433, normalAnnualRainfallMm: 980 },
  Akola: { name: "Akola", lat: 20.7002, lon: 77.0082, normalAnnualRainfallMm: 780 },
  Amravati: { name: "Amravati", lat: 20.9374, lon: 77.7796, normalAnnualRainfallMm: 850 },
  Latur: { name: "Latur", lat: 18.4088, lon: 76.5604, normalAnnualRainfallMm: 750 },
  Jalna: { name: "Jalna", lat: 19.841, lon: 75.8864, normalAnnualRainfallMm: 640 },
  Ahmednagar: { name: "Ahmednagar", lat: 19.0952, lon: 74.7496, normalAnnualRainfallMm: 540 },
  Sangli: { name: "Sangli", lat: 16.8524, lon: 74.5815, normalAnnualRainfallMm: 610 },
  Satara: { name: "Satara", lat: 17.6805, lon: 73.9934, normalAnnualRainfallMm: 800 },
  Yavatmal: { name: "Yavatmal", lat: 20.3888, lon: 78.1204, normalAnnualRainfallMm: 920 },
  Buldhana: { name: "Buldhana", lat: 20.5312, lon: 76.1824, normalAnnualRainfallMm: 740 },
};

export async function fetchAgroWeather(
  lat?: number,
  lon?: number,
  districtName = "Nashik"
): Promise<WeatherDataResponse> {
  const coords = MAHARASHTRA_DISTRICT_COORDS[districtName] || MAHARASHTRA_DISTRICT_COORDS.Nashik;
  const latitude = lat ?? coords.lat;
  const longitude = lon ?? coords.lon;

  // Open-Meteo endpoint querying hourly rain probability and FAO-56 Penman-Monteith ET0
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,et0_fao_evapotranspiration&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 1800 }, // Cache on edge for 30 minutes
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();

    const current: WeatherCurrent = {
      time: data.current?.time || new Date().toISOString(),
      temperature: Math.round(data.current?.temperature_2m ?? 28),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 29),
      relativeHumidity: Math.round(data.current?.relative_humidity_2m ?? 50),
      precipitation: data.current?.precipitation ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 8),
    };

    // Extract next 24 hours
    const hourly: HourlyForecastItem[] = [];
    const hourlyTimes = data.hourly?.time || [];
    const nowIso = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(nowIso));
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
      const rawTime = hourlyTimes[i];
      const hour = new Date(rawTime).getHours();
      const hourLabel = `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? "PM" : "AM"}`;

      hourly.push({
        time: rawTime,
        hourLabel,
        temperature: Math.round(data.hourly?.temperature_2m?.[i] ?? 25),
        precipitationProbability: data.hourly?.precipitation_probability?.[i] ?? 0,
        precipitationMm: data.hourly?.precipitation?.[i] ?? 0,
        weatherCode: data.hourly?.weather_code?.[i] ?? 0,
        et0Mm: parseFloat((data.hourly?.et0_fao_evapotranspiration?.[i] ?? 0.2).toFixed(2)),
      });
    }

    // Extract 7-day daily forecast
    const daily: DailyForecastItem[] = [];
    const dailyTimes = data.daily?.time || [];
    const daysOfWeek = ["रवि (Sun)", "सोम (Mon)", "मंगळ (Tue)", "बुध (Wed)", "गुरू (Thu)", "शुक्र (Fri)", "शनि (Sat)"];

    for (let d = 0; d < dailyTimes.length; d++) {
      const dateStr = dailyTimes[d];
      const dayIndex = new Date(dateStr).getDay();
      const dayLabel = d === 0 ? "आज (Today)" : d === 1 ? "उद्या (Tomorrow)" : daysOfWeek[dayIndex];

      daily.push({
        date: dateStr,
        dayLabel,
        weatherCode: data.daily?.weather_code?.[d] ?? 0,
        tempMax: Math.round(data.daily?.temperature_2m_max?.[d] ?? 30),
        tempMin: Math.round(data.daily?.temperature_2m_min?.[d] ?? 18),
        precipitationSum: parseFloat((data.daily?.precipitation_sum?.[d] ?? 0).toFixed(1)),
        precipitationProbabilityMax: data.daily?.precipitation_probability_max?.[d] ?? 0,
        et0Sum: parseFloat((data.daily?.et0_fao_evapotranspiration?.[d] ?? 4.2).toFixed(1)),
      });
    }

    const agroAlerts = generateAgroAdvisories(current, daily);

    return {
      source: "Open-Meteo (Live)",
      isLive: true,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      latitude,
      longitude,
      district: coords.name,
      current,
      hourly,
      daily,
      agroAlerts,
      rainfallSoFarMm: 580,
      normalRainfallMm: coords.normalAnnualRainfallMm,
    };
  } catch (err) {
    console.warn("Open-Meteo live fetch failed or timed out, using realistic Maharashtra seed fallback:", err);
    return getSeedWeatherFallback(coords);
  }
}

// Realistic seed fallback when offline or in air-gapped environment
function getSeedWeatherFallback(coords: DistrictCoordinates): WeatherDataResponse {
  const current: WeatherCurrent = {
    time: new Date().toISOString(),
    temperature: 29,
    apparentTemperature: 30,
    relativeHumidity: 48,
    precipitation: 0,
    weatherCode: 0,
    windSpeed: 8,
  };

  const hourly: HourlyForecastItem[] = [
    { time: "06:00", hourLabel: "6 AM", temperature: 20, precipitationProbability: 0, precipitationMm: 0, weatherCode: 0, et0Mm: 0.1 },
    { time: "09:00", hourLabel: "9 AM", temperature: 25, precipitationProbability: 5, precipitationMm: 0, weatherCode: 1, et0Mm: 0.3 },
    { time: "12:00", hourLabel: "12 PM", temperature: 30, precipitationProbability: 10, precipitationMm: 0, weatherCode: 2, et0Mm: 0.7 },
    { time: "15:00", hourLabel: "3 PM", temperature: 32, precipitationProbability: 5, precipitationMm: 0, weatherCode: 1, et0Mm: 0.6 },
    { time: "18:00", hourLabel: "6 PM", temperature: 27, precipitationProbability: 0, precipitationMm: 0, weatherCode: 0, et0Mm: 0.2 },
    { time: "21:00", hourLabel: "9 PM", temperature: 23, precipitationProbability: 0, precipitationMm: 0, weatherCode: 0, et0Mm: 0.0 },
  ];

  const daily: DailyForecastItem[] = [
    { date: "2026-10-14", dayLabel: "आज (Today)", weatherCode: 0, tempMax: 31, tempMin: 18, precipitationSum: 0, precipitationProbabilityMax: 0, et0Sum: 4.5 },
    { date: "2026-10-15", dayLabel: "उद्या (Tomorrow)", weatherCode: 1, tempMax: 32, tempMin: 19, precipitationSum: 0, precipitationProbabilityMax: 5, et0Sum: 4.6 },
    { date: "2026-10-16", dayLabel: "शुक्र (Fri)", weatherCode: 2, tempMax: 30, tempMin: 18, precipitationSum: 0, precipitationProbabilityMax: 15, et0Sum: 4.2 },
    { date: "2026-10-17", dayLabel: "शनि (Sat)", weatherCode: 61, tempMax: 28, tempMin: 19, precipitationSum: 4.5, precipitationProbabilityMax: 65, et0Sum: 3.5 },
    { date: "2026-10-18", dayLabel: "रवि (Sun)", weatherCode: 2, tempMax: 29, tempMin: 18, precipitationSum: 1.2, precipitationProbabilityMax: 30, et0Sum: 3.8 },
    { date: "2026-10-19", dayLabel: "सोम (Mon)", weatherCode: 0, tempMax: 31, tempMin: 17, precipitationSum: 0, precipitationProbabilityMax: 0, et0Sum: 4.4 },
    { date: "2026-10-20", dayLabel: "मंगळ (Tue)", weatherCode: 0, tempMax: 32, tempMin: 18, precipitationSum: 0, precipitationProbabilityMax: 0, et0Sum: 4.5 },
  ];

  const agroAlerts = generateAgroAdvisories(current, daily);

  return {
    source: "Cached / Seed Data",
    isLive: false,
    timestamp: "10:30 AM",
    latitude: coords.lat,
    longitude: coords.lon,
    district: coords.name,
    current,
    hourly,
    daily,
    agroAlerts,
    rainfallSoFarMm: 580,
    normalRainfallMm: coords.normalAnnualRainfallMm,
  };
}
