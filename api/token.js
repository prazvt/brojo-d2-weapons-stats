import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 1. Enable CORS so our frontend can safely talk to this proxy
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const code = req.query.code || req.body.code;
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // 2. Build a strict URLSearchParams string body payload
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '52277',
      code: code,
      redirect_uri: 'https://vercel.app'
    });

    // 3. Fire the secure POST call to Bungie with required headers
    const bungieResponse = await fetch('https://bungie.net', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': process.env.VITE_BUNGIE_API_KEY || ''
      },
      body: bodyParams.toString()
    });

    const data = await bungieResponse.json();
    
    if (!bungieResponse.ok) {
      console.error('Bungie API Error Payload:', data);
      return res.status(bungieResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Server Exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
