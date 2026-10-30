import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { RecordService } from '../../games/aimshot/services/record.service';

export interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  category: 'Sports / Manager' | 'Shooter / Precision' | 'Arcade' | 'Puzzle' | 'Tycoon / Incremental';
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
export class HubComponent implements OnInit {
  private recordService = inject(RecordService);
  searchQuery = '';

  ngOnInit() {
    this.recordService.fetchRecords();
  }

  games: GameCard[] = [
    {
      id: 'legend-player',
      title: 'Legend Player',
      subtitle: 'Simulador Modo Carrera',
      description: 'Lleva a tu jugador desde lo más bajo hasta la gloria internacional mientras tomas decisiones y forjas tu leyenda.',
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
      subtitle: 'Campo de Tiro de Precisión',
      description: 'Pon a prueba tus reflejos y pulso contra el reloj mientras destruyes dianas y superas los récords mundiales.',
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
    },
    {
      id: 'circuit-tycoon',
      title: 'Circuit Tycoon',
      subtitle: 'Simulador de Escudería F1',
      description: 'Lleva a tu equipo desde un garaje de barrio hasta lo más alto del automovilismo mundial mientras mejoras tu equipamiento.',
      route: '/games/circuit-tycoon',
      category: 'Tycoon / Incremental',
      tags: ['Fórmula 1', 'Tycoon', 'Incremental', 'Estrategia', 'Coches'],
      logoImg: 'circuit-tycoon/logo.png',
      icon: '🏎️',
      gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
      badge: 'Nuevo',
      bgGlow: 'rgba(249, 115, 22, 0.35)',
      themeColor: '#f97316'
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
