# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up or log in with your account

## Step 2: Create a New Cluster
1. Click **"Build a Database"**
2. Choose **"FREE"** tier (M0 Sandbox)
3. Select your cloud provider and region (choose closest to you)
4. Name your cluster (e.g., `climate-ai-cluster`)
5. Click **"Create Cluster"**

## Step 3: Create Database User
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `climateai-user`) and a strong password
5. Set **"Built-in Role"** to **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development/testing:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, add specific IP addresses only
4. Click **"Confirm"**

## Step 5: Get Connection String
1. Go back to **"Database"** (Databases tab)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 4.1 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your actual credentials
7. Add your database name after `mongodb.net/`, e.g.:
   ```
   mongodb+srv://climateai-user:yourpassword@cluster.mongodb.net/climateai?retryWrites=true&w=majority
   ```

## Step 6: Add Connection String to GitHub Secrets
1. Go to your GitHub repo: `https://github.com/Kousthub28/Climate-ai/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add:
   - **Name**: `MONGODB_URI`
   - **Value**: Your full connection string from Step 5
4. Click **"Add secret"**

## Step 7: Add Google API Key to GitHub Secrets
1. In the same GitHub secrets page
2. Click **"New repository secret"**
3. Add:
   - **Name**: `GOOGLE_API_KEY`
   - **Value**: Your Google API key
4. Click **"Add secret"**

## Step 8: Create Local .env Files
For local development, create `.env` files (these are already in .gitignore):

### Backend (.env in `climate-ai-app/backend/`)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/climateai?retryWrites=true&w=majority
GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=your_random_secret_here
PORT=5000
```

### Root directory (.env in project root)
```env
GOOGLE_API_KEY=your_google_api_key_here
```

## Step 9: Test Connection
Run your backend server locally:
```bash
cd climate-ai-app/backend
npm install
node server.js
```

You should see: `MongoDB connected successfully`

## Additional GitHub Secrets Needed

Add these secrets to GitHub if you're using these services:

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `NETLIFY_AUTH_TOKEN` | Netlify deploy token | Netlify User Settings > Applications |
| `NETLIFY_SITE_ID` | Your Netlify site ID | Netlify Site Settings |
| `VITE_API_URL` | Backend API URL for frontend | e.g., `https://your-backend.com/api` |
| `JWT_SECRET` | Secret for JWT tokens | Generate random string |
| `OPENWEATHER_API_KEY` | OpenWeather API key | openweathermap.org |
| `IBM_WATSONX_API_KEY` | IBM Watson X key | IBM Cloud |
| `IBM_WATSONX_PROJECT_ID` | IBM project ID | IBM Cloud |

## Security Best Practices
✅ **DO:**
- Use strong passwords
- Rotate credentials regularly
- Use environment-specific connection strings
- Restrict IP addresses in production
- Never commit `.env` files

❌ **DON'T:**
- Commit API keys or passwords to Git
- Share credentials in chat/email
- Use the same password for multiple services
- Leave "Allow Access from Anywhere" in production

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in MongoDB Atlas
- Verify network access settings

### Authentication Failed
- Double-check username and password
- Ensure special characters in password are URL-encoded

### Database Not Found
- Ensure database name is in the connection string
- MongoDB creates databases automatically when first used

## Resources
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
