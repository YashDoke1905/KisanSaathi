import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.telemetry import SensorReading, IrrigationState, FarmAlert
from app.schemas.telemetry import (
    SensorReadingResponse,
    IrrigationControlRequest,
    IrrigationStateResponse,
    FarmAlertResponse,
    TelemetryDashboardResponse,
)
from app.services.iot_simulator import iot_simulator

router = APIRouter(prefix="/api/iot", tags=["IoT & Telemetry"])


@router.get("/latest")
def get_latest_telemetry(db: Session = Depends(get_db)):
    reading = iot_simulator.get_current_reading()
    irrigation = iot_simulator.get_irrigation_state()
    alerts = db.query(FarmAlert).filter(FarmAlert.resolved == False).order_by(FarmAlert.timestamp.desc()).limit(10).all()
    
    # Recent history
    recent = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(20).all()
    recent.reverse()

    return {
        "latest": reading,
        "irrigation": irrigation,
        "active_alerts": alerts,
        "history": recent
    }


@router.get("/history", response_model=List[SensorReadingResponse])
def get_sensor_history(limit: int = Query(30, ge=5, le=200), db: Session = Depends(get_db)):
    records = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    records.reverse()
    return records


@router.post("/irrigation")
def control_irrigation(request: IrrigationControlRequest):
    updated = iot_simulator.set_irrigation_control(
        is_active=request.is_active,
        mode=request.mode,
        pump_speed=request.pump_speed,
        auto_threshold_moisture=request.auto_threshold_moisture,
        target_moisture=request.target_moisture,
    )
    return {
        "status": "success",
        "message": f"Irrigation state updated: active={updated['is_active']}, mode={updated['mode']}",
        "irrigation": updated
    }


@router.get("/alerts", response_model=List[FarmAlertResponse])
def get_alerts(unresolved_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(FarmAlert)
    if unresolved_only:
        query = query.filter(FarmAlert.resolved == False)
    return query.order_by(FarmAlert.timestamp.desc()).limit(50).all()


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(FarmAlert).filter(FarmAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.resolved = True
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as resolved."}


@router.get("/stream")
async def stream_telemetry():
    """Server-Sent Events (SSE) streaming endpoint for live telemetry updates."""
    async def event_generator():
        queue = iot_simulator.subscribe()
        try:
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            iot_simulator.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
