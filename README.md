# DQA Tool for MNH (Maternal and Newborn Health)

A full-stack web application for Data Quality Assurance assessments.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + TypeScript + Vite + TailwindCSS

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Features

- **Online Assessment Form**: Create new DQA sessions with facility and indicator data
- **UCMB Dashboard**: View all sessions with summary statistics
- **Excel Export**: Download all data as Excel with color-coded percentage deviations
- **Enhanced Reports**: Generate multi-sheet Excel reports with embedded charts, summaries, and AI-generated insights (optional)
- **CSV Upload**: Upload offline-filled CSV data (only requires: facility, district, period, indicator_code, recount_register, figure_105, figure_dhis2)
- **Automatic Calculations**: Deviations are automatically calculated from uploaded data
- **Deviation Analysis**: Automatic calculation and color-coding of deviations:
  - Green: ≤ 5%
  - Amber: 5-10%
  - Red: > 10%

## Database

The SQLite database (`dqa.db`) is automatically created on first run. Seed data includes:
- 8 facilities across 4 districts (Lamwo, Nwoya, Gulu, Pader)
- MNH indicators focused on maternity and newborn outcomes (e.g., MA04, MA05a, MA05b, MA05c, MA12, MA13, MA14, MA23, MA24, MA08).

## API Endpoints

- `GET /facilities` - List all facilities
- `GET /indicators` - List all indicators
- `GET /teams` - List all teams with members
- `GET /sessions` - List all sessions with summaries
- `GET /sessions/{id}` - Get session details
- `POST /sessions` - Create a new session
- `GET /export` - Download all data as Excel (with color-coded deviations)
- `GET /reports/enhanced` - Generate enhanced Excel report with charts, summaries, and AI insights
- `POST /sessions/upload-csv` - Upload CSV file (with team assignment)
- `GET /dashboard/stats` - Get dashboard statistics for graphs

## Deployment

This application is ready for deployment on Render. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Render

1. Push code to GitHub (already done ✅)
2. Go to https://dashboard.render.com
3. Create a new Web Service for the backend
4. Create a new Static Site for the frontend
5. Follow the instructions in [DEPLOYMENT.md](DEPLOYMENT.md)

The repository includes:
- `render.yaml` - Render configuration file
- `DEPLOYMENT.md` - Step-by-step deployment guide
- Production-ready CORS settings
- Environment variable support

