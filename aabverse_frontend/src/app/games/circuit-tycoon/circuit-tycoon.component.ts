import { Component, inject } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { GameComponent } from './components/game/game.component';
import { CircuitGameService } from './services/circuit-game.service';

@Component({
  selector: 'app-circuit-tycoon',
  standalone: true,
  imports: [NavbarComponent, GameComponent, FooterComponent],
  templateUrl: './circuit-tycoon.component.html',
  styleUrl: './circuit-tycoon.component.css'
})
export class CircuitTycoonComponent {
  gameService = inject(CircuitGameService);
}
