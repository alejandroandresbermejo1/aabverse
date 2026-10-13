from typing import Literal, Optional, List
from pydantic import BaseModel, Field

class ScoreSubmission(BaseModel):
    mode: Literal['contrareloj', 'supervivencia', 'caza']
    difficulty: Literal['facil', 'normal', 'dificil']
    score: int
    player_name: Optional[str] = Field(default="Anónimo", max_length=20)

class RecordResponse(BaseModel):
    is_new_record: bool
    record: int
    message: str

class LeaderboardEntry(BaseModel):
    id: int
    player_name: str
    mode: str
    difficulty: str
    score: int
    created_at: Optional[str] = None
