import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(Integer, ForeignKey("room_topics.id", ondelete="SET NULL"), nullable=True)
    subject = Column(String(100), nullable=False)
    duration_seconds = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="study_sessions")
    room = relationship("StudyRoom")
    topic = relationship("RoomTopic")

class BreakSession(Base):
    __tablename__ = "break_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    duration_seconds = Column(Integer, default=0)
    break_type = Column(String(50), default="eye-rest")  # eye-rest, relaxation-game, walk
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="break_sessions")
