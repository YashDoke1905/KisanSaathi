from typing import Dict, Any
from app.schemas.ai import YieldPredictionRequest, YieldPredictionResponse

CROP_BENCHMARKS = {
    "rice": {"base_yield": 4.2, "optimal_rain": 1200, "price_per_ton": 360.0},
    "wheat": {"base_yield": 3.8, "optimal_rain": 600, "price_per_ton": 320.0},
    "maize": {"base_yield": 5.5, "optimal_rain": 800, "price_per_ton": 280.0},
    "corn": {"base_yield": 5.5, "optimal_rain": 800, "price_per_ton": 280.0},
    "tomato": {"base_yield": 28.0, "optimal_rain": 650, "price_per_ton": 450.0},
    "potato": {"base_yield": 24.0, "optimal_rain": 550, "price_per_ton": 340.0},
    "cotton": {"base_yield": 2.2, "optimal_rain": 750, "price_per_ton": 880.0},
    "soybean": {"base_yield": 2.9, "optimal_rain": 900, "price_per_ton": 520.0},
    "chickpea": {"base_yield": 1.9, "optimal_rain": 400, "price_per_ton": 720.0},
    "banana": {"base_yield": 36.0, "optimal_rain": 1100, "price_per_ton": 410.0},
    "default": {"base_yield": 3.5, "optimal_rain": 750, "price_per_ton": 350.0}
}

SOIL_MULTIPLIERS = {
    "alluvial": 1.15,
    "loamy": 1.10,
    "black": 1.08,
    "clay": 0.96,
    "sandy": 0.86
}

IRRIGATION_MULTIPLIERS = {
    "drip": 1.22,
    "sprinkler": 1.10,
    "flood": 0.98,
    "rainfed": 0.82
}


def predict_crop_yield(data: YieldPredictionRequest) -> YieldPredictionResponse:
    crop_key = data.crop_name.strip().lower()
    benchmark = CROP_BENCHMARKS.get(crop_key, CROP_BENCHMARKS["default"])

    base_yield = benchmark["base_yield"]
    optimal_rain = benchmark["optimal_rain"]
    price_per_ton = benchmark["price_per_ton"]

    # 1. Soil effect
    soil_key = data.soil_type.strip().lower()
    soil_mult = SOIL_MULTIPLIERS.get(soil_key, 1.0)

    # 2. Irrigation effect
    irrig_key = data.irrigation_type.strip().lower()
    irrig_mult = IRRIGATION_MULTIPLIERS.get(irrig_key, 1.0)

    # 3. Fertilizer diminishing returns model (ideal range ~120-160 kg/ha)
    fert = data.fertilizer_usage_kg_per_ha
    if fert <= 0:
        fert_mult = 0.65
    elif fert <= 140:
        fert_mult = 0.65 + (fert / 140.0) * 0.45  # reaches ~1.10
    elif fert <= 220:
        fert_mult = 1.10 + ((fert - 140) / 80.0) * 0.05  # reaches 1.15
    else:
        # Over-fertilization burn effect
        fert_mult = 1.15 - ((fert - 220) / 100.0) * 0.15

    # 4. Rainfall effect curve
    rain_ratio = data.rainfall_annual_mm / max(100.0, optimal_rain)
    if rain_ratio < 0.6:
        rain_mult = 0.75 + (rain_ratio / 0.6) * 0.20
    elif rain_ratio <= 1.4:
        rain_mult = 0.95 + min(0.15, (rain_ratio - 0.6) * 0.15)
    else:
        # Waterlogging risk
        rain_mult = max(0.80, 1.10 - (rain_ratio - 1.4) * 0.20)

    # Overall predicted yield per hectare
    predicted_yield_per_ha = round(base_yield * soil_mult * irrig_mult * fert_mult * rain_mult, 2)
    total_yield = round(predicted_yield_per_ha * data.farm_area_hectares, 2)
    market_val = round(total_yield * price_per_ton, 2)

    factors_impact = {
        "soil_impact": f"{'+' if soil_mult >= 1.0 else ''}{round((soil_mult - 1.0) * 100, 1)}%",
        "irrigation_impact": f"{'+' if irrig_mult >= 1.0 else ''}{round((irrig_mult - 1.0) * 100, 1)}%",
        "fertilizer_efficiency": f"{round(fert_mult * 100, 1)}% of benchmark",
        "rainfall_adequacy": f"{round(rain_mult * 100, 1)}% rating"
    }

    recommendations = []
    if irrig_key in ["flood", "rainfed"]:
        recommendations.append("Upgrading to precision drip irrigation can boost harvest yield by 15-25% while halving water consumption.")
    if fert > 200:
        recommendations.append("High chemical fertilizer detected: consider adopting bio-fertilizers or split applications to prevent soil acidification.")
    elif fert < 70:
        recommendations.append("Increasing balanced basal organic compost or NPK could unlock higher yield potential.")
    if soil_key == "sandy":
        recommendations.append("Sandy soil has rapid leaching: incorporate organic farmyard manure (FYM) to elevate moisture and nutrient retention.")
    if not recommendations:
        recommendations.append("Agronomic parameters are closely aligned with peak yield benchmarks. Maintain continuous soil moisture monitoring.")

    return YieldPredictionResponse(
        crop_name=data.crop_name,
        farm_area_hectares=data.farm_area_hectares,
        predicted_yield_tons_per_ha=predicted_yield_per_ha,
        total_expected_yield_tons=total_yield,
        market_value_estimate_usd=market_val,
        factors_impact=factors_impact,
        recommendations=recommendations
    )
