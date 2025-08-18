// Shared helpers for all functions

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const ok = (data) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(data)
});

const bad = (status, message) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify({ error: message })
});

const handleOptions = () => ({
  statusCode: 200,
  headers: CORS,
  body: ''
});

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'nibcard-fpl-dashboard/1.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function inBatches(items, size, worker, pauseMs = 0) {
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    await Promise.all(slice.map(worker));
    if (pauseMs) await sleep(pauseMs);
  }
}

module.exports = { CORS, ok, bad, handleOptions, fetchJson, sleep, inBatches };
