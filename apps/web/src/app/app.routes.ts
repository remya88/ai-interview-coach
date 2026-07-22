import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { authRoutes } from './features/auth/auth.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { interviewRoutes } from './features/interview/interview.routes';
import { evaluationRoutes } from './features/evaluation/evaluation.routes';
import { analyticsRoutes } from './features/analytics/analytics.routes';
import { resumeAnalysisRoutes } from './features/resume-analysis/resume-analysis.routes';
import { jobAnalysisRoutes } from './features/job-analysis/job-analysis.routes';
import { profileRoutes } from './features/profile/profile.routes';
import { adminRoutes } from './features/admin/admin.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'auth', children: authRoutes },
      { path: 'dashboard', children: dashboardRoutes },
      { path: 'interview', children: interviewRoutes },
      { path: 'evaluation', children: evaluationRoutes },
      { path: 'analytics', children: analyticsRoutes },
      { path: 'resume-analysis', children: resumeAnalysisRoutes },
      { path: 'job-analysis', children: jobAnalysisRoutes },
      { path: 'profile', children: profileRoutes },
      { path: 'admin', children: adminRoutes },
    ],
  },
  { path: '**', redirectTo: '' },
];
