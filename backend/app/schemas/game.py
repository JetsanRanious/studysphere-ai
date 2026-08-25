from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class GameScoreCreate(BaseModel):
    game_type: str  # tic-tac-toe, flappy-bird, sudoku
    score: int
    difficulty: Optional[str] = "normal"
    result: Optional[str] = "win"

class GameScoreResponse(BaseModel):
    id: int
    user_id: int
    game_type: str
    score: int
    difficulty: str
    result: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SudokuGenerateRequest(BaseModel):
    difficulty: str = "medium"  # easy, medium, hard

class SudokuHintRequest(BaseModel):
    board: List[List[int]]
    initial_board: List[List[int]]

class SudokuValidateRequest(BaseModel):
    board: List[List[int]]

class SudokuResponse(BaseModel):
    initial_board: List[List[int]]
    solution: List[List[int]]
    difficulty: str

class SudokuHintResponse(BaseModel):
    row: int
    col: int
    value: int
    technique: str
    explanation: str
