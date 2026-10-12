import { Component, input, output, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aimshot-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  highScore = input<number>(0);
  classicHighScore = input<number>(0);
  survivalHighScore = input<number>(0);
  huntHighScore = input<number>(0);
  resetHighScore = output<void>();
  goHome = output<void>();


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    if (event.key === 'Escape') {
      this.resetHighScore.emit();
    }
  }
}


