const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const code = req.query.code || (req.body && req.body.code);
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Resolve redirect_uri dynamically based on active request host origin (req.headers.origin or window.location.origin)
  let origin = (req.body && req.body.redirect_uri) || req.headers.origin || req.headers.referer || '';
  let redirectUri = origin.replace(/\/$/, '').toLowerCase();
  
  // Extract strictly the origin if referer had sub-paths
  if (redirectUri && !redirectUri.startsWith('http://localhost') && !redirectUri.startsWith('http://127.0.0.1')) {
    try {
      const urlObj = new URL(redirectUri);
      redirectUri = urlObj.origin.replace(/\/$/, '').toLowerCase();
    } catch (e) {
      // Fallback to sanitised string
    }
  }

  // Ensure it matches your exact domain string: 'https://vercel.app' when not on localhost
  if (!redirectUri || (!redirectUri.startsWith('http://localhost') && !redirectUri.startsWith('http://127.0.0.1'))) {
    redirectUri = 'https://vercel.app';
  }

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: '52277',
    code: code,
    redirect_uri: redirectUri
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
    let chunks = [];
    bungieRes.on('data', (chunk) => { chunks.push(chunk); });
    bungieRes.on('end', () => {
      const responseBody = Buffer.concat(chunks).toString();
      try {
        const parsedData = JSON.parse(responseBody);
        res.status(bungieRes.statusCode).json(parsedData);
      } catch (e) {
        res.status(500).json({ error: 'JSON parse error', raw: responseBody });
      }
    });
  });

  bungieRequest.on('error', (err) => res.status(500).json({ error: err.message }));
  bungieRequest.write(bodyParams);
  bungieRequest.end();
};
