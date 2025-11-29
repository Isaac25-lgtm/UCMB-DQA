from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    level = Column(String, nullable=False)
    
    sessions = relationship("DqaSession", back_populates="facility")

class Indicator(Base):
    __tablename__ = "indicators"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    data_source = Column(String, nullable=False)
    
    lines = relationship("DqaLine", back_populates="indicator")

class DqaSession(Base):
    __tablename__ = "dqa_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    period = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    team = Column(String, nullable=False)
    comments = Column(String, nullable=True)
    
    facility = relationship("Facility", back_populates="sessions")
    lines = relationship("DqaLine", back_populates="session", cascade="all, delete-orphan")

class DqaLine(Base):
    __tablename__ = "dqa_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("dqa_sessions.id"), nullable=False)
    indicator_id = Column(Integer, ForeignKey("indicators.id"), nullable=False)
    recount_register = Column(Float, nullable=True)
    figure_105 = Column(Float, nullable=True)
    figure_dhis2 = Column(Float, nullable=True)
    dev_dhis2_vs_reg = Column(Float, nullable=True)
    dev_105_vs_reg = Column(Float, nullable=True)
    dev_105_vs_dhis2 = Column(Float, nullable=True)
    
    session = relationship("DqaSession", back_populates="lines")
    indicator = relationship("Indicator", back_populates="lines")

