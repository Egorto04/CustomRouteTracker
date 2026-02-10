module.exports = function handler(req, res) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return res.status(500).json({
      error: 'Google Maps API key not configured. Set GOOGLE_MAPS_API_KEY in Vercel Environment Variables.'
    });
  }

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  res.status(200).json({ apiKey });
};
