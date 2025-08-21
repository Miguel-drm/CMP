# Deployment Guide

This guide covers deploying both the frontend (Netlify) and backend (Render) of the Caelven Music Player.

## 🚀 Frontend Deployment (Netlify)

### Option 1: Deploy via Netlify UI

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment config"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - **Build command**: `cd frontend && npm install && npm run build`
     - **Publish directory**: `frontend/dist`
     - **Base directory**: `frontend`

3. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

## 🔧 Backend Deployment (Render)

### Deploy to Render

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the repository containing your project

3. **Configure Service**
   - **Name**: `caelven-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**
   - Add in Render dashboard:
     ```
     NODE_ENV=production
     PORT=3001
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend

## 🔗 Connect Frontend to Backend

1. **Get your backend URL**
   - Render: `https://your-app-name.onrender.com`
   - The URL will be shown in your Render dashboard

2. **Update Frontend Environment**
   - In Netlify: Site settings > Environment variables
   - Add: `VITE_API_URL=https://your-backend-url.onrender.com`

3. **Redeploy Frontend**
   - Trigger a new deployment in Netlify

## 📋 Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_FRONTEND_URL=https://your-frontend-url.netlify.app
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
```

## 🧪 Testing Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

2. **Test Frontend**
   - Visit your Netlify URL
   - Check browser console for API calls

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './frontend/dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  # Note: Render automatically deploys on push to main branch
  # No additional action needed for backend deployment
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your frontend domain
   - Update backend CORS origin in production

2. **Environment Variables Not Loading**
   - Check variable names start with `VITE_` for frontend
   - Redeploy after adding environment variables

3. **Build Failures**
   - Check Node.js version compatibility (>=18.0.0)
   - Ensure all dependencies are in package.json

4. **Render Free Tier Limitations**
   - Free tier services sleep after 15 minutes of inactivity
   - First request after sleep may take 30-60 seconds
   - Consider upgrading to paid plan for production

### Debug Commands

```bash
# Test backend locally
cd backend && npm start

# Test frontend build
cd frontend && npm run build

# Check environment variables
echo $VITE_API_URL
```

## 📊 Monitoring

- **Netlify**: Built-in analytics and performance monitoring
- **Render**: Logs, metrics, and uptime monitoring in dashboard
- **Health Checks**: Backend health check at `/api/health`

## 💡 Render Tips

1. **Free Tier**: Services sleep after inactivity, first request may be slow
2. **Custom Domains**: Available on paid plans
3. **SSL**: Automatically provided by Render
4. **Logs**: Available in Render dashboard
5. **Auto-deploy**: Automatically deploys on push to main branch 