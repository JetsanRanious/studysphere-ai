import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt
    file_size_bytes = Column(Integer, default=0)
    status = Column(String(50), default="processing")  # processing, ready, failed
    summary = Column(Text, nullable=True)
    
    room_id = Column(Integer, ForeignKey("study_rooms.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(Integer, ForeignKey("room_topics.id", ondelete="SET NULL"), nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    room = relationship("StudyRoom", back_populates="documents")
    topic = relationship("RoomTopic", back_populates="documents")
    uploader = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    page_number = Column(Integer, nullable=True)
    embedding_json = Column(JSON, nullable=True)  # Stores vector embedding list as JSON for universal compatibility

    document = relationship("Document", back_populates="chunks")
