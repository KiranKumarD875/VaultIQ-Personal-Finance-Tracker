from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import rag_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    context_data: list[str] = []
    history: list[dict] = []

@router.post("/")
async def chat_with_rag(request: ChatRequest):
    try:
        # Get AI response with the user-specific context
        answer = rag_service.query(request.query, request.context_data, request.history)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
