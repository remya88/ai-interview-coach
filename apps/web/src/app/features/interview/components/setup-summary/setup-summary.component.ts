import {
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InterviewSetupConfig, Technology, InterviewCategory } from '../../models/interview.model';

@Component({
  selector: 'app-setup-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <mat-card class="w-full overflow-hidden border border-slate-200 shadow-lg">
      <mat-card-header class="bg-gradient-to-r from-slate-900 to-slate-700 pb-4">
        <mat-card-title class="text-white">Review Your Configuration</mat-card-title>
        <mat-card-subtitle class="text-slate-200">Start your interview practice session</mat-card-subtitle>
      </mat-card-header>

      <mat-divider></mat-divider>

      <mat-card-content class="space-y-4 p-5">
        <!-- Technology -->
        <div class="flex items-start justify-between border-b pb-4">
          <div>
            <p class="text-sm text-slate-500">Technology</p>
            <p class="text-lg font-semibold text-slate-900">{{ technology()?.name }}</p>
          </div>
          <button mat-icon-button (click)="editStep.emit(0)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>

        <!-- Category -->
        <div class="flex items-start justify-between border-b pb-4">
          <div>
            <p class="text-sm text-slate-500">Category</p>
            <p class="text-lg font-semibold text-slate-900">{{ category()?.name }}</p>
          </div>
          <button mat-icon-button (click)="editStep.emit(1)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>

        <!-- Difficulty -->
        <div class="flex items-start justify-between border-b pb-4">
          <div>
            <p class="text-sm text-slate-500">Difficulty Level</p>
            <p class="text-lg font-semibold text-slate-900">{{ config().difficulty }}</p>
          </div>
          <button mat-icon-button (click)="editStep.emit(2)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>

        <!-- Interview Type -->
        <div class="flex items-start justify-between border-b pb-4">
          <div>
            <p class="text-sm text-slate-500">Interview Type</p>
            <p class="text-lg font-semibold text-slate-900">{{ config().interviewType }}</p>
          </div>
          <button mat-icon-button (click)="editStep.emit(3)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>

        <!-- Question Count -->
        <div class="flex items-start justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div>
            <p class="text-sm text-slate-600">Number of Questions</p>
            <p class="text-lg font-semibold text-slate-900">{{ config().questionCount }} questions</p>
            <p class="mt-1 text-xs text-slate-500">Estimated time: ~{{ estimatedTime() }} minutes</p>
          </div>
          <button mat-icon-button (click)="editStep.emit(4)">
            <mat-icon>edit</mat-icon>
          </button>
        </div>
      </mat-card-content>

      <mat-divider></mat-divider>

      <mat-card-actions class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
        <button
          mat-stroked-button
          (click)="cancel.emit()"
          class="w-full"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="start.emit()"
          [disabled]="loading() || !isValid()"
          class="w-full"
        >
          <mat-icon *ngIf="loading()" class="mr-2 inline-flex items-center justify-center">
            <mat-spinner diameter="20"></mat-spinner>
          </mat-icon>
          {{ loading() ? 'Starting...' : 'Start Interview' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class SetupSummaryComponent {
  config = input.required<InterviewSetupConfig>();
  technology = input<Technology | null>(null);
  category = input<InterviewCategory | null>(null);
  loading = input<boolean>(false);
  isValid = input<boolean>(false);

  start = output<void>();
  cancel = output<void>();
  editStep = output<number>();

  estimatedTime(): number {
    return this.config().questionCount * 3;
  }
}
