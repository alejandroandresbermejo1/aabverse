import { Component, input, output } from '@angular/core';

export type DifficultyLevel = 'facil' | 'normal' | 'dificil';
export type CrosshairStyle = 'defecto' | 'punto' | 'clasica';
export type GameMode = 'contrareloj' | 'supervivencia' | 'caza';

@Component({
  selector: 'app-setupgame',
  standalone: true,
  templateUrl: './setupgame.component.html',
  styleUrl: './setupgame.component.css'
})
export class SetupgameComponent {
  mode = input<GameMode>('contrareloj');
  difficulty = input<DifficultyLevel>('normal');
  crosshairStyle = input<CrosshairStyle>('clasica');

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
