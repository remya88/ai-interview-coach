import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-question-navigation',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex gap-2 justify-between items-center">
      <button
        mat-raised-button
        [disabled]="!canGoPrevious()"
        (click)="previous.emit()"
      >
        <mat-icon>arrow_back</mat-icon>
        Previous
      </button>

      <span class="text-sm font-semibold text-gray-600">
        {{ currentQuestion() }} of {{ totalQuestions() }}
      </span>

      <button
        mat-raised-button
        [disabled]="!canGoNext()"
        color="primary"
        (click)="next.emit()"
      >
        Next
        <mat-icon>arrow_forward</mat-icon>
      </button>
    </div>
  `,
})
export class QuestionNavigationComponent {
  currentQuestion = input(1);
  totalQuestions = input(10);
  canGoNext = input(true);
  canGoPrevious = input(true);

  next = output<void>();
  previous = output<void>();
}
