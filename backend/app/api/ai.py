from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.room import StudyRoom
from app.models.document import Document, DocumentChunk
from app.models.chat import ChatSession, ChatMessage
from app.models.study_plan import StudyPlan, StudyTask
from app.schemas.ai import (
    AIChatRequest, AIChatResponse,
    AISummarizeRequest, AISummarizeResponse,
    AIQuizRequest, AIQuizResponse, QuizQuestion,
    AIFlashcardRequest, AIFlashcardResponse, FlashcardItem,
    AIRecommendationResponse
)
from app.schemas.study_plan import GeneratePlanRequest, StudyPlanResponse, StudyTaskResponse
from app.schemas.chat import ChatSessionResponse, ChatSessionDetailResponse, ChatMessageResponse
from app.services.ai_service import AIService
from app.services.vector_service import VectorService
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = None
    if req.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == req.session_id, ChatSession.user_id == current_user.id).first()
    
    if not session:
        session_title = req.message[:35] + ("..." if len(req.message) > 35 else "")
        session = ChatSession(
            user_id=current_user.id,
            title=session_title,
            room_id=req.room_id,
            document_id=req.document_id
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    user_msg = ChatMessage(session_id=session.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    chunks_to_search = []
    doc_title = None
    room_name = None

    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if doc:
            doc_title = doc.title
            chunks_to_search = doc.chunks
    elif req.room_id:
        room = db.query(StudyRoom).filter(StudyRoom.id == req.room_id).first()
        if room:
            room_name = room.name
            for d in room.documents:
                chunks_to_search.extend(d.chunks)
    else:
        user_docs = db.query(Document).filter(Document.uploaded_by_id == current_user.id).all()
        for d in user_docs:
            chunks_to_search.extend(d.chunks)

    query_vec = await VectorService.get_embedding(req.message)
    top_chunks = VectorService.search_similar_chunks(req.message, query_vec, chunks_to_search, top_k=4)

    ai_result = await AIService.generate_chat_response(
        prompt=req.message,
        context_chunks=top_chunks,
        room_name=room_name,
        doc_title=doc_title,
        provider=req.provider or "auto",
        openai_api_key=req.openai_api_key,
        openai_model=req.openai_model or "gpt-4o"
    )

    ai_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_result["response"],
        sources=ai_result["sources"]
    )
    db.add(ai_msg)
    db.commit()

    return AIChatResponse(
        response=ai_result["response"],
        session_id=session.id,
        sources=ai_result["sources"],
        model_used=ai_result["model_used"]
    )

@router.get("/chat/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(
    room_id: Optional[int] = None,
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChatSession).filter(ChatSession.user_id == current_user.id)
    if room_id:
        query = query.filter(ChatSession.room_id == room_id)
    if document_id:
        query = query.filter(ChatSession.document_id == document_id)
        
    sessions = query.order_by(ChatSession.updated_at.desc()).all()
    
    res = []
    for s in sessions:
        last_msg = s.messages[-1].content if s.messages else None
        res.append(ChatSessionResponse(
            id=s.id,
            title=s.title,
            user_id=s.user_id,
            room_id=s.room_id,
            document_id=s.document_id,
            created_at=s.created_at,
            updated_at=s.updated_at,
            last_message=last_msg
        ))
    return res

@router.get("/chat/sessions/{session_id}", response_model=ChatSessionDetailResponse)
def get_chat_session_detail(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return ChatSessionDetailResponse(
        id=s.id,
        title=s.title,
        user_id=s.user_id,
        room_id=s.room_id,
        document_id=s.document_id,
        created_at=s.created_at,
        updated_at=s.updated_at,
        last_message=s.messages[-1].content if s.messages else None,
        messages=[ChatMessageResponse.model_validate(m) for m in s.messages]
    )

@router.post("/summarize", response_model=AISummarizeResponse)
async def summarize_document(
    req: AISummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text_content = ""
    title = None
    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        title = doc.title
        text_content = "\n\n".join([c.content for c in doc.chunks[:10]])
    elif req.room_id:
        room = db.query(StudyRoom).filter(StudyRoom.id == req.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Study room not found")
        title = f"Room: {room.name}"
        all_chunks = []
        for d in room.documents:
            all_chunks.extend([c.content for c in d.chunks[:5]])
        text_content = "\n\n".join(all_chunks)
    else:
        text_content = "Core academic concepts including system architecture, security models, algorithms, and practical implementation guidelines."

    summary_data = await AIService.generate_summary(text_content, req.summary_type)
    return AISummarizeResponse(
        summary=summary_data["summary"],
        document_title=title,
        key_takeaways=summary_data["key_takeaways"]
    )

@router.post("/quiz", response_model=AIQuizResponse)
async def generate_quiz(
    req: AIQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text_content = ""
    title = "Practice Quiz"
    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if doc:
            title = f"Quiz: {doc.title}"
            text_content = "\n\n".join([c.content for c in doc.chunks[:8]])
    elif req.room_id:
        room = db.query(StudyRoom).filter(StudyRoom.id == req.room_id).first()
        if room:
            title = f"Quiz: {room.name}"
            for d in room.documents:
                text_content += "\n\n" + "\n\n".join([c.content for c in d.chunks[:4]])

    questions = await AIService.generate_quiz(text_content, req.num_questions)
    formatted = [QuizQuestion(**q) for q in questions]
    
    return AIQuizResponse(
        title=title,
        questions=formatted,
        total_questions=len(formatted)
    )

@router.post("/flashcards", response_model=AIFlashcardResponse)
async def generate_flashcards(
    req: AIFlashcardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sample_cards = [
        FlashcardItem(front="Principle of Least Privilege (PoLP)", back="Security concept where a user or process is given only the bare minimum access privileges necessary to complete their task.", category="Security"),
        FlashcardItem(front="Role-Based Access Control (RBAC)", back="Access policy determined by user roles within an organization rather than individual identities.", category="IAM"),
        FlashcardItem(front="Multi-Factor Authentication (MFA)", back="Verification method requiring 2+ independent credentials (knowledge, possession, inherence).", category="Authentication"),
        FlashcardItem(front="Symmetric vs Asymmetric Encryption", back="Symmetric uses single shared key (AES); Asymmetric uses public-private keypair (RSA, ECC).", category="Cryptography"),
        FlashcardItem(front="Retrieval-Augmented Generation (RAG)", back="AI framework that fetches relevant context from external documents before LLM response generation.", category="AI Architecture"),
        FlashcardItem(front="Spaced Repetition System (SRS)", back="Learning technique where review intervals increase exponentially to maximize long-term retention.", category="Study Methods")
    ]
    return AIFlashcardResponse(cards=sample_cards[:req.num_cards])

@router.post("/study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(
    req: GeneratePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan_tasks_data = await AIService.generate_study_plan(
        req.prompt, 
        req.available_daily_hours or 4.0,
        req.openai_api_key,
        req.openai_model
    )
    
    plan = StudyPlan(
        user_id=current_user.id,
        title=f"AI Plan: {req.prompt[:30]}...",
        goal_prompt=req.prompt,
        plan_json={"tasks": plan_tasks_data}
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    created_tasks = []
    for t in plan_tasks_data:
        task = StudyTask(
            user_id=current_user.id,
            study_plan_id=plan.id,
            title=t["title"],
            description=t.get("description"),
            subject=t.get("subject"),
            day=t.get("day"),
            day_offset=t.get("day_offset"),
            start_time=t.get("start_time"),
            end_time=t.get("end_time"),
            estimated_minutes=t.get("estimated_minutes", 45),
            priority=t.get("priority", "medium")
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()
    db.refresh(plan)
    
    GamificationService.award_xp(db, current_user, 30)

    return StudyPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        title=plan.title,
        start_date=plan.start_date,
        end_date=plan.end_date,
        goal_prompt=plan.goal_prompt,
        plan_json=plan.plan_json,
        status=plan.status,
        created_at=plan.created_at,
        tasks=[StudyTaskResponse.model_validate(t) for t in plan.tasks]
    )

@router.get("/recommendations", response_model=AIRecommendationResponse)
def get_ai_recommendation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AIRecommendationResponse(
        headline="Focus Priority Today",
        recommendation="You have 2 hours remaining in your target study window. We recommend completing Cloud Security: IAM Module before starting Cryptography revision.",
        suggested_subject="Cloud Security",
        suggested_action="Start 45m Focused Session",
        priority_level="high"
    )
