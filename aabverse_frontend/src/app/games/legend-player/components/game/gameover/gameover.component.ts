import { Component, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../../services/game.service';
import { handleBadgeError } from '../../../utils/badge-fallback.utils';
import { Award } from '../../../models/game.models';

@Component({
  selector: 'app-gameover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gameover.component.html',
  styleUrl: './gameover.component.css'
})
export class GameoverComponent {
  private gameService = inject(GameService);

  @ViewChild('individualShelf') individualShelf?: ElementRef<HTMLDivElement>;
  @ViewChild('teamShelf') teamShelf?: ElementRef<HTMLDivElement>;
  @ViewChild('nationalShelf') nationalShelf?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.allTimeAwards();
      setTimeout(() => {
        if (this.individualShelf?.nativeElement) {
          this.individualShelf.nativeElement.scrollTop = this.individualShelf.nativeElement.scrollHeight;
        }
        if (this.teamShelf?.nativeElement) {
          this.teamShelf.nativeElement.scrollTop = this.teamShelf.nativeElement.scrollHeight;
        }
        if (this.nationalShelf?.nativeElement) {
          this.nationalShelf.nativeElement.scrollTop = this.nationalShelf.nativeElement.scrollHeight;
        }
      }, 50);
    });
  }

  hoveredAward = signal<{ name: string; icon: string; teamName?: string; teamBadge?: string; age: number; x: number; y: number; targetX: number } | null>(null);

  onAwardMouseEnter(event: MouseEvent, award: any) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const rawX = rect.left + rect.width / 2;
    const clampedX = Math.max(85, Math.min(window.innerWidth - 85, rawX));
    const clampedY = rect.top < 60 ? rect.bottom + 45 : rect.top - 8;
    this.hoveredAward.set({
      name: award.name,
      icon: award.icon,
      teamName: award.teamName,
      teamBadge: award.teamBadge,
      age: award.age,
      x: clampedX,
      y: clampedY,
      targetX: rawX
    });
  }

  onAwardMouseLeave() {
    this.hoveredAward.set(null);
  }

  onBadgeError(event: Event, teamName?: string, countryFlag?: string) {
    handleBadgeError(event, teamName, countryFlag);
  }

  player = () => this.gameService.state().player;
  history = () => this.gameService.state().seasonHistory;
  allTimeAwards = () => this.gameService.state().allTimeAwards;

  get peakOvr(): number {
    const historyOvrList = this.history().map(h => h.ovr || 0);
    const currentOvr = this.player()?.ovr || 0;
    return Math.max(currentOvr, ...historyOvrList, 0);
  }

  get peakMarketValue(): number {
    const historyValList = this.history().map(h => h.marketValue || 0);
    const currentVal = this.player()?.marketValue || 0;
    return Math.max(currentVal, ...historyValList, 0);
  }

  getOvrClass(ovr: number | undefined): string {
    const val = ovr || 50;
    if (val >= 90) return 'ovr-legendary';
    if (val >= 85) return 'ovr-special-gold';
    if (val >= 75) return 'ovr-gold';
    if (val >= 65) return 'ovr-silver';
    return 'ovr-bronze';
  }

  individualAwards = () => this.allTimeAwards().filter((a: Award) => a.type === 'individual' || (!a.type && !a.isNational && !a.name.includes('Campeón') && !a.name.includes('Copa de') && !a.name.includes('Supercopa')));
  nationalTrophies = () => this.allTimeAwards().filter((a: Award) => a.isNational || ['Copa del Mundo FIFA', 'UEFA Euro', 'Copa América', 'Eurocopa', 'UEFA Nations League', 'Finalissima'].some(n => a.name.includes(n)));
  teamTrophies = () => this.allTimeAwards().filter((a: Award) => (a.type === 'team' || a.name.includes('Campeón') || a.name.includes('Copa') || a.name.includes('Supercopa')) && !this.nationalTrophies().includes(a) && !this.individualAwards().includes(a));

  get statConfig() {
    const pos = this.player()?.position || 'DC';
    if (pos === 'POR') {
      return {
        stat1Label: 'PP',
        stat1FullName: 'PARADAS PORTERÍA',
        stat1Icon: '🧤',
        stat1Key: 'saves',
        stat2Label: 'DP',
        stat2FullName: 'DISPAROS A PUERTA',
        stat2Icon: '🛡️',
        stat2Key: 'defensiveActions'
      };
    }
    if (['DFC', 'LD', 'LI'].includes(pos)) {
      return {
        stat1Label: 'AD',
        stat1FullName: 'ATAQUES DEFENDIDOS',
        stat1Icon: '🛡️',
        stat1Key: 'defensiveActions',
        stat2Label: 'A',
        stat2FullName: 'ASISTENCIAS',
        stat2Icon: '👟',
        stat2Key: 'assists'
      };
    }
    if (['MC', 'MI', 'MD', 'MCD', 'MCO'].includes(pos)) {
      return {
        stat1Label: 'A',
        stat1FullName: 'ASISTENCIAS',
        stat1Icon: '👟',
        stat1Key: 'assists',
        stat2Label: 'G',
        stat2FullName: 'GOLES',
        stat2Icon: '⚽',
        stat2Key: 'goals'
      };
    }
    return {
      stat1Label: 'G',
      stat1FullName: 'GOLES',
      stat1Icon: '⚽',
      stat1Key: 'goals',
      stat2Label: 'A',
      stat2FullName: 'ASISTENCIAS',
      stat2Icon: '👟',
      stat2Key: 'assists'
    };
  }

  getStatValue(obj: any, key: string): number {
    if (!obj) return 0;
    return obj[key] || 0;
  }

  onNewCareer() {
    this.gameService.resetGame();
  }

  formatMarketValue(val: number): string {
    if (!val || val <= 0) return '0k';
    if (val < 1) {
      const kVal = Math.round(val * 1000);
      return `${kVal}k`;
    }
    return `${val.toFixed(1)}M`;
  }
}
