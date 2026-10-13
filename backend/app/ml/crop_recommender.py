import math
from typing import List, Dict, Any
from app.schemas.ai import CropRecommendationRequest, CropRecommendationResponse, CropRecommendationItem

# Agro-climatic crop profiles with optimal ranges (mean, std)
CROP_PROFILES = [
    {
        "crop": "Rice",
        "season": "Kharif (Monsoon / Summer)",
        "water_req": "High (Standing water)",
        "ideal_soil": "Clayey or Alluvial with high water retention",
        "optimal": {"N": 80, "P": 48, "K": 40, "temp": 24, "hum": 82, "ph": 6.5, "rain": 2025},
        "description": "Thrives in warm, humid climates with abundant water and clay-rich soil.",
        "practices": ["Maintain 2-5cm standing water during vegetative stage", "Split nitrogen fertilizer application into 3 doses", "Transplant 21-day-old seedlings"]
    },
    {
        "crop": "Maize (Corn)",
        "season": "Kharif / Rabi",
        "water_req": "Moderate",
        "ideal_soil": "Well-drained fertile Loam",
        "optimal": {"N": 78, "P": 48, "K": 20, "temp": 22, "hum": 65, "ph": 6.5, "rain": 850},
        "description": "High-yield cereal adaptable to varied climates, sensitive to waterlogging.",
        "practices": ["Ensure deep tillage and weed management within first 30 days", "Apply balanced NPK at knee-high and tasseling stages", "Avoid water stress during silking"]
    },
    {
        "crop": "Wheat",
        "season": "Rabi (Winter)",
        "water_req": "Moderate (4-6 irrigations)",
        "ideal_soil": "Well-drained Loamy to Clayey Loam",
        "optimal": {"N": 90, "P": 50, "K": 40, "temp": 19, "hum": 55, "ph": 6.8, "rain": 550},
        "description": "Staple winter crop preferring cool growing weather and sunny harvest days.",
        "practices": ["First irrigation at Crown Root Initiation (21 days post-sowing)", "Treat seeds with biofungicide", "Maintain uniform seed depth (4-5cm)"]
    },
    {
        "crop": "Cotton",
        "season": "Kharif",
        "water_req": "Moderate to High",
        "ideal_soil": "Deep Black Cotton soil (Vertisol) or Sandy Loam",
        "optimal": {"N": 118, "P": 46, "K": 19, "temp": 24, "hum": 80, "ph": 6.8, "rain": 750},
        "description": "Commercial fiber crop requiring warm sunny weather and frost-free periods.",
        "practices": ["Install pheromone traps for bollworm management", "Drip irrigation gives 30% water savings and higher boll yield", "Apply potassium to enhance fiber strength"]
    },
    {
        "crop": "Tomato",
        "season": "Year-round (Warm season preference)",
        "water_req": "Moderate (Constant moisture)",
        "ideal_soil": "Rich Sandy Loam, pH 6.0 - 7.0",
        "optimal": {"N": 100, "P": 60, "K": 60, "temp": 22, "hum": 70, "ph": 6.2, "rain": 600},
        "description": "High-value horticulture crop demanding balanced nutrition and good drainage.",
        "practices": ["Stake plants to prevent soil-borne fruit rot", "Mulch beds to conserve moisture and suppress weeds", "Provide calcium supplementation to prevent blossom end rot"]
    },
    {
        "crop": "Chickpea (Gram)",
        "season": "Rabi (Winter / Post-rainy)",
        "water_req": "Low (Drought-tolerant pulse)",
        "ideal_soil": "Sandy Loam to Deep Silt Loam",
        "optimal": {"N": 40, "P": 68, "K": 80, "temp": 18, "hum": 17, "ph": 7.2, "rain": 80},
        "description": "Protein-rich legume that enriches soil through atmospheric nitrogen fixation.",
        "practices": ["Inoculate seeds with Rhizobium culture before sowing", "Avoid heavy irrigation; 1-2 light waterings suffice", "Monitor for pod borer during flowering"]
    },
    {
        "crop": "Potato",
        "season": "Winter / Spring",
        "water_req": "Moderate",
        "ideal_soil": "Loose, well-aerated Loamy sand",
        "optimal": {"N": 120, "P": 60, "K": 100, "temp": 18, "hum": 75, "ph": 5.8, "rain": 500},
        "description": "Fast-maturing tuber crop needing cool temperatures for optimal bulking.",
        "practices": ["Perform earthing up 30-35 days after planting", "Maintain consistent soil moisture to prevent tuber cracking", "Spray preventive fungicide for late blight during fog"]
    },
    {
        "crop": "Soybean",
        "season": "Kharif (Monsoon)",
        "water_req": "Moderate",
        "ideal_soil": "Fertile Loamy soil with neutral pH",
        "optimal": {"N": 35, "P": 70, "K": 30, "temp": 26, "hum": 68, "ph": 6.5, "rain": 900},
        "description": "Dual oilseed and protein crop fixing its own nitrogen once nodules establish.",
        "practices": ["Ensure proper drainage; susceptible to seedling damping-off in stagnation", "Apply single superphosphate (SSP) for sulfur and phosphorus boost", "Weed within the first 45 days"]
    },
    {
        "crop": "Banana",
        "season": "Perennial (Warm tropical)",
        "water_req": "High",
        "ideal_soil": "Deep, rich, well-drained Alluvial Loam",
        "optimal": {"N": 100, "P": 75, "K": 50, "temp": 27, "hum": 80, "ph": 6.5, "rain": 1100},
        "description": "Heavy feeder requiring high temperatures, humidity, and abundant moisture.",
        "practices": ["Use tissue-culture saplings for uniform harvest", "Drip fertigation with high potassium during fruit development", "Desucker regularly leaving only the mother plant and one follower"]
    },
    {
        "crop": "Coffee",
        "season": "Perennial (Subtropical / Hill slopes)",
        "water_req": "Moderate to High",
        "ideal_soil": "Volcanic or Loamy forest soil rich in organic humus",
        "optimal": {"N": 102, "P": 28, "K": 30, "temp": 25, "hum": 58, "ph": 6.7, "rain": 1580},
        "description": "Shade-grown cash crop thriving in high altitude tropical mist zones.",
        "practices": ["Maintain two-tier shade trees (silver oak and leguminous trees)", "Prune dead wood and water sprouts post-harvest", "Harvest only deep red ripe berries"]
    }
]


