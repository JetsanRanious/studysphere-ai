from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.study_plan import StudyTask, Deadline
from app.schemas.study_plan import StudyTaskCreate, StudyTaskUpdate, StudyTaskResponse, DeadlineCreate, DeadlineUpdate, DeadlineResponse
from app.services.gamification_service import GamificationService

router = APIRouter(tags=["Tasks & Deadlines"])

@router.get("/tasks", response_model=List[StudyTaskResponse])
def get_tasks(
    subject: Optional[str] = None,
    room_id: Optional[int] = None,
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(StudyTask).filter(StudyTask.user_id == current_user.id)
    if subject:
        query = query.filter(StudyTask.subject == subject)
    if room_id:
        query = query.filter(StudyTask.room_id == room_id)
    if completed is not None:
        query = query.filter(StudyTask.is_completed == completed)
        
    tasks = query.order_by(StudyTask.is_completed.asc(), StudyTask.created_at.desc()).all()
    return tasks

@router.post("/tasks", response_model=StudyTaskResponse)
def create_task(task_in: StudyTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = StudyTask(
        user_id=current_user.id,
        study_plan_id=task_in.study_plan_id,
        room_id=task_in.room_id,
        title=task_in.title,
        description=task_in.description,
        subject=task_in.subject,
        scheduled_date=task_in.scheduled_date or datetime.datetime.utcnow(),
        start_time=task_in.start_time,
        end_time=task_in.end_time,
        estimated_minutes=task_in.estimated_minutes or 45,
        priority=task_in.priority or "medium"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/tasks/{task_id}", response_model=StudyTaskResponse)
def update_task(task_id: int, task_in: StudyTaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.subject is not None:
        task.subject = task_in.subject
    if task_in.scheduled_date is not None:
        task.scheduled_date = task_in.scheduled_date
    if task_in.start_time is not None:
        task.start_time = task_in.start_time
    if task_in.end_time is not None:
        task.end_time = task_in.end_time
    if task_in.estimated_minutes is not None:
        task.estimated_minutes = task_in.estimated_minutes
    if task_in.actual_minutes is not None:
        task.actual_minutes = task_in.actual_minutes
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.is_completed is not None:
        was_completed = task.is_completed
        task.is_completed = task_in.is_completed
        if task_in.is_completed and not was_completed:
            task.completed_at = datetime.datetime.utcnow()
            GamificationService.award_xp(db, current_user, 20)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

# Deadlines
@router.get("/deadlines", response_model=List[DeadlineResponse])
def get_deadlines(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Deadline).filter(Deadline.user_id == current_user.id).order_by(Deadline.due_date.asc()).all()

@router.post("/deadlines", response_model=DeadlineResponse)
def create_deadline(dl_in: DeadlineCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dl = Deadline(
        user_id=current_user.id,
        room_id=dl_in.room_id,
        title=dl_in.title,
        description=dl_in.description,
        subject=dl_in.subject,
        due_date=dl_in.due_date,
        priority=dl_in.priority or "high"
    )
    db.add(dl)
    db.commit()
    db.refresh(dl)
    return dl

@router.put("/deadlines/{deadline_id}", response_model=DeadlineResponse)
def update_deadline(deadline_id: int, dl_in: DeadlineUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dl = db.query(Deadline).filter(Deadline.id == deadline_id, Deadline.user_id == current_user.id).first()
    if not dl:
        raise HTTPException(status_code=404, detail="Deadline not found")

    if dl_in.title is not None:
        dl.title = dl_in.title
    if dl_in.description is not None:
        dl.description = dl_in.description
    if dl_in.subject is not None:
        dl.subject = dl_in.subject
    if dl_in.due_date is not None:
        dl.due_date = dl_in.due_date
    if dl_in.priority is not None:
        dl.priority = dl_in.priority
    if dl_in.is_completed is not None:
        dl.is_completed = dl_in.is_completed

    db.commit()
    db.refresh(dl)
    return dl

@router.delete("/deadlines/{deadline_id}")
def delete_deadline(deadline_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dl = db.query(Deadline).filter(Deadline.id == deadline_id, Deadline.user_id == current_user.id).first()
    if not dl:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    db.delete(dl)
    db.commit()
    return {"message": "Deadline deleted successfully"}
