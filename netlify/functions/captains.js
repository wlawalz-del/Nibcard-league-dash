exports.handler = async (event) => {
  try {
    const gw = event.queryStringParameters.gw || 1;
    const leagueId = event.queryStringParameters.leagueId;

    if (!leagueId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing leagueId" }) };
    }

    // get league standings to collect entry IDs
    const resp = await fetch(
      `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
    );
    const data = await resp.json();
    const entries = data.standings.results.map(r => r.entry);

    let captainCounts = {};
    for (let entry of entries) {
      const picksResp = await fetch(
        `https://fantasy.premierleague.com/api/entry/${entry}/event/${gw}/picks/`
      );
      const picks = await picksResp.json();
      const capId = picks?.picks?.find(p=>p.is_captain)?.element;
      if (capId) captainCounts[capId] = (captainCounts[capId]||0)+1;
    }

    const sorted = Object.entries(captainCounts).sort((a,b)=>b[1]-a[1]);
    const most = sorted[0] ? sorted[0][0] : null;
    const least = sorted[sorted.length-1] ? sorted[sorted.length-1][0] : null;

    return {
      statusCode: 200,
      body: JSON.stringify({ popular: most, least })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
