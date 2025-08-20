// netlify/functions/captains.js
import { fetchJson } from "./_utils.js";

export async function handler(event) {
  try {
    const leagueId = event.queryStringParameters.leagueId || "543395";

    // (For now: just mock data – real version would scan entry picks)
    const mockData = {
      mostPopular: { name: "Salah", count: 12 },
      leastPopular: { name: "Watkins", count: 1 }
    };

    return {
      statusCode: 200,
      body: JSON.stringify(mockData),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
