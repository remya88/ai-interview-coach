import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin.service';
import { AdminStore } from '../../store/admin.store';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';

@Component({
  selector: 'app-admin-ai-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MetricCardComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>AI Monitoring</h1>
        <p class="subtitle">Usage statistics and cost analysis</p>
      </div>

      <div *ngIf="store.loading()" class="loading-center">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!store.loading() && store.aiUsage() as u">

        <!-- Summary Metrics -->
        <section class="metrics-grid">
          <app-admin-metric-card label="Total AI Requests" [value]="u.totalRequests"
            icon="psychology" iconColor="#8b5cf6" iconBg="#ede9fe"></app-admin-metric-card>

          <app-admin-metric-card label="Total Tokens" [value]="u.totalTokens"
            icon="token" iconColor="#3b82f6" iconBg="#dbeafe"></app-admin-metric-card>

          <app-admin-metric-card label="Estimated Cost (USD)" [value]="u.estimatedCostUsd"
            icon="attach_money" iconColor="#10b981" iconBg="#dcfce7"></app-admin-metric-card>

          <app-admin-metric-card label="Most Used" [value]="u.mostUsedFeature"
            icon="star" iconColor="#f59e0b" iconBg="#fef3c7"></app-admin-metric-card>
        </section>

        <!-- Feature Breakdown -->
        <mat-card class="breakdown-card">
          <mat-card-header>
            <mat-card-title>Usage by Feature</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="feature-list">
              <div *ngFor="let f of u.byFeature" class="feature-row">
                <div class="feature-info">
                  <mat-icon>{{ getFeatureIcon(f.feature) }}</mat-icon>
                  <span class="feature-name">{{ f.feature | titlecase }}</span>
                </div>
                <div class="feature-stats">
                  <span class="stat">{{ f.requests }} requests</span>
                  <span class="stat">{{ f.tokens }} tokens</span>
                </div>
                <div class="feature-bar-bg">
                  <div class="feature-bar"
                    [style.width]="getBarWidth(f.requests, u.totalRequests) + '%'">
                  </div>
                </div>
              </div>

              <div *ngIf="u.byFeature.length === 0" class="empty">
                No AI requests in the selected period.
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Daily Usage Table -->
        <mat-card class="daily-card" *ngIf="u.dailyUsage.length > 0">
          <mat-card-header>
            <mat-card-title>Daily Usage (last 7 days)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table class="daily-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requests</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of u.dailyUsage | slice:0:7">
                  <td>{{ d.date | date:'mediumDate' }}</td>
                  <td>{{ d.requests }}</td>
                  <td>{{ d.tokens }}</td>
                </tr>
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 24px; }
    .page-header { h1 { font-size: 28px; font-weight: 700; margin: 0; } .subtitle { color: #6b7280; margin: 6px 0 0; } }
    .loading-center { display: flex; justify-content: center; padding: 64px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }

    .breakdown-card, .daily-card { border-radius: 12px; }
    mat-card-title { font-size: 18px; font-weight: 600; }

    .feature-list { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }

    .feature-row { display: flex; align-items: center; gap: 16px; }

    .feature-info { display: flex; align-items: center; gap: 8px; width: 220px; flex-shrink: 0;
      mat-icon { color: #6b7280; font-size: 18px; }
      .feature-name { font-weight: 500; font-size: 14px; }
    }

    .feature-stats { display: flex; gap: 12px; width: 200px; flex-shrink: 0;
      .stat { font-size: 13px; color: #6b7280; }
    }

    .feature-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .feature-bar { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.5s; }

    .empty { text-align: center; color: #6b7280; padding: 24px; }

    .daily-table { width: 100%; border-collapse: collapse;
      th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
      th { font-weight: 600; color: #374151; background: #f9fafb; }
    }
  `],
})
export class AdminAIMonitoringComponent implements OnInit {
  readonly store = inject(AdminStore);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.store.setLoading(true);
    this.adminService.getAIUsage(30).subscribe({
      next: (u) => { this.store.setAIUsage(u); this.store.setLoading(false); },
      error: () => this.store.setLoading(false),
    });
  }

  getFeatureIcon(feature: string): string {
    const icons: Record<string, string> = {
      INTERVIEW_EVALUATION: 'rate_review',
      RESUME_ANALYSIS: 'description',
      JOB_MATCHING: 'work',
      QUESTION_GENERATION: 'help',
    };
    return icons[feature] ?? 'psychology';
  }

  getBarWidth(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }
}
