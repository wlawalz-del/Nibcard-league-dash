// netlify/functions/h2h.js
import { fetchJson } from "./_utils.js";

export async function handler(event) {
  try {
    const leagueId = event.queryStringParameters.leagueId || "1997131"; // default H2H
    const url = `https://fantasy.premierleague.com/api/leagues-h2h/${leagueId}/standings/`;
    const data = await fetchJson(url);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
