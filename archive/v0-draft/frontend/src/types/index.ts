export interface SensorReading {
  id?: number;
  timestamp: string;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  soil_ph: number;
  light_lux: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  battery_level: number;
}

export interface IrrigationState {
  id?: number;
  is_active: boolean;
  mode: 'auto' | 'manual';
  pump_speed: number;
  auto_threshold_moisture: number;
  target_moisture: number;
  last_switched?: string;
}

export interface FarmAlert {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  source: string;
  resolved: boolean;
}

export interface CropListing {
  id: number;
  farmer_name: string;
  crop_name: string;
  variety?: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  harvest_date: string;
  is_organic: boolean;
  description?: string;
  location: string;
  image_url?: string;
  created_at: string;
}

export interface ProduceOrder {
  id: number;
  listing_id: number;
  buyer_name: string;
  buyer_contact: string;
  buyer_address: string;
  quantity_kg: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface CropRecommendationItem {
  crop: string;
  match_score: number;
  season: string;
  water_requirement: string;
  ideal_soil_type: string;
  description: string;
  key_practices: string[];
}

export interface CropRecommendationResponse {
  recommended_crops: CropRecommendationItem[];
  soil_health_assessment: string;
  nutrient_status: {
    nitrogen_status: string;
    phosphorus_status: string;
    potassium_status: string;
    ph_character: string;
    rainfall_adequacy: string;
  };
}

export interface YieldPredictionResponse {
  crop_name: string;
  farm_area_hectares: number;
  predicted_yield_tons_per_ha: number;
  total_expected_yield_tons: number;
  market_value_estimate_usd: number;
  factors_impact: Record<string, string>;
  recommendations: string[];
}

export interface DiseaseDiagnosisResponse {
  disease_detected: string;
  is_healthy: boolean;
  confidence_score: number;
  affected_crop: string;
  severity: string;
  symptoms: string[];
  organic_remedies: string[];
  chemical_treatments: string[];
  prevention_tips: string[];
}

export interface WeatherDay {
  date: string;
  day_name: string;
  condition: string;
  temp_max: number;
  temp_min: number;
  rain_probability: number;
  rainfall_amount_mm: number;
  icon: string;
}

export interface WeatherAdvisory {
  category: string;
  status: string;
  message: string;
}

export interface WeatherResponse {
  current: {
    location: string;
    temperature: number;
    feels_like: number;
    condition: string;
    humidity: number;
    wind_speed_kmh: number;
    wind_direction: string;
    uv_index: number;
    solar_radiation_wm2: number;
    barometric_pressure_hpa: number;
    precipitation_probability: number;
  };
  daily_forecast: WeatherDay[];
  advisories: WeatherAdvisory[];
}
