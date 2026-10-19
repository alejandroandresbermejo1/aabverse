import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../services/game.service';
import { Position, Foot, SimulationSpeed } from '../../../models/game.models';
import { handleBadgeError } from '../../../utils/badge-fallback.utils';

interface NationalityOption {
  name: string;
  flag: string;
  code: string;
}

@Component({
  selector: 'app-setupgame',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setupgame.component.html',
  styleUrl: './setupgame.component.css'
})
export class SetupgameComponent {
  private gameService = inject(GameService);

  onBadgeError(event: Event, teamName?: string, countryFlag?: string) {
    handleBadgeError(event, teamName, countryFlag);
  }

  selectedSpeed: SimulationSpeed = 'slow';
  nickname = 'APODO';
  number = 10;
  preferredFoot: Foot = 'Derecha';
  position: Position = 'DC';
  nationality = 'España';
  nationalityFlag = 'https://flagcdn.com/w40/es.png';
  searchTerm = '';

  onNumberInput(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (val > 99) {
      this.number = 99;
    } else if (val < 1 && (event.target as HTMLInputElement).value !== '') {
      this.number = 1;
    }
  }

  nationalities: NationalityOption[] = [
    { name: 'España', flag: 'https://flagcdn.com/w40/es.png', code: 'es' },
    { name: 'Inglaterra', flag: 'https://flagcdn.com/w40/gb-eng.png', code: 'gb-eng' },
    { name: 'Italia', flag: 'https://flagcdn.com/w40/it.png', code: 'it' },
    { name: 'Alemania', flag: 'https://flagcdn.com/w40/de.png', code: 'de' },
    { name: 'Francia', flag: 'https://flagcdn.com/w40/fr.png', code: 'fr' },
    { name: 'Portugal', flag: 'https://flagcdn.com/w40/pt.png', code: 'pt' },
    { name: 'Argentina', flag: 'https://flagcdn.com/w40/ar.png', code: 'ar' },
    { name: 'Brasil', flag: 'https://flagcdn.com/w40/br.png', code: 'br' }
  ];

  get filteredNationalities(): NationalityOption[] {
    if (!this.searchTerm.trim()) return this.nationalities;
    const term = this.searchTerm.toLowerCase();
    return this.nationalities.filter(n => n.name.toLowerCase().includes(term));
  }

  isNationalityOpen = false;

  toggleNationalityDropdown() {
    this.isNationalityOpen = !this.isNationalityOpen;
  }

  selectNationality(nat: NationalityOption) {
    this.nationality = nat.name;
    this.nationalityFlag = nat.flag;
    this.isNationalityOpen = false;
  }

  onNationalitySelectChange(event: Event) {
    const selectedName = (event.target as HTMLSelectElement).value;
    const found = this.nationalities.find(n => n.name === selectedName);
    if (found) {
      this.nationality = found.name;
      this.nationalityFlag = found.flag;
    }
  }

  selectSpeed(speed: SimulationSpeed) {
    this.selectedSpeed = speed;
    this.gameService.setSimulationSpeed(speed);
  }

  onSubmit() {
    this.gameService.setSimulationSpeed(this.selectedSpeed);
    this.gameService.createPlayer({
      nickname: this.nickname,
      number: this.number,
      preferredFoot: this.preferredFoot,
      position: this.position,
      nationality: this.nationality,
      nationalityFlag: this.nationalityFlag
    });
  }
}
