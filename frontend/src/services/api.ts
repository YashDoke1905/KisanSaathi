import type {
  SensorReading,
  IrrigationState,
  FarmAlert,
  CropListing,
  ProduceOrder,
  CropRecommendationResponse,
  YieldPredictionResponse,
  DiseaseDiagnosisResponse,
  WeatherResponse
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Telemetry & IoT
  async getLatestTelemetry(): Promise<{
    latest: SensorReading;
    irrigation: IrrigationState;
    active_alerts: FarmAlert[];
    history: SensorReading[];
  }> {
    const res = await fetch(`${BASE_URL}/iot/latest`);
    if (!res.ok) throw new Error('Failed to fetch latest telemetry');
    return res.json();
  },

  async getTelemetryHistory(limit: number = 30): Promise<SensorReading[]> {
    const res = await fetch(`${BASE_URL}/iot/history?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch telemetry history');
    return res.json();
  },

  async controlIrrigation(data: Partial<IrrigationState>): Promise<{
    status: string;
    message: string;
    irrigation: IrrigationState;
  }> {
    const res = await fetch(`${BASE_URL}/iot/irrigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update irrigation');
    return res.json();
  },

  async getAlerts(unresolvedOnly: boolean = true): Promise<FarmAlert[]> {
    const res = await fetch(`${BASE_URL}/iot/alerts?unresolved_only=${unresolvedOnly}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async resolveAlert(alertId: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${BASE_URL}/iot/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  // AI & ML
  async recommendCrops(params: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }): Promise<CropRecommendationResponse> {
    const res = await fetch(`${BASE_URL}/ai/recommend-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to get crop recommendations');
    return res.json();
  },

  async predictYield(params: {
    crop_name: string;
    farm_area_hectares: number;
    fertilizer_usage_kg_per_ha: number;
    rainfall_annual_mm: number;
    soil_type: string;
    irrigation_type: string;
  }): Promise<YieldPredictionResponse> {
    const res = await fetch(`${BASE_URL}/ai/predict-yield`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to predict yield');
    return res.json();
  },

  async diagnoseDisease(file: File): Promise<DiseaseDiagnosisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/ai/diagnose-disease`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to diagnose plant image');
    return res.json();
  },

  // Marketplace
  async getListings(params?: { category?: string; organicOnly?: boolean; search?: string }): Promise<CropListing[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.organicOnly) query.append('organic_only', 'true');
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/marketplace/listings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch crop listings');
    return res.json();
  },

  async createListing(listing: Partial<CropListing>): Promise<CropListing> {
    const res = await fetch(`${BASE_URL}/marketplace/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });
    if (!res.ok) throw new Error('Failed to create listing');
    return res.json();
  },

  async placeOrder(order: {
    listing_id: number;
    buyer_name: string;
    buyer_contact: string;
    buyer_address: string;
    quantity_kg: number;
  }): Promise<ProduceOrder> {
    const res = await fetch(`${BASE_URL}/marketplace/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to place order');
    }
    return res.json();
  },

  async getMarketStats(): Promise<{
    total_listings: number;
    total_stock_kg: number;
    total_orders: number;
    categories: string[];
  }> {
    const res = await fetch(`${BASE_URL}/marketplace/stats`);
    if (!res.ok) throw new Error('Failed to fetch market stats');
    return res.json();
  },

  // Weather
  async getWeather(location?: string): Promise<WeatherResponse> {
    const loc = location ? `?location=${encodeURIComponent(location)}` : '';
    const res = await fetch(`${BASE_URL}/weather/forecast${loc}`);
    if (!res.ok) throw new Error('Failed to fetch agro-weather forecast');
    return res.json();
  },
};
