from fastapi import APIRouter
from app.schemas import AnomalyRequest, AnomalyResponse, AnomalyScanRequest, AnomalyScanResponse
from app.services.anomaly_service import detect_anomaly, scan_history

router = APIRouter()


@router.post("/", response_model=AnomalyResponse)
def check_anomaly(payload: AnomalyRequest):
    return detect_anomaly(payload.history, payload.new_amount, payload.new_category)


@router.post("/scan", response_model=AnomalyScanResponse)
def scan(payload: AnomalyScanRequest):
    flags = scan_history(payload.history)
    return {"anomalies": flags}