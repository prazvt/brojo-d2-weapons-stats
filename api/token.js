const https = require('https');

module.exports = async (req, res) => {
  // 1. Enforce universal CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Extract authorization parameters adaptively regardless of casing mismatches
    const code = (req.query && req.query.code) || (req.body && req.body.code) || (req.query && req.query.Code) || (req.body && req.body.Code);
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Proxy Error: Authorization parameter could not be extracted from URL matrix query keys.' 
      });
    }

    // 3. Construct a standard form-urlencoded payload string package
    const bodyParams = `grant_type=authorization_code&client_id=52277&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent('https://brojo-d2-weapons-stats.vercel.app')}`;

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

    // 4. Dispatch the secure server connection query
    const bungieRequest = https.request(options, (bungieRes) => {
      let chunks = [];
      bungieRes.on('data', (chunk) => { chunks.push(chunk); });
      bungieRes.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString();
        try {
          // Pass the literal message object data cleanly back to the client app interface
          const parsedData = JSON.parse(responseBody);
          res.status(bungieRes.statusCode).json(parsedData);
        } catch (parseError) {
          res.status(500).json({ error: 'Serialization Error', raw: responseBody });
        }
      });
    });

    bungieRequest.on('error', (requestError) => {
      res.status(500).json({ error: 'Gateway Exception', message: requestError.message });
    });

    bungieRequest.write(bodyParams);
    bungieRequest.end();

  } catch (globalException) {
    res.status(500).json({ error: 'Internal Server Error Exception', debug: globalException.message });
  }
};
