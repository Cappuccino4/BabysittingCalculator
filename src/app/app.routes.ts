import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'weekly',
    loadComponent: () => import('./components/weekly/weekly.component').then(m => m.WeeklyComponent),
  },
  {
    path: 'overall',
    loadComponent: () => import('./components/overall/overall.component').then(m => m.OverallComponent),
  },
  { path: '', redirectTo: 'weekly', pathMatch: 'full' },
  { path: '**', redirectTo: 'weekly' },
];
