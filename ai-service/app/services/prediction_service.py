import os
from collections import defaultdict
from datetime import date, timedelta
from typing import List

import numpy as np
import joblib

from app.config import LSTM_MODEL_PATH, SCALER_PATH, FEATURE_INFO_PATH, WINDOW_SIZE_DEFAULT
from app.schemas import HistoryPoint
from app.services import xgboost_service

_lstm_model = None
_scaler = None
_feature_info = None
_lstm_load_attempted = False


def _try_load_lstm():
    """Lazy-load the TensorFlow model only once, only if it exists on disk."""
    global _lstm_model, _scaler, _feature_info, _lstm_load_attempted
    if _lstm_load_attempted:
        return
    _lstm_load_attempted = True

    if os.path.exists(LSTM_MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            import tensorflow as tf
            _lstm_model = tf.keras.models.load_model(LSTM_MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
            _feature_info = joblib.load(FEATURE_INFO_PATH) if os.path.exists(FEATURE_INFO_PATH) else None
            print("✅ LSTM model loaded successfully")
        except Exception as e:
            print(f"⚠️ Failed to load LSTM model, will use fallback: {e}")
            _lstm_model = None


def _aggregate_daily(history: List[HistoryPoint]):
    """
    BUGFIX: The LSTM was trained on one-total-per-day sequences, but
    inference was previously fed a raw per-transaction sequence (so a
    'window of 30' meant 30 transactions, not 30 days — a scale mismatch
    with training). This collapses same-day transactions into daily totals
    so inference matches the training distribution exactly.
    """
    totals = defaultdict(float)
    for h in history:
        totals[h.date] += h.amount
    sorted_dates = sorted(totals.keys())
    return sorted_dates, [round(totals[d], 2) for d in sorted_dates]


def _lstm_recursive_forecast(daily_amounts: List[float], horizon_days: int, last_date: date):
    """
    BUGFIX: Previously did ONE single-step prediction then multiplied it
    by horizon_days (a flat linear guess). This now does genuine
    walk-forward forecasting: predict day 1, feed it back into the window,
    predict day 2, and so on — which is how time-series forecasting is
    actually supposed to work.
    """
    window = _feature_info["window_size"] if _feature_info else WINDOW_SIZE_DEFAULT
    series = daily_amounts[-window:]
    if len(series) < window:
        series = [series[0]] * (window - len(series)) + series

    scaled = _scaler.transform(np.array(series).reshape(-1, 1)).flatten().tolist()

    forecast = []
    current_date = last_date
    for _ in range(horizon_days):
        x_input = np.array(scaled[-window:]).reshape(1, window, 1)
        scaled_pred = float(_lstm_model.predict(x_input, verbose=0)[0][0])
        scaled_pred = float(np.clip(scaled_pred, 0, 1))
        scaled.append(scaled_pred)

        actual_pred = float(_scaler.inverse_transform([[scaled_pred]])[0][0])
        current_date = current_date + timedelta(days=1)
        forecast.append({"date": current_date.isoformat(), "amount": round(max(0, actual_pred), 2)})

    return forecast


def _statistical_daily_forecast(daily_amounts: List[float], horizon_days: int, last_date: date):
    """Fallback when neither LSTM nor XGBoost is available/trained yet."""
    n = len(daily_amounts)
    weights = np.linspace(1, 2, n)
    weighted_avg = float(np.average(daily_amounts, weights=weights))
    slope = float(np.polyfit(np.arange(n), daily_amounts, 1)[0]) if n >= 2 else 0.0

    forecast = []
    current_date = last_date
    for i in range(horizon_days):
        current_date = current_date + timedelta(days=1)
        value = max(0, weighted_avg + slope * ((i + 1) / max(1, n)))
        forecast.append({"date": current_date.isoformat(), "amount": round(value, 2)})

    return forecast


def _confidence_from_volatility(daily_amounts: List[float], base=0.9):
    mean = np.mean(daily_amounts) or 1e-6
    volatility = np.std(daily_amounts) / mean
    return round(float(max(0.4, min(base, 1 - volatility * 0.5))), 2)


def _trend_label(forecast: List[dict]):
    if len(forecast) < 2:
        return "stable"
    half = len(forecast) // 2
    first_half_avg = np.mean([f["amount"] for f in forecast[:half]]) if half else forecast[0]["amount"]
    second_half_avg = np.mean([f["amount"] for f in forecast[half:]])
    diff_pct = (second_half_avg - first_half_avg) / (first_half_avg + 1e-6)
    if diff_pct > 0.05:
        return "upward"
    if diff_pct < -0.05:
        return "downward"
    return "stable"


def _category_breakdown(history: List[HistoryPoint], total_predicted: float, horizon_days: int):
    """
    IMPROVED: Previously always did a naive proportional split of the
    single total prediction. Now, categories with enough dedicated history
    (>=10 points) get their OWN independent weighted-trend estimate instead
    of just inheriting a slice of the overall number. Sparse categories
    still fall back to proportional splitting (not enough data to trust
    an independent trend for them yet).
    """
    groups = defaultdict(list)
    for h in history:
        groups[h.category or "Uncategorized"].append(h)

    total_all = sum(h.amount for h in history) or 1
    breakdown = {}

    for cat, points in groups.items():
        amounts = [p.amount for p in points]
        cat_total = sum(amounts)

        if len(points) >= 10:
            n = len(amounts)
            weights = np.linspace(1, 2, n)
            weighted_avg = np.average(amounts, weights=weights)
            slope = np.polyfit(np.arange(n), amounts, 1)[0] if n >= 2 else 0
            span_days = max(1, (points[-1].date - points[0].date).days / max(1, n))
            predicted_cat = max(0, (weighted_avg + slope) * (horizon_days / max(1, span_days)))
        else:
            proportion = cat_total / total_all
            predicted_cat = total_predicted * proportion

        breakdown[cat] = round(float(predicted_cat), 2)

    return breakdown


def predict_expense(history: List[HistoryPoint], horizon_days: int = 30) -> dict:
    _try_load_lstm()

    sorted_history = sorted(history, key=lambda h: h.date)
    dates, daily_amounts = _aggregate_daily(sorted_history)
    last_date = dates[-1]

    window = _feature_info["window_size"] if _feature_info else WINDOW_SIZE_DEFAULT

    if _lstm_model is not None and len(daily_amounts) >= window:
        forecast = _lstm_recursive_forecast(daily_amounts, horizon_days, last_date)
        model_used = "LSTM"
        confidence = 0.85
    elif xgboost_service.is_available() and len(daily_amounts) >= 3:
        forecast = xgboost_service.forecast(dates, daily_amounts, horizon_days)
        model_used = "XGBoost (cold-start)"
        confidence = 0.65
    else:
        forecast = _statistical_daily_forecast(daily_amounts, horizon_days, last_date)
        model_used = "statistical_fallback (weighted_avg + trend)"
        confidence = _confidence_from_volatility(daily_amounts, base=0.75)

    predicted_amount = round(sum(f["amount"] for f in forecast), 2)
    trend = _trend_label(forecast)
    category_breakdown = _category_breakdown(sorted_history, predicted_amount, horizon_days)

    return {
        "predicted_amount": predicted_amount,
        "confidence": confidence,
        "trend": trend,
        "model_used": model_used,
        "category_breakdown": category_breakdown,
        "daily_forecast": forecast,
    }