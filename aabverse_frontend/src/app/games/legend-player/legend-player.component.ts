import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SetupgameComponent } from './components/game/setupgame/setupgame.component';
import { OngameComponent } from './components/game/ongame/ongame.component';
import { GameoverComponent } from './components/game/gameover/gameover.component';

@Component({
  selector: 'app-legend-player-game',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SetupgameComponent,
    OngameComponent,
    GameoverComponent
  ],
  templateUrl: './legend-player.component.html',
  styleUrl: './legend-player.component.css'
})
export class LegendPlayerComponent implements OnInit {
  private gameService = inject(GameService);

  ngOnInit() {}

  screen = () => this.gameService.state().screen;
}
