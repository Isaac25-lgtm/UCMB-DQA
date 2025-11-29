from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FacilityBase(BaseModel):
    name: str
    district: str
    level: str

class Facility(FacilityBase):
    id: int
    
    class Config:
        from_attributes = True

class IndicatorBase(BaseModel):
    code: str
    name: str
    data_source: str

class Indicator(IndicatorBase):
    id: int
    
    class Config:
        from_attributes = True

class DqaLineCreate(BaseModel):
    indicator_id: int
    recount_register: Optional[float] = None
    figure_105: Optional[float] = None
    figure_dhis2: Optional[float] = None

class DqaLineResponse(BaseModel):
    id: int
    indicator_id: int
    recount_register: Optional[float]
    figure_105: Optional[float]
    figure_dhis2: Optional[float]
    dev_dhis2_vs_reg: Optional[float]
    dev_105_vs_reg: Optional[float]
    dev_105_vs_dhis2: Optional[float]
    indicator: Indicator
    
    class Config:
        from_attributes = True

class DqaSessionCreate(BaseModel):
    facility_id: int
    period: str
    team: str
    lines: List[DqaLineCreate]

class DqaSessionResponse(BaseModel):
    id: int
    facility_id: int
    period: str
    created_at: datetime
    team: Optional[str]
    facility: Facility
    lines: List[DqaLineResponse]
    
    class Config:
        from_attributes = True

class DqaSessionSummary(BaseModel):
    id: int
    facility_id: int
    period: str
    created_at: datetime
    team: Optional[str]
    facility_name: str
    district: str
    line_count: int
    red_count: int
    amber_count: int
    
    class Config:
        from_attributes = True

