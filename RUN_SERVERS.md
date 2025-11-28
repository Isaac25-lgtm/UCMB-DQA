# Running the DQA Application

## Python Location Found
Python 3.12.2 is installed at: `C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe`

## Starting the Servers

### Backend (FastAPI)
Open a terminal and run:
```powershell
cd backend
C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn main:app --reload
```

The backend will be available at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- API Endpoints: http://localhost:8000/facilities, /indicators, /sessions, etc.

### Frontend (React + Vite)
Open another terminal and run:
```powershell
cd frontend
npm run dev
```

The frontend will be available at: **http://localhost:5173**

## Quick Start (Both Servers)

**Terminal 1 - Backend:**
```powershell
cd C:\Users\USER\Downloads\fghjkl\backend
C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\USER\Downloads\fghjkl\frontend
npm run dev
```

## Access the Application

Once both servers are running:
- **Main Application**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

## Note

The database (`dqa.db`) will be created automatically in the `backend` folder when the backend server starts for the first time. Seed data (facilities and indicators) will be populated automatically.

