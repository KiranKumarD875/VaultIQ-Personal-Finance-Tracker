from fastapi import APIRouter
from app.schemas import CategorizeRequest, CategorizeResponse
from app.services.categorization_service import categorize_transaction

router = APIRouter()


@router.post("/", response_model=CategorizeResponse)
def categorize(payload: CategorizeRequest):
    return categorize_transaction(payload.description)