from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from database import get_connection
from .models import ScoreSubmission, RecordResponse, LeaderboardEntry

router = APIRouter()

@router.get("/records")
def get_records():
    try:
        conn = get_connection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT mode, MAX(record) as max_record 
                FROM aimshot.records 
                WHERE difficulty = 'dificil'
                GROUP BY mode;
            """)
            rows = cur.fetchall()
            records_map = {row["mode"]: row["max_record"] for row in rows}
            return records_map
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    mode: str = Query("contrareloj", description="Game mode (contrareloj, supervivencia, caza)")
):
    try:
        conn = get_connection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, COALESCE(player_name, 'Anónimo') as player_name, mode, difficulty, record as score, updated_at as created_at
                FROM aimshot.records
                WHERE mode = %s
                ORDER BY record DESC, updated_at ASC
                LIMIT 10;
            """, (mode,))
            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append(LeaderboardEntry(
                    id=r["id"],
                    player_name=r["player_name"],
                    mode=r["mode"],
                    difficulty=r["difficulty"],
                    score=r["score"],
                    created_at=str(r["created_at"]) if r["created_at"] else None
                ))
            return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/records", response_model=RecordResponse)
def submit_score(payload: ScoreSubmission):
    player_name = (payload.player_name or "Anónimo").strip()
    if not player_name:
        player_name = "Anónimo"
    player_name = player_name[:20]

    if payload.score < 0:
        return RecordResponse(
            is_new_record=False,
            record=0,
            message="Puntuación no válida."
        )

    try:
        conn = get_connection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, record
                FROM aimshot.records
                WHERE mode = %s
                ORDER BY record DESC, updated_at ASC;
            """, (payload.mode,))
            current_records = cur.fetchall()

            if len(current_records) >= 10:
                tenth_score = current_records[9]["record"]
                if payload.score <= tenth_score:
                    cur.execute("""
                        SELECT MAX(record) as max_record
                        FROM aimshot.records
                        WHERE mode = %s AND difficulty = 'dificil';
                    """, (payload.mode,))
                    max_row = cur.fetchone()
                    current_max = max_row["max_record"] if max_row and max_row["max_record"] is not None else 0
                    return RecordResponse(
                        is_new_record=False,
                        record=current_max,
                        message="Récord no superado."
                    )

            if payload.difficulty != "dificil":
                return RecordResponse(
                    is_new_record=False,
                    record=payload.score,
                    message="Solo se guarda en dificultad difícil."
                )

            cur.execute("""
                INSERT INTO aimshot.records (player_name, mode, difficulty, record, updated_at)
                VALUES (%s, %s, %s, %s, NOW());
            """, (player_name, payload.mode, payload.difficulty, payload.score))

            cur.execute("""
                DELETE FROM aimshot.records
                WHERE mode = %s
                AND id NOT IN (
                    SELECT id FROM aimshot.records
                    WHERE mode = %s
                    ORDER BY record DESC, updated_at ASC
                    LIMIT 10
                );
            """, (payload.mode, payload.mode))

            cur.execute("""
                SELECT MAX(record) as max_record
                FROM aimshot.records
                WHERE mode = %s AND difficulty = 'dificil' AND id != LASTVAL();
            """, (payload.mode,))
            row = cur.fetchone()
            prev_max = row["max_record"] if row and row["max_record"] is not None else None

            conn.commit()

            if prev_max is None:
                return RecordResponse(
                    is_new_record=True,
                    record=payload.score,
                    message="Nuevo récord."
                )
            elif payload.score > prev_max:
                return RecordResponse(
                    is_new_record=True,
                    record=payload.score,
                    message="Récord superado."
                )
            else:
                return RecordResponse(
                    is_new_record=False,
                    record=prev_max,
                    message="Récord no superado."
                )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
