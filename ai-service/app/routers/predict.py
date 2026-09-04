from fastapi import APIRouter
from app.schemas import PredictRequest, PredictResponse
from app.services.prediction_service import predict_expense

router = APIRouter()


@router.post("/", response_model=PredictResponse)
def predict(payload: PredictRequest):
    result = predict_expense(payload.history, payload.horizon_days)
    return result