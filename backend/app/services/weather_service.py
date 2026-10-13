from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List


def get_agro_weather_forecast(location: str = "GreenValley Agricultural Zone") -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    
    current = {
        "location": location,
        "temperature": 27.5,
        "feels_like": 28.8,
        "condition": "Partly Cloudy",
        "humidity": 62,
        "wind_speed_kmh": 11.4,
        "wind_direction": "SSW",
        "uv_index": 6.8,
        "solar_radiation_wm2": 680,
        "barometric_pressure_hpa": 1013.2,
        "precipitation_probability": 15
    }

    days_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_forecast: List[Dict[str, Any]] = []

    conditions = [
        ("Partly Cloudy", 28, 19, 10, "partly-cloudy"),
        ("Sunny & Clear", 30, 20, 5, "sunny"),
        ("Afternoon Showers", 25, 18, 65, "rain"),
        ("Overcast", 24, 17, 30, "cloudy"),
        ("Clear Sky", 29, 19, 0, "sunny"),
    ]

    for i in range(5):
        target_date = now + timedelta(days=i)
        cond_name, high, low, rain_prob, icon = conditions[i % len(conditions)]
        daily_forecast.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day_name": days_names[target_date.weekday()],
            "condition": cond_name,
            "temp_max": high,
            "temp_min": low,
            "rain_probability": rain_prob,
            "rainfall_amount_mm": 12.5 if rain_prob > 50 else (2.0 if rain_prob > 20 else 0.0),
            "icon": icon
        })

    advisories = [
        {
            "category": "Spraying Conditions",
            "status": "Optimal",
            "message": "Winds are steady at 11 km/h with no morning rain. Favorable window for micronutrient and bio-fungicide foliar application between 07:00 and 11:00."
        },
        {
            "category": "Irrigation Guidance",
            "status": "Conserve Water",
            "message": "Moderate showers (12.5mm) forecasted for day 3. Reduce automated irrigation duration by 25% to maximize rainwater capture."
        },
        {
            "category": "Heat & Thermal Stress",
            "status": "Safe",
            "message": "Daytime peak temperatures remain under 31°C. Photosynthetic canopy stress index is low."
        },
        {
            "category": "Fungal Pathology Watch",
            "status": "Caution",
            "message": "Post-rain relative humidity spikes will elevate powdery mildew risk on cucurbits and legumes. Pre-emptively apply neem oil barrier."
        }
    ]

    return {
        "current": current,
        "daily_forecast": daily_forecast,
        "advisories": advisories
    }
