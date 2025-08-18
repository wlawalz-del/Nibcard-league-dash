const { ok, bad, handleOptions, fetchJson } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const { leagueId, page = 1 } = event.queryStringParameters || {};
    if (!leagueId) return bad(400, 'Missing leagueId');

    const url = `https://fantasy.premierleague.com/api/leagues-h2h/${leagueId}/standings/?page_standings=${page}`;
    const data = await fetchJson(url);

    const results = (data && data.standings && data.standings.results) || [];
    if (!results.length) return ok({ teamName: 'N/A', managerName: 'N/A', points: 0 });

    // Top of the table is usually first, but be safe
    const leader = results.reduce((a, b) => (a.total >= b.total ? a : b));
    return ok({
      teamName: leader.entry_name,
      managerName: leader.player_name,
      points: leader.total
    });
  } catch (err) {
    return bad(500, `h2h error: ${err.message}`);
  }
};
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
