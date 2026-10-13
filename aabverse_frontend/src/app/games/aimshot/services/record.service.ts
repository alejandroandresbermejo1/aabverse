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
  private cachedRecords: Record<string, number> | null = null;
  private fetchPromise: Promise<Record<string, number> | null> | null = null;

  async fetchRecords(): Promise<Record<string, number> | null> {
    if (this.cachedRecords) {
      return this.cachedRecords;
    }
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = (async () => {
      try {
        const response = await fetch(this.API_URL);
        if (!response.ok) return null;
        const data = await response.json();
        this.cachedRecords = data;
        return data;
      } catch (e) {
        console.warn('API no disponible. Usando local.', e);
        return null;
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
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
      const res: RecordResponse = await response.json();
      if (res && res.is_new_record && this.cachedRecords) {
        this.cachedRecords[mode] = res.record;
      }
      return res;
    } catch (e) {
      console.warn('Error al enviar récord. Guardado en local.', e);
      return null;
    }
  }
}
