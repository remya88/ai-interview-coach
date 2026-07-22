import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-ideal-answer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule],
  template: `
    <mat-card class="answer-card">
      <mat-card-header>
        <mat-card-title>Answer Comparison</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-tab-group>
          <mat-tab label="Your Answer">
            <div class="answer-content">
              <pre>{{ candidateAnswer() }}</pre>
            </div>
          </mat-tab>
          <mat-tab label="Ideal Answer">
            <div class="answer-content ideal">
              <pre>{{ idealAnswer() }}</pre>
            </div>
          </mat-tab>
          <mat-tab label="Improved Version">
            <div class="answer-content improved">
              <pre>{{ improvedAnswer() }}</pre>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .answer-card {
      @apply mt-6;
    }

    mat-card-header {
      @apply mb-4;
    }

    mat-card-title {
      @apply text-base font-semibold text-gray-800;
    }

    .answer-content {
      @apply p-4 bg-gray-50 rounded mt-4 overflow-x-auto;

      pre {
        @apply font-mono text-sm whitespace-pre-wrap break-words;
        margin: 0;
      }

      &.ideal {
        pre {
          @apply text-green-700;
        }
      }

      &.improved {
        pre {
          @apply text-blue-700;
        }
      }
    }

    ::ng-deep {
      .mat-mdc-tab {
        @apply min-w-[150px];
      }
    }
  `],
})
export class IdealAnswerComponent {
  candidateAnswer = input<string>('');
  idealAnswer = input<string>('');
  improvedAnswer = input<string>('');
}
