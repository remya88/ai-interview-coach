import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-submit-confirmation',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  template: `
    <mat-card class="w-full">
      <mat-card-header>
        <div class="flex items-center gap-2">
          <mat-icon class="text-blue-500">info</mat-icon>
          <mat-card-title>Submit Your Answer?</mat-card-title>
        </div>
      </mat-card-header>

      <mat-card-content class="space-y-4">
        <p class="text-gray-700">
          Please review your answer before submitting. You cannot edit it after submission.
        </p>

        <div class="bg-blue-50 p-3 rounded-lg text-sm">
          <p><strong>Characters:</strong> {{ charCount() }}</p>
          <p><strong>Words:</strong> {{ wordCount() }}</p>
          <p *ngIf="timeSpent() > 0"><strong>Time spent:</strong> {{ formatTime() }}</p>
        </div>

        <div class="text-sm text-gray-600">
          <p *ngIf="allowMultipleAttempts()">
            💡 You can retake this interview multiple times to improve your score.
          </p>
        </div>
      </mat-card-content>

      <mat-card-actions class="flex gap-2">
        <button mat-stroked-button (click)="cancel.emit()">Cancel</button>
        <button mat-raised-button color="primary" (click)="confirm.emit()">
          <mat-icon>check</mat-icon>
          Yes, Submit Answer
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class SubmitConfirmationComponent {
  charCount = input(0);
  wordCount = input(0);
  timeSpent = input(0);
  allowMultipleAttempts = input(true);

  confirm = output<void>();
  cancel = output<void>();

  formatTime(): string {
    const seconds = this.timeSpent();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
