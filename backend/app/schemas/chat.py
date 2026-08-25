from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[int] = None
    room_id: Optional[int] = None
    document_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    room_id: Optional[int] = None
    document_id: Optional[int] = None

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    user_id: int
    room_id: Optional[int] = None
    document_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ChatSessionDetailResponse(ChatSessionResponse):
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