def recommend_crops(data: CropRecommendationRequest) -> CropRecommendationResponse:
    # Feature weights
    weights = {
        "N": 0.15,
        "P": 0.15,
        "K": 0.15,
        "temp": 0.20,
        "hum": 0.10,
        "ph": 0.10,
        "rain": 0.15
    }

    # Normalization scale ranges
    scales = {
        "N": 140.0,
        "P": 100.0,
        "K": 100.0,
        "temp": 35.0,
        "hum": 100.0,
        "ph": 14.0,
        "rain": 2000.0
    }

    feat_map = {
        "N": data.nitrogen,
        "P": data.phosphorus,
        "K": data.potassium,
        "temp": data.temperature,
        "hum": data.humidity,
        "ph": data.ph,
        "rain": data.rainfall
    }

    scored_crops = []

    for item in CROP_PROFILES:
        opt = item["optimal"]
        
        diff_sq = 0.0
        for feat, w in weights.items():
            val_user = feat_map[feat]
            val_opt = opt[feat]
            norm_diff = (val_user - val_opt) / scales[feat]
            diff_sq += w * (norm_diff ** 2)

        distance = math.sqrt(diff_sq)
        # Convert distance into match score (0 to 100)
        match_score = max(15.0, min(99.0, round((1.0 / (1.0 + 2.2 * distance)) * 100, 1)))

        scored_crops.append({
            "crop": item["crop"],
            "match_score": match_score,
            "season": item["season"],
            "water_requirement": item["water_req"],
            "ideal_soil_type": item["ideal_soil"],
            "description": item["description"],
            "key_practices": item["practices"]
        })

    # Sort descending by match score
    scored_crops.sort(key=lambda x: x["match_score"], reverse=True)
    top_recommendations = [CropRecommendationItem(**c) for c in scored_crops[:4]]

    # Soil health assessment
    soil_assessment = []
    if data.ph < 5.5:
        soil_assessment.append("Acidic soil: Recommend agricultural lime (calcium carbonate) application.")
    elif data.ph > 7.8:
        soil_assessment.append("Alkaline soil: Apply gypsum or elemental sulfur to bring pH towards optimal neutral range.")
    else:
        soil_assessment.append("Optimal soil pH: Well balanced for broad crop nutrient availability.")

    if data.nitrogen < 50:
        soil_assessment.append("Low Nitrogen: Legume green manuring or urea top-dressing recommended.")
    elif data.nitrogen > 110:
        soil_assessment.append("High Nitrogen: Ample vegetative growth nutrients present, monitor for pest attraction.")

    if data.phosphorus < 30:
        soil_assessment.append("Deficient Phosphorus: Root development could benefit from Rock Phosphate or DAP.")

    if data.potassium < 35:
        soil_assessment.append("Low Potassium: Apply MOP (Muriate of Potash) to improve drought resistance and fruit quality.")

    nutrient_status = {
        "nitrogen_status": "Deficient" if data.nitrogen < 40 else "Optimal" if data.nitrogen < 100 else "Surplus",
        "phosphorus_status": "Deficient" if data.phosphorus < 25 else "Optimal" if data.phosphorus < 60 else "Surplus",
        "potassium_status": "Deficient" if data.potassium < 30 else "Optimal" if data.potassium < 80 else "Surplus",
        "ph_character": "Acidic" if data.ph < 6.0 else "Neutral" if data.ph <= 7.5 else "Alkaline",
        "rainfall_adequacy": "Low" if data.rainfall < 500 else "Moderate" if data.rainfall < 1200 else "Abundant"
    }

    return CropRecommendationResponse(
        recommended_crops=top_recommendations,
        soil_health_assessment=" ".join(soil_assessment),
        nutrient_status=nutrient_status
    )
