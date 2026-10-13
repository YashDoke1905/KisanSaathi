import asyncio
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database import SessionLocal
from app.models.telemetry import SensorReading, IrrigationState, FarmAlert


def utcnow():
    return datetime.now(timezone.utc)


class IoTSimulatorService:
    def __init__(self):
        self.soil_moisture: float = 38.5
        self.temperature: float = 27.2
        self.humidity: float = 64.0
        self.soil_ph: float = 6.6
        self.light_lux: float = 48500.0
        self.nitrogen: float = 46.0
        self.phosphorus: float = 32.0
        self.potassium: float = 41.0
        self.battery_level: float = 96.0

        # Pump and automation state
        self.is_active: bool = False
        self.mode: str = "auto"
        self.pump_speed: int = 100
        self.auto_threshold_moisture: float = 32.0
        self.target_moisture: float = 70.0
        self.last_switched: datetime = utcnow()

        # Subscribers for live SSE updates
        self._listeners: List[asyncio.Queue] = []
        self._running: bool = False

    def get_current_reading(self) -> Dict[str, Any]:
        return {
            "timestamp": utcnow().isoformat(),
            "soil_moisture": round(self.soil_moisture, 1),
            "temperature": round(self.temperature, 1),
            "humidity": round(self.humidity, 1),
            "soil_ph": round(self.soil_ph, 2),
            "light_lux": round(self.light_lux, 0),
            "nitrogen": round(self.nitrogen, 1),
            "phosphorus": round(self.phosphorus, 1),
            "potassium": round(self.potassium, 1),
            "battery_level": round(self.battery_level, 1),
        }

    def get_irrigation_state(self) -> Dict[str, Any]:
        return {
            "id": 1,
            "is_active": self.is_active,
            "mode": self.mode,
            "pump_speed": self.pump_speed,
            "auto_threshold_moisture": self.auto_threshold_moisture,
            "target_moisture": self.target_moisture,
            "last_switched": self.last_switched.isoformat()
        }

    def set_irrigation_control(
        self,
        is_active: Optional[bool] = None,
        mode: Optional[str] = None,
        pump_speed: Optional[int] = None,
        auto_threshold_moisture: Optional[float] = None,
        target_moisture: Optional[float] = None
    ) -> Dict[str, Any]:
        if mode is not None:
            self.mode = mode
        if pump_speed is not None:
            self.pump_speed = pump_speed
        if auto_threshold_moisture is not None:
            self.auto_threshold_moisture = auto_threshold_moisture
        if target_moisture is not None:
            self.target_moisture = target_moisture
        if is_active is not None and is_active != self.is_active:
            self.is_active = is_active
            self.last_switched = utcnow()
            self._record_alert(
                level="info",
                title=f"Irrigation Pump {'Turned ON' if is_active else 'Turned OFF'}",
                message=f"Pump manually switched to {'ON' if is_active else 'OFF'} at {self.pump_speed}% speed.",
                source="Manual Control"
            )

        # Synchronize DB
        self._sync_irrigation_db()
        return self.get_irrigation_state()

    def _sync_irrigation_db(self):
        try:
            with SessionLocal() as db:
                state = db.query(IrrigationState).first()
                if not state:
                    state = IrrigationState(id=1)
                    db.add(state)
                state.is_active = self.is_active
                state.mode = self.mode
                state.pump_speed = self.pump_speed
                state.auto_threshold_moisture = self.auto_threshold_moisture
                state.target_moisture = self.target_moisture
                state.last_switched = self.last_switched
                db.commit()
        except Exception:
            pass

    def _record_alert(self, level: str, title: str, message: str, source: str):
        try:
            with SessionLocal() as db:
                alert = FarmAlert(
                    timestamp=utcnow(),
                    level=level,
                    title=title,
                    message=message,
                    source=source,
                    resolved=False
                )
                db.add(alert)
                db.commit()
        except Exception:
            pass

    def tick(self):
        # Physics simulation step
        if self.is_active:
            # Water replenish rate proportional to pump speed
            rate = 1.2 * (self.pump_speed / 100.0)
            self.soil_moisture = min(88.0, self.soil_moisture + rate)
            self.humidity = min(92.0, self.humidity + 0.3)
        else:
            # Evaporation / soil drying rate
            evap_rate = 0.25 + random.uniform(0.05, 0.15)
            self.soil_moisture = max(14.0, self.soil_moisture - evap_rate)
            self.humidity = max(40.0, self.humidity - random.uniform(0.1, 0.3))

        # Ambient temperature walk
        self.temperature += random.uniform(-0.15, 0.15)
        self.temperature = max(18.0, min(36.0, self.temperature))

        # Sunlight walk
        self.light_lux += random.uniform(-800, 800)
        self.light_lux = max(1000.0, min(75000.0, self.light_lux))

        # Small pH drift
        self.soil_ph += random.uniform(-0.01, 0.01)
        self.soil_ph = max(5.5, min(8.0, self.soil_ph))

        # Automatic irrigation logic
        if self.mode == "auto":
            if not self.is_active and self.soil_moisture < self.auto_threshold_moisture:
                self.is_active = True
                self.last_switched = utcnow()
                self._record_alert(
                    level="warning",
                    title="Low Soil Moisture - Auto Pump Activated",
                    message=f"Soil moisture dropped to {self.soil_moisture:.1f}% (below trigger {self.auto_threshold_moisture:.1f}%). Irrigation pump activated.",
                    source="Smart Automation"
                )
                self._sync_irrigation_db()

            elif self.is_active and self.soil_moisture >= self.target_moisture:
                self.is_active = False
                self.last_switched = utcnow()
                self._record_alert(
                    level="info",
                    title="Optimal Moisture Reached - Pump Shutoff",
                    message=f"Soil moisture reached target {self.soil_moisture:.1f}%. Automatic shutoff engaged to conserve water.",
                    source="Smart Automation"
                )
                self._sync_irrigation_db()

        # Check critical alerts
        if self.soil_moisture < 20.0 and random.random() < 0.1:
            self._record_alert(
                level="critical",
                title="Critical Soil Desiccation Alert",
                message=f"Severe drought condition detected: soil moisture is critically low at {self.soil_moisture:.1f}%.",
                source="Telemetry Sensor Node"
            )

    async def run_loop(self):
        self._running = True
        tick_count = 0
        while self._running:
            try:
                self.tick()
                tick_count += 1

                # Save reading to DB every 5 ticks (~10 seconds)
                if tick_count % 5 == 0:
                    try:
                        with SessionLocal() as db:
                            reading = SensorReading(
                                timestamp=utcnow(),
                                soil_moisture=round(self.soil_moisture, 1),
                                temperature=round(self.temperature, 1),
                                humidity=round(self.humidity, 1),
                                soil_ph=round(self.soil_ph, 2),
                                light_lux=round(self.light_lux, 0),
                                nitrogen=round(self.nitrogen, 1),
                                phosphorus=round(self.phosphorus, 1),
                                potassium=round(self.potassium, 1),
                                battery_level=round(self.battery_level, 1),
                            )
                            db.add(reading)
                            db.commit()
                    except Exception:
                        pass

                # Broadcast to SSE listeners
                payload = {
                    "reading": self.get_current_reading(),
                    "irrigation": self.get_irrigation_state()
                }
                dead_listeners = []
                for queue in self._listeners:
                    try:
                        queue.put_nowait(payload)
                    except asyncio.QueueFull:
                        pass
                    except Exception:
                        dead_listeners.append(queue)
                for dl in dead_listeners:
                    if dl in self._listeners:
                        self._listeners.remove(dl)

            except Exception as e:
                print(f"Error in IoT simulation tick: {e}")

            await asyncio.sleep(2.0)

    def subscribe(self) -> asyncio.Queue:
        queue = asyncio.Queue(maxsize=10)
        self._listeners.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue):
        if queue in self._listeners:
            self._listeners.remove(queue)


# Singleton simulator instance
iot_simulator = IoTSimulatorService()
