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
                WHERE difficulty = 'hard';
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
    if payload.difficulty != "hard":
        return RecordResponse(
            is_new_record=False,
            record=payload.score,
            message="Los récords solo se registran en dificultad Difícil."
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
                    message="¡Primer récord registrado para este modo!"
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
                    message="¡Nuevo récord global superado!"
                )
            
            return RecordResponse(
                is_new_record=False,
                record=current_record,
                message="El récord actual es mayor. No se modifica la base de datos."
            )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
