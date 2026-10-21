"""
VERITAS AI — Machine Learning Pipeline & Model Trainer
Trains a TF-IDF + LinearSVC NLP classifier with Platt Sigmoid Calibration,
evaluates performance without train/test data leakage, and persists model artifacts.
"""
import os
import re
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)

from .config import DATA_DIR, MODELS_DIR, MODEL_PATH, VECTORIZER_PATH, METRICS_PATH
from .dataset_downloader import create_or_validate_benchmark_dataset, DATASET_CSV_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("veritas.train")


def clean_text(text: str) -> str:
    """
    Standardize and clean raw news text for NLP processing:
    1. Lowercasing
    2. Remove URLs and email addresses
    3. Remove HTML tags
    4. Remove non-alphanumeric characters (preserve basic punctuation boundaries)
    5. Strip excessive whitespace
    """
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    # Strip URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Strip HTML tags
    text = re.sub(r'<.*?>', ' ', text)
    # Strip email addresses
    text = re.sub(r'\S+@\S+', ' ', text)
    # Keep alphanumeric and basic punctuation
    text = re.sub(r'[^a-z0-9\s\.\,\!\?\-]', ' ', text)
    # Normalize excess whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def train_pipeline(csv_path: Path = DATASET_CSV_PATH) -> Dict[str, Any]:
    """
    Execute full reproducible training workflow:
    - Load & validate dataset
    - Stratified train/test split
    - TF-IDF feature extraction on X_train only
    - Calibrated LinearSVC fitting
    - Test set evaluation and metrics serialization
    """
    logger.info("Initializing VERITAS AI training pipeline...")

    # 1. Dataset Verification
    if not csv_path.exists():
        logger.info(f"Dataset not found at {csv_path}. Creating verified benchmark...")
        create_or_validate_benchmark_dataset(csv_path)

    df = pd.read_csv(csv_path)
    logger.info(f"Loaded raw dataset with {len(df)} records.")

    # Validate required columns
    text_col = "text" if "text" in df.columns else ("title" if "title" in df.columns else None)
    if not text_col or "label" not in df.columns:
        raise ValueError(f"Dataset must contain 'text' (or 'title') and 'label' columns. Found: {list(df.columns)}")

    # Clean missing values
    df = df.dropna(subset=[text_col, "label"]).copy()
    df["label"] = df["label"].astype(int)
    
    # Filter only binary labels (0 = Likely Real, 1 = Likely Fake)
    df = df[df["label"].isin([0, 1])].copy()

    # Deduplicate exact text content to prevent data leakage between train and test splits
    df["clean_text"] = df[text_col].apply(clean_text)
    df = df[df["clean_text"].str.len() > 10].copy()
    initial_count = len(df)
    df = df.drop_duplicates(subset=["clean_text"]).reset_index(drop=True)
    dedup_count = len(df)
    logger.info(f"Deduplicated dataset from {initial_count} to {dedup_count} unique articles.")

    X = df["clean_text"].values
    y = df["label"].values

    real_total = int(np.sum(y == 0))
    fake_total = int(np.sum(y == 1))
    logger.info(f"Class distribution: {real_total} Likely Real (0), {fake_total} Likely Fake (1)")

    # 2. Stratified Train / Test Split (Reproducible with random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    logger.info(f"Split sizes — Train: {len(X_train)}, Test: {len(X_test)}")

    # 3. TF-IDF Vectorization — Fit exclusively on training data (No Data Leakage)
    vectorizer = TfidfVectorizer(
        max_features=8000,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    logger.info(f"TF-IDF vocabulary built with {len(vectorizer.vocabulary_)} features.")

    # 4. Model Training: LinearSVC with Platt Sigmoid Probability Calibration
    # CalibratedClassifierCV ensures mathematically sound posterior probabilities
    base_svc = LinearSVC(C=1.0, max_iter=3000, random_state=42)
    calibrated_model = CalibratedClassifierCV(estimator=base_svc, method="sigmoid", cv=3)
    
    # Also fit raw base_svc on X_train for feature importance extraction and decision function
    base_svc.fit(X_train_vec, y_train)
    calibrated_model.fit(X_train_vec, y_train)
    logger.info("Calibrated LinearSVC training complete.")

    # 5. Model Evaluation on Unseen Test Split
    y_pred = calibrated_model.predict(X_test_vec)
    y_proba = calibrated_model.predict_proba(X_test_vec)

    acc = float(accuracy_score(y_test, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Per-class metrics
    class_p, class_r, class_f1, class_supp = precision_recall_fscore_support(
        y_test, y_pred, average=None, labels=[0, 1], zero_division=0
    )

    # Extract top discriminative n-grams from base LinearSVC coefficients
    feature_names = np.array(vectorizer.get_feature_names_out())
    coef = base_svc.coef_[0]
    top_fake_indices = np.argsort(coef)[-15:][::-1]
    top_real_indices = np.argsort(coef)[:15]

    top_fake_features = [
        {"feature": str(feature_names[i]), "weight": round(float(coef[i]), 4)}
        for i in top_fake_indices
    ]
    top_real_features = [
        {"feature": str(feature_names[i]), "weight": round(float(abs(coef[i])), 4)}
        for i in top_real_indices
    ]

    metrics = {
        "model_name": "TF-IDF + LinearSVC (Platt Calibrated)",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_source": "VERITAS Journalistic & Deception Benchmark Corpus",
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "accuracy": round(acc, 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": {
            "matrix": cm,
            "labels": ["Likely Real", "Likely Fake"],
            "true_negatives": int(cm[0][0]),
            "false_positives": int(cm[0][1]),
            "false_negatives": int(cm[1][0]),
            "true_positives": int(cm[1][1])
        },
        "class_metrics": {
            "likely_real": {
                "precision": round(float(class_p[0]), 4),
                "recall": round(float(class_r[0]), 4),
                "f1_score": round(float(class_f1[0]), 4),
                "support": int(class_supp[0])
            },
            "likely_fake": {
                "precision": round(float(class_p[1]), 4),
                "recall": round(float(class_r[1]), 4),
                "f1_score": round(float(class_f1[1]), 4),
                "support": int(class_supp[1])
            }
        },
        "top_features": {
            "likely_fake_signals": top_fake_features,
            "likely_real_signals": top_real_features
        },
        "hyperparameters": {
            "vectorizer": "TfidfVectorizer(max_features=8000, ngram=(1,2), sublinear_tf=True)",
            "classifier": "LinearSVC(C=1.0, max_iter=3000)",
            "calibration": "CalibratedClassifierCV(method='sigmoid', cv=3)"
        },
        "limitation_notice": (
            "Model predictions reflect statistical patterns in labeled training data and stylistic vocabulary. "
            "They do not constitute real-time fact-checking or absolute truth verification."
        )
    }

    # 6. Save Artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    # Save the calibrated model and vectorizer
    joblib.dump(calibrated_model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    # Save metrics JSON
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    logger.info(f"Model successfully saved to {MODEL_PATH}")
    logger.info(f"Vectorizer successfully saved to {VECTORIZER_PATH}")
    logger.info(f"Metrics saved to {METRICS_PATH}")
    logger.info(f"Test Accuracy: {acc * 100:.2f}% | F1-Score: {f1 * 100:.2f}%")

    return metrics


if __name__ == "__main__":
    train_pipeline()
