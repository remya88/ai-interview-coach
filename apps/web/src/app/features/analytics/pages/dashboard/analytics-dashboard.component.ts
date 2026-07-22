import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsStore } from '../../store/analytics.store';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';
import { SkillChartComponent } from '../../components/skill-chart/skill-chart.component';
import { TechnologyPerformanceComponent } from '../../components/technology-performance/technology-performance.component';
import { InterviewHistoryComponent } from '../../components/interview-history/interview-history.component';
import { ProgressSummaryComponent } from '../../components/progress-summary/progress-summary.component';
import { PerformanceChartComponent } from '../../components/performance-chart/performance-chart.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    SummaryCardComponent,
    SkillChartComponent,
    TechnologyPerformanceComponent,
    InterviewHistoryComponent,
    ProgressSummaryComponent,
    PerformanceChartComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Loading State -->
      <div *ngIf="store.loading()" class="loading-container">
        <div class="loading-card">
          <mat-spinner [diameter]="44"></mat-spinner>
          <p class="loading-text">Loading your analytics...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="store.hasError()" class="error-container">
        <div class="error-message">
          <div class="error-icon">
            <mat-icon>error</mat-icon>
          </div>
          <strong>Failed to load analytics</strong>
          <p>{{ store.errorMessage() }}</p>
          <button mat-stroked-button color="warn" (click)="reload()">Retry</button>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!store.loading() && !store.hasError()" class="dashboard-content">
        <div class="dashboard-header-card">
          <div class="header-copy">
            <p class="eyebrow">Interview Insights</p>
            <h1>Analytics Dashboard</h1>
            <p class="subtitle">Track your progress, spot skill gaps, and keep improving with every session.</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button class="secondary-btn" type="button" (click)="openResumeAnalyzer()">
              <mat-icon>description</mat-icon>
              Resume Analyzer
            </button>
            <button mat-stroked-button class="start-interview-btn" type="button" (click)="startNewInterview()">
              <mat-icon>add</mat-icon>
              Start New Interview
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <section class="summary-section">
          <div class="cards-grid">
            <app-summary-card
              label="Total Interviews"
              [value]="store.totalInterviews()"
              icon="assignment"
              iconColor="#3b82f6"
              iconBgColor="#dbeafe"
            ></app-summary-card>

            <app-summary-card
              label="Average Score"
              [value]="store.averageScore()"
              unit="/ 100"
              icon="trending_up"
              iconColor="#10b981"
              iconBgColor="#dcfce7"
            ></app-summary-card>

            <app-summary-card
              label="Practice Hours"
              [value]="store.totalPracticeHours()"
              unit="hours"
              icon="schedule"
              iconColor="#f59e0b"
              iconBgColor="#fef3c7"
            ></app-summary-card>

            <app-summary-card
              label="Current Streak"
              [value]="store.currentStreak()"
              unit="days"
              icon="local_fire_department"
              iconColor="#ef4444"
              iconBgColor="#fee2e2"
            ></app-summary-card>
          </div>
        </section>

        <!-- Performance Summary -->
        <section class="performance-summary-section" *ngIf="store.performanceSummary()">
          <app-progress-summary
            [trend]="store.overallTrend()"
            [trendPercentage]="store.trendPercentage()"
            [nextLevelThreshold]="store.nextLevelThreshold()"
            [estimatedDays]="store.estimatedDaysToNextLevel()"
            [currentScore]="store.averageScore()"
          ></app-progress-summary>
        </section>

        <!-- Charts and Analytics -->
        <section class="charts-section">
          <div class="charts-row">
            <div class="chart-col-full">
              <app-performance-chart
                [trends]="store.performanceData()"
              ></app-performance-chart>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-col-half">
              <app-skill-chart
                title="Skill Assessment"
                [skills]="skillChartData()"
              ></app-skill-chart>
            </div>

            <div class="chart-col-half">
              <app-technology-performance
                [technologies]="store.topTechnologies()"
              ></app-technology-performance>
            </div>
          </div>
        </section>

        <!-- Interview History -->
        <section class="history-section">
          <app-interview-history
            [interviews]="store.recentInterviews()"
            [totalItems]="store.recentInterviews().length"
            [pageSize]="5"
          ></app-interview-history>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      padding: 24px;
      background: linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%);
      color: #f8fafc;
    }

    .loading-container,
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 420px;
    }

    .loading-card,
    .error-message {
      width: min(100%, 480px);
      border: 1px solid rgba(34, 211, 238, 0.2);
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(18px);
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(2, 8, 23, 0.35);
      padding: 28px;
      text-align: center;
    }

    .loading-text {
      margin-top: 16px;
      color: #cbd5e1;
      font-size: 14px;
    }

    .error-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      background: rgba(248, 113, 113, 0.12);
      color: #fda4af;
      margin-bottom: 12px;
    }

    .error-message strong {
      font-size: 18px;
      display: block;
      margin-bottom: 8px;
      color: #f8fafc;
    }

    .error-message p {
      margin: 8px 0 16px;
      font-size: 14px;
      color: #cbd5e1;
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 28px 32px;
      margin-bottom: 24px;
      border: 1px solid rgba(34, 211, 238, 0.18);
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(18px);
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(2, 8, 23, 0.25);
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 11px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: #67e8f9;
      font-weight: 700;
    }

    .dashboard-header-card h1 {
      font-size: 32px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .subtitle {
      color: #cbd5e1;
      font-size: 14px;
      margin: 8px 0 0 0;
      max-width: 720px;
    }

    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .secondary-btn,
    .start-interview-btn {
      border-color: rgba(34, 211, 238, 0.35) !important;
      color: #ecfeff !important;
      border-radius: 999px !important;
      padding: 10px 16px !important;
      background: rgba(34, 211, 238, 0.12) !important;
      white-space: nowrap;
    }

    .summary-section,
    .performance-summary-section,
    .charts-section,
    .history-section {
      margin-bottom: 32px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .chart-col-full {
      grid-column: 1 / -1;
    }

    .chart-col-half {
      min-width: 0;
    }

    @media (max-width: 1024px) {
      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;

        h1 {
          font-size: 24px;
        }
      }

      .start-interview-btn {
        width: 100%;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .charts-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly router = inject(Router);
  readonly store = inject(AnalyticsStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  skillChartData = computed(() =>
    this.store.skillData().map((skill) => ({
      name: skill.skillName,
      score: skill.currentScore,
      color: this.getColorForScore(skill.currentScore),
    })),
  );

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startNewInterview(): void {
    this.router.navigateByUrl('/interview/setup');
  }

  openResumeAnalyzer(): void {
    this.router.navigateByUrl('/resume-analysis');
  }

  private loadAllAnalytics(): void {
    this.store.setLoading(true);
    this.store.setError(null);

    // Load all analytics in parallel
    Promise.all([
      this.loadDashboard(),
      this.loadPerformance(),
      this.loadSkills(),
      this.loadTechnology(),
      this.loadSummary(),
    ])
      .then(() => {
        this.store.setLoading(false);
      })
      .catch((error) => {
        this.store.setLoading(false);
        this.store.setError(error.message || 'Failed to load analytics');
        this.snackBar.open('Failed to load analytics', 'Close', {
          duration: 5000,
        });
      });
  }

  private loadDashboard(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService
        .getDashboard()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.store.setDashboard(data);
            resolve();
          },
          error: (error) => reject(error),
        });
    });
  }

  private loadPerformance(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService
        .getPerformanceTrend(30)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.store.setPerformanceData(data);
            resolve();
          },
          error: (error) => reject(error),
        });
    });
  }

  private loadSkills(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService
        .getSkillAnalytics()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.store.setSkillData(data);
            resolve();
          },
          error: (error) => reject(error),
        });
    });
  }

  private loadTechnology(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService
        .getTechnologyAnalytics()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.store.setTechnologyData(data);
            resolve();
          },
          error: (error) => reject(error),
        });
    });
  }

  private loadSummary(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService
        .getPerformanceSummary()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.store.setPerformanceSummary(response.data);
            resolve();
          },
          error: (error) => reject(error),
        });
    });
  }

  reload(): void {
    this.loadAllAnalytics();
  }

  private getColorForScore(score: number): string {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  }
}
