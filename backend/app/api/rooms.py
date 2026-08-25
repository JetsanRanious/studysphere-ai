from typing import List
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.room import StudyRoom, RoomMember, RoomTopic, RoomChatMessage
from app.schemas.room import (
    RoomCreate, RoomUpdate, RoomResponse, RoomDetailResponse,
    TopicCreate, TopicResponse, MemberResponse,
    JoinRoomByCodeRequest, RoomChatMessageCreate, RoomChatMessageResponse
)
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/rooms", tags=["Study Rooms"])

def generate_invite_code():
    digits = ''.join(random.choices(string.digits, k=4))
    return f"SPHERE-{digits}"

@router.get("", response_model=List[RoomResponse])
def get_user_rooms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(RoomMember).filter(RoomMember.user_id == current_user.id).all()
    room_ids = [m.room_id for m in memberships]
    
    rooms = db.query(StudyRoom).filter(
        (StudyRoom.created_by_id == current_user.id) | (StudyRoom.id.in_(room_ids))
    ).all()
    
    result = []
    for r in rooms:
        result.append(RoomResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            subject=r.subject,
            color=r.color,
            icon=r.icon,
            invite_code=r.invite_code or f"SPHERE-{r.id:04d}",
            created_by_id=r.created_by_id,
            created_at=r.created_at,
            updated_at=r.updated_at,
            member_count=len(r.members),
            document_count=len(r.documents),
            topic_count=len(r.topics)
        ))
    return result

