import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/hub/hub.component').then(
        (m) => m.HubComponent
      )
  },
  {
    path: 'games/legend-player',
    loadComponent: () =>
      import('./games/legend-player/legend-player.component').then(
        (m) => m.LegendPlayerComponent
      )
  },
  {
    path: 'games/aimshot',
    loadComponent: () =>
      import('./games/aimshot/aimshot.component').then(
        (m) => m.AimshotComponent
      )
  },
  {
    path: 'report',
    loadComponent: () =>
      import('./components/report/report.component').then(
        (m) => m.ReportComponent
      )
  },
  { path: '**', redirectTo: '' }
];
