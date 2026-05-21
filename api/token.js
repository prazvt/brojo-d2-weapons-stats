const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const code = req.query.code || req.body.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: '52277',
    code: code,
    redirect_uri: 'https://vercel.app'
  }).toString();

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
    let data = '';
    bungieRes.on('data', (chunk) => { data += chunk; });
    bungieRes.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        res.status(bungieRes.statusCode).json(parsedData);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse Bungie response' });
      }
    });
  });

  bungieRequest.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  bungieRequest.write(bodyParams);
  bungieRequest.end();
};
