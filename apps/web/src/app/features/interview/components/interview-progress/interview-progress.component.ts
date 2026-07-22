import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-interview-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-2">
      <!-- Progress Bar -->
      <mat-progress-bar
        mode="determinate"
        [value]="progress()"
        class="h-1"
      ></mat-progress-bar>

      <!-- Progress Text -->
      <div class="flex justify-between text-sm px-1">
        <span class="font-semibold">
          {{ currentQuestion() }} / {{ totalQuestions() }} answered
        </span>
        <span class="text-gray-600">{{ progress() }}%</span>
      </div>

      <!-- Question Indicators -->
      <div class="flex gap-1 flex-wrap pt-2">
        <div
          *ngFor="let i of getQuestionArray()"
          class="w-2 h-2 rounded-full transition-colors"
          [class.bg-blue-500]="isAnswered(i)"
          [class.bg-green-500]="i === currentQuestion()"
          [class.bg-gray-300]="!isAnswered(i) && i !== currentQuestion()"
          [attr.aria-label]="'Question ' + i + (isAnswered(i) ? ' answered' : '')"
        ></div>
      </div>
    </div>
  `,
})
export class InterviewProgressComponent {
  currentQuestion = input(1);
  totalQuestions = input(10);
  answeredQuestions = input(0);

  readonly progress = () => {
    const total = this.totalQuestions();
    const answered = this.answeredQuestions();
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  isAnswered(questionNumber: number): boolean {
    return questionNumber <= this.answeredQuestions();
  }

  getQuestionArray(): number[] {
    return Array.from({ length: this.totalQuestions() }, (_, i) => i + 1);
  }
}
