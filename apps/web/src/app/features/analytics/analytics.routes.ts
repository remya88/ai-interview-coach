import { Route } from '@angular/router';
import { AnalyticsDashboardComponent } from './pages/dashboard/analytics-dashboard.component';

export const analyticsRoutes: Route[] = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
    data: { title: 'Analytics Dashboard' },
  },
];
