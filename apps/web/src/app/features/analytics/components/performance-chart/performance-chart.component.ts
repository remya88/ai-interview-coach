import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PerformanceTrend } from '../../models/analytics.model';

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>Performance Trend</mat-card-title>
        <p class="chart-subtitle">Last {{ trends.length }} days</p>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container" *ngIf="trends.length > 0">
          <svg
            class="line-chart"
            [attr.viewBox]="'0 0 ' + width + ' ' + height"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Grid lines -->
            <g class="grid" *ngFor="let i of [0, 1, 2, 3, 4]">
              <line
                [attr.x1]="0"
                [attr.y1]="(height / 5) * i"
                [attr.x2]="width"
                [attr.y2]="(height / 5) * i"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="4"
              />
              <text
                [attr.x]="5"
                [attr.y]="(height / 5) * i - 5"
                class="grid-label"
              >
                {{ 100 - (100 / 5) * i | number: '1.0-0' }}
              </text>
            </g>

            <!-- Line path -->
            <polyline
              class="trend-line"
              [attr.points]="linePoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="3"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Points -->
            <circle
              *ngFor="let point of chartPoints"
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              r="4"
              fill="#3b82f6"
              class="data-point"
            />
          </svg>
        </div>
        <div class="empty-state" *ngIf="trends.length === 0">
          <p>No performance data available</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-card {
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
      margin: 0;
    }

    .chart-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin: 4px 0 0 0;
    }

    .chart-container {
      width: 100%;
      height: 300px;
      margin-top: 16px;
    }

    .line-chart {
      width: 100%;
      height: 100%;
    }

    .grid-label {
      font-size: 12px;
      color: #64748b;
      text-anchor: end;
    }

    .trend-line {
      fill: none;
    }

    .data-point {
      stroke: white;
      stroke-width: 2;
      cursor: pointer;

      &:hover {
        r: 6;
      }
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .chart-container {
        height: 200px;
      }
    }
  `],
})
export class PerformanceChartComponent implements OnInit {
  @Input() trends: PerformanceTrend[] = [];

  width = 800;
  height = 300;
  padding = 40;
  chartPoints: { x: number; y: number }[] = [];
  linePoints = '';

  ngOnInit(): void {
    this.generateChart();
  }

  private generateChart(): void {
    if (this.trends.length === 0) return;

    const chartWidth = this.width - this.padding * 2;
    const chartHeight = this.height - this.padding * 2;

    // Find min and max scores
    const scores = this.trends.map((t) => t.averageScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores, 100);
    const scoreRange = maxScore - minScore || 1;

    // Generate points
    this.chartPoints = this.trends.map((trend, index) => {
      const x = this.padding + (index / (this.trends.length - 1 || 1)) * chartWidth;
      const normalizedScore = (trend.averageScore - minScore) / scoreRange;
      const y = this.height - this.padding - normalizedScore * chartHeight;
      return { x, y };
    });

    // Create line points string
    this.linePoints = this.chartPoints
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  }
}
