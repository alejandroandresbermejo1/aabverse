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
  private readonly API_URL = 'https://aabverseback.vercel.app/api/records';

  async fetchRecords(): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('API no disponible. Usando local.', e);
      return null;
    }
  }

  async submitScore(
    mode: 'contrareloj' | 'supervivencia' | 'caza',
    difficulty: 'facil' | 'normal' | 'dificil',
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
      console.warn('Error al enviar récord. Guardado en local.', e);
      return null;
    }
  }
}
