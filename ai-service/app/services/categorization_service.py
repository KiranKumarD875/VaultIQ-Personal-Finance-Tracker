CATEGORY_KEYWORDS = {
    "Food & Dining": ["restaurant", "swiggy", "zomato", "cafe", "coffee", "starbucks", "mcdonald",
                       "pizza", "burger", "food", "dining", "doordash", "ubereats"],
    "Rent & Housing": ["rent", "landlord", "housing", "lease", "mortgage"],
    "Transport": ["uber", "ola", "lyft", "fuel", "gas station", "petrol", "metro", "taxi", "parking"],
    "Entertainment": ["netflix", "spotify", "movie", "cinema", "hulu", "disney+", "game", "concert"],
    "Utilities": ["electricity", "water bill", "internet", "wifi", "broadband", "gas bill", "utility"],
    "Shopping": ["amazon", "walmart", "target", "mall", "shopping", "flipkart", "myntra"],
    "Healthcare": ["pharmacy", "hospital", "clinic", "doctor", "medicine", "health"],
    "Education": ["tuition", "course", "udemy", "coursera", "book store", "school", "university"],
    "Subscriptions": ["subscription", "membership", "prime", "icloud", "google one"],
    "Salary": ["salary", "payroll", "wages"],
    "Freelance": ["freelance", "upwork", "fiverr", "contract payment"],
}


def categorize_transaction(description: str) -> dict:
    desc_lower = (description or "").lower()

    best_category = "Other Expense"
    best_score = 0.0

    for category, keywords in CATEGORY_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in desc_lower)
        if matches > 0:
            score = min(0.95, 0.6 + matches * 0.15)
            if score > best_score:
                best_score = score
                best_category = category

    if best_score == 0.0:
        return {"category": "Other Expense", "confidence": 0.3}

    return {"category": best_category, "confidence": round(best_score, 2)}