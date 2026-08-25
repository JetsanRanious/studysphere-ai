from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.session import StudySession, BreakSession
from app.schemas.session import StudySessionCreate, StudySessionResponse, BreakSessionCreate, BreakSessionResponse
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/study-sessions", tags=["Study & Break Sessions"])

@router.get("", response_model=List[StudySessionResponse])
def get_study_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(StudySession).filter(StudySession.user_id == current_user.id).order_by(StudySession.ended_at.desc()).all()

@router.post("", response_model=StudySessionResponse)
def record_study_session(session_in: StudySessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate XP: ~50 XP per hour (approx 1 XP per minute, minimum 10 XP)
    minutes = session_in.duration_seconds // 60
    xp_earned = max(10, int(minutes * 0.85))

    session_obj = StudySession(
        user_id=current_user.id,
        subject=session_in.subject,
        room_id=session_in.room_id,
        topic_id=session_in.topic_id,
        duration_seconds=session_in.duration_seconds,
        xp_earned=xp_earned,
        notes=session_in.notes,
        started_at=session_in.started_at,
        ended_at=session_in.ended_at
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)

    # Award XP and update streak
    GamificationService.award_xp(db, current_user, xp_earned)
    GamificationService.record_activity(db, current_user)

    return session_obj

@router.post("/breaks", response_model=BreakSessionResponse)
def record_break_session(break_in: BreakSessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = BreakSession(
        user_id=current_user.id,
        duration_seconds=break_in.duration_seconds,
        break_type=break_in.break_type or "eye-rest",
        started_at=break_in.started_at,
        ended_at=break_in.ended_at
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return b
