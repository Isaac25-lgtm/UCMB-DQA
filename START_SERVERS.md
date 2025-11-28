# How to Start the Servers

## Backend (FastAPI)

**Note:** Python needs to be installed first. If you don't have Python installed:

1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"

Then run:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run at: **http://localhost:8000**

## Frontend (React + Vite)

The frontend is already starting! It will be available at: **http://localhost:5173**

If you need to start it manually:

```bash
cd frontend
npm install
npm run dev
```

## Access the Application

Once both servers are running:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

- If the frontend can't connect to the backend, make sure the backend is running on port 8000
- Check that CORS is enabled in the backend (it should be by default)
- The database (`dqa.db`) will be created automatically when the backend starts

