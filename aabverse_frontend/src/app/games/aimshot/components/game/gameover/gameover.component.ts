import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordService, LeaderboardEntry } from '../../../services/record.service';

@Component({
  selector: 'app-gameover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gameover.component.html',
  styleUrl: './gameover.component.css'
})
export class GameoverComponent {
  private recordService = inject(RecordService);

  score = input<number>(0);
  accuracy = input<number>(0);
  totalHits = input<number>(0);
  totalShots = input<number>(0);
  standardHits = input<number>(0);
  goldenHits = input<number>(0);
  penaltyHits = input<number>(0);
  difficulty = input<'facil' | 'normal' | 'dificil'>('normal');
  mode = input<'contrareloj' | 'supervivencia' | 'caza'>('contrareloj');

  restartGame = output<void>();
  goHome = output<void>();
  saveScore = output<string>();

  leaderboard = signal<LeaderboardEntry[]>([]);
  isLoadingLeaderboard = signal<boolean>(false);

  playerName = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isSaved = signal<boolean>(false);
  saveMessage = signal<string>('');
  isError = signal<boolean>(false);

  onNameChange(val: string) {
    this.playerName.set(val);
    if (this.isError()) {
      this.isError.set(false);
    }
  }

  constructor() {
    effect(() => {
      const currentMode = this.mode();
      this.loadLeaderboard(currentMode);
    });
  }

  async loadLeaderboard(m: string) {
    this.isLoadingLeaderboard.set(true);
    const data = await this.recordService.fetchLeaderboard(m);
    this.leaderboard.set(data);
    this.isLoadingLeaderboard.set(false);
  }

  setSaveResult(msg: string) {
    this.saveMessage.set(msg);
    this.isSubmitting.set(false);
    if (msg.includes('ya existe') || msg.includes('no válida') || msg.includes('No se pudo')) {
      this.isError.set(true);
      this.isSaved.set(false);
    } else {
      this.isError.set(false);
      this.isSaved.set(true);
      this.loadLeaderboard(this.mode());
    }
  }

  onSubmitName() {
    if (this.isSubmitting() || this.isSaved()) return;
    const name = this.playerName().trim() || 'Anónimo';
    this.isSubmitting.set(true);
    this.saveScore.emit(name);
  }

  onRestart() {
    this.restartGame.emit();
  }
}
