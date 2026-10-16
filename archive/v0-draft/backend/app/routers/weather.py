from fastapi import APIRouter, Query
from app.services.weather_service import get_agro_weather_forecast

router = APIRouter(prefix="/api/weather", tags=["Agro Weather Advisory"])


@router.get("/forecast")
def get_weather_forecast(location: str = Query("GreenValley Agricultural Zone")):
    return get_agro_weather_forecast(location=location)
