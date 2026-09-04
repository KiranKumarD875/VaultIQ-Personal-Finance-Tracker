import numpy as np
from collections import defaultdict
from datetime import date, timedelta
from typing import List
from app.schemas import HistoryPoint, ScanHistoryPoint


def detect_anomaly(history: List[HistoryPoint], new_amount: float, new_category: str = None) -> dict:
    relevant = [h.amount for h in history if (new_category is None or h.category == new_category)]

    if len(relevant) < 3:
        relevant = [h.amount for h in history]

    if len(relevant) < 3:
        return {
            "is_anomaly": False,
            "severity": "NONE",
            "reason": "Not enough historical data to evaluate.",
            "z_score": 0.0,
        }

    mean = np.mean(relevant)
    std = np.std(relevant) or 1e-6
    z_score = (new_amount - mean) / std

    if z_score >= 3:
        severity = "HIGH"
        is_anomaly = True
    elif z_score >= 2:
        severity = "MEDIUM"
        is_anomaly = True
    elif z_score >= 1.5:
        severity = "LOW"
        is_anomaly = True
    else:
        severity = "NONE"
        is_anomaly = False

    pct_diff = ((new_amount - mean) / mean) * 100 if mean else 0
    category_label = f" in {new_category}" if new_category else ""

    if is_anomaly:
        reason = (
            f"This transaction of {new_amount:.2f}{category_label} is "
            f"{abs(pct_diff):.0f}% {'higher' if pct_diff > 0 else 'lower'} than your usual "
            f"average of {mean:.2f}."
        )
    else:
        reason = "Transaction is within your normal spending pattern."

    return {
        "is_anomaly": is_anomaly,
        "severity": severity,
        "reason": reason,
        "z_score": round(float(z_score), 2),
    }


def scan_history(history: List[ScanHistoryPoint], lookback_days: int = 60) -> List[dict]:
    """
    Scans full transaction history and flags statistically unusual
    transactions per-category, limited to a recent lookback window so
    old anomalies don't keep resurfacing forever.
    """
    groups = defaultdict(list)
    for h in history:
        groups[h.category or "Uncategorized"].append(h)

    cutoff = date.today() - timedelta(days=lookback_days)
    flags = []

    for cat, points in groups.items():
        if len(points) < 4:
            continue

        amounts = [p.amount for p in points]
        mean = np.mean(amounts)
        std = np.std(amounts) or 1e-6

        for p in points:
            if p.date < cutoff:
                continue

            z_score = (p.amount - mean) / std
            if z_score < 1.5:
                continue

            severity = "HIGH" if z_score >= 3 else ("MEDIUM" if z_score >= 2 else "LOW")
            pct_diff = ((p.amount - mean) / mean) * 100 if mean else 0

            flags.append({
                "id": p.id,
                "date": p.date,
                "amount": p.amount,
                "category": cat,
                "severity": severity,
                "reason": (
                    f"{p.amount:.2f} in {cat} is {abs(pct_diff):.0f}% "
                    f"{'higher' if pct_diff > 0 else 'lower'} than your average of {mean:.2f}."
                ),
                "z_score": round(float(z_score), 2),
            })

    return sorted(flags, key=lambda f: f["date"], reverse=True)