import { Component, signal, computed, input, OnDestroy, ElementRef, ViewChild, output, HostListener } from '@angular/core';
import { Target, TargetType } from '../../../models/target.model';
import { SetupgameComponent, DifficultyLevel, CrosshairStyle, GameMode } from '../setupgame/setupgame.component';
import { GameoverComponent } from '../gameover/gameover.component';

type GameState = 'idle' | 'playing' | 'ended';

interface ClickFeedback {
  id: string;
  x: number;
  y: number;
  text: string;
  targetType: TargetType;
  useHeartIcon?: boolean;
}

@Component({
  selector: 'app-ongame',
  standalone: true,
  imports: [SetupgameComponent, GameoverComponent],
  templateUrl: './ongame.component.html',
  styleUrl: './ongame.component.css'
})
export class OngameComponent implements OnDestroy {
  @ViewChild('gameArea') gameAreaRef!: ElementRef<HTMLDivElement>;

  newScoreEvent = output<{ score: number; mode: GameMode; difficulty: DifficultyLevel }>();
  crosshairStyleChange = output<CrosshairStyle>();

  mode = signal<GameMode>('contrareloj');
  difficulty = signal<DifficultyLevel>('normal');
  crosshairStyle = input<CrosshairStyle>('clasica');

  selectCrosshair(style: CrosshairStyle) {
    this.crosshairStyleChange.emit(style);
  }

  gameState = signal<GameState>('idle');
  score = signal<number>(0);
  timeLeft = signal<number>(45);
  lives = signal<number>(3);
  maxLives = signal<number>(3);
  targets = signal<Target[]>([]);
  feedbacks = signal<ClickFeedback[]>([]);

  totalShots = signal<number>(0);
  totalHits = signal<number>(0);
  standardHits = signal<number>(0);
  goldenHits = signal<number>(0);
  penaltyHits = signal<number>(0);

  accuracy = computed(() => {
    if (this.totalShots() === 0) return 0;
    return Math.round((this.totalHits() / this.totalShots()) * 100);
  });

  livesArray = computed(() => Array.from({ length: this.maxLives() }, (_, i) => i < this.lives()));

  private gameTimer?: any;
  private targetSpawner?: any;
  private targetCleaner?: any;

  private lastClientX = 0;
  private lastClientY = 0;

