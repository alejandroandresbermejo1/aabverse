import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { OngameComponent } from './components/game/ongame/ongame.component';
import { FooterComponent } from './components/footer/footer.component';
import { RecordService } from './services/record.service';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type CrosshairStyle = 'default' | 'dot' | 'classic';

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
  crosshairStyle = signal<CrosshairStyle>('classic');

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
      if (remoteRecords['classic'] !== undefined) {
        this.classicHighScore.set(remoteRecords['classic']);
        localStorage.setItem(this.CLASSIC_STORAGE_KEY, remoteRecords['classic'].toString());
      }
      if (remoteRecords['survival'] !== undefined) {
        this.survivalHighScore.set(remoteRecords['survival']);
        localStorage.setItem(this.SURVIVAL_STORAGE_KEY, remoteRecords['survival'].toString());
      }
      if (remoteRecords['hunt'] !== undefined) {
        this.huntHighScore.set(remoteRecords['hunt']);
        localStorage.setItem(this.HUNT_STORAGE_KEY, remoteRecords['hunt'].toString());
      }
    }
  }

  async onScoreSubmitted(event: {
    score: number;
    mode: 'classic' | 'survival' | 'hunt';
    difficulty: DifficultyLevel;
  }) {
    if (event.difficulty !== 'hard') {
      return;
    }

    let finalScore = event.score;

    const response = await this.recordService.submitScore(event.mode, event.difficulty, event.score);
    if (response && response.record !== undefined) {
      finalScore = response.record;
    }

    if (event.mode === 'classic') {
      if (finalScore > this.classicHighScore()) {
        this.classicHighScore.set(finalScore);
        localStorage.setItem(this.CLASSIC_STORAGE_KEY, finalScore.toString());
      }
    } else if (event.mode === 'survival') {
      if (finalScore > this.survivalHighScore()) {
        this.survivalHighScore.set(finalScore);
        localStorage.setItem(this.SURVIVAL_STORAGE_KEY, finalScore.toString());
      }
    } else if (event.mode === 'hunt') {
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
