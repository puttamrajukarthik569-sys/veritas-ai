"""
VERITAS AI — Configuration
"""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DB_PATH = BASE_DIR / "veritas.db"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Model artifact paths
MODEL_PATH = MODELS_DIR / "model.joblib"
VECTORIZER_PATH = MODELS_DIR / "vectorizer.joblib"
METRICS_PATH = MODELS_DIR / "metrics.json"

# Server configuration
PORT = int(os.environ.get("PORT", 5000))
HOST = os.environ.get("HOST", "127.0.0.1")
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "t")

# Input limits
MIN_INPUT_LENGTH = 15          # Minimum characters for meaningful text classification
MAX_INPUT_LENGTH = 50000       # Cap input to prevent memory exhaustion / DoS
MAX_PREVIEW_LENGTH = 280       # History card text preview character limit
