from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    order_index: Optional[int] = 0

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: int
    room_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    color: Optional[str] = "#3B82F6"
    icon: Optional[str] = "book"

class RoomCreate(RoomBase):
    initial_topics: Optional[List[str]] = []

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class JoinRoomByCodeRequest(BaseModel):
    invite_code: str

class MemberResponse(BaseModel):
    id: int
    user_id: int
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    joined_at: datetime

class RoomResponse(RoomBase):
    id: int
    invite_code: Optional[str] = None
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    member_count: int = 1
    document_count: int = 0
    topic_count: int = 0

    class Config:
        from_attributes = True

class RoomDetailResponse(RoomResponse):
    topics: List[TopicResponse] = []
    members: List[MemberResponse] = []

    class Config:
        from_attributes = True

class RoomChatMessageCreate(BaseModel):
    content: str

class RoomChatMessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
