import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService, LeaderboardEntry } from '../../../services/record.service';

export type DifficultyLevel = 'facil' | 'normal' | 'dificil';
export type CrosshairStyle = 'defecto' | 'punto' | 'clasica';
export type GameMode = 'contrareloj' | 'supervivencia' | 'caza';

@Component({
  selector: 'app-setupgame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setupgame.component.html',
  styleUrl: './setupgame.component.css'
})
export class SetupgameComponent {
  private recordService = inject(RecordService);

  mode = input<GameMode>('contrareloj');
  difficulty = input<DifficultyLevel>('normal');
  crosshairStyle = input<CrosshairStyle>('clasica');

  modeChange = output<GameMode>();
  difficultyChange = output<DifficultyLevel>();
  crosshairStyleChange = output<CrosshairStyle>();
  startGame = output<void>();

  leaderboard = signal<LeaderboardEntry[]>([]);
  isLoadingLeaderboard = signal<boolean>(false);

  constructor() {
    effect(() => {
      const currentMode = this.mode();
      this.loadLeaderboard(currentMode);
    });
  }

  async loadLeaderboard(m: GameMode) {
    const current = this.leaderboard();
    if (current.length === 0) {
      this.isLoadingLeaderboard.set(true);
    }
    const data = await this.recordService.fetchLeaderboard(m);
    this.leaderboard.set(data);
    this.isLoadingLeaderboard.set(false);
  }

  onSelectMode(m: GameMode) {
    this.modeChange.emit(m);
  }

  onSelectDifficulty(level: DifficultyLevel) {
    this.difficultyChange.emit(level);
  }

  onSelectCrosshair(style: CrosshairStyle) {
    this.crosshairStyleChange.emit(style);
  }

  onStart() {
    this.startGame.emit();
  }
}
