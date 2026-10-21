# VERITAS AI — Fake News Detection Platform
> *"See Beyond the Headline."*

An AI-powered textual intelligence and fake news detection platform. Built with a modern dark editorial aesthetic, natural language processing (NLP), support vector machine classification, and real-time probabilistic telemetry.

---

## Architecture Overview

```
fake-news-prediction/
├── backend/
│   ├── app.py                     # Flask REST API endpoints & CORS configuration
│   ├── config.py                  # Environment settings, file paths & input validation thresholds
│   ├── database.py                # SQLite persistence layer (veritas.db) & analytics aggregations
│   ├── dataset_downloader.py      # Benchmark dataset compiler & schema validator
│   ├── model.py                   # Real-time NLP inference service & salient term extractor
│   ├── train.py                   # Reproducible ML training pipeline (TF-IDF + LinearSVC + Platt Calibration)
│   ├── data/                      # Dataset repository (dataset.csv)
│   ├── models/                    # Serialized model artifacts (model.joblib, vectorizer.joblib, metrics.json)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py            # Automated pytest suite covering API, DB, input limits, and model
│   └── requirements.txt           # Python dependency specifications
├── frontend/
│   ├── index.html                 # Google Fonts (Syne, Inter, JetBrains Mono) & metadata
│   ├── vite.config.js             # Vite development server configuration & /api proxy
│   ├── package.json               # Frontend dependencies (React 19, Lucide React, Recharts)
│   └── src/
│       ├── App.jsx                # Application shell with navigation state & notification toasts
│       ├── index.css              # Custom design system (tokens, glass panels, scanning laser, responsive layout)
│       ├── main.jsx               # React entrypoint
│       ├── components/
│       │   ├── Navbar.jsx         # Sticky navigation with live API health indicator & mobile drawer
│       │   ├── Footer.jsx         # Editorial footer with tech specs & ethical limitations notice
│       │   ├── ScanVisualizer.jsx # Cinematic scanning lifecycle animation
│       │   └── Toast.jsx          # Accessible floating feedback notifications
│       ├── pages/
│       │   ├── LandingPage.jsx    # Cinematic hero ("THE TRUTH IS WORTH FINDING"), scroll storytelling, how it works
│       │   ├── AnalyzerPage.jsx   # Dedicated news analysis workspace with sample pills & result card
│       │   ├── DashboardPage.jsx  # Telemetry dashboard with Recharts area & donut charts
│       │   ├── HistoryPage.jsx    # SQLite prediction log with search, filters, and full text modal
│       │   └── ModelPage.jsx      # Scientific audit, confusion matrix (TN, FP, FN, TP) & top n-grams
│       └── services/
│           ├── api.js             # Fetch client with centralized error handling
│           └── sampleData.js      # Curated benchmark real vs deceptive news test samples
├── .gitignore
└── README.md
```

---
## 🚀 Live Demo

