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

    // 2. Resolve redirect_uri dynamically based on active request host origin (req.headers.origin or window.location.origin)
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

    if (!redirectUri) {
      redirectUri = 'https://vercel.app';
    }

    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '52277',
      code: code,
      redirect_uri: redirectUri
    });

    // 3. Fire the secure POST call to Bungie with required headers
    const bungieResponse = await fetch('https://bungie.net', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': process.env.BUNGIE_API_KEY || process.env.VITE_BUNGIE_API_KEY || ''
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
    return res.status(500).json({ error: error.message, stack: error.stack, phase: 'Bungie API token request execution' });
  }
}
