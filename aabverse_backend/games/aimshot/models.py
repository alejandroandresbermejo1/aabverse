from typing import Literal
from pydantic import BaseModel

class ScoreSubmission(BaseModel):
    mode: Literal['classic', 'survival', 'hunt']
    difficulty: Literal['easy', 'normal', 'hard']
    score: int

class RecordResponse(BaseModel):
    is_new_record: bool
    record: int
    message: str
