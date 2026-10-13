import { Injectable } from '@angular/core';

export interface RecordResponse {
  is_new_record: boolean;
  record: number;
  message: string;
}

export interface LeaderboardEntry {
  id: number;
  player_name: string;
  mode: string;
  difficulty: string;
  score: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private readonly API_URL = 'https://aabverseback.vercel.app/api/games/aimshot';
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
        const response = await fetch(`${this.API_URL}/records`);
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

  async fetchLeaderboard(mode: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.API_URL}/leaderboard?mode=${encodeURIComponent(mode)}`);
      if (!response.ok) return [];
      const data: LeaderboardEntry[] = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Error al obtener el leaderboard.', e);
      return [];
    }
  }

  async submitScore(
    mode: 'contrareloj' | 'supervivencia' | 'caza',
    difficulty: 'facil' | 'normal' | 'dificil',
    score: number,
    playerName: string = 'Anónimo'
  ): Promise<RecordResponse | null> {
    try {
      const cleanName = playerName.trim() || 'Anónimo';
      const response = await fetch(`${this.API_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          difficulty,
          score,
          player_name: cleanName.slice(0, 20)
        }),
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
