import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InterviewQuestion } from '../../models/interview-session.model';
import { QUESTION_TYPES_DISPLAY } from '../../models/interview-session.model';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatDividerModule],
  template: `
    <mat-card *ngIf="question(); let q" class="w-full overflow-hidden border border-slate-700/40 bg-slate-900/70 text-slate-100 shadow-xl">
      <mat-card-header class="bg-gradient-to-r from-cyan-500/20 to-slate-800 pb-4">
        <div class="mb-2 flex items-start justify-between">
          <mat-card-title class="text-2xl font-black tracking-tight text-white">
            Question {{ questionNumber() }} of {{ totalQuestions() }}
          </mat-card-title>
          <mat-icon class="text-cyan-300">help_outline</mat-icon>
        </div>
        <mat-card-subtitle class="text-cyan-100">
          {{ getQuestionTypeDisplay(q.type) }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-divider></mat-divider>

      <mat-card-content class="space-y-5 p-5">
        <!-- Question Text -->
        <div class="rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-lg leading-relaxed text-slate-100">
          {{ q.text }}
        </div>

        <!-- Metadata -->
        <div class="flex flex-wrap gap-2 pt-2">
          <mat-chip-set aria-label="Question metadata">
            <mat-chip class="!bg-slate-800 !text-slate-200">
              <mat-icon class="text-sm mr-1">trending_up</mat-icon>
              {{ q.difficulty }}
            </mat-chip>
            <mat-chip *ngIf="q.technology" class="!bg-slate-800 !text-slate-200">
              <mat-icon class="text-sm mr-1">code</mat-icon>
              {{ q.technology }}
            </mat-chip>
            <mat-chip *ngIf="q.category" class="!bg-slate-800 !text-slate-200">
              <mat-icon class="text-sm mr-1">category</mat-icon>
              {{ q.category }}
            </mat-chip>
            <mat-chip *ngIf="q.timeLimit" class="!bg-cyan-500/20 !text-cyan-100">
              <mat-icon class="text-sm mr-1">schedule</mat-icon>
              {{ q.timeLimit }} min
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Examples if available -->
        <div *ngIf="q.examples && q.examples.length > 0" class="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
          <h4 class="mb-2 font-semibold text-slate-100">Examples:</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li *ngFor="let example of q.examples">{{ example }}</li>
          </ul>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class QuestionCardComponent {
  question = input<InterviewQuestion | null>(null);
  questionNumber = input(1);
  totalQuestions = input(10);

  readonly QUESTION_TYPES_DISPLAY = QUESTION_TYPES_DISPLAY;

  getQuestionTypeDisplay(type: string): string {
    return QUESTION_TYPES_DISPLAY[type as keyof typeof QUESTION_TYPES_DISPLAY] || type;
  }
}
