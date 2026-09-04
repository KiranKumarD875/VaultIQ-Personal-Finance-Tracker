from fastapi import APIRouter
from app.schemas import RecurringRequest, RecurringResponse
from app.services.recurring_service import detect_recurring

router = APIRouter()


@router.post("/", response_model=RecurringResponse)
def check_recurring(payload: RecurringRequest):
    matches = detect_recurring(payload.transactions)
    return {"subscriptions": matches}