# Deployment Guide for Render

This guide will help you deploy the DQA Tool to Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)
3. Your code pushed to GitHub

## Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: DQA Tool for MNH"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/Isaac25-lgtm/UCMB-DQA.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Isaac25-lgtm/UCMB-DQA`
4. Configure the backend service:
   - **Name**: `dqa-backend` (or any name you prefer)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty (or set to `backend` if you prefer)
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Copy the service URL (e.g., `https://dqa-backend.onrender.com`)

### 3. Update Frontend API URL

After the backend is deployed, update the frontend to use the production API:

1. In Render dashboard, go to your frontend service (or create it)
2. Add environment variable:
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://dqa-backend.onrender.com` (your backend URL)

Or update `frontend/src/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
```

### 4. Deploy Frontend on Render

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `dqa-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add environment variable:
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://dqa-backend.onrender.com`
5. Click "Create Static Site"

### 5. Update Backend CORS

Update `backend/main.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dqa-frontend.onrender.com",  # Add your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6. Database Considerations

- The SQLite database (`dqa.db`) will be created automatically on first run
- For production, consider using PostgreSQL (Render provides free PostgreSQL)
- To use PostgreSQL, update `backend/database.py`:

```python
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dqa.db")
# If DATABASE_URL starts with postgres://, use PostgreSQL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
```

## Environment Variables

### Backend
- `PORT`: Automatically set by Render
- `DATABASE_URL`: Optional (defaults to SQLite)

### Frontend
- `VITE_API_BASE`: Your backend URL (e.g., `https://dqa-backend.onrender.com`)

## Troubleshooting

1. **Backend not starting**: Check logs in Render dashboard
2. **CORS errors**: Ensure frontend URL is in `allow_origins` list
3. **Database issues**: Check that database file has write permissions
4. **Build failures**: Check that all dependencies are in `requirements.txt` and `package.json`

## Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain and follow DNS configuration instructions

