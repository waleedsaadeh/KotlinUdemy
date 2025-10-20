from __future__ import annotations

import pandas as pd
from typing import Literal

Signal = Literal["BUY", "SELL", "HOLD"]


def generate_signals(data: pd.DataFrame) -> Signal:
    """Generate a trading signal using a simple SMA crossover strategy.

    Expects 'data' to have at least the columns ['date', 'close'] sorted ascending by date.
    Computes SMA-20 and SMA-50. Signals:
    - BUY when SMA20 crosses above SMA50
    - SELL when SMA20 crosses below SMA50
    - HOLD otherwise
    """
    if data is None or data.empty or "close" not in data.columns:
        return "HOLD"

    closes = data["close"].astype(float)
    sma20 = closes.rolling(window=20, min_periods=20).mean()
    sma50 = closes.rolling(window=50, min_periods=50).mean()

    if sma50.isna().iloc[-1]:
        # Not enough data to compute SMA50
        return "HOLD"

    # Use last two points to detect a crossover event
    sma20_last = sma20.iloc[-1]
    sma50_last = sma50.iloc[-1]

    sma20_prev = sma20.iloc[-2] if len(sma20) >= 2 else None
    sma50_prev = sma50.iloc[-2] if len(sma50) >= 2 else None

    if sma20_prev is not None and sma50_prev is not None:
        crossed_up = sma20_last > sma50_last and sma20_prev <= sma50_prev
        crossed_down = sma20_last < sma50_last and sma20_prev >= sma50_prev
        if crossed_up:
            return "BUY"
        if crossed_down:
            return "SELL"

    return "HOLD"
