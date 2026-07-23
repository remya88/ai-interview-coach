import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="rec-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
          {{ title }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <ul class="rec-list">
          <li *ngFor="let item of items; let i = index">
            <span class="rec-number">{{ i + 1 }}</span>
            <span class="rec-text">{{ item }}</span>
          </li>
          <li *ngIf="items.length === 0" class="empty">
            No recommendations at this time.
          </li>
        </ul>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .rec-card {
      border-radius: 20px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.74);
      box-shadow: 0 20px 45px rgba(2, 6, 23, 0.32);
      backdrop-filter: blur(16px);
      color: #f8fafc;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
    }

    .rec-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);

      &:last-child { border-bottom: none; }
    }

    .rec-number {
      min-width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(34, 211, 238, 0.16);
      color: #67e8f9;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rec-text {
      font-size: 14px;
      color: #e2e8f0;
      line-height: 1.6;
    }

    .empty {
      color: #94a3b8;
      font-size: 14px;
    }
  `],
})
export class RecommendationCardComponent {
  @Input() title = 'Recommendations';
  @Input() items: string[] = [];
  @Input() icon = 'lightbulb';
  @Input() iconColor = '#f59e0b';
}
