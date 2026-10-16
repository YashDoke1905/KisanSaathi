from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=utcnow, index=True)
    soil_moisture = Column(Float, nullable=False)  # % (0-100)
    temperature = Column(Float, nullable=False)    # °C
    humidity = Column(Float, nullable=False)       # % (0-100)
    soil_ph = Column(Float, nullable=False)        # 0 - 14
    light_lux = Column(Float, nullable=False)      # Lux (0 - 80000)
    nitrogen = Column(Float, default=45.0)         # mg/kg
    phosphorus = Column(Float, default=30.0)       # mg/kg
    potassium = Column(Float, default=40.0)        # mg/kg
    battery_level = Column(Float, default=95.0)    # %


class IrrigationState(Base):
    __tablename__ = "irrigation_state"

    id = Column(Integer, primary_key=True, index=True)
    is_active = Column(Boolean, default=False)
    mode = Column(String, default="auto")  # "auto" or "manual"
    pump_speed = Column(Integer, default=100)  # %
    auto_threshold_moisture = Column(Float, default=32.0)  # Trigger pump below this %
    target_moisture = Column(Float, default=70.0)  # Turn off above this %
    last_switched = Column(DateTime, default=utcnow)


class FarmAlert(Base):
    __tablename__ = "farm_alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=utcnow)
    level = Column(String, default="info")  # "info", "warning", "critical"
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    source = Column(String, default="Telemetry System")
    resolved = Column(Boolean, default=False)
