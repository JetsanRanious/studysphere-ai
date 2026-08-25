import datetime
import random
import string
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_invite_code():
    digits = ''.join(random.choices(string.digits, k=4))
    return f"SPHERE-{digits}"

class StudyRoom(Base):
    __tablename__ = "study_rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)
    color = Column(String(50), default="#3B82F6")
    icon = Column(String(50), default="book")
    invite_code = Column(String(50), unique=True, index=True, default=generate_invite_code)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by_id])
    members = relationship("RoomMember", back_populates="room", cascade="all, delete-orphan")
    topics = relationship("RoomTopic", back_populates="room", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="room", cascade="all, delete-orphan")
    tasks = relationship("StudyTask", back_populates="room", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("RoomChatMessage", back_populates="room", cascade="all, delete-orphan", order_by="RoomChatMessage.created_at")

class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member")  # admin, member
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("StudyRoom", back_populates="members")
    user = relationship("User", back_populates="memberships")

class RoomTopic(Base):
    __tablename__ = "room_topics"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("StudyRoom", back_populates="topics")
    documents = relationship("Document", back_populates="topic")

class RoomChatMessage(Base):
    __tablename__ = "room_chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("StudyRoom", back_populates="messages")
    user = relationship("User")
