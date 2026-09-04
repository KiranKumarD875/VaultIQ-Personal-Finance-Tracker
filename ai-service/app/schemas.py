from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class HistoryPoint(BaseModel):
    date: date
    amount: float
    category: Optional[str] = None


class PredictRequest(BaseModel):
    history: List[HistoryPoint] = Field(..., min_items=3)
    horizon_days: int = 30


class PredictResponse(BaseModel):
    predicted_amount: float
    confidence: float
    trend: str
    model_used: str
    category_breakdown: Optional[dict] = None
    model_config = {'protected_namespaces': ()}


class AnomalyRequest(BaseModel):
    history: List[HistoryPoint] = Field(..., min_items=5)
    new_amount: float
    new_category: Optional[str] = None


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    severity: str
    reason: str
    z_score: float


class TransactionForRecurring(BaseModel):
    id: str
    merchant: Optional[str] = None
    description: Optional[str] = None
    amount: float
    date: date


class RecurringRequest(BaseModel):
    transactions: List[TransactionForRecurring]


class RecurringMatch(BaseModel):
    merchant: str
    avg_amount: float
    frequency_days: int
    occurrences: int
    last_seen: date
    confidence: float


class RecurringResponse(BaseModel):
    subscriptions: List[RecurringMatch]


class CategorizeRequest(BaseModel):
    description: str


class CategorizeResponse(BaseModel):
    category: str
    confidence: float

class ScanHistoryPoint(BaseModel):
    id: str
    date: date
    amount: float
    category: Optional[str] = None

class AnomalyScanRequest(BaseModel):
    history: List[ScanHistoryPoint]

class AnomalyFlag(BaseModel):
    id: str
    date: date
    amount: float
    category: Optional[str] = None
    severity: str
    reason: str
    z_score: float

class AnomalyScanResponse(BaseModel):
    anomalies: List[AnomalyFlag]