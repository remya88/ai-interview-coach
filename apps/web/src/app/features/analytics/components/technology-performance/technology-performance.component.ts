import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TechnologyAnalytics } from '../../models/analytics.model';

@Component({
  selector: 'app-technology-performance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card class="tech-card">
      <mat-card-header>
        <mat-card-title>Technology Performance</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="tech-list">
          <div *ngFor="let tech of technologies" class="tech-item">
            <div class="tech-header">
              <span class="tech-name">{{ tech.technology }}</span>
              <div class="badges">
                <mat-chip-set class="chip-row">
                  <mat-chip>{{ tech.interviews }} interviews</mat-chip>
                </mat-chip-set>
              </div>
            </div>
            <div class="tech-stats">
              <div class="stat">
                <span class="stat-label">Average</span>
                <span class="stat-value" [style.color]="getColor(tech.averageScore)">
                  {{ tech.averageScore }}
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Best</span>
                <span class="stat-value" style="color: #10b981">
                  {{ tech.bestScore }}
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Trend</span>
                <span class="stat-value" [style.color]="getTrendColor(tech.improvementTrend)">
                  {{ tech.improvementTrend > 0 ? '+' : '' }}{{ tech.improvementTrend }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .tech-card {
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.78);
      box-shadow: 0 20px 50px rgba(2, 8, 23, 0.24);
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
    }

    .tech-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tech-item {
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.5);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(30, 41, 59, 0.7);
        border-color: rgba(34, 211, 238, 0.24);
      }
    }

    .tech-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .tech-name {
      font-size: 16px;
      font-weight: 600;
      color: #f8fafc;
    }

    .badges {
      display: flex;
      gap: 8px;
    }

    .chip-row {
      display: flex;
      gap: 8px;

      ::ng-deep .mat-chip {
        font-size: 12px;
      }
    }

    .tech-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
    }

    @media (max-width: 768px) {
      .tech-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .tech-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
})
export class TechnologyPerformanceComponent {
  @Input() technologies: TechnologyAnalytics[] = [];

  getColor(score: number): string {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  }

  getTrendColor(trend: number): string {
    if (trend > 0) return '#10b981';
    if (trend < 0) return '#ef4444';
    return '#6b7280';
  }
}
