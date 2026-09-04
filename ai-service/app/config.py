import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.h5")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
FEATURE_INFO_PATH = os.path.join(MODEL_DIR, "feature_info.pkl")
WINDOW_SIZE_DEFAULT = 14