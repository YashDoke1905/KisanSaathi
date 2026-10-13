from pydantic import BaseModel, Field
from typing import List, Optional


class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen ratio in soil (N)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus ratio in soil (P)")
    potassium: float = Field(..., ge=0, le=250, description="Potassium ratio in soil (K)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=5000, description="Average seasonal rainfall in mm")


class CropRecommendationItem(BaseModel):
    crop: str
    match_score: float  # 0 to 100%
    season: str
    water_requirement: str
    ideal_soil_type: str
    description: str
    key_practices: List[str]


class CropRecommendationResponse(BaseModel):
    recommended_crops: List[CropRecommendationItem]
    soil_health_assessment: str
    nutrient_status: dict


class YieldPredictionRequest(BaseModel):
    crop_name: str
    farm_area_hectares: float = Field(..., gt=0, description="Farm area in hectares")
    fertilizer_usage_kg_per_ha: float = Field(default=120.0, ge=0)
    rainfall_annual_mm: float = Field(default=850.0, ge=0)
    soil_type: str = Field(default="Loamy", description="Loamy, Sandy, Clay, Alluvial, Black")
    irrigation_type: str = Field(default="Drip", description="Drip, Sprinkler, Flood, Rainfed")


class YieldPredictionResponse(BaseModel):
    crop_name: str
    farm_area_hectares: float
    predicted_yield_tons_per_ha: float
    total_expected_yield_tons: float
    market_value_estimate_usd: float
    factors_impact: dict
    recommendations: List[str]


class DiseaseDiagnosisResponse(BaseModel):
    disease_detected: str
    is_healthy: bool
    confidence_score: float  # 0 to 100%
    affected_crop: str
    severity: str  # "None", "Mild", "Moderate", "Severe"
    symptoms: List[str]
    organic_remedies: List[str]
    chemical_treatments: List[str]
    prevention_tips: List[str]
