from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Facility, Indicator, DqaSession, DqaLine

def get_facilities(db: Session):
    return db.query(Facility).all()

def get_indicators(db: Session):
    return db.query(Indicator).all()

def get_facility(db: Session, facility_id: int):
    return db.query(Facility).filter(Facility.id == facility_id).first()

def get_indicator(db: Session, indicator_id: int):
    return db.query(Indicator).filter(Indicator.id == indicator_id).first()

def get_indicator_by_code(db: Session, code: str):
    return db.query(Indicator).filter(Indicator.code == code).first()

def get_sessions(db: Session):
    sessions = db.query(DqaSession).all()
    result = []
    for session in sessions:
        line_count = len(session.lines)
        red_count = 0
        amber_count = 0
        
        for line in session.lines:
            if line.dev_dhis2_vs_reg is not None:
                abs_dev = abs(line.dev_dhis2_vs_reg)
                if abs_dev > 0.10:
                    red_count += 1
                elif abs_dev > 0.05:
                    amber_count += 1
        
        result.append({
            "id": session.id,
            "facility_id": session.facility_id,
            "period": session.period,
            "created_at": session.created_at,
            "team": session.team,
            "facility_name": session.facility.name,
            "district": session.facility.district,
            "line_count": line_count,
            "red_count": red_count,
            "amber_count": amber_count
        })
    return result

def get_session(db: Session, session_id: int):
    return db.query(DqaSession).filter(DqaSession.id == session_id).first()

def create_session(db: Session, session_data: dict, lines_data: list):
    session = DqaSession(**session_data)
    db.add(session)
    db.flush()
    
    for line_data in lines_data:
        line = DqaLine(session_id=session.id, **line_data)
        db.add(line)
    
    db.commit()
    db.refresh(session)
    return session

def get_dashboard_stats(db: Session):
    """Get statistics for dashboard graphs"""
    total_facilities = db.query(Facility).count()
    total_sessions = db.query(DqaSession).count()
    
    # Get unique facilities that have been assessed (have at least one session)
    assessed_facilities = db.query(DqaSession.facility_id).distinct().count()
    
    # Get progress by team
    team_stats = db.query(
        DqaSession.team,
        func.count(func.distinct(DqaSession.facility_id)).label('facilities_assessed')
    ).group_by(DqaSession.team).all()
    
    team_progress = [
        {"team": team or "Unknown", "facilities_assessed": count}
        for team, count in team_stats
    ]
    
    return {
        "total_facilities": total_facilities,
        "assessed_facilities": assessed_facilities,
        "total_sessions": total_sessions,
        "team_progress": team_progress
    }

