from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict, anomaly, recurring, categorize, chat

app = FastAPI(
    title="FinSight AI Service",
    description="Expense prediction, anomaly detection, recurring payment detection, and categorization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # backend-only consumer, safe to open in internal network
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(anomaly.router, prefix="/api/v1/anomaly", tags=["Anomaly Detection"])
app.include_router(recurring.router, prefix="/api/v1/recurring", tags=["Recurring Detection"])
app.include_router(categorize.router, prefix="/api/v1/categorize", tags=["Categorization"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat & RAG"])


@app.get("/")
def root():
    return {"status": "ok", "service": "FinSight AI Service"}


@app.get("/health")
def health():
    return {"status": "healthy"}