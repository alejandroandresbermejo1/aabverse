import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

export interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  category: 'Sports / Manager' | 'Shooter / Precision' | 'Arcade' | 'Puzzle';
  tags: string[];
  logoImg?: string;
  icon?: string;
  gradient: string;
  badge?: string;
  bgGlow: string;
  themeColor?: string;
  desktopOnly?: boolean;
}

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.css'
})
export class HubComponent {
  searchQuery = '';

  games: GameCard[] = [
    {
      id: 'legend-player',
      title: 'Legend Player',
      subtitle: 'Simulador Modo Carrera',
      description: 'Crea tu propio jugador de fútbol, entrena, toma decisiones de carrera, gestiona tu vida deportiva y conviértete en una leyenda mundial.',
      route: '/games/legend-player',
      category: 'Sports / Manager',
      tags: ['Fútbol', 'Simulación', 'Carrera', 'Estrategia'],
      logoImg: 'legend-player/logo.png',
      icon: '⚽',
      gradient: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
      badge: 'Popular',
      bgGlow: 'rgba(0, 242, 254, 0.3)',
      themeColor: '#00f2fe'
    },
    {
      id: 'aimshot',
      title: 'AimShot',
      subtitle: 'Precision Aim Trainer',
      description: 'Entrena tu puntería, velocidad de reacción y precisión en 3 modos intensos: Clásico, Supervivencia y Cacería.',
      route: '/games/aimshot',
      category: 'Shooter / Precision',
      tags: ['Aim Trainer', 'FPS', 'Reacción', 'Récords'],
      logoImg: 'aimshot/logo.png',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      badge: 'Acción',
      bgGlow: 'rgba(244, 63, 94, 0.3)',
      themeColor: '#f43f5e',
      desktopOnly: true
    }
  ];

  get filteredGames(): GameCard[] {
    return this.games.filter(game => {
      return game.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             game.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
             game.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));
    });
  }
}
