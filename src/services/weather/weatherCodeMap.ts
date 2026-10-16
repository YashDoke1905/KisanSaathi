export interface WeatherCodeInfo {
  en: string;
  mr: string;
  hi: string;
  icon: "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "cloud-lightning" | "wind";
}

export const WMO_WEATHER_MAP: Record<number, WeatherCodeInfo> = {
  0: {
    en: "Clear Sky",
    mr: "निरभ्र आकाश",
    hi: "साफ आसमान",
    icon: "sun",
  },
  1: {
    en: "Mainly Clear",
    mr: "मुख्यतः निरभ्र",
    hi: "मुख्यतः साफ",
    icon: "sun",
  },
  2: {
    en: "Partly Cloudy",
    mr: "अंशतः ढगाळ",
    hi: "आंशिक रूप से बादल",
    icon: "cloud-sun",
  },
  3: {
    en: "Overcast",
    mr: "पूर्णतः ढगाळ",
    hi: "घने बादल",
    icon: "cloud",
  },
  45: {
    en: "Foggy",
    mr: "धुके",
    hi: "कोहरा",
    icon: "cloud",
  },
  48: {
    en: "Depositing Rime Fog",
    mr: "दाट धुके",
    hi: "घना कोहरा",
    icon: "cloud",
  },
  51: {
    en: "Light Drizzle",
    mr: "रिमझिम पाऊस",
    hi: "हल्की बूंदाबांदी",
    icon: "cloud-rain",
  },
  53: {
    en: "Moderate Drizzle",
    mr: "मध्यम रिमझिम",
    hi: "मध्यम बूंदाबांदी",
    icon: "cloud-rain",
  },
  55: {
    en: "Dense Drizzle",
    mr: "दाट रिमझिम पाऊस",
    hi: "तेज बूंदाबांदी",
    icon: "cloud-rain",
  },
  61: {
    en: "Slight Rain",
    mr: "हलका पाऊस",
    hi: "हल्की बारिश",
    icon: "cloud-rain",
  },
  63: {
    en: "Moderate Rain",
    mr: "मध्यम पाऊस",
    hi: "मध्यम बारिश",
    icon: "cloud-rain",
  },
  65: {
    en: "Heavy Rain",
    mr: "मुसळधार पाऊस",
    hi: "भारी बारिश",
    icon: "cloud-rain",
  },
  80: {
    en: "Slight Rain Showers",
    mr: "पावसाच्या हलक्या सरी",
    hi: "हल्की बारिश की बौछारें",
    icon: "cloud-rain",
  },
  81: {
    en: "Moderate Rain Showers",
    mr: "पावसाच्या मध्यम सरी",
    hi: "मध्यम बारिश की बौछारें",
    icon: "cloud-rain",
  },
  82: {
    en: "Violent Rain Showers",
    mr: "पावसाच्या जोरदार सरी",
    hi: "तेज बारिश की बौछारें",
    icon: "cloud-rain",
  },
  95: {
    en: "Thunderstorm",
    mr: "विजांसह वादळी पाऊस",
    hi: "गरज के साथ बारिश",
    icon: "cloud-lightning",
  },
  96: {
    en: "Thunderstorm with Slight Hail",
    mr: "वादळी पाऊस व हलकी गारपीट",
    hi: "हल्की ओलावृष्टि के साथ आंधी",
    icon: "cloud-lightning",
  },
  99: {
    en: "Severe Hailstorm",
    mr: "तीव्र गारपीट व वादळ",
    hi: "भारी ओलावृष्टि व तूफान",
    icon: "cloud-lightning",
  },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return (
    WMO_WEATHER_MAP[code] || {
      en: "Moderate Weather",
      mr: "साधारण हवामान",
      hi: "सामान्य मौसम",
      icon: "cloud-sun",
    }
  );
}
