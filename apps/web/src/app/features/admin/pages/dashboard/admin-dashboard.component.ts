import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../services/admin.service';
import { AdminStore } from '../../store/admin.store';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { ErrorTableComponent } from '../../components/error-table/error-table.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MetricCardComponent,
    ErrorTableComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Platform overview and health metrics</p>
      </div>

      <div *ngIf="store.loading()" class="loading-center">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!store.loading() && store.dashboard() as d">
        <!-- Metric Grid -->
        <section class="metrics-grid">
          <app-admin-metric-card label="Total Users" [value]="d.totalUsers"
            icon="people" iconColor="#3b82f6" iconBg="#dbeafe"
            [sub]="'+' + d.newUsersThisWeek + ' this week'"></app-admin-metric-card>

          <app-admin-metric-card label="Active Users" [value]="d.activeUsers"
            icon="person_check" iconColor="#10b981" iconBg="#dcfce7"></app-admin-metric-card>

          <app-admin-metric-card label="Total Interviews" [value]="d.totalInterviews"
            icon="assignment" iconColor="#8b5cf6" iconBg="#ede9fe"
            [sub]="d.completionRate + '% completion rate'"></app-admin-metric-card>

          <app-admin-metric-card label="Completed" [value]="d.completedInterviews"
            icon="check_circle" iconColor="#10b981" iconBg="#dcfce7"></app-admin-metric-card>

          <app-admin-metric-card label="Avg Score" [value]="d.averageScore"
            icon="score" iconColor="#f59e0b" iconBg="#fef3c7"></app-admin-metric-card>

          <app-admin-metric-card label="Resumes" [value]="d.totalResumes"
            icon="description" iconColor="#6366f1" iconBg="#e0e7ff"></app-admin-metric-card>

          <app-admin-metric-card label="AI Requests" [value]="d.totalAIRequests"
            icon="psychology" iconColor="#14b8a6" iconBg="#ccfbf1"></app-admin-metric-card>

          <app-admin-metric-card label="Critical Errors (24h)" [value]="d.criticalErrorsLast24h"
            icon="error" iconColor="#ef4444" iconBg="#fee2e2"
            [highlight]="d.criticalErrorsLast24h > 0"></app-admin-metric-card>
        </section>

        <!-- Quick Navigation -->
        <section class="quick-nav">
          <h2>Quick Actions</h2>
          <div class="nav-grid">
            <a routerLink="/admin/users" class="nav-card">
              <mat-icon>people</mat-icon>
              <span>Manage Users</span>
            </a>
            <a routerLink="/admin/interviews" class="nav-card">
              <mat-icon>assignment</mat-icon>
              <span>Interviews</span>
            </a>
            <a routerLink="/admin/ai" class="nav-card">
              <mat-icon>psychology</mat-icon>
              <span>AI Monitoring</span>
            </a>
            <a routerLink="/admin/settings" class="nav-card">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
          </div>
        </section>

        <!-- Recent Errors -->
        <section *ngIf="store.criticalErrors().length > 0">
          <app-error-table [errors]="store.criticalErrors()"></app-error-table>
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .page-header {
      margin-bottom: 32px;
      h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0; }
      .subtitle { color: #6b7280; margin: 6px 0 0; }
    }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .quick-nav {
      margin-bottom: 32px;
      h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    }

    .nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .nav-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      text-decoration: none;
      color: #374151;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;

      mat-icon { font-size: 32px; width: 32px; height: 32px; color: #3b82f6; }

      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
    }

    @media (max-width: 768px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  readonly store = inject(AdminStore);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.store.setLoading(true);

    Promise.all([
      this.loadDashboard(),
      this.loadErrors(),
    ]).finally(() => this.store.setLoading(false));
  }

  private loadDashboard(): Promise<void> {
    return new Promise((resolve) => {
      this.adminService.getDashboard().subscribe({
        next: (d) => { this.store.setDashboard(d); resolve(); },
        error: () => resolve(),
      });
    });
  }

  private loadErrors(): Promise<void> {
    return new Promise((resolve) => {
      this.adminService.getErrors('CRITICAL', 1).subscribe({
        next: (e) => { this.store.setErrors(e); resolve(); },
        error: () => resolve(),
      });
    });
  }
}
