import { Routes } from '@angular/router';
import { InterviewSetupComponent } from './pages/interview-setup/interview-setup.component';
import { authGuard } from '../../core/guards/auth.guard';

export const interviewRoutes: Routes = [
  {
    path: 'setup',
    component: InterviewSetupComponent,
    canActivate: [authGuard],
    data: { title: 'Interview Setup' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/interview-session/interview-session.component').then(
        m => m.InterviewSessionComponent,
      ),
    canActivate: [authGuard],
    data: { title: 'Interview Session' },
  },
];
