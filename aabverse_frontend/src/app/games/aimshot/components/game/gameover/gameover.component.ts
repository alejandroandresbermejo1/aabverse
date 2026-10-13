import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gameover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gameover.component.html',
  styleUrl: './gameover.component.css'
})
export class GameoverComponent {
  score = input<number>(0);
  accuracy = input<number>(0);
  totalHits = input<number>(0);
  totalShots = input<number>(0);
  standardHits = input<number>(0);
  goldenHits = input<number>(0);
  penaltyHits = input<number>(0);
  difficulty = input<'facil' | 'normal' | 'dificil'>('normal');

  restartGame = output<void>();
  goHome = output<void>();
  saveScore = output<string>();

  playerName = signal<string>('');
  isSubmitting = signal<boolean>(false);
  isSaved = signal<boolean>(false);
  saveMessage = signal<string>('');

  setSaveResult(msg: string) {
    this.saveMessage.set(msg);
    this.isSubmitting.set(false);
    this.isSaved.set(true);
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
