from fastapi import APIRouter, HTTPException
from database import get_connection
from .models import ScoreSubmission, RecordResponse

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
                SELECT mode, record 
                FROM aimshot.records 
                WHERE difficulty = 'dificil';
            """)
            rows = cur.fetchall()
            records_map = {row["mode"]: row["record"] for row in rows}
            return records_map
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/records", response_model=RecordResponse)
def submit_score(payload: ScoreSubmission):
    if payload.difficulty != "dificil":
        return RecordResponse(
            is_new_record=False,
            record=payload.score,
            message="Solo se guarda en dificultad difícil."
        )

    try:
        conn = get_connection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT record 
                FROM aimshot.records 
                WHERE mode = %s AND difficulty = %s;
            """, (payload.mode, payload.difficulty))
            row = cur.fetchone()

            if row is None:
                cur.execute("""
                    INSERT INTO aimshot.records (mode, difficulty, record, updated_at)
                    VALUES (%s, %s, %s, NOW());
                """, (payload.mode, payload.difficulty, payload.score))
                conn.commit()
                return RecordResponse(
                    is_new_record=True,
                    record=payload.score,
                    message="Nuevo récord."
                )
            
            current_record = row["record"]
            if payload.score > current_record:
                cur.execute("""
                    UPDATE aimshot.records
                    SET record = %s, updated_at = NOW()
                    WHERE mode = %s AND difficulty = %s;
                """, (payload.score, payload.mode, payload.difficulty))
                conn.commit()
                return RecordResponse(
                    is_new_record=True,
                    record=payload.score,
                    message="Récord superado."
                )
            
            return RecordResponse(
                is_new_record=False,
                record=current_record,
                message="Récord no superado."
            )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
