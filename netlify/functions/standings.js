const { ok, bad, handleOptions, fetchJson } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const { leagueId, page = 1 } = event.queryStringParameters || {};
    if (!leagueId) return bad(400, 'Missing leagueId');

    const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
    const data = await fetchJson(url);
    return ok(data);
  } catch (err) {
    return bad(500, `standings error: ${err.message}`);
  }
};
