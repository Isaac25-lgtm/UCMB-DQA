from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from typing import List
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from openpyxl.utils import get_column_letter

from database import engine, get_db, Base
from models import Facility, Indicator, DqaSession, DqaLine
from schemas import (
    Facility as FacilitySchema,
    Indicator as IndicatorSchema,
    DqaSessionCreate,
    DqaSessionResponse,
    DqaSessionSummary,
    DqaLineResponse
)
from crud import (
    get_facilities,
    get_indicators,
    get_facility,
    get_indicator_by_code,
    get_sessions,
    get_session,
    create_session,
    delete_session,
    get_dashboard_stats
)

app = FastAPI()

# CORS middleware
# Allow both localhost (development) and Render (production) origins
import os
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add any Render frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# For production, also allow common Render patterns
# This allows any *.onrender.com domain
allowed_origins.append("https://*.onrender.com")

# If no specific frontend URL is set, allow all origins (for easier setup)
# Remove this in production if you want stricter CORS
if not frontend_url and os.getenv("RENDER"):
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed data
def seed_data():
    db = next(get_db())
    try:
        # Check if facilities exist
        if db.query(Facility).count() == 0:
            facilities_data = [
                {"name": "Agoro Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Akworo Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Alero Health Centre III", "district": "Nwoya District", "level": "HC III"},
                {"name": "Amuru Lacor Health Centre III", "district": "Amuru District", "level": "HC III"},
                {"name": "Anaka General Hospital", "district": "Nwoya District", "level": "Hospital"},
                {"name": "Atiak Health Centre IV", "district": "Amuru District", "level": "HC IV"},
                {"name": "Awach Health Centre IV", "district": "Gulu District", "level": "HC IV"},
                {"name": "Awich Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Cwero Health Centre III", "district": "Gulu District", "level": "HC III"},
                {"name": "David Fagerlee's Medical Centre", "district": "Agago District", "level": "Medical Centre"},
                {"name": "Dr. Ambrosoli Memorial Hospital Kalongo", "district": "Agago District", "level": "Hospital"},
                {"name": "Kitgum General Hospital", "district": "Kitgum District", "level": "Hospital"},
                {"name": "Kitgum-Matidi Health Centre III", "district": "Kitgum District", "level": "HC III"},
                {"name": "Koch Goma Health Centre III", "district": "Nwoya District", "level": "HC III"},
                {"name": "Labongogali Health Centre III", "district": "Amuru District", "level": "HC III"},
                {"name": "Labworomor Health Centre III", "district": "Gulu District", "level": "HC III"},
                {"name": "Lacor Opit Health Centre III", "district": "Omoro District", "level": "HC III"},
                {"name": "Lacor-Pabbo Health Centre III", "district": "Amuru District", "level": "HC III"},
                {"name": "Lalogi Health Centre IV", "district": "Omoro District", "level": "HC IV"},
                {"name": "Lanenober Health Centre III", "district": "Omoro District", "level": "HC III"},
                {"name": "Layibi Techo Health Centre III", "district": "Gulu City", "level": "HC III"},
                {"name": "Lokung Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Madi-Opei Health Centre IV", "district": "Lamwo District", "level": "HC IV"},
                {"name": "Mary Queen Of Peace Health Centre III", "district": "Gulu City", "level": "HC III"},
                {"name": "Minakulu (Bobi) Health Centre II", "district": "Omoro District", "level": "HC II"},
                {"name": "Mucwini Health Centre III", "district": "Kitgum District", "level": "HC III"},
                {"name": "Namokora Health Centre IV", "district": "Kitgum District", "level": "HC IV"},
                {"name": "Odek Health Centre III", "district": "Omoro District", "level": "HC III"},
                {"name": "Ogonyo Health Centre III", "district": "Pader District", "level": "HC III"},
                {"name": "Okidi Health Centre III", "district": "Kitgum District", "level": "HC III"},
                {"name": "Okinga Health Centre III", "district": "Pader District", "level": "HC III"},
                {"name": "Pabbo Health Centre III", "district": "Amuru District", "level": "HC III"},
                {"name": "Pabwo Health Centre III", "district": "Gulu District", "level": "HC III"},
                {"name": "Pader Health Centre III", "district": "Pader District", "level": "HC III"},
                {"name": "Padibe Health Centre IV", "district": "Lamwo District", "level": "HC IV"},
                {"name": "Padibe West Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Paimol Health Centre III", "district": "Agago District", "level": "HC III"},
                {"name": "Pajule Health Centre IV", "district": "Pader District", "level": "HC IV"},
                {"name": "Palabek-Gem Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Palabek-Kal Health Centre IV", "district": "Lamwo District", "level": "HC IV"},
                {"name": "Paloga Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Paluda Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Patongo Health Centre IV", "district": "Agago District", "level": "HC IV"},
                {"name": "Puranga Health Centre III", "district": "Pader District", "level": "HC III"},
                {"name": "Purongo Health Centre III", "district": "Nwoya District", "level": "HC III"},
                {"name": "St. Joseph's Kitgum Hospital", "district": "Kitgum District", "level": "Hospital"},
                {"name": "St. Mary's Hospital Lacor", "district": "Gulu City", "level": "Hospital"},
                {"name": "St. Mauritz Health Centre III", "district": "Gulu City", "level": "HC III"},
                {"name": "St. Peter and Paul Health Centre III", "district": "Lamwo District", "level": "HC III"},
                {"name": "Todora Health Centre III", "district": "Nwoya District", "level": "HC III"},
            ]
            for fac_data in facilities_data:
                facility = Facility(**fac_data)
                db.add(facility)
        
        # Check if indicators exist
        if db.query(Indicator).count() == 0:
            indicators_data = [
                {"code": "AN01", "name": "ANC 1st contacts/visits (Total)", "data_source": "ANC register"},
                {"code": "AN02", "name": "ANC 4th contacts/visits for women", "data_source": "ANC register"},
                {"code": "AN11", "name": "Pregnant women receiving LLINs at 1st ANC visit", "data_source": "ANC register / LLIN section"},
                {"code": "PN01", "name": "Post-natal attendances at 6 days", "data_source": "PNC register"},
                {"code": "MA04", "name": "Total deliveries in unit", "data_source": "Maternity/delivery register"},
                {"code": "MA05a", "name": "Live births <2.5 kg", "data_source": "Maternity register"},
                {"code": "MA05b", "name": "Fresh stillbirths", "data_source": "Maternity register"},
                {"code": "MA05c", "name": "Macerated stillbirths", "data_source": "Maternity register"},
                {"code": "MA12", "name": "Newborn deaths 0–7 days", "data_source": "Maternity/newborn register"},
                {"code": "MA13", "name": "Maternal deaths", "data_source": "Maternity register + death register"},
                {"code": "MA14", "name": "Mothers who initiated breastfeeding within 1st hour after delivery", "data_source": "Maternity register"},
                {"code": "MA23", "name": "Babies with birth asphyxia", "data_source": "Maternity/newborn register"},
                {"code": "MA24", "name": "Babies successfully resuscitated", "data_source": "Maternity/newborn register"},
                {"code": "MA08", "name": "LBW babies <2.5 kg initiated on KMC", "data_source": "KMC register / maternity register"},
                {"code": "MA22", "name": "HIV-exposed infants given ARV prophylaxis", "data_source": "Maternity register + HEI/HIV register"},
            ]
            for ind_data in indicators_data:
                indicator = Indicator(**ind_data)
                db.add(indicator)
        
        db.commit()
    finally:
        db.close()

