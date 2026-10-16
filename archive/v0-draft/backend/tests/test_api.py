import io
import pytest
from fastapi.testclient import TestClient
from app.main import app, seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "SmartHarvest" in data["system"]


def test_iot_endpoints():
    response = client.get("/api/iot/latest")
    assert response.status_code == 200
    data = response.json()
    assert "latest" in data
    assert "irrigation" in data
    assert "history" in data

    # Test irrigation control toggle
    ctrl_res = client.post("/api/iot/irrigation", json={"mode": "manual", "is_active": True, "pump_speed": 85})
    assert ctrl_res.status_code == 200
    ctrl_data = ctrl_res.json()
    assert ctrl_data["irrigation"]["is_active"] is True
    assert ctrl_data["irrigation"]["pump_speed"] == 85


def test_ai_crop_recommendation():
    payload = {
        "nitrogen": 85.0,
        "phosphorus": 50.0,
        "potassium": 45.0,
        "temperature": 25.0,
        "humidity": 80.0,
        "ph": 6.5,
        "rainfall": 1800.0
    }
    response = client.post("/api/ai/recommend-crop", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommended_crops"]) > 0
    assert "soil_health_assessment" in data


def test_ai_yield_prediction():
    payload = {
        "crop_name": "Wheat",
        "farm_area_hectares": 5.0,
        "fertilizer_usage_kg_per_ha": 140.0,
        "rainfall_annual_mm": 650.0,
        "soil_type": "Loamy",
        "irrigation_type": "Drip"
    }
    response = client.post("/api/ai/predict-yield", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "Wheat"
    assert data["predicted_yield_tons_per_ha"] > 0
    assert data["total_expected_yield_tons"] > 0


def test_ai_disease_diagnosis():
    # Create simple dummy 100x100 RGB image in memory
    from PIL import Image
    img = Image.new("RGB", (100, 100), color=(50, 160, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/ai/diagnose-disease",
        files={"file": ("healthy_leaf.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "disease_detected" in data
    assert "confidence_score" in data
    assert len(data["prevention_tips"]) > 0


def test_marketplace_endpoints():
    # 1. Fetch listings
    res = client.get("/api/marketplace/listings")
    assert res.status_code == 200
    listings = res.json()
    assert len(listings) > 0
    first_id = listings[0]["id"]

    # 2. Place order
    order_payload = {
        "listing_id": first_id,
        "buyer_name": "FreshMart Groceries",
        "buyer_contact": "orders@freshmart.example",
        "buyer_address": "404 Market Street, Metro Hub",
        "quantity_kg": 10.0
    }
    order_res = client.post("/api/marketplace/orders", json=order_payload)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["status"] == "Confirmed"
    assert order_data["quantity_kg"] == 10.0

    # 3. Market stats
    stats_res = client.get("/api/marketplace/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_listings"] > 0


def test_weather_endpoint():
    response = client.get("/api/weather/forecast")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert len(data["daily_forecast"]) == 5
    assert len(data["advisories"]) > 0
