import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminAIMonitoringComponent } from './pages/ai-monitoring/admin-ai-monitoring.component';
import { AdminSettingsComponent } from './pages/settings/admin-settings.component';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'ai', component: AdminAIMonitoringComponent },
      { path: 'settings', component: AdminSettingsComponent },
    ],
  },
];