# Run seed on startup
seed_data()

def calculate_deviations(recount_register, figure_105, figure_dhis2):
    """Calculate deviation percentages"""
    dev_dhis2_vs_reg = None
    dev_105_vs_reg = None
    dev_105_vs_dhis2 = None
    
    if recount_register not in (None, 0):
        if figure_dhis2 is not None:
            dev_dhis2_vs_reg = (figure_dhis2 - recount_register) / recount_register
        if figure_105 is not None:
            dev_105_vs_reg = (figure_105 - recount_register) / recount_register
    
    if figure_dhis2 not in (None, 0) and figure_105 is not None:
        dev_105_vs_dhis2 = (figure_105 - figure_dhis2) / figure_dhis2
    
    return dev_dhis2_vs_reg, dev_105_vs_reg, dev_105_vs_dhis2

@app.get("/facilities", response_model=List[FacilitySchema])
def list_facilities(db: Session = Depends(get_db)):
    return get_facilities(db)

@app.get("/indicators", response_model=List[IndicatorSchema])
def list_indicators(db: Session = Depends(get_db)):
    return get_indicators(db)

@app.get("/teams")
def get_teams():
    """Get list of teams with their members"""
    return {
        "Team A": ["Biostat Gulu District", "Biostat Nwoya", "Biostat Amuru"],
        "Team B": ["Biostat Pader", "Biostat Omoro", "Biostat Lacor"],
        "Team C": ["Biostat Gulu City", "Biostat Lamwo", "Biostat Agago"],
        "Team D": ["Biostat Kitgum", "Biostat Gulu RRH", "Abalo Jenda (UCMB Staff)"]
    }

