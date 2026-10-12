import { Component, input, output } from '@angular/core';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type CrosshairStyle = 'default' | 'dot' | 'classic';
export type GameMode = 'classic' | 'survival' | 'hunt';

@Component({
  selector: 'app-setupgame',
  standalone: true,
  templateUrl: './setupgame.component.html',
  styleUrl: './setupgame.component.css'
})
export class SetupgameComponent {
  mode = input<GameMode>('classic');
  difficulty = input<DifficultyLevel>('normal');
  crosshairStyle = input<CrosshairStyle>('classic');

  modeChange = output<GameMode>();
  difficultyChange = output<DifficultyLevel>();
  crosshairStyleChange = output<CrosshairStyle>();
  startGame = output<void>();

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
