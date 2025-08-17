exports.handler = async (event) => {
  try {
    const leagueId = event.queryStringParameters.leagueId;
    const page = event.queryStringParameters.page || 1;

    if (!leagueId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing leagueId" }) };
    }

    const resp = await fetch(
      `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/?page_standings=${page}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    if (!resp.ok) throw new Error("Failed to fetch classic league standings");

    const data = await resp.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
