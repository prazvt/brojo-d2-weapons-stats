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
    // Safely parse request.body regardless of content-type parsing by environment middleware
    let reqBody = request.body;
    if (typeof reqBody === 'string') {
      try {
        reqBody = JSON.parse(reqBody);
      } catch (e) {
        console.error('Failed to parse request body string as JSON:', e);
      }
    }

    const { code, redirect_uri } = reqBody || {};
    if (!code) {
      return response.status(400).json({ error: 'Missing code parameter' });
    }

    const BUNGIE_CLIENT_ID = process.env.VITE_BUNGIE_CLIENT_ID || process.env.BUNGIE_CLIENT_ID || '52277';
    const BUNGIE_API_KEY = process.env.VITE_BUNGIE_API_KEY || process.env.BUNGIE_API_KEY || 'ed248174f8f34940bf2df8c6ed61cff1';

    // 1. Structure the payload explicitly as form-urlencoded data with exactly 4 parameters
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'authorization_code');
    bodyParams.append('client_id', BUNGIE_CLIENT_ID);
    bodyParams.append('code', code);
    bodyParams.append('redirect_uri', redirect_uri || 'https://vercel.app');

    console.log("Proxying token exchange request to Bungie for client_id:", BUNGIE_CLIENT_ID);
    console.log("Payload keys being sent to Bungie:", Array.from(bodyParams.keys()));

    // 2. Fetch call with 'Content-Type': 'application/x-www-form-urlencoded' and API Key header
    const bungieResponse = await fetch('https://www.bungie.net/Platform/App/OAuth/Token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': BUNGIE_API_KEY
      },
      body: bodyParams.toString()
    });

    // 3. Error catch block inside api/token.js that logs detailed text message response from Bungie's endpoint to Vercel logs if it fails
    if (!bungieResponse.ok) {
      const errorText = await bungieResponse.text();
      console.error("Bungie OAuth token exchange failed. HTTP Status:", bungieResponse.status);
      console.error("Bungie error response payload:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        return response.status(bungieResponse.status).json(errorJson);
      } catch (parseError) {
        return response.status(bungieResponse.status).json({
          error: 'Bungie Token Exchange Error',
          status: bungieResponse.status,
          message: errorText
        });
      }
    }

    const data = await bungieResponse.json();
    return response.status(bungieResponse.status).json(data);
  } catch (error) {
    console.error('Error in token proxy serverless function:', error);
    return response.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
