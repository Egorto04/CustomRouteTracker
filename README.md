# Custom Route Timer 🗺️

A Google Maps-based web app that lets you draw a custom route and shows a **live countdown timer** for travel time — unlike standard map apps that only show the recommended route.

## Quick Start

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Places API**
4. Go to **APIs & Services → Credentials → Create Credentials → API Key**
5. Copy the key

### 2. Restrict Your API Key (IMPORTANT for security)

In the Google Cloud Console, click on your API key and set:

#### Application Restrictions
- Choose **"HTTP referrers (websites)"**
- Add your allowed domains:
  ```
  http://localhost:3000/*          ← for development
  https://yourdomain.com/*        ← for production
  ```

#### API Restrictions
- Choose **"Restrict key"**
- Select only:
  - Maps JavaScript API
  - Directions API
  - Places API

### 3. Configure & Run

```bash
# Install dependencies
npm install

# Set your API key
# Edit the .env file and replace YOUR_API_KEY_HERE with your actual key
nano .env

# Start the server
npm start
```

Open `http://localhost:3000` in your browser.

### 4. How to Find Your IP (for additional restrictions)

```bash
# Your public IP:
curl ifconfig.me

# Or visit: https://whatismyip.com
```

You can add IP restrictions in Google Cloud Console under your API key settings if you want server-side IP locking (useful for backend-only keys).

---

## Deployment Guide

### Option A: Deploy to Railway (Easiest — Free Tier)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Add environment variable: `GOOGLE_MAPS_API_KEY` = your key
5. Add environment variable: `ALLOWED_ORIGINS` = `https://your-railway-url.up.railway.app`
6. Railway gives you a URL automatically

### Option B: Deploy to Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new **Web Service** → connect your repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables in the dashboard

### Option C: Deploy to a VPS (DigitalOcean / Hetzner)

```bash
# On your server:
git clone <your-repo>
cd MapProject
npm install
cp .env.example .env
nano .env  # set your API key and ALLOWED_ORIGINS
npm start
```

Use **PM2** to keep it running:
```bash
npm install -g pm2
pm2 start server/index.js --name route-timer
pm2 save
pm2 startup
```

Use **Nginx** as a reverse proxy + free SSL with Let's Encrypt:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Buying a Domain

### Recommended Registrars

| Registrar | Price Range | Notes |
|-----------|-------------|-------|
| [Namecheap](https://namecheap.com) | $8-12/yr | Great UI, free WhoisGuard |
| [Cloudflare Registrar](https://dash.cloudflare.com) | At-cost pricing | Cheapest renewals, no markup |
| [Porkbun](https://porkbun.com) | $7-10/yr | Low cost, good interface |
| [Google Domains → Squarespace](https://domains.squarespace.com) | $12/yr | Simple integration |

### Steps:
1. Search for your desired domain name
2. Purchase it (~$10/year for `.com`)
3. Point DNS to your hosting provider:
   - **Railway/Render**: Add a CNAME record pointing to their URL
   - **VPS**: Add an A record pointing to your server IP
4. Update `ALLOWED_ORIGINS` in `.env` to your domain
5. Update Google Maps API key HTTP referrer restrictions

---

## Project Structure

```
MapProject/
├── .env                 ← Your API key (NEVER commit this)
├── .env.example         ← Template for other developers
├── .gitignore           ← Keeps .env out of git
├── package.json         ← Dependencies
├── server/
│   └── index.js         ← Express server (security, API key proxy)
├── public/
│   └── index.html       ← Frontend app
└── index.html           ← (old file — can be deleted)
```

## Security Checklist

- [x] API key stored in `.env`, never in frontend source
- [x] `.gitignore` excludes `.env`
- [x] Helmet.js security headers
- [x] CORS origin restriction
- [x] Rate limiting (100 req / 15 min per IP)
- [x] Content Security Policy
- [ ] Set HTTP referrer restrictions on your Google API key
- [ ] Set API restrictions to only required APIs
- [ ] Use HTTPS in production
