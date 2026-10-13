from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class SensorReadingBase(BaseModel):
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture in percentage")
    temperature: float = Field(..., description="Ambient temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in percentage")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    light_lux: float = Field(..., ge=0, description="Sunlight intensity in Lux")
    nitrogen: float = Field(default=45.0, description="Nitrogen level in mg/kg")
    phosphorus: float = Field(default=30.0, description="Phosphorus level in mg/kg")
    potassium: float = Field(default=40.0, description="Potassium level in mg/kg")
    battery_level: float = Field(default=95.0, description="Sensor node battery %")


class SensorReadingCreate(SensorReadingBase):
    pass


class SensorReadingResponse(SensorReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


class IrrigationControlRequest(BaseModel):
    is_active: Optional[bool] = None
    mode: Optional[str] = Field(None, pattern="^(auto|manual)$")
    pump_speed: Optional[int] = Field(None, ge=0, le=100)
    auto_threshold_moisture: Optional[float] = Field(None, ge=10, le=90)
    target_moisture: Optional[float] = Field(None, ge=30, le=100)


class IrrigationStateResponse(BaseModel):
    id: int
    is_active: bool
    mode: str
    pump_speed: int
    auto_threshold_moisture: float
    target_moisture: float
    last_switched: datetime
    model_config = ConfigDict(from_attributes=True)


class FarmAlertResponse(BaseModel):
    id: int
    timestamp: datetime
    level: str
    title: str
    message: str
    source: str
    resolved: bool
    model_config = ConfigDict(from_attributes=True)


class TelemetryDashboardResponse(BaseModel):
    latest: Optional[SensorReadingResponse]
    irrigation: IrrigationStateResponse
    active_alerts: List[FarmAlertResponse]
    history: List[SensorReadingResponse]
