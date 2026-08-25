from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DocumentChunkResponse(BaseModel):
    id: int
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    token_count: int = 0

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    title: str
    filename: str
    file_type: str
    file_size_bytes: int
    status: str
    summary: Optional[str] = None
    room_id: Optional[int] = None
    topic_id: Optional[int] = None
    uploaded_by_id: int
    created_at: datetime
    updated_at: datetime
    chunk_count: int = 0

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

    class Config:
        from_attributes = True