@app.get("/sessions", response_model=List[DqaSessionSummary])
def list_sessions(db: Session = Depends(get_db)):
    sessions = get_sessions(db)
    return sessions

@app.get("/dashboard/stats")
def get_dashboard_stats_endpoint(db: Session = Depends(get_db)):
    """Get dashboard statistics for graphs"""
    return get_dashboard_stats(db)

@app.get("/sessions/{session_id}", response_model=DqaSessionResponse)
def get_session_detail(session_id: int, db: Session = Depends(get_db)):
    session = get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.delete("/sessions/{session_id}")
def delete_dqa_session(session_id: int, db: Session = Depends(get_db)):
    """Delete a DQA session"""
    result = delete_session(db, session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}

@app.post("/sessions", response_model=DqaSessionResponse)
def create_dqa_session(session_data: DqaSessionCreate, db: Session = Depends(get_db)):
    # Verify facility exists
    facility = get_facility(db, session_data.facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    # Prepare session data
    session_dict = {
        "facility_id": session_data.facility_id,
        "period": session_data.period,
        "team": session_data.team
    }
    
    # Prepare lines with calculated deviations
    lines_list = []
    for line in session_data.lines:
        # Verify indicator exists
        indicator = db.query(Indicator).filter(Indicator.id == line.indicator_id).first()
        if not indicator:
            raise HTTPException(status_code=404, detail=f"Indicator {line.indicator_id} not found")
        
        dev_dhis2_vs_reg, dev_105_vs_reg, dev_105_vs_dhis2 = calculate_deviations(
            line.recount_register, line.figure_105, line.figure_dhis2
        )
        
        lines_list.append({
            "indicator_id": line.indicator_id,
            "recount_register": line.recount_register,
            "figure_105": line.figure_105,
            "figure_dhis2": line.figure_dhis2,
            "dev_dhis2_vs_reg": dev_dhis2_vs_reg,
            "dev_105_vs_reg": dev_105_vs_reg,
            "dev_105_vs_dhis2": dev_105_vs_dhis2
        })
    
    session = create_session(db, session_dict, lines_list)
    return session

@app.get("/export")
def export_csv(db: Session = Depends(get_db)):
    """Export all DQA lines as Excel with color-coded percentage deviations"""
    lines = db.query(DqaLine).join(DqaSession).join(Facility).join(Indicator).all()
    
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "DQA Data"
    
    # Define colors
    green_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
    yellow_fill = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
    red_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
    gray_fill = PatternFill(start_color="E0E0E0", end_color="E0E0E0", fill_type="solid")
    
    # Header row
    headers = [
        "district", "facility", "period", "indicator_code", "indicator_name",
        "recount_register", "figure_105", "figure_dhis2",
        "dev_dhis2_vs_reg", "dev_105_vs_reg", "dev_105_vs_dhis2"
    ]
    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = Font(bold=True)
    
    # Deviation column indices (1-based, so 9, 10, 11)
    dev_cols = [9, 10, 11]
    
    # Data rows
    for row_idx, line in enumerate(lines, start=2):
        row_data = [
            line.session.facility.district,
            line.session.facility.name,
            line.session.period,
            line.indicator.code,
            line.indicator.name,
            line.recount_register,
            line.figure_105,
            line.figure_dhis2,
            line.dev_dhis2_vs_reg,
            line.dev_105_vs_reg,
            line.dev_105_vs_dhis2
        ]
        
        for col_idx, value in enumerate(row_data, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            
            # Format deviation columns as percentages and color code
            if col_idx in dev_cols:
                if value is not None:
                    # Set as percentage
                    cell.value = value
                    cell.number_format = '0.0%'
                    
                    # Color code based on absolute deviation
                    abs_dev = abs(value)
                    if abs_dev <= 0.05:  # ≤ 5%
                        cell.fill = green_fill
                    elif abs_dev <= 0.10:  # 5-10%
                        cell.fill = yellow_fill
                    else:  # > 10%
                        cell.fill = red_fill
                else:
                    # Empty cell for null values
                    cell.value = ""
                    cell.fill = gray_fill
    
    # Auto-adjust column widths
    for col_idx in range(1, len(headers) + 1):
        column_letter = get_column_letter(col_idx)
        ws.column_dimensions[column_letter].width = 15
    
    # Save to BytesIO
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=dqa_export.xlsx"}
    )

@app.post("/sessions/upload-csv")
def upload_csv(
    file: UploadFile = File(...),
    team: str = Form(None),
    db: Session = Depends(get_db)
):
    """Upload CSV file and create session(s)
    
    Args:
        file: CSV file to upload
        team: Team name to assign the uploaded data to (optional, defaults to 'csv_upload')
    """
    content = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(content))
    
    # Group by facility + district + period to create sessions
    sessions_dict = {}
    
    for row in csv_reader:
        facility_name = row.get("facility", "").strip()
        district = row.get("district", "").strip()
        period = row.get("period", "").strip()
        indicator_code = row.get("indicator_code", "").strip()
        
        # Find facility
        facility = db.query(Facility).filter(
            Facility.name == facility_name,
            Facility.district == district
        ).first()
        
        if not facility:
            raise HTTPException(
                status_code=400,
                detail=f"Facility '{facility_name}' in district '{district}' not found"
            )
        
        # Find indicator
        indicator = get_indicator_by_code(db, indicator_code)
        if not indicator:
            raise HTTPException(
                status_code=400,
                detail=f"Indicator code '{indicator_code}' not found"
            )
        
        # Group key
        key = (facility.id, period)
        
        if key not in sessions_dict:
            # Use the team parameter from the form, or from CSV row, or default
            assigned_team = team or row.get("team", "").strip() or "csv_upload"
            sessions_dict[key] = {
                "facility_id": facility.id,
                "period": period,
                "team": assigned_team,
                "lines": []
            }
        
        # Parse values
        recount_register = float(row.get("recount_register", "")) if row.get("recount_register", "").strip() else None
        figure_105 = float(row.get("figure_105", "")) if row.get("figure_105", "").strip() else None
        figure_dhis2 = float(row.get("figure_dhis2", "")) if row.get("figure_dhis2", "").strip() else None
        
        # Calculate deviations
        dev_dhis2_vs_reg, dev_105_vs_reg, dev_105_vs_dhis2 = calculate_deviations(
            recount_register, figure_105, figure_dhis2
        )
        
        sessions_dict[key]["lines"].append({
            "indicator_id": indicator.id,
            "recount_register": recount_register,
            "figure_105": figure_105,
            "figure_dhis2": figure_dhis2,
            "dev_dhis2_vs_reg": dev_dhis2_vs_reg,
            "dev_105_vs_reg": dev_105_vs_reg,
            "dev_105_vs_dhis2": dev_105_vs_dhis2
        })
    
    # Create sessions
    created_sessions = []
    for session_data in sessions_dict.values():
        session = create_session(db, {
            "facility_id": session_data["facility_id"],
            "period": session_data["period"],
            "team": session_data["team"]
        }, session_data["lines"])
        created_sessions.append(session)
    
    return {"message": f"Created {len(created_sessions)} session(s)", "sessions": [s.id for s in created_sessions]}

