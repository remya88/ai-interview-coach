import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="summary-card">
      <mat-card-content>
        <div class="card-content">
          <div class="icon-container" [style.backgroundColor]="iconBgColor">
            <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
          </div>
          <div class="info">
            <p class="label">{{ label }}</p>
            <p class="value">{{ value }}</p>
            <p class="unit" *ngIf="unit">{{ unit }}</p>
          </div>
        </div>
        <div class="change" *ngIf="change !== undefined">
          <mat-icon
            [style.color]="change >= 0 ? '#10b981' : '#ef4444'"
            class="change-icon"
          >
            {{ change >= 0 ? 'trending_up' : 'trending_down' }}
          </mat-icon>
          <span [style.color]="change >= 0 ? '#10b981' : '#ef4444'">
            {{ change >= 0 ? '+' : '' }}{{ change }}%
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .summary-card {
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.78);
      box-shadow: 0 20px 50px rgba(2, 8, 23, 0.24);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 28px 60px rgba(2, 8, 23, 0.32);
        transform: translateY(-2px);
      }
    }

    mat-card-content {
      padding: 20px;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .info {
      flex: 1;
    }

    .label {
      margin: 0;
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }

    .value {
      margin: 4px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #f8fafc;
    }

    .unit {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }

    .change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;

      .change-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `],
})
export class SummaryCardComponent {
  @Input() label!: string;
  @Input() value!: number | string;
  @Input() unit?: string;
  @Input() icon!: string;
  @Input() iconColor = '#3b82f6';
  @Input() iconBgColor = '#dbeafe';
  @Input() change?: number;
}
