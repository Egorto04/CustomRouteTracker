require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------
// Security Middleware
// ------------------------------------

// Helmet sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://maps.googleapis.com",
        "https://maps.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://*.googleapis.com",
        "https://*.gstatic.com",
        "https://*.google.com",
        "https://*.googleusercontent.com"
      ],
      connectSrc: [
        "'self'",
        "https://maps.googleapis.com",
        "https://routes.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      frameSrc: [
        "https://www.google.com",
        "https://maps.google.com"
      ]
    }
  }
}));

// CORS – restrict to your domain in production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Rate limiting – prevent abuse of your API key
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);
app.use(express.json());

// ------------------------------------
// Serve static frontend files
// ------------------------------------
app.use(express.static(path.join(__dirname, '..', 'public')));

// ------------------------------------
// API Endpoint: Provide the Maps API key to the frontend
// This way the key is NEVER in client-side source code.
// The key is loaded server-side from .env and served only
// to your own frontend via this endpoint.
// ------------------------------------
app.get('/api/maps-config', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return res.status(500).json({
      error: 'Google Maps API key not configured. Set GOOGLE_MAPS_API_KEY in .env'
    });
  }
  res.json({ apiKey });
});

// ------------------------------------
// Health check for monitoring/uptime
// ------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------
// Catch-all: serve index.html for SPA-like behavior
// ------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ------------------------------------
// Start server
// ------------------------------------
app.listen(PORT, () => {
  console.log(`\n🗺️  Custom Route Timer running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Key configured: ${process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' ? '✅ Yes' : '❌ No – set GOOGLE_MAPS_API_KEY in .env'}\n`);
});
