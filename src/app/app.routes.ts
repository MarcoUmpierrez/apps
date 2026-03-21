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
      import('./features/dashboard/dashboard').then(c => c.Dashboard),
    title: 'Dashboard'
  },
  {
    path: 'timer',
    /** * @description Lazy loading the Timer feature.
     * loads the component directly as the primary view for this path.
     */
    loadComponent: () =>
      import('./features/timer/timer').then(c => c.Timer),
    title: 'Timer App'
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