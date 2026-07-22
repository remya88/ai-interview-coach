import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { getScoreColor, getScoreLabel } from '../../models/resume.model';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="score-card">
      <mat-card-content>
        <div class="score-layout">
          <div class="score-circle" [style.border-color]="color">
            <span class="score-value" [style.color]="color">{{ score }}</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-info">
            <p class="score-label">{{ label }}</p>
            <p class="score-badge" [style.background-color]="color + '20'" [style.color]="color">
              {{ label_ }}
            </p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .score-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .score-layout {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .score-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 4px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .score-value {
      font-size: 22px;
      font-weight: 800;
      line-height: 1;
    }

    .score-max {
      font-size: 11px;
      color: #9ca3af;
    }

    .score-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 6px;
    }

    .score-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
      margin: 0;
    }
  `],
})
export class ScoreCardComponent {
  @Input() score = 0;
  @Input() label = '';

  get color(): string { return getScoreColor(this.score); }
  get label_(): string { return getScoreLabel(this.score); }
}
