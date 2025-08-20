// netlify/functions/entryHistory.js
import { fetchJson } from "./_utils.js";

export async function handler(event) {
  try {
    const teamId = event.queryStringParameters.teamId || "2827830"; // default: admin_entry
    const url = `https://fantasy.premierleague.com/api/entry/${teamId}/history/`;
    const data = await fetchJson(url);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
