from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DemoLoginRequest(BaseModel):
    email: Optional[str] = "student@studysphere.ai"
    full_name: Optional[str] = "Jetsan"

class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    major: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None
    daily_goal_minutes: Optional[int] = None
    break_interval_minutes: Optional[int] = None
    default_session_minutes: Optional[int] = None
    theme_preference: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    major: str
    university: str
    bio: str
    daily_goal_minutes: int
    break_interval_minutes: int
    default_session_minutes: int
    theme_preference: str
    xp: int
    level: int

    class Config:
        from_attributes = True

class UserStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime]

    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    xp_reward: int
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None
    streak: Optional[UserStreakResponse] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
