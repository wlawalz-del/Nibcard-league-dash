exports.handler = async (event) => {
  try {
    const teamId = event.queryStringParameters.teamId;
    if (!teamId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing teamId" }) };
    }

    const resp = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!resp.ok) throw new Error("Failed to fetch entry history");
    const data = await resp.json();

    const history = (data?.current || []).map(h => ({
      gw: h.event,
      points: h.points,
      total_points: h.total_points
    }));

    return { statusCode: 200, body: JSON.stringify(history) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
