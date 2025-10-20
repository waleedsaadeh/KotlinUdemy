let chart;

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function loadStatus() {
  try {
    const data = await fetchJSON('/api/status');
    document.getElementById('statusText').textContent = data.status || '—';
    document.getElementById('lastRun').textContent = formatDate(data.last_run_time);

    const signals = data.last_signals || {};
    const pretty = Object.entries(signals).map(([sym, sig]) => `${sym}: ${sig}`).join('، ');
    document.getElementById('signals').textContent = pretty || '—';
  } catch (e) {
    document.getElementById('statusText').textContent = 'غير متصل';
  }
}

function ensureChart(ctx) {
  if (chart) return chart;
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'سعر الصفقة', data: [], borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.2)', tension: 0.2 }] },
    options: { scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } }, plugins: { legend: { labels: { color: '#e2e8f0' } } } }
  });
  return chart;
}

async function loadTrades() {
  try {
    const data = await fetchJSON('/api/trade-history?limit=20');
    const tbody = document.querySelector('#tradesTable tbody');
    tbody.innerHTML = '';

    for (const row of data) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.id}</td>
        <td>${formatDate(row.timestamp)}</td>
        <td>${row.symbol}</td>
        <td>${row.action}</td>
        <td>${Number(row.price).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    }

    // Update chart with recent trades (ascending by time)
    const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = sorted.map(r => new Date(r.timestamp).toLocaleTimeString());
    const prices = sorted.map(r => Number(r.price));

    const ctx = document.getElementById('tradeChart').getContext('2d');
    const ch = ensureChart(ctx);
    ch.data.labels = labels;
    ch.data.datasets[0].data = prices;
    ch.update();
  } catch (e) {
    // ignore display errors
  }
}

async function refreshAll() {
  await Promise.all([loadStatus(), loadTrades()]);
}

window.addEventListener('DOMContentLoaded', async () => {
  await refreshAll();
  setInterval(refreshAll, 30000); // every 30s
});
