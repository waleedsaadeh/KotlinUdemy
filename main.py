from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from threading import Lock

import data_provider
import trading_logic
import database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Trading Web App")

# Mount static files and set up templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

SYMBOLS: List[str] = ["AAPL", "GOOGL"]

scheduler: Optional[BackgroundScheduler] = None
state_lock = Lock()

class BotState:
    last_run_time: Optional[str] = None
    last_signals: Dict[str, str] = {}
    is_running: bool = False

bot_state = BotState()


def run_trading_cycle(symbol: str) -> None:
    """One trading cycle for a single symbol: fetch data, generate signal, log trade if needed."""
    try:
        logger.info("Running trading cycle for %s", symbol)
        price_df: pd.DataFrame = data_provider.fetch_price_history(symbol)
        if price_df.empty:
            logger.warning("No price data for %s; skipping", symbol)
            return

        signal = trading_logic.generate_signals(price_df)
        price = float(price_df["close"].iloc[-1])

        with state_lock:
            bot_state.last_signals[symbol] = signal
            bot_state.last_run_time = datetime.now(timezone.utc).isoformat()

        if signal in ("BUY", "SELL"):
            database.log_trade(symbol=symbol, action=signal, price=price)
            logger.info("Logged trade: %s %s @ %.2f", signal, symbol, price)
        else:
            logger.info("No trade signal for %s (HOLD)", symbol)

        # Optionally refresh news in the background; ignore errors
        try:
            _ = data_provider.fetch_financial_news(symbol)
        except Exception:  # noqa: BLE001
            pass

    except Exception as exc:  # noqa: BLE001
        logger.exception("Error in trading cycle for %s: %s", symbol, exc)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Initializing database and scheduler")
    database.init_db()

    global scheduler
    scheduler = BackgroundScheduler()

    # Schedule a job for each symbol every 5 minutes
    for sym in SYMBOLS:
        scheduler.add_job(
            run_trading_cycle,
            trigger=IntervalTrigger(minutes=5),
            args=[sym],
            id=f"trade_cycle_{sym}",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

    scheduler.start()


@app.on_event("shutdown")
def on_shutdown() -> None:
    logger.info("Shutting down scheduler")
    if scheduler:
        scheduler.shutdown(wait=False)


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "symbols": SYMBOLS})


@app.get("/api/trade-history")
async def api_trade_history(limit: int = 20):
    trades = database.get_recent_trades(limit=limit)
    return JSONResponse(content=trades)


@app.get("/api/status")
async def api_status():
    with state_lock:
        payload = {
            "status": "running",
            "last_run_time": bot_state.last_run_time,
            "symbols": SYMBOLS,
            "last_signals": bot_state.last_signals,
        }
    return JSONResponse(content=payload)
