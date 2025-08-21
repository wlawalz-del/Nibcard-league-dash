const { fetch } = require("./_utils");

exports.handler = async () => {
  const res = await fetch("https://fantasy.premierleague.com/api/leagues-classic/543395/standings/");
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify(data) };
};
