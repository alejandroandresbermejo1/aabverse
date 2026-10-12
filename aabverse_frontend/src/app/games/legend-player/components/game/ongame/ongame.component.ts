import { Component, inject, ViewChild, ElementRef, effect, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../../services/game.service';
import { ContractOption, EventChoice, Award } from '../../../models/game.models';
import { handleBadgeError } from '../../../utils/badge-fallback.utils';

@Component({
  selector: 'app-ongame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ongame.component.html',
  styleUrl: './ongame.component.css'
})
export class OngameComponent {
  private gameService = inject(GameService);

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

  @ViewChild('timelineContainer') timelineContainer?: ElementRef<HTMLDivElement>;

  player = () => this.gameService.state().player;
  currentOffers = () => this.gameService.state().currentOffers;
  seasonHistory = () => [...this.gameService.state().seasonHistory].sort((a, b) => {
    const ageA = parseInt(String(a.age));
    const ageB = parseInt(String(b.age));
    if (ageA !== ageB) return ageA - ageB;
    if (a.isNationalTeam && !b.isNationalTeam) return 1;
    if (!a.isNationalTeam && b.isNationalTeam) return -1;
    return 0;
  });
  allTimeAwards = () => this.gameService.state().allTimeAwards;
  individualAwards = () => this.allTimeAwards().filter((a: Award) => a.type === 'individual' || (!a.type && !a.isNational && !a.name.includes('Campeón') && !a.name.includes('Copa de') && !a.name.includes('Supercopa')));
  nationalTrophies = () => this.allTimeAwards().filter((a: Award) => a.isNational || ['Copa del Mundo FIFA', 'UEFA Euro', 'Copa América', 'Eurocopa', 'UEFA Nations League', 'Finalissima'].some(n => a.name.includes(n)));
  teamTrophies = () => this.allTimeAwards().filter((a: Award) => (a.type === 'team' || a.name.includes('Campeón') || a.name.includes('Copa') || a.name.includes('Supercopa')) && !this.nationalTrophies().includes(a) && !this.individualAwards().includes(a));
  pendingEvent = () => this.gameService.state().pendingEvent;
  activeEventResult = () => this.gameService.state().activeEventResult;
  activeEventDetails = () => this.gameService.state().activeEventDetails;
  isSpinningRoulette = () => this.gameService.state().isSpinningRoulette;
  isSimulating = () => this.gameService.state().isSimulating;
  simProgressWidth = () => this.gameService.state().simProgressWidth ?? 0;
  simProgressDuration = () => this.gameService.state().simProgressDuration ?? 0;
  simulatingSpeed = () => this.gameService.state().speed;

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

  getOvrClass(ovr: number | undefined): string {
    const val = ovr || 50;
    if (val >= 90) return 'ovr-legendary';
    if (val >= 85) return 'ovr-special-gold';
    if (val >= 75) return 'ovr-gold';
    if (val >= 65) return 'ovr-silver';
    return 'ovr-bronze';
  }

  @ViewChild('individualShelf') individualShelf?: ElementRef<HTMLDivElement>;
  @ViewChild('teamShelf') teamShelf?: ElementRef<HTMLDivElement>;
  @ViewChild('nationalShelf') nationalShelf?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.seasonHistory();
      this.allTimeAwards();
      setTimeout(() => {
        if (this.timelineContainer?.nativeElement) {
          this.timelineContainer.nativeElement.scrollTop = this.timelineContainer.nativeElement.scrollHeight;
        }
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

  @ViewChild('rouletteDisc') set rouletteDiscRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref?.nativeElement) {
      const details = this.activeEventDetails();
      if (details) {
        const risk = details.riskPercent || 50;
        const greenEndDeg = (risk / 100) * 360;
        
        let targetLandingDeg = 0;
        if (details.isSuccess) {
          const min = Math.min(15, greenEndDeg * 0.2);
          const max = Math.max(greenEndDeg - 15, greenEndDeg * 0.8);
          targetLandingDeg = min + Math.random() * Math.max(1, max - min);
        } else {
          const redSpan = 360 - greenEndDeg;
          const min = greenEndDeg + Math.min(15, redSpan * 0.2);
          const max = Math.max(greenEndDeg + redSpan - 15, 360 - (redSpan * 0.2));
          targetLandingDeg = min + Math.random() * Math.max(1, max - min);
        }

        const landingOffset = 360 - targetLandingDeg;
        const totalDeg = Math.round((360 * 14) + landingOffset);

        ref.nativeElement.style.transform = 'rotate(0deg)';

        setTimeout(() => {
          if (!ref.nativeElement) return;
          ref.nativeElement.animate([
            { transform: 'rotate(0deg)' },
            { transform: `rotate(${totalDeg}deg)` }
          ], {
            duration: 4500,
            easing: 'cubic-bezier(0.08, 0.9, 0.2, 1.0)',
            fill: 'forwards'
          });

          const hubEl = ref.nativeElement.querySelector('.roulette-center-hub');
          if (hubEl) {
            hubEl.animate([
              { transform: 'rotate(0deg)' },
              { transform: `rotate(-${totalDeg}deg)` }
            ], {
              duration: 4500,
              easing: 'cubic-bezier(0.08, 0.9, 0.2, 1.0)',
              fill: 'forwards'
            });
          }
        }, 600);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.isSpinningRoulette()) return;

    if (this.activeEventResult()) {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === '1' || event.key === ' ') {
        this.dismissResult();
      }
      return;
    }

    if (this.isSimulating() && !this.pendingEvent()) return;

    const keyIndex = parseInt(event.key, 10) - 1;
    if (isNaN(keyIndex) || keyIndex < 0) return;

    const evt = this.pendingEvent();
    if (evt) {
      if (evt.choices && evt.choices[keyIndex]) {
        this.onChooseEvent(evt.choices[keyIndex]);
      }
    } else {
      const offers = this.currentOffers();
      if (offers && offers[keyIndex]) {
        this.onSelectOffer(offers[keyIndex]);
      }
    }
  }

  onSelectOffer(offer: ContractOption) {
    this.gameService.selectContract(offer);
  }

  onChooseEvent(choice: EventChoice) {
    this.gameService.resolveEventChoice(choice);
  }

  dismissResult() {
    this.gameService.dismissEventResult();
  }

  getSuccessImpactText(choice: EventChoice): string {
    const parts: string[] = [];
    if (choice.successOutcome.ovrDelta > 0) {
      parts.push(`+${choice.successOutcome.ovrDelta} OVR`);
    } else if (choice.successOutcome.ovrDelta < 0) {
      parts.push(`${choice.successOutcome.ovrDelta} OVR`);
    }

    if (choice.successOutcome.marketValueDeltaPercent !== 0) {
      const sign = choice.successOutcome.marketValueDeltaPercent > 0 ? '+' : '';
      parts.push(`${sign}${choice.successOutcome.marketValueDeltaPercent}% Val`);
    }

    if (parts.length === 0) {
      return `Éxito ${choice.riskPercent}%`;
    }

    return `Éxito ${choice.riskPercent}%: ${parts.join(', ')}`;
  }

  getFailureImpactText(choice: EventChoice): string {
    const failureRisk = 100 - choice.riskPercent;

    if (choice.failureOutcome.isFired) {
      return `Fallo ${failureRisk}%: Despido`;
    }

    const defaultMissed = Math.max(5, Math.min(45, Math.round(failureRisk * 0.45)));
    const missed = choice.failureOutcome.missedGamesPercent !== undefined
      ? choice.failureOutcome.missedGamesPercent
      : defaultMissed;
    
    const parts: string[] = [];
    parts.push(`-${missed}% PJ`);

    if (choice.failureOutcome.ovrDelta !== 0) {
      const sign = choice.failureOutcome.ovrDelta > 0 ? '+' : '';
      parts.push(`${sign}${choice.failureOutcome.ovrDelta} OVR`);
    }

    if (choice.failureOutcome.marketValueDeltaPercent && choice.failureOutcome.marketValueDeltaPercent !== 0) {
      const sign = choice.failureOutcome.marketValueDeltaPercent > 0 ? '+' : '';
      parts.push(`${sign}${choice.failureOutcome.marketValueDeltaPercent}% Val`);
    }

    return `Fallo ${failureRisk}%: ${parts.join(', ')}`;
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
