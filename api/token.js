export default async function handler(request, response) {
  // Support CORS if needed (though on same domain, it is direct)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, redirect_uri } = request.body || {};
    if (!code) {
      return response.status(400).json({ error: 'Missing code parameter' });
    }

    const BUNGIE_CLIENT_ID = process.env.VITE_BUNGIE_CLIENT_ID || process.env.BUNGIE_CLIENT_ID || '52277';
    const BUNGIE_API_KEY = process.env.VITE_BUNGIE_API_KEY || process.env.BUNGIE_API_KEY || 'ed248174f8f34940bf2df8c6ed61cff1';

    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'authorization_code');
    bodyParams.append('client_id', BUNGIE_CLIENT_ID);
    bodyParams.append('code', code);
    if (redirect_uri) {
      bodyParams.append('redirect_uri', redirect_uri);
    }

    console.log("Proxying token exchange request to Bungie for client_id:", BUNGIE_CLIENT_ID);

    const bungieResponse = await fetch('https://www.bungie.net/Platform/App/OAuth/Token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_API_KEY
      },
      body: bodyParams.toString()
    });

    const data = await bungieResponse.json();
    return response.status(bungieResponse.status).json(data);
  } catch (error) {
    console.error('Error in token proxy:', error);
    return response.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
