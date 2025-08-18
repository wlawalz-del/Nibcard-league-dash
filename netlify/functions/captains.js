const fetch = require("node-fetch");

let playerMap = null; // cached player id → name

async function loadBootstrap() {
  if (playerMap) return playerMap;
  const res = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/");
  const data = await res.json();
  playerMap = {};
  data.elements.forEach(p => playerMap[p.id] = p.web_name);
  return playerMap;
}

exports.handler = async (event) => {
  try {
    const { gw, leagueId } = event.queryStringParameters;
    if (!gw || !leagueId) {
      return { statusCode: 400, body: "Missing gw or leagueId" };
    }

    // get league standings
    const res = await fetch(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`);
    const data = await res.json();
    const teams = data.standings.results;

    // build captain counts
    let captainCounts = {};
    for (let t of teams) {
      const picksRes = await fetch(`https://fantasy.premierleague.com/api/entry/${t.entry}/event/${gw}/picks/`);
      const picks = await picksRes.json();
      const cap = picks.picks.find(p => p.is_captain);
      if (cap) {
        captainCounts[cap.element] = (captainCounts[cap.element] || 0) + 1;
      }
    }

    // map ids → names using cached bootstrap
    const map = await loadBootstrap();
    const sorted = Object.entries(captainCounts).sort((a,b)=>b[1]-a[1]);

    const popular = sorted.length ? map[sorted[0][0]] : "N/A";
    const least = sorted.length ? map[sorted[sorted.length-1][0]] : "N/A";

    return {
      statusCode: 200,
      body: JSON.stringify({ popular, least, counts: captainCounts })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.toString() }) };
  }
};
