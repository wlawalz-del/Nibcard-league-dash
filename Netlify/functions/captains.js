const { fetch } = require("./_utils");

exports.handler = async () => {
  try {
    // Get league standings
    const standingsRes = await fetch("https://fantasy.premierleague.com/api/leagues-classic/543395/standings/");
    const standings = await standingsRes.json();
    const teams = standings.standings.results;

    // Get bootstrap-static (player data)
    const bootstrapRes = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/");
    const bootstrap = await bootstrapRes.json();
    const players = bootstrap.elements;

    // Count captain picks
    let captainCount = {};
    for (let team of teams) {
      const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${team.entry}/event/1/picks/`);
      const entryData = await entryRes.json();
      const captainId = entryData.picks.find(p => p.is_captain)?.element;
      if (captainId) {
        captainCount[captainId] = (captainCount[captainId] || 0) + 1;
      }
    }

    // Find most popular captain
    let mostPopularId = null, max = 0;
    for (let [id, count] of Object.entries(captainCount)) {
      if (count > max) {
        mostPopularId = id;
        max = count;
      }
    }
    const mostPopularPlayer = players.find(p => p.id == mostPopularId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        mostPopular: {
          player_name: mostPopularPlayer?.web_name || "Unknown",
          picks: max
        }
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
