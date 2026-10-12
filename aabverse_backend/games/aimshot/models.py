from typing import Literal
from pydantic import BaseModel

class ScoreSubmission(BaseModel):
    mode: Literal['contrareloj', 'supervivencia', 'caza']
    difficulty: Literal['facil', 'normal', 'dificil']
    score: int

class RecordResponse(BaseModel):
    is_new_record: bool
    record: int
    message: str
