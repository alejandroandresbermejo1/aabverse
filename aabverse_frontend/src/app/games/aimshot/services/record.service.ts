import { Injectable } from '@angular/core';

export interface RecordResponse {
  is_new_record: boolean;
  record: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private readonly API_URL = 'http://localhost:8000/api/records';

  async fetchRecords(): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('API de récords no disponible, usando almacenamiento local:', e);
      return null;
    }
  }

  async submitScore(
    mode: 'classic' | 'survival' | 'hunt',
    difficulty: 'easy' | 'normal' | 'hard',
    score: number,
  ): Promise<RecordResponse | null> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, difficulty, score }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('No se pudo enviar el récord a la API, guardando en local:', e);
      return null;
    }
  }
}
