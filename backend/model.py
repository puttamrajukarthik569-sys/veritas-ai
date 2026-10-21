"""
VERITAS AI — Model Loader and Real-time NLP Prediction Service
Loads calibrated LinearSVC and TF-IDF artifacts to provide inference,
honest calibration reporting, and explanatory feature highlights.
"""
import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

import joblib
import numpy as np

from .config import MODEL_PATH, VECTORIZER_PATH, METRICS_PATH, MIN_INPUT_LENGTH

logger = logging.getLogger("veritas.model")

# Module-level cached models
_MODEL = None
_VECTORIZER = None
_METRICS = None


def clean_text(text: str) -> str:
    """Standardize and clean news text for NLP inference."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'[^a-z0-9\s\.\,\!\?\-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def load_model_artifacts() -> bool:
    """Load model, vectorizer, and metrics artifacts into memory."""
    global _MODEL, _VECTORIZER, _METRICS

    if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
        logger.warning(f"Model artifacts not found at {MODEL_PATH} or {VECTORIZER_PATH}")
        return False

    try:
        _MODEL = joblib.load(MODEL_PATH)
        _VECTORIZER = joblib.load(VECTORIZER_PATH)

        if METRICS_PATH.exists():
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                _METRICS = json.load(f)
        else:
            _METRICS = None

        logger.info("Successfully loaded VERITAS AI model and vectorizer artifacts into memory.")
        return True
    except Exception as e:
        logger.error(f"Failed to load model artifacts: {e}")
        _MODEL = None
        _VECTORIZER = None
        return False


def is_model_available() -> bool:
    """Check if model and vectorizer are ready for inference."""
    global _MODEL, _VECTORIZER
    if _MODEL is None or _VECTORIZER is None:
        return load_model_artifacts()
    return True


def get_model_metrics() -> Optional[Dict[str, Any]]:
    """Return saved model evaluation metrics."""
    global _METRICS
    if _METRICS is None and METRICS_PATH.exists():
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                _METRICS = json.load(f)
        except Exception:
            return None
    return _METRICS


def extract_salient_terms(cleaned_text: str, vectorizer, top_n: int = 5) -> List[Dict[str, Any]]:
    """Extract top TF-IDF weighted n-grams from the specific input text."""
    try:
        vec_row = vectorizer.transform([cleaned_text])
        feature_names = vectorizer.get_feature_names_out()
        cx = vec_row.tocoo()
        
        # Sort terms by TF-IDF weight in this specific document
        items = sorted(zip(cx.col, cx.data), key=lambda x: x[1], reverse=True)[:top_n]
        return [
            {"term": str(feature_names[idx]), "tfidf_score": round(float(score), 4)}
            for idx, score in items
        ]
    except Exception:
        return []


def predict_news(text: str) -> Dict[str, Any]:
    """
    Run the NLP classification pipeline on incoming text.
    Returns:
    - prediction: "Likely Real" or "Likely Fake"
    - confidence: float calibrated probability in [0, 1]
    - confidence_pct: formatted percentage string
    - raw_score: signed distance or calibrated logit
    - salient_terms: top TF-IDF n-grams from this document
    - limitation_notice: scientific disclaimer on model limits
    """
    if not is_model_available():
        raise RuntimeError(
            "Model artifacts are not loaded. Please ensure train.py has been executed "
            "and artifacts exist in backend/models/."
        )

    clean = clean_text(text)
    if len(clean) < MIN_INPUT_LENGTH:
        raise ValueError(
            f"Input text must contain at least {MIN_INPUT_LENGTH} valid characters for NLP analysis."
        )

    # 1. Vectorize with trained TF-IDF model
    text_vec = _VECTORIZER.transform([clean])

    # 2. Predict with CalibratedClassifierCV
    # Class 0: "Likely Real", Class 1: "Likely Fake"
    pred_class = int(_MODEL.predict(text_vec)[0])
    probas = _MODEL.predict_proba(text_vec)[0]  # [prob_real, prob_fake]

    label_str = "Likely Fake" if pred_class == 1 else "Likely Real"
    conf = float(probas[pred_class])

    # Compute raw log-odds (logit) from calibrated probability
    # logit = ln(p / (1 - p)) gives the continuous unclipped decision score
    epsilon = 1e-6
    clipped_p = np.clip(probas[1], epsilon, 1 - epsilon)
    raw_score = float(np.log(clipped_p / (1 - clipped_p)))

    # Extract top TF-IDF features present in this article
    salient_terms = extract_salient_terms(clean, _VECTORIZER, top_n=6)

    return {
        "prediction": label_str,
        "class_index": pred_class,
        "confidence": round(conf, 4),
        "confidence_pct": f"{conf * 100:.1f}%",
        "probabilities": {
            "likely_real": round(float(probas[0]), 4),
            "likely_fake": round(float(probas[1]), 4)
        },
        "raw_score": round(raw_score, 4),
        "salient_terms": salient_terms,
        "limitation_notice": (
            "This prediction reflects vocabulary and syntactic patterns learned by a machine learning classifier. "
            "It does not verify external facts, check live sources, or guarantee absolute truth."
        )
    }
