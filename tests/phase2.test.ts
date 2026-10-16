import { describe, it, expect } from "vitest";
import { getWeatherInfo } from "../src/services/weather/weatherCodeMap";
import { generateAgroAdvisories } from "../src/services/weather/agroAdvisoryEngine";
import { fetchAgroWeather, MAHARASHTRA_DISTRICT_COORDS } from "../src/services/weather/openMeteoAdapter";
import { WeatherCurrent, DailyForecastItem } from "../src/services/weather/types";

describe("Phase 2: WMO Weather Code Mapping", () => {
  it("translates code 0 (Clear Sky) correctly in mr, hi, and en", () => {
    const info = getWeatherInfo(0);
    expect(info.en).toBe("Clear Sky");
    expect(info.mr).toBe("निरभ्र आकाश");
    expect(info.hi).toBe("साफ आसमान");
    expect(info.icon).toBe("sun");
  });

  it("translates rain and thunderstorm codes correctly", () => {
    const rain = getWeatherInfo(61);
    expect(rain.mr).toBe("हलका पाऊस");
    expect(rain.icon).toBe("cloud-rain");

    const storm = getWeatherInfo(95);
    expect(storm.mr).toBe("विजांसह वादळी पाऊस");
    expect(storm.icon).toBe("cloud-lightning");
  });
});

describe("Phase 2: Agro-Advisory & Agricultural Alert Rules Engine", () => {
  const baseCurrent: WeatherCurrent = {
    time: "2026-10-14T10:00:00Z",
    temperature: 26,
    apparentTemperature: 27,
    relativeHumidity: 50,
    precipitation: 0,
    weatherCode: 0,
    windSpeed: 8,
  };

  const baseDaily: DailyForecastItem[] = [
    {
      date: "2026-10-14",
      dayLabel: "आज (Today)",
      weatherCode: 0,
      tempMax: 30,
      tempMin: 18,
      precipitationSum: 0,
      precipitationProbabilityMax: 0,
      et0Sum: 4.2,
    },
    {
      date: "2026-10-15",
      dayLabel: "उद्या (Tomorrow)",
      weatherCode: 0,
      tempMax: 31,
      tempMin: 19,
      precipitationSum: 0,
      precipitationProbabilityMax: 10,
      et0Sum: 4.5,
    },
  ];

  it("recommends optimal spraying window when winds are calm and no rain is expected", () => {
    const alerts = generateAgroAdvisories(baseCurrent, baseDaily);
    const sprayAlert = alerts.find((a) => a.id === "optimal-spray-window");
    expect(sprayAlert).toBeDefined();
    expect(sprayAlert?.severity).toBe("success");
    expect(sprayAlert?.titleMr).toContain("फवारणीसाठी अनुकूल");
  });

  it("warns against spraying when rain is forecast for tomorrow", () => {
    const rainDaily = [...baseDaily];
    rainDaily[1] = {
      ...rainDaily[1],
      precipitationProbabilityMax: 70,
      precipitationSum: 15.0,
    };

    const alerts = generateAgroAdvisories(baseCurrent, rainDaily);
    const noSprayAlert = alerts.find((a) => a.id === "no-spray-rain-expected");
    expect(noSprayAlert).toBeDefined();
    expect(noSprayAlert?.severity).toBe("warning");
    expect(noSprayAlert?.titleMr).toContain("फवारणी करू नका");
  });

  it("warns against spray drift when wind speed exceeds 15 km/h", () => {
    const windyCurrent = { ...baseCurrent, windSpeed: 20 };
    const alerts = generateAgroAdvisories(windyCurrent, baseDaily);
    const windAlert = alerts.find((a) => a.id === "wind-spray-drift");
    expect(windAlert).toBeDefined();
    expect(windAlert?.severity).toBe("warning");
  });

  it("triggers fungal pathogen risk alert when humidity is high and temp is moderate", () => {
    const fungalWeather = { ...baseCurrent, relativeHumidity: 82, temperature: 24 };
    const alerts = generateAgroAdvisories(fungalWeather, baseDaily);
    const fungalAlert = alerts.find((a) => a.id === "fungal-pathogen-humidity");
    expect(fungalAlert).toBeDefined();
    expect(fungalAlert?.severity).toBe("warning");
    expect(fungalAlert?.titleMr).toContain("बुरशीजन्य करपा");
  });

  it("recommends postponing irrigation when significant rain has fallen", () => {
    const rainyTodayDaily = [...baseDaily];
    rainyTodayDaily[0] = { ...rainyTodayDaily[0], precipitationSum: 22.0 };

    const alerts = generateAgroAdvisories(baseCurrent, rainyTodayDaily);
    const postponeAlert = alerts.find((a) => a.id === "postpone-irrigation-rainfall");
    expect(postponeAlert).toBeDefined();
    expect(postponeAlert?.titleMr).toContain("पाण्याची पाळी पुढे ढकला");
  });
});

describe("Phase 2: Open-Meteo Adapter & District Coordinates", () => {
  it("has valid coordinates for key Maharashtra agricultural hubs", () => {
    expect(MAHARASHTRA_DISTRICT_COORDS.Nashik.lat).toBeCloseTo(19.99, 1);
    expect(MAHARASHTRA_DISTRICT_COORDS.Solapur.lon).toBeCloseTo(75.90, 1);
    expect(MAHARASHTRA_DISTRICT_COORDS.Nagpur.normalAnnualRainfallMm).toBeGreaterThan(900);
  });

  it("returns complete agricultural weather structure with hourly and 7-day items", async () => {
    const result = await fetchAgroWeather(undefined, undefined, "Nashik");
    expect(result).toBeDefined();
    expect(result.district).toBe("Nashik");
    expect(typeof result.current.temperature).toBe("number");
    expect(result.hourly.length).toBeGreaterThanOrEqual(6);
    expect(result.daily.length).toBe(7);
    expect(result.agroAlerts.length).toBeGreaterThan(0);
  });
});
