# AI Trading Web App (FastAPI)

This project is a demo web application that automates stock trading decisions using a simple SMA crossover strategy. It fetches market data and financial news, generates trading signals, and logs simulated trades in SQLite. A simple dashboard displays status, recent trades, and a basic chart using Chart.js.

- Backend: FastAPI (Python)
- Frontend: HTML/CSS/JS + Chart.js
- Database: SQLite
- Scheduler: APScheduler

Environment variables:
- `ALPHA_VANTAGE_API_KEY` (optional; defaults to `YOUR_API_KEY`)

Run locally:
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000` in your browser.
