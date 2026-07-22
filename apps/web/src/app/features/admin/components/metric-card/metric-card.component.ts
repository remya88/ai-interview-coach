import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-metric-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="metric-card" [class.highlight]="highlight">
      <mat-card-content>
        <div class="metric-row">
          <div class="icon-box" [style.background-color]="iconBg">
            <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
          </div>
          <div class="metric-info">
            <p class="metric-label">{{ label }}</p>
            <p class="metric-value">{{ value | number }}</p>
            <p *ngIf="sub" class="metric-sub">{{ sub }}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .metric-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: transform 0.15s, box-shadow 0.15s;

      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
      &.highlight { border-left: 4px solid #3b82f6; }
    }

    .metric-row { display: flex; align-items: center; gap: 16px; }

    .icon-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-label { font-size: 13px; color: #6b7280; margin: 0 0 4px; }
    .metric-value { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; }
    .metric-sub { font-size: 12px; color: #9ca3af; margin: 4px 0 0; }
  `],
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'analytics';
  @Input() iconColor = '#3b82f6';
  @Input() iconBg = '#dbeafe';
  @Input() sub = '';
  @Input() highlight = false;
}
