"""
Generates synthetic income/expense history to bootstrap LSTM training
when no real user data exists yet.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

start_date = datetime(2023, 1, 1)
days = 730  # 2 years of daily data

rows = []
for i in range(days):
    current_date = start_date + timedelta(days=i)
    weekday = current_date.weekday()

    # base daily expense with weekend spike + monthly rent spike
    base = 30 + np.random.normal(0, 8)
    if weekday >= 5:  # weekend
        base *= 1.4
    if current_date.day == 1:  # rent day
        base += 800
    if current_date.month == 12:  # holiday season
        base *= 1.2

    base = max(5, base)
    rows.append({"Date": current_date.strftime("%Y-%m-%d"), "amount": round(base, 2), "type": "EXPENSE"})

    # occasional income (bi-weekly salary)
    if current_date.day in (1, 15):
        rows.append({
            "Date": current_date.strftime("%Y-%m-%d"),
            "amount": round(1500 + np.random.normal(0, 50), 2),
            "type": "INCOME",
        })

df = pd.DataFrame(rows)
df.to_csv("training/expenses_income_summary.csv", index=False)
print(f"✅ Generated {len(df)} rows -> training/expenses_income_summary.csv")