import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentChunkResponse
from app.services.document_service import DocumentService
from app.services.vector_service import VectorService
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/documents", tags=["Document Processing & RAG"])

@router.get("", response_model=List[DocumentResponse])
def get_documents(
    room_id: Optional[int] = None,
    topic_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.uploaded_by_id == current_user.id)
    if room_id:
        query = query.filter(Document.room_id == room_id)
    if topic_id:
        query = query.filter(Document.topic_id == topic_id)
        
    docs = query.order_by(Document.created_at.desc()).all()
    
    return [
        DocumentResponse(
            id=d.id,
            title=d.title,
            filename=d.filename,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            status=d.status,
            summary=d.summary,
            room_id=d.room_id,
            topic_id=d.topic_id,
            uploaded_by_id=d.uploaded_by_id,
            created_at=d.created_at,
            updated_at=d.updated_at,
            chunk_count=len(d.chunks)
        ) for d in docs
    ]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    room_id: Optional[int] = Form(None),
    topic_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "document.txt"
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"{current_user.id}_{int(os.path.getmtime(settings.UPLOAD_DIR) if os.path.exists(settings.UPLOAD_DIR) else 1)}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    doc_title = title if title and title.strip() else filename.rsplit(".", 1)[0]

    doc = Document(
        title=doc_title,
        filename=filename,
        file_path=file_path,
        file_type=ext,
        file_size_bytes=file_size,
        status="processing",
        room_id=room_id,
        topic_id=topic_id,
        uploaded_by_id=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process chunks & embeddings
    try:
        pages = DocumentService.extract_text_from_file(file_path, ext)
        chunks_data = DocumentService.chunk_text(pages, chunk_size=600, chunk_overlap=100)

        for c in chunks_data:
            # Generate embedding
            emb = await VectorService.get_embedding(c["content"])
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                page_number=c.get("page_number", 1),
                token_count=c.get("token_count", len(c["content"].split())),
                embedding_json=emb
            )
            db.add(chunk_obj)

        doc.status = "ready"
        doc.summary = f"Processed document '{doc.title}' with {len(chunks_data)} searchable chunks."
        db.commit()
        db.refresh(doc)

        # Gamification reward for uploading study document
        GamificationService.award_xp(db, current_user, 25)
    except Exception as e:
        doc.status = "failed"
        doc.summary = f"Processing error: {str(e)}"
        db.commit()
        db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        status=doc.status,
        summary=doc.summary,
        room_id=doc.room_id,
        topic_id=doc.topic_id,
        uploaded_by_id=doc.uploaded_by_id,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=len(doc.chunks)
    )

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.uploaded_by_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentDetailResponse(
        id=doc.id,
        title=doc.title,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        status=doc.status,
        summary=doc.summary,
        room_id=doc.room_id,
        topic_id=doc.topic_id,
        uploaded_by_id=doc.uploaded_by_id,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=len(doc.chunks),
        chunks=[DocumentChunkResponse.model_validate(c) for c in doc.chunks]
    )

@router.delete("/{document_id}")
def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.uploaded_by_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
