from typing import List, Dict
from pydantic import BaseModel

class DailyStudyStat(BaseModel):
    date: str
    minutes: int
    target_minutes: int

class SubjectStudyStat(BaseModel):
    subject: str
    minutes: int
    color: str
    percentage: float

class AnalyticsOverviewResponse(BaseModel):
    total_study_minutes_today: int
    daily_goal_minutes: int
    today_progress_percentage: float
    total_study_minutes_all_time: int
    current_streak_days: int
    longest_streak_days: int
    tasks_completed_count: int
    tasks_pending_count: int
    completion_rate_percentage: float
    deadlines_upcoming_count: int
    total_xp: int
    current_level: int
    most_productive_subject: str
    daily_stats_last_7_days: List[DailyStudyStat]
    subject_distribution: List[SubjectStudyStat]
