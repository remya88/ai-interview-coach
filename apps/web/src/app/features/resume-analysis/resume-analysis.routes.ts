import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { ResumeUploadComponent } from './pages/resume-upload/resume-upload.component';
import { ResumeAnalysisPageComponent } from './pages/resume-analysis/resume-analysis-page.component';
import { JobMatchComponent } from './pages/job-match/job-match.component';

export const resumeAnalysisRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: ResumeUploadComponent,
  },
  {
    path: ':id',
    canActivate: [authGuard],
    component: ResumeAnalysisPageComponent,
  },
  {
    path: ':id/job-match',
    canActivate: [authGuard],
    component: JobMatchComponent,
  },
];

