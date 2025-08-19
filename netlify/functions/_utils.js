// netlify/functions/_utils.js
import fetch from "node-fetch";

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return res.json();
}
