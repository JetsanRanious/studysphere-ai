from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.models.user import User, UserProfile, UserStreak
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, DemoLoginRequest, GoogleLoginRequest
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        avatar_url=user_in.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.full_name}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize Profile & Streak
    profile = UserProfile(user_id=user.id, major="Computer Science", xp=50, level=1)
    streak = UserStreak(user_id=user.id, current_streak=1, longest_streak=1)
    db.add(profile)
    db.add(streak)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=user)

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not user.hashed_password or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Record activity
    GamificationService.record_activity(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=user)

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(req: DemoLoginRequest = DemoLoginRequest(), db: Session = Depends(get_db)):
    """Zero-config instant login for local evaluation and testing."""
    email = req.email or "student@studysphere.ai"
    full_name = req.full_name or "Jetsan"
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash("DemoStudy2026!"),
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={full_name}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(user_id=user.id, major="Cloud & Cyber Security", xp=320, level=2)
        streak = UserStreak(user_id=user.id, current_streak=5, longest_streak=7)
        db.add(profile)
        db.add(streak)
        db.commit()
        db.refresh(user)
    
    GamificationService.record_activity(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=user)

@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Google OAuth token exchange endpoint."""
    # In production, verifies token with Google OAuth API. For dev convenience, extracts user profile.
    email = "google.student@studysphere.ai"
    full_name = "Google Student"
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            google_id="google-oauth-demo-id",
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={full_name}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(user_id=user.id, major="Computer Science", xp=100, level=1)
        streak = UserStreak(user_id=user.id, current_streak=1, longest_streak=1)
        db.add(profile)
        db.add(streak)
        db.commit()
        db.refresh(user)

    GamificationService.record_activity(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
