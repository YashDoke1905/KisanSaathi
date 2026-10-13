import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.models.telemetry import SensorReading, IrrigationState, FarmAlert
from app.models.marketplace import CropListing
from app.services.iot_simulator import iot_simulator
from app.routers import iot, ai, marketplace, weather


def utcnow():
    return datetime.now(timezone.utc)


def seed_database():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        # 1. Initialize Irrigation state if absent
        if not db.query(IrrigationState).first():
            state = IrrigationState(
                id=1,
                is_active=False,
                mode="auto",
                pump_speed=100,
                auto_threshold_moisture=32.0,
                target_moisture=70.0,
                last_switched=utcnow()
            )
            db.add(state)

        # 2. Seed sensor readings if empty
        if db.query(SensorReading).count() == 0:
            now = utcnow()
            readings = []
            for i in range(24, 0, -1):
                t = now - timedelta(minutes=i * 10)
                # gentle variation
                moisture = 42.0 - (i % 8) * 0.8
                temp = 24.0 + (i % 6) * 0.9
                hum = 68.0 - (i % 6) * 1.2
                readings.append(SensorReading(
                    timestamp=t,
                    soil_moisture=round(moisture, 1),
                    temperature=round(temp, 1),
                    humidity=round(hum, 1),
                    soil_ph=6.55,
                    light_lux=35000.0 if 6 <= (t.hour % 24) <= 18 else 1200.0,
                    nitrogen=45.0,
                    phosphorus=30.0,
                    potassium=40.0,
                    battery_level=96.0
                ))
            db.add_all(readings)

        # 3. Seed initial farm alerts
        if db.query(FarmAlert).count() == 0:
            alerts = [
                FarmAlert(
                    timestamp=utcnow() - timedelta(hours=3),
                    level="warning",
                    title="Moisture Dip Detected in Sector 3",
                    message="Soil moisture approached 33% at 06:15. Automation primed pump.",
                    source="Sector 3 Sensor Node",
                    resolved=False
                ),
                FarmAlert(
                    timestamp=utcnow() - timedelta(hours=14),
                    level="info",
                    title="Scheduled Fertigation Complete",
                    message="Automated drip fertigation cycle for Block B finished successfully.",
                    source="Drip Line 2",
                    resolved=True
                )
            ]
            db.add_all(alerts)

        # 4. Seed marketplace produce listings
        if db.query(CropListing).count() == 0:
            listings = [
                CropListing(
                    farmer_name="Ramesh Patel",
                    crop_name="Organic Roma Tomatoes",
                    variety="Roma Plum",
                    category="Vegetable",
                    quantity_kg=850.0,
                    price_per_kg=1.40,
                    harvest_date="2026-10-12",
                    is_organic=True,
                    description="Vine-ripened, pesticide-free plum tomatoes with high pulp density. Ideal for sauce, canning, and fresh salads.",
                    location="Sunridge Organic Farm, Field 2",
                    image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
                ),
                CropListing(
                    farmer_name="Sarah Jenkins",
                    crop_name="Golden Sharbati Wheat",
                    variety="C-306 Heirloom",
                    category="Grain",
                    quantity_kg=2400.0,
                    price_per_kg=0.65,
                    harvest_date="2026-10-08",
                    is_organic=True,
                    description="Premium high-protein grain harvested under sunny autumn conditions. Sun-dried and graded for milling.",
                    location="Prairie Green Valleys, Plot 7",
                    image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"
                ),
                CropListing(
                    farmer_name="Amit Sharma",
                    crop_name="Sweet Hybrid Corn",
                    variety="Sugar King F1",
                    category="Grain",
                    quantity_kg=1200.0,
                    price_per_kg=0.90,
                    harvest_date="2026-10-11",
                    is_organic=False,
                    description="Crisp and naturally sweet golden cobs, harvested early morning for maximum moisture retention.",
                    location="Cedar Creek Farmlands",
                    image_url="https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"
                ),
                CropListing(
                    farmer_name="Maria Gonzalez",
                    crop_name="Alphonso Mangoes",
                    variety="Ratnagiri King",
                    category="Fruit",
                    quantity_kg=450.0,
                    price_per_kg=4.20,
                    harvest_date="2026-10-13",
                    is_organic=True,
                    description="Export-quality aromatic Alphonso mangoes, hand-plucked with stems intact. Natural hay-ripened.",
                    location="Coastal Groves, Block A",
                    image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80"
                ),
                CropListing(
                    farmer_name="Gurpreet Singh",
                    crop_name="Kabuli Chickpeas",
                    variety="Jumbo Grade 12mm",
                    category="Pulse",
                    quantity_kg=1800.0,
                    price_per_kg=1.85,
                    harvest_date="2026-10-05",
                    is_organic=True,
                    description="Extra large, sun-cured white chickpeas. Exceptional boiling quality and high vegetable protein.",
                    location="North Plains Agro Cooperative",
                    image_url="https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&auto=format&fit=crop&q=80"
                ),
                CropListing(
                    farmer_name="Kenji Takahashi",
                    crop_name="Hydroponic Butterhead Lettuce",
                    variety="Rex Butterhead",
                    category="Vegetable",
                    quantity_kg=320.0,
                    price_per_kg=2.50,
                    harvest_date="2026-10-14",
                    is_organic=True,
                    description="Clean root-on butterhead lettuce grown in controlled recirculating nutrient solution. Zero soil residue.",
                    location="PureLeaf Vertical Facility 1",
                    image_url="https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80"
                )
            ]
            db.add_all(listings)

        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database and start IoT background simulation loop
    seed_database()
    sim_task = asyncio.create_task(iot_simulator.run_loop())
    yield
    # Shutdown: Stop simulator
    iot_simulator._running = False
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="SmartHarvest Core API",
    description="Intelligent Agriculture Telemetry, AI Diagnostics, and Produce Marketplace API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(iot.router)
app.include_router(ai.router)
app.include_router(marketplace.router)
app.include_router(weather.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "system": "SmartHarvest Precision Agriculture Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "iot": "/api/iot/latest",
            "stream": "/api/iot/stream",
            "ai": "/api/ai/recommend-crop",
            "marketplace": "/api/marketplace/listings",
            "weather": "/api/weather/forecast"
        }
    }
