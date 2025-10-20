from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Dict, Any

DB_PATH = os.getenv("TRADES_DB_PATH", "trades.db")


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    try:
        conn.row_factory = sqlite3.Row
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                symbol TEXT NOT NULL,
                action TEXT NOT NULL CHECK (action IN ('BUY','SELL')),
                price REAL NOT NULL
            )
            """
        )


def log_trade(symbol: str, action: str, price: float) -> None:
    timestamp = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO trades (timestamp, symbol, action, price) VALUES (?, ?, ?, ?)",
            (timestamp, symbol.upper(), action, float(price)),
        )


def get_recent_trades(limit: int = 20) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT id, timestamp, symbol, action, price FROM trades ORDER BY id DESC LIMIT ?",
            (int(limit),),
        )
        rows = cur.fetchall()
    # Convert to list of dicts
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "timestamp": row["timestamp"],
            "symbol": row["symbol"],
            "action": row["action"],
            "price": row["price"],
        })
    return results
