/**
 * Secure Vercel Serverless Cron Sync Endpoint
 * Triggers the automated dataset refresh engine.
 * Access is restricted to requests containing Vercel's Cron Secret Authorization header in production.
 */

import { sync } from '../scripts/sync-manifest.js';

export default async function handler(req, res) {
  // Enforce universal CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only GET requests are permitted.' });
  }

  try {
    // Enforce security check in production environments
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

      if (!authHeader || authHeader !== expectedToken) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Secure access token is missing or invalid. Action denied.' 
        });
      }
    }

    console.log('Initiating automated dataset refresh via cron...');
    const result = await sync();

    if (result.success) {
      return res.status(200).json({
        status: 'Success',
        message: 'Bungie D2 Manifest successfully synchronized and static snapshots updated.',
        summary: result.summary
      });
    } else {
      return res.status(500).json({
        status: 'Error',
        message: 'Synchronizer pipeline failed during execution.',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Unhandled exception inside cron sync endpoint:', error);
    return res.status(500).json({
      status: 'Fatal Error',
      message: 'An unhandled exception occurred in the cron sync handler.',
      error: error.message
    });
  }
}
