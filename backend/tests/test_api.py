"""
VERITAS AI — Automated Pytest Suite
Tests API endpoints, input validation, database persistence, analytics aggregation,
and model behavior.
"""
import pytest
import json
from backend.app import create_app
from backend.database import init_db, clear_history, save_prediction, get_history, get_analytics
from backend.model import clean_text


@pytest.fixture
def client():
    """Create test client with clean database."""
    app = create_app()
    app.config["TESTING"] = True
    init_db()
    clear_history()
    with app.test_client() as client:
        yield client
    clear_history()


def test_health_endpoint(client):
    """Verify health endpoint returns 200 with service metadata."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "VERITAS AI API"
    assert "model_ready" in data
    assert "timestamp" in data


def test_predict_non_json(client):
    """Verify non-JSON request body produces 400 Bad Request."""
    res = client.post(
        "/api/predict",
        data="Some raw string not json",
        content_type="text/plain"
    )
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data


def test_predict_empty_text(client):
    """Verify empty text produces 400 with descriptive validation error."""
    res = client.post("/api/predict", json={"text": ""})
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data


def test_predict_short_text(client):
    """Verify text shorter than minimum length produces 400."""
    res = client.post("/api/predict", json={"text": "Short"})
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "characters" in data["error"]


def test_clean_text_function():
    """Verify text preprocessing strips HTML, URLs, and excess spaces."""
    raw = "Breaking! Visit https://example.com for <b>Miracle</b> cure!!!   "
    cleaned = clean_text(raw)
    assert "https" not in cleaned
    assert "<b>" not in cleaned
    assert "miracle" in cleaned
    assert "   " not in cleaned


def test_database_persistence_and_history(client):
    """Verify manual predictions are properly persisted and retrieved from SQLite."""
    rec = save_prediction(
        text="A formal international treaty on environmental conservation was enacted today.",
        prediction="Likely Real",
        confidence=0.92,
        raw_score=-1.85,
        title="Treaty Enacted"
    )
    assert rec["id"].startswith("vrt_")
    assert rec["prediction"] == "Likely Real"

    # Query history endpoint
    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == rec["id"]
    assert data["items"][0]["prediction"] == "Likely Real"


def test_history_search_and_filter(client):
    """Verify history filtering by prediction label and search query."""
    save_prediction("Economic report highlights steady industrial recovery.", "Likely Real", 0.88, -1.2, "Economic Report")
    save_prediction("Secret aliens infiltrate subterranean cavern network.", "Likely Fake", 0.95, 2.4, "Alien Alert")

    # Filter Likely Real
    res_real = client.get("/api/history?filter=Likely Real")
    assert res_real.status_code == 200
    data_real = res_real.get_json()
    assert data_real["total"] == 1
    assert data_real["items"][0]["prediction"] == "Likely Real"

    # Filter Likely Fake
    res_fake = client.get("/api/history?filter=Likely Fake")
    assert res_fake.status_code == 200
    data_fake = res_fake.get_json()
    assert data_fake["total"] == 1
    assert data_fake["items"][0]["prediction"] == "Likely Fake"

    # Search query
    res_search = client.get("/api/history?q=aliens")
    assert res_search.status_code == 200
    data_search = res_search.get_json()
    assert data_search["total"] == 1
    assert "Alien" in data_search["items"][0]["title"]


def test_analytics_calculation(client):
    """Verify analytics aggregates correctly calculate totals and percentages."""
    save_prediction("Valid news report sample 1", "Likely Real", 0.90, -1.0)
    save_prediction("Valid news report sample 2", "Likely Real", 0.85, -0.9)
    save_prediction("Conspiracy fake news alert sample 1", "Likely Fake", 0.92, 1.5)

    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total_predictions"] == 3
    assert data["likely_real_count"] == 2
    assert data["likely_fake_count"] == 1
    assert data["likely_real_percentage"] == 66.7
    assert data["likely_fake_percentage"] == 33.3
    assert len(data["trends"]) >= 1


def test_model_metrics_endpoint(client):
    """Verify model metrics endpoint returns status and structure."""
    res = client.get("/api/model-metrics")
    assert res.status_code == 200
    data = res.get_json()
    assert "model_ready" in data