🌐 **Frontend Website:** [Open VERITAS AI](https://veritas-ai-rho.vercel.app)

⚙️ **Backend API:** [Render Backend](https://veritas-ai-a8rh.onrender.com)

💻 **Source Code:** [GitHub Repository](https://github.com/puttamrajukarthik569-sys/veritas-ai)

## Key Features

1. **Cinematic Dark Editorial Design**:
   - Palette: Deep black (`#07090E`), midnight-navy (`#0C1018`), charcoal surfaces (`#111622`), electric cyan (`#00F0FF`), selective violet (`#8B5CF6`), muted green (`#10B981`), and muted red (`#EF4444`).
   - Typography: Syne for oversized editorial headlines, Inter for clean UI, and JetBrains Mono for metrics and log-odds.
   - Restrained micro-interactions: tactile button press, laser scanner animation, and smooth scroll transitions.

2. **Real NLP Machine Learning Pipeline**:
   - Sublinear TF-IDF vectorization with unigram and bigram n-grams (`ngram_range=(1, 2)`).
   - Linear Support Vector Machine (`LinearSVC`).
   - Platt Sigmoid Calibration (`CalibratedClassifierCV`) to calculate statistically legitimate posterior probabilities rather than raw uncalibrated decision distances.
   - Zero Data Leakage: TF-IDF vectorizer fitted exclusively on training data after stratified train/test split.

3. **News Analyzer Workspace**:
   - Character and word counter with validation against configurable min/max bounds.
   - Quick one-click benchmark samples (both authentic journalistic reports and documented deceptive hoaxes).
   - Real-time result presentation with probability distributions, signed logit raw scores, and extracted salient terms.
   - Copy report button and direct navigation to audit history.

4. **Telemetry & Dashboard**:
   - Total evaluations, Likely Real count, Likely Fake count, and balance ratios.
   - Recharts-powered historical volume area chart and class distribution donut chart.
   - Recent activity stream with live inspect.

5. **Persistent SQLite History**:
   - Automatically stores all predictions with generated unique identifiers (`vrt_...`), text previews, full text, and timestamps.
   - Real-time search query matching and label filtering (`Likely Real`, `Likely Fake`, `All`).
   - Full article modal reader supporting long-form text without layout distortion.

6. **Model Intelligence & Evaluation**:
   - Transparent evaluation report detailing Accuracy, Precision, Recall, and F1-Score.
   - Interactive 2x2 Confusion Matrix (`True Negatives`, `False Positives`, `False Negatives`, `True Positives`).
   - Top discriminating n-gram weights illustrating words that trigger deceptive vs authentic classifications.

---

## Getting Started (Windows Execution)

### Prerequisites
- Python 3.10+ installed
- Node.js v18+ and npm installed

### 1. Install Backend Dependencies
In the project root terminal:
```powershell
python -m pip install -r backend/requirements.txt
```

### 2. Train the NLP Model
Train the calibrated LinearSVC classifier and generate `model.joblib`, `vectorizer.joblib`, and `metrics.json`:
```powershell
python -m backend.train
```

### 3. Run Backend Pytest Suite
Verify all API endpoints, input validation, and database operations:
```powershell
python -m pytest backend/tests/test_api.py -v
```

### 4. Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## Starting the Application

Run the backend and frontend in separate terminals:

### Terminal 1: Backend Server (Port 5000)
```powershell
python -m backend.app
```
*API will be available at `http://127.0.0.1:5000`.*

### Terminal 2: Frontend Development Server (Port 3000)
```powershell
cd frontend
npm run dev
```
*Web application will be accessible at `http://localhost:3000`.*

---

## Building Frontend for Production
To generate an optimized production bundle:
```powershell
cd frontend
npm run build
```
The production bundle will be written to `frontend/dist/`.

---

## REST API Documentation

### `GET /api/health`
Checks server, SQLite database, and model artifact readiness.
**Response (200 OK):**
```json
{
  "database_ready": true,
  "model_ready": true,
  "service": "VERITAS AI API",
  "status": "ok",
  "timestamp": "2026-10-21T17:14:23.506633+00:00",
  "version": "1.0.0"
}
```

### `POST /api/predict`
Analyzes input article text and saves the record to SQLite.
**Request Body:**
```json
{
  "title": "Exoplanet Atmosphere Discovery",
  "text": "Astronomers analyzing spectral transmission data from the James Webb Space Telescope have confirmed clear signatures of water vapor in the atmosphere."
}
```
**Response (200 OK):**
```json
{
  "id": "vrt_3b3aa51eeb49",
  "prediction": "Likely Real",
  "confidence": 0.853,
  "confidence_pct": "85.3%",
  "probabilities": {
    "likely_real": 0.853,
    "likely_fake": 0.147
  },
  "raw_score": -1.7586,
  "salient_terms": [
    { "term": "analyzing", "tfidf_score": 0.1891 },
    { "term": "astronomers", "tfidf_score": 0.1891 },
    { "term": "atmosphere", "tfidf_score": 0.1891 }
  ],
  "title": "Exoplanet Atmosphere Discovery",
  "text_preview": "Astronomers analyzing spectral transmission data...",
  "word_count": 21,
  "char_count": 139,
  "created_at": "2026-10-21T17:14:25.123456+00:00",
  "limitation_notice": "This prediction reflects vocabulary and syntactic patterns learned by a machine learning classifier. It does not verify external facts, check live sources, or guarantee absolute truth."
}
```

### `GET /api/history`
Retrieves paginated prediction audit logs.
**Query Parameters:**
- `limit` (int, default 20, max 100)
- `offset` (int, default 0)
- `filter` (string: `"all"`, `"Likely Real"`, `"Likely Fake"`)
- `q` (string: search query)

### `GET /api/analytics`
Returns aggregate KPI totals, percentages, daily volume trends, and recent activity.

### `GET /api/model-metrics`
Returns serialized model performance metrics, classification report, confusion matrix, and top feature weights.

---

## Machine Learning Methodology & Integrity

- **Feature Extraction**: TF-IDF (Term Frequency-Inverse Document Frequency) transforms cleaned and normalized text into an 8,000-dimensional sparse feature space using sublinear term frequencies.
- **Classification Engine**: Linear Support Vector Classifier (`LinearSVC`, $C=1.0$).
- **Sigmoid Probability Calibration**: Because raw SVM decision distances ($w \cdot x + b$) are uncalibrated and can be distorted by margin geometry, we employ Platt Sigmoid calibration via `CalibratedClassifierCV(method='sigmoid', cv=3)` to output statistically valid posterior probabilities $P(\text{class} \mid x)$.
- **Zero Train-to-Test Leakage**: The TF-IDF vectorizer is fitted strictly on the 80% training split (`X_train`) after stratified partitioning. Test evaluation takes place strictly on the unseen 20% test split.
- **Deduplication**: Exact text duplicates are removed before splitting to avoid memorization leakage.

---

## Model Limitations Notice

> **Scientific Disclaimer**:
> VERITAS AI is an automated text classification tool that evaluates linguistic, stylistic, and vocabulary patterns learned from labeled training corpora. High test-set accuracy indicates strong performance within the modeled domain, but does **not** guarantee infallible accuracy on novel news stories, out-of-distribution events, or nuanced political commentary. VERITAS AI does not conduct real-time fact-checking or web crawling and should be utilized as an investigative decision-support aid alongside independent journalistic verification.

---

## License
MIT License. Developed for research and educational purposes.
