import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { EvaluationResultComponent } from './pages/evaluation-result/evaluation-result.component';

export const evaluationRoutes: Routes = [
  {
    path: ':id',
    component: EvaluationResultComponent,
    canActivate: [authGuard],
    data: { title: 'Interview Evaluation' },
  },
];
