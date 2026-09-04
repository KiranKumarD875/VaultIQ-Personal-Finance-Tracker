import os
from datetime import date, timedelta
from typing import List

import numpy as np
import joblib

from app.config import MODEL_DIR

XGBOOST_MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_model.pkl")
XGBOOST_FEATURES_PATH = os.path.join(MODEL_DIR, "xgboost_features.pkl")

_model = None
_load_attempted = False


def _try_load():
    global _model, _load_attempted
    if _load_attempted:
        return
    _load_attempted = True

    if os.path.exists(XGBOOST_MODEL_PATH):
        try:
            _model = joblib.load(XGBOOST_MODEL_PATH)
            print("✅ XGBoost cold-start model loaded successfully")
        except Exception as e:
            print(f"⚠️ Failed to load XGBoost model: {e}")
            _model = None


def is_available() -> bool:
    _try_load()
    return _model is not None


def _build_features(target_date: date, recent_amounts: List[float]) -> List[float]:
    day_of_week = target_date.weekday()
    day_of_month = target_date.day
    month = target_date.month
    is_weekend = 1 if day_of_week >= 5 else 0
    is_month_start = 1 if day_of_month <= 3 else 0
    is_month_end = 1 if day_of_month >= 28 else 0

    tail3 = recent_amounts[-3:] if recent_amounts else [0]
    tail7 = recent_amounts[-7:] if recent_amounts else [0]
    rolling_avg_3 = float(np.mean(tail3))
    rolling_avg_7 = float(np.mean(tail7))

    return [day_of_week, day_of_month, month, is_weekend, is_month_start, is_month_end, rolling_avg_3, rolling_avg_7]


def forecast(known_dates: List[date], known_amounts: List[float], horizon_days: int) -> List[dict]:
    """
    Used for the 'cold start' problem — new users who don't have the 30+
    days of history the LSTM needs. Walks forward day-by-day, predicting
    each day and feeding it back into the rolling-average features.
    """
    _try_load()
    if _model is None:
        raise RuntimeError("XGBoost model not loaded")

    amounts_so_far = list(known_amounts)
    last_date = known_dates[-1]

    results = []
    current_date = last_date
    for _ in range(horizon_days):
        current_date = current_date + timedelta(days=1)
        features = _build_features(current_date, amounts_so_far)
        pred = float(_model.predict(np.array([features]))[0])
        pred = max(0, pred)
        amounts_so_far.append(pred)
        results.append({"date": current_date.isoformat(), "amount": round(pred, 2)})

    return results