import os
import logging
from datetime import datetime
from typing import List, Dict, Any

import requests
import pandas as pd

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "YOUR_API_KEY")
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

logger = logging.getLogger(__name__)


def _get(url: str, params: Dict[str, Any], timeout: int = 20) -> Dict[str, Any] | None:
    """Internal helper to perform GET requests with basic error handling."""
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        data = response.json()
        # Alpha Vantage rate limiting and error messages often appear under 'Note' or 'Error Message'
        if isinstance(data, dict) and ("Note" in data or "Error Message" in data or "Information" in data):
            logger.warning("Alpha Vantage API notice: %s", data.get("Note") or data.get("Error Message") or data.get("Information"))
            return None
        return data
    except requests.RequestException as exc:
        logger.exception("HTTP error while fetching data: %s", exc)
        return None
    except ValueError as exc:
        logger.exception("Failed to parse JSON: %s", exc)
        return None


def fetch_price_history(symbol: str) -> pd.DataFrame:
    """Fetch last ~100 days daily closing prices for the given stock symbol.

    Returns a DataFrame with columns: ['date', 'close'] sorted ascending by date.
    On failure, returns an empty DataFrame.
    """
    params = {
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": symbol,
        "outputsize": "compact",  # ~100 most recent data points
        "apikey": ALPHA_VANTAGE_API_KEY,
    }
    data = _get(ALPHA_VANTAGE_BASE_URL, params)
    if not data or "Time Series (Daily)" not in data:
        logger.error("Price history response missing for symbol %s", symbol)
        return pd.DataFrame(columns=["date", "close"]).astype({"date": "datetime64[ns]", "close": "float"})

    ts = data["Time Series (Daily)"]
    records: List[Dict[str, Any]] = []
    for date_str, values in ts.items():
        try:
            close_price = float(values.get("4. close"))
            records.append({"date": datetime.strptime(date_str, "%Y-%m-%d"), "close": close_price})
        except (TypeError, ValueError):
            continue

    df = pd.DataFrame(records)
    if df.empty:
        return pd.DataFrame(columns=["date", "close"]).astype({"date": "datetime64[ns]", "close": "float"})

    df.sort_values("date", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def fetch_financial_news(symbol: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Fetch latest financial news related to the stock symbol using Alpha Vantage NEWS_SENTIMENT.

    Returns a list of news items with keys: title, time_published, url.
    On any error returns an empty list. Some accounts may not have access; this is handled gracefully.
    """
    params = {
        "function": "NEWS_SENTIMENT",
        "tickers": symbol,
        "apikey": ALPHA_VANTAGE_API_KEY,
        # Optionally, you can add more filters like 'topics' or 'sort'
    }
    data = _get(ALPHA_VANTAGE_BASE_URL, params)
    if not data or "feed" not in data:
        logger.warning("No news feed returned for %s", symbol)
        return []

    feed = data.get("feed", [])
    news_items: List[Dict[str, Any]] = []
    for item in feed[:limit]:
        title = item.get("title")
        time_published = item.get("time_published")
        url = item.get("url")
        if title and url:
            news_items.append({
                "title": title,
                "time_published": time_published,
                "url": url,
            })
    return news_items
