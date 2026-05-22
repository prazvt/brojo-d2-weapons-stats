const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const code = req.query.code || req.body.code;
  if (!code) return res.status(400).json({ error: 'Local Error: Missing code parameter from URL redirect.' });

  const bodyParams = `grant_type=authorization_code&client_id=52277&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent('https://vercel.app')}`;

  const options = {
    hostname: 'www.bungie.net',
    path: '/Platform/App/OAuth/Token/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': process.env.BUNGIE_API_KEY || process.env.VITE_BUNGIE_API_KEY || '',
      'Content-Length': Buffer.byteLength(bodyParams)
    }
  };

  const bungieRequest = https.request(options, (bungieRes) => {
    let chunks = [];
    bungieRes.on('data', (chunk) => { chunks.push(chunk); });
    bungieRes.on('end', () => {
      const responseBody = Buffer.concat(chunks).toString();
      // Force pass whatever Bungie said straight to the browser console
      res.status(bungieRes.statusCode).send(responseBody);
    });
  });

  bungieRequest.on('error', (err) => {
    res.status(500).json({ error: 'Local Vercel Server Crash', message: err.message });
  });

  bungieRequest.write(bodyParams);
  bungieRequest.end();
};
