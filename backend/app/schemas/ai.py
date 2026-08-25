from typing import Optional, List, Any
from pydantic import BaseModel

class AIChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    document_id: Optional[int] = None
    room_id: Optional[int] = None
    provider: Optional[str] = "auto"  # auto, ollama, openai, fallback
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = "gpt-4o"

class AIChatResponse(BaseModel):
    response: str
    session_id: int
    sources: List[dict] = []
    model_used: str

class AISummarizeRequest(BaseModel):
    document_id: Optional[int] = None
    room_id: Optional[int] = None
    summary_type: str = "key_concepts"
    provider: Optional[str] = "auto"
    openai_api_key: Optional[str] = None

class AISummarizeResponse(BaseModel):
    summary: str
    document_title: Optional[str] = None
    key_takeaways: List[str] = []

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class AIQuizRequest(BaseModel):
    document_id: Optional[int] = None
    room_id: Optional[int] = None
    num_questions: int = 5
    topic: Optional[str] = None
    openai_api_key: Optional[str] = None

class AIQuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]
    total_questions: int

class FlashcardItem(BaseModel):
    front: str
    back: str
    category: Optional[str] = None

class AIFlashcardRequest(BaseModel):
    document_id: Optional[int] = None
    room_id: Optional[int] = None
    num_cards: int = 8

class AIFlashcardResponse(BaseModel):
    cards: List[FlashcardItem]

class AIRecommendationResponse(BaseModel):
    headline: str
    recommendation: str
    suggested_subject: Optional[str] = None
    suggested_action: str
    priority_level: str
