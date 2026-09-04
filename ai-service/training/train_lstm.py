"""
Improved LSTM training script for FinSight AI.
Trains on expense amounts using a sliding window and saves artifacts
that the ai-service loads at inference time.
"""
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import math
import os
import joblib

DATA_PATH = "training/expenses_income_summary.csv"
MODEL_DIR = "saved_models"
WINDOW = 30

# 1. Load Data
df = pd.read_csv(DATA_PATH)
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
df = df.dropna(subset=["amount", "Date"]).sort_values("Date")
df = df[df["type"] == "EXPENSE"].copy()  # train specifically on expense behavior
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
df = df.dropna(subset=["amount"])

# aggregate to one row per day (sum of that day's expenses)
daily = df.groupby(df["Date"].dt.date)["amount"].sum().reset_index()
daily.columns = ["Date", "amount"]

# 2. Feature Scaling
scaler = MinMaxScaler()
daily["scaled_amount"] = scaler.fit_transform(daily[["amount"]])


def create_sequences(data, window):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i:i + window])
        y.append(data[i + window])
    return np.array(X), np.array(y)


X, y = create_sequences(daily["scaled_amount"].values, WINDOW)
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

# 3. Build LSTM Model
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(WINDOW, 1)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.LSTM(64, return_sequences=False),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dense(1),
])
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss="mse")

early_stop = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=20, restore_best_weights=True)
reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=10, min_lr=1e-5)

# 4. Train
history = model.fit(
    X_train, y_train,
    validation_split=0.1,
    epochs=200,
    batch_size=32,
    verbose=1,
    callbacks=[early_stop, reduce_lr],
)

# 5. Evaluate
if len(X_test) > 0:
    preds = model.predict(X_test, verbose=0)
    mae = mean_absolute_error(y_test, preds)
    rmse = math.sqrt(mean_squared_error(y_test, preds))
    print(f"📊 Test MAE (scaled): {mae:.4f} | RMSE (scaled): {rmse:.4f}")

# 6. Save artifacts
os.makedirs(MODEL_DIR, exist_ok=True)
model.save(os.path.join(MODEL_DIR, "lstm_model.h5"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
joblib.dump({
    "window_size": WINDOW,
    "feature_columns": ["scaled_amount"],
    "target_column": "amount",
    "model_type": "LSTM",
}, os.path.join(MODEL_DIR, "feature_info.pkl"))

print("✅ Model, scaler, and feature_info saved to saved_models/")