exports.handler = async (event) => {
  try {
    const leagueId = event.queryStringParameters.leagueId || "1997131";
    const page = event.queryStringParameters.page || 1;

    const resp = await fetch(
      `https://fantasy.premierleague.com/api/leagues-h2h/${leagueId}/standings/?page_standings=${page}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!resp.ok) throw new Error("Failed to fetch H2H standings");
    const data = await resp.json();

    const results = data?.standings?.results || [];
    if (results.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ error: "No teams found" }) };
    }

    // Find leader (rank 1)
    const leader = results.find(r => r.rank === 1) || results[0];
    return {
      statusCode: 200,
      body: JSON.stringify({
        leaderName: leader?.player_name || null,
        teamName: leader?.entry_name || null,
        points: leader?.points_total || leader?.total || 0,
        rawCount: results.length
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
