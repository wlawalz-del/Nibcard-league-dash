const { ok, bad, handleOptions, fetchJson, inBatches } = require('./_utils');

/**
 * Returns the most & least popular captains within a classic league for a GW:
 *   { popular: "Salah — 8 picks", least: "Watkins — 1 pick" }
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const { leagueId, gw } = event.queryStringParameters || {};
    if (!leagueId) return bad(400, 'Missing leagueId');
    const gwId = parseInt(gw, 10) || 1;

    // 1) Get league entries (paginate classic standings)
    const entries = await getClassicEntryIds(leagueId);

    if (!entries.length) return ok({ popular: null, least: null });

    // 2) Get bootstrap for player id -> name map
    const bootstrap = await fetchJson('https://fantasy.premierleague.com/api/bootstrap-static/');
    const idToName = {};
    (bootstrap.elements || []).forEach(p => {
      // Prefer web_name; fallback to first + second names
      idToName[p.id] = p.web_name || `${p.first_name} ${p.second_name}`.trim();
    });

    // 3) For each entry, fetch captain pick for that GW (batched to be gentle)
    const counts = new Map(); // elementId -> times captained
    await inBatches(entries, 8, async (entryId) => {
      try {
        const url = `https://fantasy.premierleague.com/api/entry/${entryId}/event/${gwId}/picks/`;
        const data = await fetchJson(url);
        const picks = data.picks || [];
        const cap = picks.find(p => p.is_captain) || picks.find(p => (p.multiplier || 1) > 1);
        if (cap && cap.element) {
          counts.set(cap.element, (counts.get(cap.element) || 0) + 1);
        }
      } catch (_) {
        // ignore individual entry errors (private teams, etc.)
      }
    }, 180); // pause ~180ms between batches

    if (counts.size === 0) return ok({ popular: null, least: null });

    // 4) Determine most & least popular (min > 0)
    let popular = null, least = null;
    for (const [el, c] of counts.entries()) {
      if (!popular || c > popular.c) popular = { el, c };
      if (!least || c < least.c) least = { el, c };
    }

    const fmt = (name, c) => `${name} — ${c} ${c === 1 ? 'pick' : 'picks'}`;
    const popularName = idToName[popular.el] || `#${popular.el}`;
    const leastName = idToName[least.el] || `#${least.el}`;

    return ok({
      popular: fmt(popularName, popular.c),
      least: fmt(leastName, least.c)
    });
  } catch (err) {
    return bad(500, `captains error: ${err.message}`);
  }
};

// Helper: fetch up to ~200 entries from a classic league (pages of 50)
async function getClassicEntryIds(leagueId) {
  const perPage = 50;
  const maxPages = 5; // up to 250 teams; adjust if needed
  const ids = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
    const data = await fetchJson(url);
    const rows = (data.standings && data.standings.results) || [];
    if (!rows.length) break;
    rows.forEach(r => ids.push(r.entry));
    if (rows.length < perPage) break; // no more pages
  }
  return ids;
}
