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

  newScoreEvent = output<{
    score: number;
    mode: GameMode;
    difficulty: DifficultyLevel;
    playerName: string;
  }>();
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
  private isMouseDown = false;
  private isSpaceDown = false;

  @HostListener('window:mousemove', ['$event'])
  onGlobalMouseMove(e: MouseEvent) {
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    if (e.buttons === 0 && this.isMouseDown) {
      this.isMouseDown = false;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onGlobalMouseUp(e: MouseEvent) {
    this.isMouseDown = false;
  }

  @HostListener('window:keyup', ['$event'])
  onGlobalKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      this.isSpaceDown = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' && this.gameState() === 'playing') {
      e.preventDefault();
      if (e.repeat || this.isSpaceDown) return;
      this.isSpaceDown = true;
      this.triggerShootAt(this.lastClientX, this.lastClientY);
    }
  }

  private triggerShootAt(clientX: number, clientY: number) {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const targetWrapper = el?.closest('.target-wrapper') as HTMLElement | null;
    if (targetWrapper) {
      const targetId = targetWrapper.getAttribute('data-target-id');
      const target = this.targets().find(t => t.id === targetId);
      if (target && !target.isHit) {
        this.processTargetHit(target, clientX, clientY, targetWrapper);
        return;
      }
    }
    this.processMiss();
  }

  startGame(e?: MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    this.isMouseDown = false;
    this.isSpaceDown = false;
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

    this.sessionStartTime = Date.now();
    this.gameState.set('playing');
    this.startTimers();
  }

  resetToIdle() {
    this.clearTimers();
    this.isMouseDown = false;
    this.isSpaceDown = false;
    this.gameState.set('idle');
    this.targets.set([]);
    this.feedbacks.set([]);
  }

  private sessionStartTime = 0;

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

    this.scheduleNextSpawn();

    this.targetCleaner = setInterval(() => {
      if (this.gameState() !== 'playing') return;

      const now = Date.now();
      const currentList = this.targets();

      if (currentMode === 'supervivencia' || currentMode === 'caza') {
        const missedTargets = currentList.filter(
          t => !t.isHit && (now - t.createdAt) >= t.durationMs && t.type !== 'penalty'
        );

        if (missedTargets.length > 0) {
          for (const mt of missedTargets) {
            this.showFeedback(mt.x, mt.y, '-1', 'penalty', true);
          }
          this.loseLives(missedTargets.length);
        }
      }

      this.targets.update(list => list.filter(t => t.isHit || (now - t.createdAt) < t.durationMs));
    }, 75);
  }

  private scheduleNextSpawn() {
    if (this.gameState() !== 'playing') return;

    const currentMode = this.mode();
    let spawnDelay = 800;

    if (currentMode === 'caza') {
      const elapsedSec = (Date.now() - this.sessionStartTime) / 1000;
      if (this.difficulty() === 'dificil') {
        spawnDelay = Math.max(380, Math.round(620 - elapsedSec * 2.5));
      } else if (this.difficulty() === 'normal') {
        spawnDelay = Math.max(480, Math.round(750 - elapsedSec * 2.5));
      } else {
        spawnDelay = Math.max(620, Math.round(920 - elapsedSec * 2.0));
      }
    } else if (currentMode === 'contrareloj') {
      const speedMap = { facil: 1000, normal: 800, dificil: 550 };
      spawnDelay = speedMap[this.difficulty()];
    } else {
      const elapsedSec = (Date.now() - this.sessionStartTime) / 1000;
      if (this.difficulty() === 'dificil') {
        spawnDelay = Math.max(320, Math.round(620 - elapsedSec * 4.6));
      } else if (this.difficulty() === 'normal') {
        spawnDelay = Math.max(430, Math.round(750 - elapsedSec * 3.8));
      } else {
        spawnDelay = Math.max(560, Math.round(900 - elapsedSec * 3.2));
      }
    }

    this.targetSpawner = setTimeout(() => {
      if (this.gameState() === 'playing') {
        this.spawnTarget();
        this.scheduleNextSpawn();
      }
    }, spawnDelay);
  }

  private loseLives(amount: number) {
    this.lives.update(l => Math.max(0, l - amount));
    if (this.lives() <= 0) {
      this.endGame();
    }
  }

  private spawnTarget() {
    const currentTargets = this.targets();
    const activeTargets = currentTargets.filter(t => !t.isHit);
    const currentMode = this.mode();
    const diff = this.difficulty();
    const elapsedSec = (Date.now() - this.sessionStartTime) / 1000;

    let maxTargets = { facil: 4, normal: 5, dificil: 7 }[diff];
    if (currentMode === 'supervivencia') {
      if (diff === 'dificil') {
        if (elapsedSec > 45) maxTargets = 6;
        else if (elapsedSec > 25) maxTargets = 5;
        else if (elapsedSec > 12) maxTargets = 4;
        else maxTargets = 3;
      } else if (diff === 'normal') {
        if (elapsedSec > 45) maxTargets = 5;
        else if (elapsedSec > 20) maxTargets = 4;
        else maxTargets = 3;
      } else {
        if (elapsedSec > 30) maxTargets = 4;
        else maxTargets = 3;
      }
    } else if (currentMode === 'caza') {
      if (diff === 'dificil') {
        if (elapsedSec > 60) maxTargets = 7;
        else if (elapsedSec > 30) maxTargets = 6;
        else maxTargets = 5;
      } else if (diff === 'normal') {
        if (elapsedSec > 40) maxTargets = 6;
        else maxTargets = 5;
      }
    }

    if (activeTargets.length >= maxTargets) return;

    const rand = Math.random();
    let type: TargetType = 'standard';
    let points = 100;
    let durationMs = 2500;
    let sizePx = 64;

    if (currentMode === 'supervivencia' && diff === 'dificil') {
      const baseDuration = Math.max(1200, Math.round(1640 - elapsedSec * 4.4));
      const baseSize = Math.max(55, Math.round(63 - elapsedSec * 0.065));

      if (rand > 0.88) {
        type = 'golden';
        points = 500;
        durationMs = Math.max(900, Math.round(1280 - elapsedSec * 3.6));
        sizePx = Math.max(47, Math.round(baseSize * 0.84));
      } else if (rand > 0.77) {
        type = 'penalty';
        points = -150;
        durationMs = Math.max(1280, Math.round(1680 - elapsedSec * 3.8));
        sizePx = baseSize;
      } else {
        type = 'standard';
        points = 100;
        durationMs = baseDuration;
        sizePx = baseSize;
      }
    } else if (currentMode === 'supervivencia') {
      if (diff === 'normal') {
        const baseDuration = Math.max(750, Math.round(1600 - elapsedSec * 14));
        const baseSize = Math.max(50, Math.round(62 - elapsedSec * 0.15));
        if (rand > 0.85) {
          type = 'golden';
          points = 500;
          durationMs = Math.max(550, Math.round(1200 - elapsedSec * 10));
          sizePx = 44;
        } else if (rand > 0.68) {
          type = 'penalty';
          points = -150;
          durationMs = Math.max(900, Math.round(1400 - elapsedSec * 10));
          sizePx = baseSize;
        } else {
          durationMs = baseDuration;
          sizePx = baseSize;
        }
      } else {
        const baseDuration = Math.max(1200, Math.round(2400 - elapsedSec * 16));
        if (rand > 0.85) {
          type = 'golden';
          points = 500;
          durationMs = Math.max(850, Math.round(1700 - elapsedSec * 12));
          sizePx = 48;
        } else if (rand > 0.72) {
          type = 'penalty';
          points = -150;
          durationMs = Math.max(1400, Math.round(2000 - elapsedSec * 12));
          sizePx = 64;
        } else {
          durationMs = baseDuration;
          sizePx = 64;
        }
      }
    } else {
      const durationMultMap = { facil: 1.3, normal: 1.0, dificil: 0.7 };
      const mult = durationMultMap[diff];
      durationMs = Math.round(2500 * mult);
      sizePx = 64;

      if (rand > 0.85) {
        type = 'golden';
        points = 500;
        durationMs = Math.round(1800 * mult);
        sizePx = 48;
      } else if (rand > 0.65) {
        type = 'penalty';
        points = -150;
        durationMs = Math.round(2200 * mult);
        sizePx = 64;
      }
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
        const huntVerticalDurationMap = {
          facil: Math.max(3200, Math.round(4400 - elapsedSec * 10)),
          normal: Math.max(2600, Math.round(3600 - elapsedSec * 9)),
          dificil: Math.max(2100, Math.round(2900 - elapsedSec * 8))
        };
        durationMs = huntVerticalDurationMap[this.difficulty()];

        const fromTop = Math.random() > 0.5;
        startY = fromTop ? -10 : 110;
        endY = fromTop ? 110 : -10;
        startX = Math.floor(Math.random() * 70) + 15;
        endX = startX + (Math.random() * 20 - 10);
      } else {
        const huntHorizontalDurationMap = {
          facil: Math.max(2800, Math.round(3700 - elapsedSec * 8)),
          normal: Math.max(2200, Math.round(3000 - elapsedSec * 7)),
          dificil: Math.max(1850, Math.round(2550 - elapsedSec * 6.5))
        };
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
      const minDistance = currentMode === 'supervivencia' && diff === 'dificil' ? 9 : 12;
      let validPosition = false;
      let attempts = 0;

      while (!validPosition && attempts < 15) {
        x = Math.floor(Math.random() * 75) + 12;
        y = Math.floor(Math.random() * 65) + 18;
        attempts++;

        const hasOverlap = activeTargets.some(t => {
          const dx = t.x - x;
          const dy = t.y - y;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!hasOverlap) validPosition = true;
      }

      if (!validPosition && activeTargets.length > 0) return;
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
    if (e.button !== undefined && e.button !== 0) return;
    if (this.isMouseDown) return;
    this.isMouseDown = true;
    this.processMiss();
  }

  onTargetHit(target: Target, event: MouseEvent) {
    event.stopPropagation();
    if (this.gameState() !== 'playing' || target.isHit) return;
    if (event.button !== undefined && event.button !== 0) return;
    if (this.isMouseDown) return;
    this.isMouseDown = true;

    const targetElement = (event.currentTarget as HTMLElement) || (event.target as HTMLElement)?.closest('.target-wrapper');
    this.processTargetHit(target, event.clientX, event.clientY, targetElement);
  }

  private processMiss() {
    this.totalShots.update(s => s + 1);
  }

  private processTargetHit(target: Target, clientX?: number, clientY?: number, targetElement?: HTMLElement | null) {
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

    if (targetElement && this.gameAreaRef?.nativeElement) {
      const areaRect = this.gameAreaRef.nativeElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      feedbackX = ((targetRect.left + targetRect.width / 2 - areaRect.left) / areaRect.width) * 100;
      feedbackY = ((targetRect.top + targetRect.height / 2 - areaRect.top) / areaRect.height) * 100;
    } else if (clientX !== undefined && clientY !== undefined && this.gameAreaRef?.nativeElement) {
      const areaRect = this.gameAreaRef.nativeElement.getBoundingClientRect();
      feedbackX = ((clientX - areaRect.left) / areaRect.width) * 100;
      feedbackY = ((clientY - areaRect.top) / areaRect.height) * 100;
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
  }

  @ViewChild('gameoverComp') gameoverComp?: GameoverComponent;

  onSaveScore(playerName: string) {
    this.newScoreEvent.emit({
      score: this.score(),
      mode: this.mode(),
      difficulty: this.difficulty(),
      playerName: playerName || 'Anónimo'
    });
  }

  notifyScoreSaved(message: string) {
    if (this.gameoverComp) {
      this.gameoverComp.setSaveResult(message);
    }
  }

  private clearTimers() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.targetSpawner) {
      clearTimeout(this.targetSpawner);
      clearInterval(this.targetSpawner);
    }
    if (this.targetCleaner) clearInterval(this.targetCleaner);
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}

