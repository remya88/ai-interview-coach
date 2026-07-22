import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progress-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <mat-card class="progress-card">
      <mat-card-content>
        <div class="progress-content">
          <div class="left-section">
            <div class="trend-indicator" [class]="'trend-' + trend">
              <mat-icon>{{ trend === 'improving' ? 'trending_up' : trend === 'stable' ? 'trending_flat' : 'trending_down' }}</mat-icon>
            </div>
            <div>
              <p class="trend-label">{{ trendLabel }}</p>
              <p class="trend-value">{{ trendPercentage | number: '1.0-0' }}%</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="right-section">
            <div class="threshold-info">
              <p class="threshold-label">Next Level: {{ nextLevelThreshold }}</p>
              <p class="threshold-subtitle">~{{ estimatedDays }} days to reach</p>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="progressPercentage"
              class="threshold-progress"
            ></mat-progress-bar>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .progress-card {
      border-radius: 24px;
      border: 1px solid rgba(34, 211, 238, 0.18);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
      box-shadow: 0 20px 50px rgba(2, 8, 23, 0.24);
    }

    .progress-content {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
    }

    .left-section,
    .right-section {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      font-size: 32px;

      &.trend-improving {
        background-color: #dcfce7;
        color: #16a34a;
      }

      &.trend-stable {
        background-color: #dbeafe;
        color: #2563eb;
      }

      &.trend-declining {
        background-color: #fee2e2;
        color: #dc2626;
      }
    }

    .trend-label {
      margin: 0;
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .trend-value {
      margin: 4px 0 0 0;
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
    }

    .divider {
      width: 1px;
      height: 60px;
      background-color: #e5e7eb;
    }

    .threshold-label {
      margin: 0;
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .threshold-subtitle {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }

    .threshold-progress {
      height: 6px;
      border-radius: 3px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .progress-content {
        flex-direction: column;
        gap: 16px;
      }

      .divider {
        width: 100%;
        height: 1px;
      }

      .left-section,
      .right-section {
        width: 100%;
      }
    }
  `],
})
export class ProgressSummaryComponent {
  @Input() trend: 'improving' | 'stable' | 'declining' = 'stable';
  @Input() trendPercentage = 0;
  @Input() nextLevelThreshold = 85;
  @Input() estimatedDays = 0;
  @Input() currentScore = 0;

  get trendLabel(): string {
    const labels = {
      improving: 'Performance Trend',
      stable: 'Performance Trend',
      declining: 'Performance Trend',
    };
    return labels[this.trend];
  }

  get progressPercentage(): number {
    const maxScore = 100;
    return Math.min((this.currentScore / maxScore) * 100, 100);
  }
}
