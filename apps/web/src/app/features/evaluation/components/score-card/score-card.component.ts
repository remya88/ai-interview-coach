import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  template: `
    <mat-card class="score-card">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="score-value" [class.high]="score() >= 75" [class.medium]="score() >= 50 && score() < 75" [class.low]="score() < 50">
          {{ score() | number: '1.0-0' }}
        </div>
        <mat-progress-bar
          mode="determinate"
          [value]="score()"
          [color]="getScoreColor()"
        ></mat-progress-bar>
        <div class="score-label">{{ scoreLabel() }}</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .score-card {
      @apply h-full;
    }

    mat-card-header {
      @apply mb-4;
    }

    mat-card-title {
      @apply text-sm font-medium text-gray-600;
    }

    .score-value {
      @apply text-5xl font-bold text-center mb-4;

      &.high {
        @apply text-green-600;
      }

      &.medium {
        @apply text-yellow-600;
      }

      &.low {
        @apply text-red-600;
      }
    }

    .score-label {
      @apply text-sm text-gray-500 text-center mt-2;
    }

    ::ng-deep {
      .mat-mdc-progress-bar {
        @apply mb-0;
      }
    }
  `],
})
export class ScoreCardComponent {
  score = input<number>(0);
  title = input<string>('Score');
  scoreLabel = input<string>('');

  getScoreColor(): 'primary' | 'accent' | 'warn' {
    const s = this.score();
    if (s >= 75) return 'primary';
    if (s >= 50) return 'accent';
    return 'warn';
  }
}
