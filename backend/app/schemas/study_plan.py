from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class StudyTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    day: Optional[str] = None          # e.g. "Monday" — from AI weekly plan
    day_offset: Optional[int] = None   # 0=Mon … 6=Sun
    scheduled_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    estimated_minutes: Optional[int] = 45
    priority: Optional[str] = "medium"
    room_id: Optional[int] = None
    study_plan_id: Optional[int] = None

class StudyTaskCreate(StudyTaskBase):
    pass

class StudyTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None

class StudyTaskResponse(StudyTaskBase):
    id: int
    user_id: int
    actual_minutes: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DeadlineBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: datetime
    priority: Optional[str] = "high"
    room_id: Optional[int] = None

class DeadlineCreate(DeadlineBase):
    pass

class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None

class DeadlineResponse(DeadlineBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class GeneratePlanRequest(BaseModel):
    prompt: str
    available_daily_hours: Optional[float] = 4.0
    start_date: Optional[datetime] = None
    include_breaks: Optional[bool] = True
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = "gpt-4o"

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    start_date: datetime
    end_date: Optional[datetime]
    goal_prompt: Optional[str]
    plan_json: Optional[Any]
    status: str
    created_at: datetime
    tasks: List[StudyTaskResponse] = []

    class Config:
        from_attributes = True
