# Backend Deployment Guide

## Options for Deploying Node.js Backend

Your backend needs to be deployed to a hosting service. Here are the best free/low-cost options:

---

## Option 1: Render (Recommended - Free Tier)

### Steps:
1. Go to [Render](https://render.com/) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select `Climate-ai` repository
4. Configure:
   - **Name**: `climate-ai-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `climate-ai-app/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Random secret string
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://climate-ai-nodejs.netlify.app`
   - Add all other API keys from `.env.example`
6. Click **"Create Web Service"**
7. Copy your deployed URL (e.g., `https://climate-ai-backend.onrender.com`)

---

## Option 2: Railway (Free Tier)

### Steps:
1. Go to [Railway](https://railway.app/) and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `Climate-ai` repository
4. Configure:
   - **Root Directory**: `climate-ai-app/backend`
   - Add environment variables (same as Render)
5. Railway will auto-deploy
6. Get your deployment URL from the dashboard

---

## Option 3: Heroku (Paid - $5/month minimum)

### Steps:
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app:
   ```bash
   cd climate-ai-app/backend
   heroku create climate-ai-backend
   ```
4. Add MongoDB addon or use Atlas
5. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_connection_string"
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set FRONTEND_URL="https://climate-ai-nodejs.netlify.app"
   ```
6. Deploy:
   ```bash
   git subtree push --prefix climate-ai-app/backend heroku main
   ```

---

## After Backend Deployment

### Step 1: Update GitHub Secrets
Go to: `https://github.com/Kousthub28/Climate-ai/settings/secrets/actions`

Add/Update:
| Secret Name | Value |
|-------------|-------|
| `VITE_API_URL` | Your backend URL + `/api` (e.g., `https://climate-ai-backend.onrender.com/api`) |

### Step 2: Redeploy Frontend
Push any change to trigger redeployment:
```bash
git commit --allow-empty -m "Update backend URL"
git push origin main
```

Or manually redeploy on Netlify dashboard.

### Step 3: Test Your App
1. Go to: `https://climate-ai-nodejs.netlify.app`
2. Try registering a new account
3. Check browser console for errors

---

## Quick Start with Render (Easiest)

1. **Deploy Backend on Render** (5 minutes)
   - Sign up at render.com
   - Connect GitHub repo
   - Set root directory: `climate-ai-app/backend`
   - Add environment variables
   - Deploy

2. **Copy Backend URL** (e.g., `https://climate-ai-backend.onrender.com`)

3. **Add to GitHub Secrets**
   - Go to repo settings → Secrets → Actions
   - Add `VITE_API_URL` = `https://climate-ai-backend.onrender.com/api`

4. **Push to Trigger Redeploy**
   ```bash
   git commit --allow-empty -m "Connect to backend"
   git push origin main
   ```

5. **Done!** Your app should work now.

---

## Backend Environment Variables Checklist

Make sure to add these to your backend hosting service:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_random_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://climate-ai-nodejs.netlify.app

# API Keys (if using these services)
OPENWEATHER_API_KEY=...
TOMORROW_API_KEY=...
CLIMATIQ_API_KEY=...
CARBON_INTERFACE_API_KEY=...
IBM_WATSONX_API_KEY=...
IBM_WATSONX_PROJECT_ID=...
GOOGLE_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend env variables
- Check backend CORS configuration in `server.js`

### 404 Errors on API Routes
- Verify backend is running: visit `https://your-backend-url.com/api/health`
- Check root directory is set to `climate-ai-app/backend`

### Database Connection Errors
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)

### Backend Crashes on Startup
- Check logs in your hosting dashboard
- Verify all required environment variables are set
- Ensure `package.json` has correct start script

---

## Free Tier Limitations

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| Render | 750 hours/month | Sleeps after 15 min inactivity (30s cold start) |
| Railway | $5 credit/month | ~500 hours of uptime |
| Heroku | Paid only | $5/month minimum (eco dynos) |

**Recommendation**: Use Render for free deployment. Upgrade if you need always-on service.
