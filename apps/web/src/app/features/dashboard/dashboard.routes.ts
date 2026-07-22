import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../analytics/pages/dashboard/analytics-dashboard.component').then(
        (m) => m.AnalyticsDashboardComponent,
      ),
  },
];
