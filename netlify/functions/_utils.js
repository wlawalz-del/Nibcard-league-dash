// netlify/functions/_utils.js
import fetch from "node-fetch";

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}
async function inBatches(items, size, worker, pauseMs = 0) {
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    await Promise.all(slice.map(worker));
    if (pauseMs) await sleep(pauseMs);
  }
}

module.exports = { CORS, ok, bad, handleOptions, fetchJson, sleep, inBatches };
