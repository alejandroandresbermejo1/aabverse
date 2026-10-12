import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-gameover',
  standalone: true,
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

  onRestart() {
    this.restartGame.emit();
  }
}
