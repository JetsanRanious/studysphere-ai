from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserProfile, Achievement, UserAchievement
from app.schemas.user import UserResponse, UserProfileUpdate, UserProfileResponse, AchievementResponse

router = APIRouter(prefix="/users", tags=["Users & Profile"])

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url

    if not current_user.profile:
        current_user.profile = UserProfile(user_id=current_user.id)
        db.add(current_user.profile)

    if profile_in.major is not None:
        current_user.profile.major = profile_in.major
    if profile_in.university is not None:
        current_user.profile.university = profile_in.university
    if profile_in.bio is not None:
        current_user.profile.bio = profile_in.bio
    if profile_in.daily_goal_minutes is not None:
        current_user.profile.daily_goal_minutes = profile_in.daily_goal_minutes
    if profile_in.break_interval_minutes is not None:
        current_user.profile.break_interval_minutes = profile_in.break_interval_minutes
    if profile_in.default_session_minutes is not None:
        current_user.profile.default_session_minutes = profile_in.default_session_minutes
    if profile_in.theme_preference is not None:
        current_user.profile.theme_preference = profile_in.theme_preference

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/achievements", response_model=List[AchievementResponse])
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_achievements = db.query(Achievement).all()
    user_ach_map = {
        ua.achievement_id: ua.unlocked_at
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    }

    result = []
    for ach in all_achievements:
        is_unlocked = ach.id in user_ach_map
        result.append(AchievementResponse(
            id=ach.id,
            code=ach.code,
            title=ach.title,
            description=ach.description,
            icon=ach.icon,
            xp_reward=ach.xp_reward,
            is_unlocked=is_unlocked,
            unlocked_at=user_ach_map.get(ach.id)
        ))
    return result
