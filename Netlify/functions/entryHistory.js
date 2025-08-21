const { fetch } = require("./_utils");

exports.handler = async () => {
  try {
    // Example: using your team ID for testing (replace later with dynamic league loop)
    const teamId = 4887748;
    const res = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/history/`);
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.current) // returns per-GW history (points, rank, etc.)
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
