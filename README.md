# 🌾 SmartHarvest: Full-Stack Smart Farming & Precision Agronomy Platform

SmartHarvest is a precision agriculture platform integrating real-time **IoT telemetry**, **AI/ML agronomic analytics**, **automated smart irrigation**, and a **farm-to-market produce portal**.

---

## 🌟 Key Features

1. **IoT Telemetry & Smart Irrigation Actuator**
   - Live sensor streams for **Soil Moisture (%)**, **Temperature (°C)**, **Humidity (%)**, **Soil pH**, **Sunlight (Lux)**, and **Battery Level**.
   - **Autonomous Irrigation Automation**: Triggers drip pump below configurable soil moisture thresholds and halts upon reaching target capacity to conserve water.
   - **Manual Operator Override**: One-click pump activation and speed control.
   - **Real-Time SSE Streaming**: Live updates via Server-Sent Events (`/api/iot/stream`).
   - **Farm Alerts Engine**: Incident logging for soil desiccation, extreme weather, and pump cycles.

2. **AI & Machine Learning Diagnostics**
   - **Leaf Disease Scanner**: Computer vision analysis of uploaded leaf imagery. Identifies Early Blight, Late Blight, Powdery Mildew, Leaf Rust, or Healthy Foliage with confidence scoring, symptom checklists, and dual organic & chemical treatment guides. Includes one-click test sample presets.
   - **Crop Recommendation Engine**: Multi-dimensional agro-climatic matching (Nitrogen, Phosphorus, Potassium, pH, rainfall, temperature, humidity) recommending top-suited crops with seasonal windows and agronomic practices.
   - **Harvest Yield Predictor**: Empirical regression estimating total tons and market valuation ($ USD) based on acreage, soil classification, fertilizer curves, and irrigation methods.

3. **Agro-Weather Advisory**
   - 5-day agricultural weather forecast with precipitation probabilities.
   - Actionable farming advisories: foliar spraying windows, irrigation postponement, and pathogen humidity warnings.

4. **Farm-to-Market Produce Portal**
   - Direct listings by farmers with harvest dates, quantities, prices, and organic certifications.
   - Search, category filters (Grains, Vegetables, Fruits, Pulses), and instant buyer ordering workflow with automatic stock deductions.
   - Harvest batch listing modal for farmers.

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy, SQLite, Pydantic V2, Pillow, NumPy, Pytest.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Communication**: RESTful JSON APIs + Server-Sent Events (SSE).

---

## 🚀 Quick Start Guide

### Option 1: Automated Launch (Windows)
Double-click `run_all.bat` (or execute from terminal):
```powershell
.\run_all.bat
```
This starts both the FastAPI backend and Vite frontend concurrently.

### Option 2: Manual Step-by-Step

#### 1. Backend Setup
```powershell
cd backend
# Activate virtual environment
.\venv\Scripts\activate
# Run server
python run.py
```
- API root: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

#### 2. Frontend Setup
```powershell
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Testing

Run backend pytest suite:
```powershell
cd backend
..\backend\venv\Scripts\python.exe -m pytest tests/
```
All 7 unit and integration tests validate the root endpoint, telemetry controls, crop recommendations, yield calculations, leaf pathology scans, weather advisory, and marketplace order processing.

---

## 📁 Repository Structure

```text
SmartHarvest/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan simulation loop, database seeder
│   │   ├── database.py          # SQLite engine & session factory
│   │   ├── models/              # SQLAlchemy models (Telemetry, Irrigation, Alerts, Marketplace)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── routers/             # API endpoints (iot, ai, marketplace, weather)
│   │   ├── ml/                  # Agronomic models (disease_classifier, crop_recommender, yield_predictor)
│   │   └── services/            # IoT simulator and agro-weather service
│   ├── tests/                   # Pytest test suite
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.tsx
│   │   ├── pages/Dashboard.tsx
│   │   ├── pages/TelemetryPage.tsx
│   │   ├── pages/AiAdvisorPage.tsx
│   │   ├── pages/YieldPredictorPage.tsx
│   │   ├── pages/MarketplacePage.tsx
│   │   ├── services/api.ts      # Client API service
│   │   ├── types/index.ts       # TypeScript definitions
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── run_backend.bat
├── run_frontend.bat
├── run_all.bat
└── README.md
```
