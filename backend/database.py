"""
VERITAS AI — SQLite Database Module
Manages prediction persistence, history retrieval, and analytics aggregations.
"""
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from .config import DB_PATH, MAX_PREVIEW_LENGTH


def get_db_connection() -> sqlite3.Connection:
    """Create and return a row-factory enabled SQLite connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database tables and indexes."""
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                title TEXT,
                text TEXT NOT NULL,
                text_preview TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL NOT NULL,
                raw_score REAL NOT NULL,
                word_count INTEGER NOT NULL,
                char_count INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_predictions_created 
            ON predictions(created_at DESC);
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_predictions_label 
            ON predictions(prediction);
        """)
        conn.commit()


def save_prediction(
    text: str,
    prediction: str,
    confidence: float,
    raw_score: float,
    title: Optional[str] = None
) -> Dict[str, Any]:
    """Persist a prediction result into SQLite and return its record."""
    clean_text = text.strip()
    words = clean_text.split()
    word_count = len(words)
    char_count = len(clean_text)

    # Generate truncated preview
    preview = clean_text[:MAX_PREVIEW_LENGTH]
    if len(clean_text) > MAX_PREVIEW_LENGTH:
        preview = preview.rstrip() + "..."

    # Use title or extract from first line
    extracted_title = title.strip() if title else ""
    if not extracted_title and words:
        first_line = clean_text.split("\n")[0].strip()
        extracted_title = first_line[:100]

    record_id = f"vrt_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO predictions 
            (id, title, text, text_preview, prediction, confidence, raw_score, word_count, char_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (record_id, extracted_title, clean_text, preview, prediction, confidence, raw_score, word_count, char_count, created_at)
        )
        conn.commit()

    return {
        "id": record_id,
        "title": extracted_title,
        "text": clean_text,
        "text_preview": preview,
        "prediction": prediction,
        "confidence": confidence,
        "raw_score": raw_score,
        "word_count": word_count,
        "char_count": char_count,
        "created_at": created_at
    }


def get_history(
    limit: int = 50,
    offset: int = 0,
    label_filter: Optional[str] = None,
    search_query: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch paginated prediction history with optional filter & text search."""
    conditions = []
    params = []

    if label_filter and label_filter.lower() in ("likely real", "likely fake"):
        conditions.append("prediction = ?")
        params.append(label_filter.title())

    if search_query and search_query.strip():
        search_term = f"%{search_query.strip()}%"
        conditions.append("(title LIKE ? OR text_preview LIKE ? OR text LIKE ?)")
        params.extend([search_term, search_term, search_term])

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    count_sql = f"SELECT COUNT(*) as total FROM predictions {where_clause}"

    items_sql = f"""
        SELECT id, title, text_preview, prediction, confidence, raw_score, word_count, char_count, created_at
        FROM predictions
        {where_clause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    """

    with get_db_connection() as conn:
        total = conn.execute(count_sql, params).fetchone()["total"]
        rows = conn.execute(items_sql, params + [limit, offset]).fetchall()

        items = [dict(row) for row in rows]

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + len(items)) < total
    }


def get_prediction_by_id(prediction_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve full prediction record by id."""
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT * FROM predictions WHERE id = ?",
            (prediction_id,)
        ).fetchone()

        if row:
            return dict(row)
        return None


def get_analytics() -> Dict[str, Any]:
    """Aggregate analytics on predictions for the dashboard."""
    with get_db_connection() as conn:
        total_row = conn.execute("SELECT COUNT(*) as total FROM predictions").fetchone()
        total = total_row["total"] if total_row else 0

        real_row = conn.execute(
            "SELECT COUNT(*) as count, AVG(confidence) as avg_conf FROM predictions WHERE prediction = 'Likely Real'"
        ).fetchone()
        fake_row = conn.execute(
            "SELECT COUNT(*) as count, AVG(confidence) as avg_conf FROM predictions WHERE prediction = 'Likely Fake'"
        ).fetchone()

        likely_real_count = real_row["count"] if real_row else 0
        likely_fake_count = fake_row["count"] if fake_row else 0

        real_pct = round((likely_real_count / total * 100), 1) if total > 0 else 0.0
        fake_pct = round((likely_fake_count / total * 100), 1) if total > 0 else 0.0

        # Timeline grouped by date (YYYY-MM-DD)
        trend_rows = conn.execute("""
            SELECT 
                SUBSTR(created_at, 1, 10) as date,
                COUNT(*) as total,
                SUM(CASE WHEN prediction = 'Likely Real' THEN 1 ELSE 0 END) as likely_real,
                SUM(CASE WHEN prediction = 'Likely Fake' THEN 1 ELSE 0 END) as likely_fake
            FROM predictions
            GROUP BY SUBSTR(created_at, 1, 10)
            ORDER BY date ASC
            LIMIT 30
        """).fetchall()

        trends = [
            {
                "date": row["date"],
                "total": row["total"],
                "likely_real": row["likely_real"],
                "likely_fake": row["likely_fake"]
            }
            for row in trend_rows
        ]

        # Recent 5 items for activity stream
        recent_rows = conn.execute("""
            SELECT id, title, text_preview, prediction, confidence, created_at
            FROM predictions
            ORDER BY created_at DESC
            LIMIT 5
        """).fetchall()

        recent = [dict(row) for row in recent_rows]

    return {
        "total_predictions": total,
        "likely_real_count": likely_real_count,
        "likely_fake_count": likely_fake_count,
        "likely_real_percentage": real_pct,
        "likely_fake_percentage": fake_pct,
        "trends": trends,
        "recent_activity": recent
    }


def clear_history() -> None:
    """Clear all records from database (useful for testing)."""
    with get_db_connection() as conn:
        conn.execute("DELETE FROM predictions")
        conn.commit()
