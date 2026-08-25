from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.game import GameScore
from app.schemas.game import (
    GameScoreCreate, GameScoreResponse,
    SudokuGenerateRequest, SudokuResponse,
    SudokuHintRequest, SudokuHintResponse,
    SudokuValidateRequest
)
from app.services.sudoku_service import SudokuService
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/games", tags=["Relax Zone Games"])

@router.get("/scores", response_model=List[GameScoreResponse])
def get_game_scores(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(GameScore).filter(GameScore.user_id == current_user.id).order_by(GameScore.created_at.desc()).limit(20).all()

@router.post("/scores", response_model=GameScoreResponse)
def record_game_score(score_in: GameScoreCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score_obj = GameScore(
        user_id=current_user.id,
        game_type=score_in.game_type,
        score=score_in.score,
        difficulty=score_in.difficulty or "normal",
        result=score_in.result or "win"
    )
    db.add(score_obj)
    db.commit()
    db.refresh(score_obj)

    # Award bonus XP for relaxation game participation
    GamificationService.award_xp(db, current_user, 15)

    return score_obj

@router.post("/sudoku/generate", response_model=SudokuResponse)
def generate_sudoku(req: SudokuGenerateRequest = SudokuGenerateRequest()):
    puzzle, solution = SudokuService.generate_puzzle(req.difficulty)
    return SudokuResponse(
        initial_board=puzzle,
        solution=solution,
        difficulty=req.difficulty
    )

@router.post("/sudoku/hint", response_model=SudokuHintResponse)
def get_sudoku_hint(req: SudokuHintRequest):
    hint = SudokuService.get_ai_hint(req.board, req.initial_board)
    if not hint:
        raise HTTPException(status_code=400, detail="Board is complete or no single step deduction found.")
    return SudokuHintResponse(**hint)
