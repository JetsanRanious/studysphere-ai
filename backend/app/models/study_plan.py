import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    goal_prompt = Column(Text, nullable=True)
    plan_json = Column(JSON, nullable=True)
    status = Column(String(50), default="active")  # active, completed, archived
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="study_plan", cascade="all, delete-orphan")

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="SET NULL"), nullable=True)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)
    day = Column(String(20), nullable=True)        # "Monday" … "Sunday" — used by weekly planner
    day_offset = Column(Integer, nullable=True)    # 0=Monday … 6=Sunday
    scheduled_date = Column(DateTime, nullable=True)
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    estimated_minutes = Column(Integer, default=45)
    actual_minutes = Column(Integer, default=0)
    priority = Column(String(20), default="medium")  # high, medium, low
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    study_plan = relationship("StudyPlan", back_populates="tasks")
    room = relationship("StudyRoom", back_populates="tasks")

class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)
    due_date = Column(DateTime, nullable=False)
    priority = Column(String(20), default="high")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    room = relationship("StudyRoom")
