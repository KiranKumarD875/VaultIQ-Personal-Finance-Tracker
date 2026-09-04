"""
XGBoost training script for FinSight AI.
Trains a model based on engineered features for predicting the next day's spending.
"""
import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from sklearn.metrics import mean_absolute_error, mean_squared_error
import math

DATA_PATH = "training/expenses_income_summary.csv"
MODEL_DIR = "saved_models"

def build_features_for_training(df):
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["amount", "Date"]).sort_values("Date")
    df = df[df["type"] == "EXPENSE"].copy()
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df = df.dropna(subset=["amount"])

    daily = df.groupby(df["Date"].dt.date)["amount"].sum().reset_index()
    daily.columns = ["Date", "amount"]
    daily["Date"] = pd.to_datetime(daily["Date"])

    # Features
    daily["day_of_week"] = daily["Date"].dt.dayofweek
    daily["day_of_month"] = daily["Date"].dt.day
    daily["month"] = daily["Date"].dt.month
    daily["is_weekend"] = (daily["day_of_week"] >= 5).astype(int)
    daily["is_month_start"] = (daily["day_of_month"] <= 3).astype(int)
    daily["is_month_end"] = (daily["day_of_month"] >= 28).astype(int)

    # Rolling averages
    daily["rolling_avg_3"] = daily["amount"].shift(1).rolling(window=3).mean().fillna(0)
    daily["rolling_avg_7"] = daily["amount"].shift(1).rolling(window=7).mean().fillna(0)
    
    # Target is next day amount
    daily["target"] = daily["amount"].shift(-1)
    daily = daily.dropna(subset=["target"])
    
    return daily

def train():
    daily = build_features_for_training(pd.read_csv(DATA_PATH))
    
    features = [
        "day_of_week", "day_of_month", "month", "is_weekend", 
        "is_month_start", "is_month_end", "rolling_avg_3", "rolling_avg_7"
    ]
    
    X = daily[features].values
    y = daily["target"].values
    
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    if len(X_test) > 0:
        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        rmse = math.sqrt(mean_squared_error(y_test, preds))
        print(f"📊 Test MAE: {mae:.4f} | RMSE: {rmse:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "xgboost_model.pkl"))
    print("✅ XGBoost model saved to saved_models/xgboost_model.pkl")

if __name__ == "__main__":
    train()