import { Routes } from '@angular/router';

/**
 * Modern Angular 21 Routing Configuration.
 * * Uses functional lazy loading to ensure optimal bundle splitting.
 * All components are standalone by default.
 */
export const routes: Routes = [
  {
    path: 'dashboard',
    /** * @description Entry point for the apps overview.
     */
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    title: 'Dashboard'
  },
  {
    path: 'timer',
    /** * @description Lazy loading the Timer feature.
     * loads the component directly as the primary view for this path.
     */
    loadComponent: () =>
      import('./features/timer/timer.component').then(c => c.TimerComponent),
    title: 'Timer App'
  },
  {
    path: 'brain',
    title: 'Brain Games',
    loadComponent: () =>
      import('./features/brain/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'brain/settings',
    loadComponent: () =>
      import('./features/brain/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },
  {
    path: 'brain/game/:mode',
    loadComponent: () =>
      import('./features/brain/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'harmonica',
    title: 'Harmonica Hero',
    loadComponent: () =>
      import('./features/harmonica/harmonica-hero.component').then(
        (m) => m.HarmonicaHeroComponent
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];