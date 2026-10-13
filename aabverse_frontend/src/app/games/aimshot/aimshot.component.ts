import { Component, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { OngameComponent } from './components/game/ongame/ongame.component';
import { FooterComponent } from './components/footer/footer.component';
import { RecordService } from './services/record.service';

export type DifficultyLevel = 'facil' | 'normal' | 'dificil';
export type CrosshairStyle = 'defecto' | 'punto' | 'clasica';

@Component({
  selector: 'app-aimshot-game',
  standalone: true,
  imports: [CommonModule, NavbarComponent, OngameComponent, FooterComponent],
  templateUrl: './aimshot.component.html',
  styleUrl: './aimshot.component.css'
})
export class AimshotComponent implements OnInit {
  @ViewChild('gameComp') gameComp?: OngameComponent;

  classicHighScore = signal<number>(0);
  survivalHighScore = signal<number>(0);
  huntHighScore = signal<number>(0);
  isLoadingRecords = signal<boolean>(true);

  difficulty = signal<DifficultyLevel>('normal');
  crosshairStyle = signal<CrosshairStyle>('clasica');

  constructor(private recordService: RecordService) {}

  async ngOnInit() {
    this.recordService.preloadAllLeaderboards();
    await this.syncRemoteRecords();
  }

  private async syncRemoteRecords() {
    this.isLoadingRecords.set(true);
    const remoteRecords = await this.recordService.fetchRecords();
    if (remoteRecords) {
      const contrarelojVal = remoteRecords['contrareloj'] ?? remoteRecords['classic'];
      if (contrarelojVal !== undefined) {
        this.classicHighScore.set(contrarelojVal);
      }
      const supervivenciaVal = remoteRecords['supervivencia'] ?? remoteRecords['survival'];
      if (supervivenciaVal !== undefined) {
        this.survivalHighScore.set(supervivenciaVal);
      }
      const cazaVal = remoteRecords['caza'] ?? remoteRecords['hunt'];
      if (cazaVal !== undefined) {
        this.huntHighScore.set(cazaVal);
      }
    }
    this.isLoadingRecords.set(false);
  }

  async onScoreSubmitted(event: {
    score: number;
    mode: 'contrareloj' | 'supervivencia' | 'caza';
    difficulty: DifficultyLevel;
    playerName: string;
  }) {
    let finalScore = event.score;

    const response = await this.recordService.submitScore(
      event.mode,
      event.difficulty,
      event.score,
      event.playerName
    );
    if (response) {
      if (response.record !== undefined) {
        finalScore = response.record;
      }
      if (this.gameComp) {
        this.gameComp.notifyScoreSaved(response.message);
      }
    } else {
      if (this.gameComp) {
        this.gameComp.notifyScoreSaved('No se pudo conectar con el servidor.');
      }
    }

    if (event.difficulty === 'dificil') {
      if (event.mode === 'contrareloj') {
        if (finalScore > this.classicHighScore()) {
          this.classicHighScore.set(finalScore);
        }
      } else if (event.mode === 'supervivencia') {
        if (finalScore > this.survivalHighScore()) {
          this.survivalHighScore.set(finalScore);
        }
      } else if (event.mode === 'caza') {
        if (finalScore > this.huntHighScore()) {
          this.huntHighScore.set(finalScore);
        }
      }
    }
  }
}
