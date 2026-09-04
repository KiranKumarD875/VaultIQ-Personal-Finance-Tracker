from collections import defaultdict
from datetime import date
from typing import List
from difflib import SequenceMatcher

from app.schemas import TransactionForRecurring


def _normalize_merchant(name: str) -> str:
    if not name:
        return "unknown"
    
    # Remove special characters
    clean = "".join(ch.lower() for ch in name if ch.isalnum() or ch.isspace()).strip()
    
    # Strip common payment providers and filler words
    stop_words = {
        "paytm", "phonepe", "phonepay", "gpay", "googlepay", "amazonpay",
        "supermoney", "supermoneyyes", "upi", "card", "payment",
        "subscription", "subscribed", "to", "bought", "the", "for", "a", "an"
    }
    
    words = clean.split()
    filtered = [w for w in words if w not in stop_words]
    
    if not filtered:
        return clean # fallback if it was entirely stopwords
        
    return " ".join(filtered)

def _similar(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

def detect_recurring(transactions: List[TransactionForRecurring]) -> List[dict]:
    """
    Groups transactions by normalized merchant name (fuzzy-matched), then checks
    whether amounts are consistent (±10%) and intervals resemble a recurring
    pattern (weekly ~7d, monthly ~28-31d, yearly ~365d).
    """
    groups = defaultdict(list)

    # bucket by combined normalized merchant+description
    for tx in transactions:
        raw_name = f"{tx.merchant or ''} {tx.description or ''}".strip()
        if not raw_name:
            raw_name = "unknown"
            
        norm = _normalize_merchant(raw_name)

        matched_key = None
        for key in groups.keys():
            # If one string is fully contained in another (e.g. "netflix" in "netflix premium"), that's a match
            if norm in key or key in norm or _similar(key, norm) > 0.7:
                matched_key = key
                break

        groups[matched_key or norm].append(tx)

    results = []
    for merchant, txs in groups.items():
        if len(txs) < 2:
            continue

        txs_sorted = sorted(txs, key=lambda t: t.date)
        amounts = [t.amount for t in txs_sorted]
        avg_amount = sum(amounts) / len(amounts)

        # amount consistency check (±10%)
        amount_consistent = all(abs(a - avg_amount) / max(avg_amount, 1e-6) <= 0.10 for a in amounts)
        if not amount_consistent:
            continue

        # interval calculation
        intervals = [
            (txs_sorted[i + 1].date - txs_sorted[i].date).days
            for i in range(len(txs_sorted) - 1)
        ]
        avg_interval = sum(intervals) / len(intervals)

        known_cycles = {7: "weekly", 30: "monthly", 365: "yearly"}
        closest_cycle = min(known_cycles.keys(), key=lambda c: abs(c - avg_interval))
        cycle_tolerance = closest_cycle * 0.25  # 25% tolerance

        if abs(avg_interval - closest_cycle) > cycle_tolerance:
            continue  # not a consistent recurring pattern

        confidence = min(0.95, 0.5 + 0.1 * len(txs_sorted))

        results.append({
            "merchant": merchant.title(),
            "avg_amount": round(avg_amount, 2),
            "frequency_days": int(round(avg_interval)),
            "occurrences": len(txs_sorted),
            "last_seen": txs_sorted[-1].date,
            "confidence": round(confidence, 2),
        })

    return sorted(results, key=lambda r: r["confidence"], reverse=True)