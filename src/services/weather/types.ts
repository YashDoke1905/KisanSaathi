export interface WeatherCurrent {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  temperature: number;
  precipitationProbability: number;
  precipitationMm: number;
  weatherCode: number;
  et0Mm: number;
}

export interface DailyForecastItem {
  date: string;
  dayLabel: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  et0Sum: number;
}

export interface AgroAlert {
  id: string;
  severity: "info" | "warning" | "danger" | "success";
  titleEn: string;
  titleMr: string;
  titleHi: string;
  messageEn: string;
  messageMr: string;
  messageHi: string;
  actionEn: string;
  actionMr: string;
  actionHi: string;
  iconName: string;
}

export interface WeatherDataResponse {
  source: "Open-Meteo (Live)" | "Cached / Seed Data";
  isLive: boolean;
  timestamp: string;
  latitude: number;
  longitude: number;
  district: string;
  current: WeatherCurrent;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  agroAlerts: AgroAlert[];
  rainfallSoFarMm: number;
  normalRainfallMm: number;
}
