import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class GameScore(Base):
    __tablename__ = "game_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    game_type = Column(String(50), nullable=False)  # tic-tac-toe, flappy-bird, sudoku
    score = Column(Integer, default=0)
    difficulty = Column(String(20), default="normal")
    result = Column(String(20), nullable=True)  # win, loss, draw
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="game_scores")
