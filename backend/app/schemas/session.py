from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class StudySessionCreate(BaseModel):
    subject: str
    room_id: Optional[int] = None
    topic_id: Optional[int] = None
    duration_seconds: int
    notes: Optional[str] = None
    started_at: datetime
    ended_at: datetime

class StudySessionResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    room_id: Optional[int]
    topic_id: Optional[int]
    duration_seconds: int
    xp_earned: int
    notes: Optional[str]
    started_at: datetime
    ended_at: datetime

    class Config:
        from_attributes = True

class BreakSessionCreate(BaseModel):
    duration_seconds: int
    break_type: Optional[str] = "eye-rest"
    started_at: datetime
    ended_at: datetime

class BreakSessionResponse(BaseModel):
    id: int
    user_id: int
    duration_seconds: int
    break_type: str
    started_at: datetime
    ended_at: datetime

    class Config:
        from_attributes = True