@router.post("", response_model=RoomDetailResponse)
def create_room(room_in: RoomCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invite_code = generate_invite_code()
    room = StudyRoom(
        name=room_in.name,
        description=room_in.description,
        subject=room_in.subject or room_in.name,
        color=room_in.color or "#3B82F6",
        icon=room_in.icon or "book",
        invite_code=invite_code,
        created_by_id=current_user.id
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    # Add creator as admin member
    member = RoomMember(room_id=room.id, user_id=current_user.id, role="admin")
    db.add(member)

    # Add initial topics if provided
    initial_topics = room_in.initial_topics or ["Module 1: Foundations", "Module 2: Core Concepts", "Exam Preparation"]
    for idx, t_name in enumerate(initial_topics):
        topic = RoomTopic(room_id=room.id, name=t_name, order_index=idx)
        db.add(topic)

    db.commit()
    db.refresh(room)
    
    GamificationService.award_xp(db, current_user, 30)

    return RoomDetailResponse(
        id=room.id,
        name=room.name,
        description=room.description,
        subject=room.subject,
        color=room.color,
        icon=room.icon,
        invite_code=room.invite_code,
        created_by_id=room.created_by_id,
        created_at=room.created_at,
        updated_at=room.updated_at,
        member_count=len(room.members),
        document_count=len(room.documents),
        topic_count=len(room.topics),
        topics=[TopicResponse.model_validate(t) for t in room.topics],
        members=[
            MemberResponse(
                id=m.id,
                user_id=m.user_id,
                email=m.user.email,
                full_name=m.user.full_name,
                avatar_url=m.user.avatar_url,
                role=m.role,
                joined_at=m.joined_at
            ) for m in room.members
        ]
    )

@router.post("/join-by-code", response_model=RoomDetailResponse)
def join_room_by_code(req: JoinRoomByCodeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = req.invite_code.strip().upper()
    room = db.query(StudyRoom).filter(StudyRoom.invite_code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"No study room found with invite code '{code}'")

    existing_member = db.query(RoomMember).filter(RoomMember.room_id == room.id, RoomMember.user_id == current_user.id).first()
    if not existing_member:
        new_member = RoomMember(room_id=room.id, user_id=current_user.id, role="member")
        db.add(new_member)
        db.commit()
        db.refresh(room)
        GamificationService.award_xp(db, current_user, 25)

    return RoomDetailResponse(
        id=room.id,
        name=room.name,
        description=room.description,
        subject=room.subject,
        color=room.color,
        icon=room.icon,
        invite_code=room.invite_code,
        created_by_id=room.created_by_id,
        created_at=room.created_at,
        updated_at=room.updated_at,
        member_count=len(room.members),
        document_count=len(room.documents),
        topic_count=len(room.topics),
        topics=[TopicResponse.model_validate(t) for t in room.topics],
        members=[
            MemberResponse(
                id=m.id,
                user_id=m.user_id,
                email=m.user.email,
                full_name=m.user.full_name,
                avatar_url=m.user.avatar_url,
                role=m.role,
                joined_at=m.joined_at
            ) for m in room.members
        ]
    )

@router.get("/{room_id}", response_model=RoomDetailResponse)
def get_room_detail(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")
    
    if not room.invite_code:
        room.invite_code = f"SPHERE-{room.id:04d}"
        db.commit()
        db.refresh(room)

    return RoomDetailResponse(
        id=room.id,
        name=room.name,
        description=room.description,
        subject=room.subject,
        color=room.color,
        icon=room.icon,
        invite_code=room.invite_code,
        created_by_id=room.created_by_id,
        created_at=room.created_at,
        updated_at=room.updated_at,
        member_count=len(room.members),
        document_count=len(room.documents),
        topic_count=len(room.topics),
        topics=[TopicResponse.model_validate(t) for t in sorted(room.topics, key=lambda x: x.order_index)],
        members=[
            MemberResponse(
                id=m.id,
                user_id=m.user_id,
                email=m.user.email,
                full_name=m.user.full_name,
                avatar_url=m.user.avatar_url,
                role=m.role,
                joined_at=m.joined_at
            ) for m in room.members
        ]
    )

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, room_in: RoomUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")
    
    if room_in.name is not None:
        room.name = room_in.name
    if room_in.description is not None:
        room.description = room_in.description
    if room_in.subject is not None:
        room.subject = room_in.subject
    if room_in.color is not None:
        room.color = room_in.color
    if room_in.icon is not None:
        room.icon = room_in.icon

    db.commit()
    db.refresh(room)
    return RoomResponse(
        id=room.id,
        name=room.name,
        description=room.description,
        subject=room.subject,
        color=room.color,
        icon=room.icon,
        invite_code=room.invite_code,
        created_by_id=room.created_by_id,
        created_at=room.created_at,
        updated_at=room.updated_at,
        member_count=len(room.members),
        document_count=len(room.documents),
        topic_count=len(room.topics)
    )

@router.delete("/{room_id}")
def delete_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}

# Peer Group Chat in Rooms
@router.get("/{room_id}/messages", response_model=List[RoomChatMessageResponse])
def get_room_messages(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")

    messages = db.query(RoomChatMessage).filter(RoomChatMessage.room_id == room_id).order_by(RoomChatMessage.created_at.asc()).all()
    
    return [
        RoomChatMessageResponse(
            id=m.id,
            room_id=m.room_id,
            user_id=m.user_id,
            user_name=m.user.full_name,
            user_avatar=m.user.avatar_url,
            content=m.content,
            created_at=m.created_at
        ) for m in messages
    ]

@router.post("/{room_id}/messages", response_model=RoomChatMessageResponse)
def post_room_message(room_id: int, msg_in: RoomChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")

    msg = RoomChatMessage(
        room_id=room.id,
        user_id=current_user.id,
        content=msg_in.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return RoomChatMessageResponse(
        id=msg.id,
        room_id=msg.room_id,
        user_id=msg.user_id,
        user_name=current_user.full_name,
        user_avatar=current_user.avatar_url,
        content=msg.content,
        created_at=msg.created_at
    )

@router.post("/{room_id}/topics", response_model=TopicResponse)
def add_topic(room_id: int, topic_in: TopicCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")
    
    topic = RoomTopic(
        room_id=room.id,
        name=topic_in.name,
        description=topic_in.description,
        order_index=topic_in.order_index or len(room.topics)
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/{room_id}/topics/{topic_id}")
def delete_topic(room_id: int, topic_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(RoomTopic).filter(RoomTopic.id == topic_id, RoomTopic.room_id == room_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted successfully"}
