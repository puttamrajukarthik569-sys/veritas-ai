"""
VERITAS AI — Flask REST API Server
Provides high-performance endpoints for NLP prediction, persistent history,
aggregated analytics, and model evaluation telemetry.
"""
import logging
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS

from .config import PORT, HOST, DEBUG, MIN_INPUT_LENGTH, MAX_INPUT_LENGTH
from .database import (
    init_db,
    save_prediction,
    get_history,
    get_prediction_by_id,
    get_analytics,
    clear_history
)
from .model import (
    predict_news,
    is_model_available,
    get_model_metrics,
    load_model_artifacts
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("veritas.api")


def create_app() -> Flask:
    """Application factory for VERITAS AI Flask API."""
    app = Flask(__name__)
    
    # Configure CORS for local development and production frontends
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize SQLite database schema
    init_db()

    # Preload model artifacts on startup
    load_model_artifacts()

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint indicating server and model availability."""
        model_ready = is_model_available()
        return jsonify({
            "status": "ok",
            "service": "VERITAS AI API",
            "version": "1.0.0",
            "model_ready": model_ready,
            "database_ready": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200

    @app.route("/api/predict", methods=["POST"])
    def predict_endpoint():
        """
        Analyze news article or headline text using trained NLP classifier.
        Saves prediction result to SQLite history.
        """
        if not request.is_json:
            return jsonify({
                "error": "Invalid Content-Type. Request body must be JSON."
            }), 400

        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({
                "error": "Request body must be a non-empty JSON object."
            }), 400

        text = data.get("text")
        title = data.get("title", "")

        if not text or not isinstance(text, str):
            return jsonify({
                "error": "The 'text' field is required and must be a non-empty string."
            }), 400

        trimmed_text = text.strip()
        if len(trimmed_text) < MIN_INPUT_LENGTH:
            return jsonify({
                "error": f"Article text must be at least {MIN_INPUT_LENGTH} characters long for analysis. Provided length: {len(trimmed_text)}"
            }), 400

        if len(trimmed_text) > MAX_INPUT_LENGTH:
            return jsonify({
                "error": f"Article text exceeds the maximum allowed length of {MAX_INPUT_LENGTH} characters. Provided length: {len(trimmed_text)}"
            }), 400

        if not is_model_available():
            return jsonify({
                "error": "Model is not trained or model files are missing.",
                "setup_required": True,
                "instructions": "Execute `python -m backend.train` to train the classifier and generate model artifacts."
            }), 503

        try:
            # Execute real ML prediction
            prediction_result = predict_news(trimmed_text)

            # Persist record to SQLite
            saved_record = save_prediction(
                text=trimmed_text,
                prediction=prediction_result["prediction"],
                confidence=prediction_result["confidence"],
                raw_score=prediction_result["raw_score"],
                title=title
            )

            # Merge prediction metadata and return
            response_payload = {
                "id": saved_record["id"],
                "prediction": prediction_result["prediction"],
                "confidence": prediction_result["confidence"],
                "confidence_pct": prediction_result["confidence_pct"],
                "probabilities": prediction_result["probabilities"],
                "raw_score": prediction_result["raw_score"],
                "salient_terms": prediction_result["salient_terms"],
                "limitation_notice": prediction_result["limitation_notice"],
                "title": saved_record["title"],
                "text_preview": saved_record["text_preview"],
                "word_count": saved_record["word_count"],
                "char_count": saved_record["char_count"],
                "created_at": saved_record["created_at"]
            }

            return jsonify(response_payload), 200

        except Exception as e:
            logger.exception("Unexpected error during prediction")
            return jsonify({
                "error": "An error occurred during text analysis. Please verify your input and try again."
            }), 500

    @app.route("/api/history", methods=["GET"])
    def history_endpoint():
        """Retrieve paginated prediction history with optional search and label filter."""
        try:
            limit = min(int(request.args.get("limit", 20)), 100)
            offset = max(int(request.args.get("offset", 0)), 0)
        except ValueError:
            return jsonify({"error": "Query parameters 'limit' and 'offset' must be valid integers."}), 400

        label_filter = request.args.get("filter")
        search_query = request.args.get("q")

        try:
            history_data = get_history(
                limit=limit,
                offset=offset,
                label_filter=label_filter,
                search_query=search_query
            )
            return jsonify(history_data), 200
        except Exception:
            logger.exception("Error fetching prediction history")
            return jsonify({"error": "Failed to retrieve prediction history."}), 500

    @app.route("/api/history/<prediction_id>", methods=["GET"])
    def single_prediction_endpoint(prediction_id):
        """Retrieve full details for a single prediction record."""
        try:
            record = get_prediction_by_id(prediction_id)
            if not record:
                return jsonify({"error": "Prediction record not found."}), 404
            return jsonify(record), 200
        except Exception:
            logger.exception("Error fetching prediction record")
            return jsonify({"error": "Failed to retrieve prediction record."}), 500

    @app.route("/api/analytics", methods=["GET"])
    def analytics_endpoint():
        """Retrieve real dashboard analytics aggregated across stored predictions."""
        try:
            analytics_data = get_analytics()
            return jsonify(analytics_data), 200
        except Exception:
            logger.exception("Error calculating analytics")
            return jsonify({"error": "Failed to calculate analytics."}), 500

    @app.route("/api/model-metrics", methods=["GET"])
    def model_metrics_endpoint():
        """Retrieve actual training and evaluation metrics from the saved model."""
        metrics = get_model_metrics()
        if not metrics:
            return jsonify({
                "model_ready": False,
                "message": "Model evaluation metrics have not been generated yet.",
                "setup_instructions": "Run `python -m backend.train` to train the classifier and generate evaluation metrics."
            }), 200

        return jsonify({
            "model_ready": True,
            "metrics": metrics
        }), 200

    @app.route("/api/clear-history", methods=["POST"])
    def clear_history_endpoint():
        """Administrative endpoint to clear local history (e.g. for testing)."""
        try:
            clear_history()
            return jsonify({"message": "Prediction history successfully cleared."}), 200
        except Exception:
            return jsonify({"error": "Failed to clear history."}), 500

    return app


# Root entrypoint
app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting VERITAS AI API server on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
