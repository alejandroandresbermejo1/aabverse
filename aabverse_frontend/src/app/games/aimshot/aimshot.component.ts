import { Component, signal, OnInit } from '@angular/core';
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
  private readonly CLASSIC_STORAGE_KEY = 'aimshot_highscore_classic';
  private readonly SURVIVAL_STORAGE_KEY = 'aimshot_highscore_survival';
  private readonly HUNT_STORAGE_KEY = 'aimshot_highscore_hunt';

  classicHighScore = signal<number>(0);
  survivalHighScore = signal<number>(0);
  huntHighScore = signal<number>(0);

  difficulty = signal<DifficultyLevel>('normal');
  crosshairStyle = signal<CrosshairStyle>('clasica');

  constructor(private recordService: RecordService) {}

  async ngOnInit() {
    this.loadHighScores();
    await this.syncRemoteRecords();
  }

  private loadHighScores() {
    const savedClassic =
      localStorage.getItem(this.CLASSIC_STORAGE_KEY) || localStorage.getItem('aimshot_highscore');
    if (savedClassic) {
      this.classicHighScore.set(parseInt(savedClassic, 10) || 0);
    }

    const savedSurvival = localStorage.getItem(this.SURVIVAL_STORAGE_KEY);
    if (savedSurvival) {
      this.survivalHighScore.set(parseInt(savedSurvival, 10) || 0);
    }

    const savedHunt = localStorage.getItem(this.HUNT_STORAGE_KEY);
    if (savedHunt) {
      this.huntHighScore.set(parseInt(savedHunt, 10) || 0);
    }
  }

  private async syncRemoteRecords() {
    const remoteRecords = await this.recordService.fetchRecords();
    if (remoteRecords) {
      const contrarelojVal = remoteRecords['contrareloj'] ?? remoteRecords['classic'];
      if (contrarelojVal !== undefined) {
        this.classicHighScore.set(contrarelojVal);
        localStorage.setItem(this.CLASSIC_STORAGE_KEY, contrarelojVal.toString());
      }
      const supervivenciaVal = remoteRecords['supervivencia'] ?? remoteRecords['survival'];
      if (supervivenciaVal !== undefined) {
        this.survivalHighScore.set(supervivenciaVal);
        localStorage.setItem(this.SURVIVAL_STORAGE_KEY, supervivenciaVal.toString());
      }
      const cazaVal = remoteRecords['caza'] ?? remoteRecords['hunt'];
      if (cazaVal !== undefined) {
        this.huntHighScore.set(cazaVal);
        localStorage.setItem(this.HUNT_STORAGE_KEY, cazaVal.toString());
      }
    }
  }

  async onScoreSubmitted(event: {
    score: number;
    mode: 'contrareloj' | 'supervivencia' | 'caza';
    difficulty: DifficultyLevel;
  }) {
    if (event.difficulty !== 'dificil') {
      return;
    }

    let finalScore = event.score;

    const response = await this.recordService.submitScore(event.mode, event.difficulty, event.score);
    if (response && response.record !== undefined) {
      finalScore = response.record;
    }

    if (event.mode === 'contrareloj') {
      if (finalScore > this.classicHighScore()) {
        this.classicHighScore.set(finalScore);
        localStorage.setItem(this.CLASSIC_STORAGE_KEY, finalScore.toString());
      }
    } else if (event.mode === 'supervivencia') {
      if (finalScore > this.survivalHighScore()) {
        this.survivalHighScore.set(finalScore);
        localStorage.setItem(this.SURVIVAL_STORAGE_KEY, finalScore.toString());
      }
    } else if (event.mode === 'caza') {
      if (finalScore > this.huntHighScore()) {
        this.huntHighScore.set(finalScore);
        localStorage.setItem(this.HUNT_STORAGE_KEY, finalScore.toString());
      }
    }
  }

  onResetHighScore() {
    this.classicHighScore.set(0);
    this.survivalHighScore.set(0);
    this.huntHighScore.set(0);
    localStorage.removeItem(this.CLASSIC_STORAGE_KEY);
    localStorage.removeItem(this.SURVIVAL_STORAGE_KEY);
    localStorage.removeItem(this.HUNT_STORAGE_KEY);
    localStorage.removeItem('aimshot_highscore');
  }
}
