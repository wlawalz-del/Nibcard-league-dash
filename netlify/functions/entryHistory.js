const { ok, bad, handleOptions, fetchJson } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const { teamId } = event.queryStringParameters || {};
    if (!teamId) return bad(400, 'Missing teamId');

    const url = `https://fantasy.premierleague.com/api/entry/${teamId}/history/`;
    const data = await fetchJson(url);

    const rows = (data.current || []).map(r => ({
      gw: r.event,
      total_points: r.total_points
    }));

    return ok(rows);
  } catch (err) {
    return bad(500, `entryHistory error: ${err.message}`);
  }
};