  @HostListener('window:mousemove', ['$event'])
  onGlobalMouseMove(e: MouseEvent) {
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' && this.gameState() === 'playing') {
      e.preventDefault();
      const el = document.elementFromPoint(this.lastClientX, this.lastClientY) as HTMLElement | null;
      const targetWrapper = el?.closest('.target-wrapper') as HTMLElement | null;
      if (targetWrapper) {
        targetWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      } else {
        this.onAreaClick(new MouseEvent('mousedown'));
      }
    }
  }

  startGame(e?: MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    this.score.set(0);
    this.timeLeft.set(45);
    this.totalShots.set(0);
    this.totalHits.set(0);
    this.standardHits.set(0);
    this.goldenHits.set(0);
    this.penaltyHits.set(0);
    this.targets.set([]);
    this.feedbacks.set([]);

    const initialLivesMap = { facil: 5, normal: 4, dificil: 3 };
    const startingLives = initialLivesMap[this.difficulty()];
    this.maxLives.set(startingLives);
    this.lives.set(startingLives);

    this.gameState.set('playing');
    this.startTimers();
  }

  resetToIdle() {
    this.clearTimers();
    this.gameState.set('idle');
    this.targets.set([]);
    this.feedbacks.set([]);
  }

  private startTimers() {
    this.clearTimers();

    const currentMode = this.mode();

    if (currentMode === 'contrareloj') {
      this.gameTimer = setInterval(() => {
        this.timeLeft.update(t => {
          if (t <= 1) {
            this.endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    let spawnInterval = 800;
    if (currentMode === 'caza') {
      const huntSpeedMap = { facil: 900, normal: 700, dificil: 500 };
      spawnInterval = huntSpeedMap[this.difficulty()];
    } else {
      const speedMap = { facil: 1000, normal: 800, dificil: 550 };
      spawnInterval = speedMap[this.difficulty()];
    }

    this.targetSpawner = setInterval(() => {
      if (this.gameState() === 'playing') {
        this.spawnTarget();
      }
    }, spawnInterval);

    this.targetCleaner = setInterval(() => {
      if (this.gameState() !== 'playing') return;

      const now = Date.now();
      const currentList = this.targets();

      if (currentMode === 'supervivencia' || currentMode === 'caza') {
        const missedTargets = currentList.filter(
          t => !t.isHit && (now - t.createdAt) >= t.durationMs && t.type !== 'penalty'
        );

        if (missedTargets.length > 0) {
          this.loseLives(missedTargets.length);
        }
      }

      this.targets.update(list => list.filter(t => (now - t.createdAt) < t.durationMs));
    }, 150);
  }

  private loseLives(amount: number) {
    this.lives.update(l => Math.max(0, l - amount));
    if (this.lives() <= 0) {
      this.endGame();
    }
  }

  private spawnTarget() {
    const currentTargets = this.targets();
    const maxTargetsMap = { facil: 4, normal: 5, dificil: 7 };
    if (currentTargets.length >= maxTargetsMap[this.difficulty()]) return;

    const currentMode = this.mode();
    const rand = Math.random();
    let type: TargetType = 'standard';
    let points = 100;

    const durationMultMap = { facil: 1.3, normal: 1.0, dificil: 0.7 };
    const mult = durationMultMap[this.difficulty()];

    let durationMs = Math.round(2500 * mult);
    let sizePx = 64;

    if (rand > 0.85) {
      type = 'golden';
      points = 500;
      durationMs = Math.round(1800 * mult);
      sizePx = 48;
    } else if (rand > 0.65) {
      type = 'penalty';
      points = -150;
      durationMs = Math.round(2200 * mult);
      sizePx = 70;
    }

    let x = 50;
    let y = 50;
    let startX: number | undefined;
    let startY: number | undefined;
    let endX: number | undefined;
    let endY: number | undefined;

    if (currentMode === 'caza') {
      const isVertical = Math.random() > 0.65;

      if (isVertical) {
        const huntVerticalDurationMap = { facil: 4200, normal: 3400, dificil: 2500 };
        durationMs = huntVerticalDurationMap[this.difficulty()];

        const fromTop = Math.random() > 0.5;
        startY = fromTop ? -10 : 110;
        endY = fromTop ? 110 : -10;
        startX = Math.floor(Math.random() * 70) + 15;
        endX = startX + (Math.random() * 20 - 10);
      } else {
        const huntHorizontalDurationMap = { facil: 3600, normal: 2800, dificil: 2000 };
        durationMs = huntHorizontalDurationMap[this.difficulty()];

        const fromLeft = Math.random() > 0.5;
        startX = fromLeft ? -8 : 108;
        endX = fromLeft ? 108 : -8;
        startY = Math.floor(Math.random() * 55) + 20;
        endY = startY + (Math.random() * 16 - 8);
      }

      x = startX;
      y = startY;
    } else {
      const minDistance = 12;
      let validPosition = false;
      let attempts = 0;

      while (!validPosition && attempts < 15) {
        x = Math.floor(Math.random() * 75) + 12;
        y = Math.floor(Math.random() * 65) + 18;
        attempts++;

        const hasOverlap = currentTargets.some(t => {
          const dx = t.x - x;
          const dy = t.y - y;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!hasOverlap) validPosition = true;
      }

      if (!validPosition && currentTargets.length > 0) return;
    }

    const newTarget: Target = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      x,
      y,
      startX,
      startY,
      endX,
      endY,
      points,
      durationMs,
      sizePx,
      createdAt: Date.now()
    };

    this.targets.update(list => [...list, newTarget]);
  }

  onAreaClick(e: MouseEvent) {
    if (this.gameState() !== 'playing') return;
    this.totalShots.update(s => s + 1);
  }

  onTargetHit(target: Target, event: MouseEvent) {
    event.stopPropagation();

    if (this.gameState() !== 'playing' || target.isHit) return;

    this.targets.update(list => list.map(t => t.id === target.id ? { ...t, isHit: true } : t));

    this.totalShots.update(s => s + 1);
    this.totalHits.update(h => h + 1);

    this.score.update(currentScore => Math.max(0, currentScore + target.points));

    if (target.type === 'standard') {
      this.standardHits.update(h => h + 1);
    } else if (target.type === 'golden') {
      this.goldenHits.update(h => h + 1);
    } else if (target.type === 'penalty') {
      this.penaltyHits.update(h => h + 1);
      if (this.mode() === 'supervivencia' || this.mode() === 'caza') {
        this.loseLives(1);
      }
    }

    let feedbackX = target.x;
    let feedbackY = target.y;

    const targetElement = (event.currentTarget as HTMLElement) || (event.target as HTMLElement)?.closest('.target-wrapper');
    if (targetElement && this.gameAreaRef?.nativeElement) {
      const areaRect = this.gameAreaRef.nativeElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      feedbackX = ((targetRect.left + targetRect.width / 2 - areaRect.left) / areaRect.width) * 100;
      feedbackY = ((targetRect.top + targetRect.height / 2 - areaRect.top) / areaRect.height) * 100;
    } else if (event.clientX && event.clientY && this.gameAreaRef?.nativeElement) {
      const areaRect = this.gameAreaRef.nativeElement.getBoundingClientRect();
      feedbackX = ((event.clientX - areaRect.left) / areaRect.width) * 100;
      feedbackY = ((event.clientY - areaRect.top) / areaRect.height) * 100;
    }

    if (target.type === 'penalty') {
      const isLifeLossMode = this.mode() === 'supervivencia' || this.mode() === 'caza';
      if (isLifeLossMode) {
        this.showFeedback(feedbackX, feedbackY, '-1', 'penalty', true);
      } else {
        this.showFeedback(feedbackX, feedbackY, '-150', 'penalty', false);
      }
    } else if (target.type === 'golden') {
      this.showFeedback(feedbackX, feedbackY, '+500', 'golden');
    } else {
      this.showFeedback(feedbackX, feedbackY, '+100', 'standard');
    }

    setTimeout(() => {
      this.targets.update(list => list.filter(t => t.id !== target.id));
    }, 700);
  }

  private showFeedback(x: number, y: number, text: string, targetType: TargetType, useHeartIcon = false) {
    const id = Math.random().toString(36).substring(2, 9);
    this.feedbacks.update(list => [...list, { id, x, y, text, targetType, useHeartIcon }]);

    setTimeout(() => {
      this.feedbacks.update(list => list.filter(f => f.id !== id));
    }, 800);
  }

  private endGame() {
    this.clearTimers();
    this.gameState.set('ended');
    this.targets.set([]);
    this.newScoreEvent.emit({
      score: this.score(),
      mode: this.mode(),
      difficulty: this.difficulty()
    });
  }

  private clearTimers() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.targetSpawner) clearInterval(this.targetSpawner);
    if (this.targetCleaner) clearInterval(this.targetCleaner);
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}

