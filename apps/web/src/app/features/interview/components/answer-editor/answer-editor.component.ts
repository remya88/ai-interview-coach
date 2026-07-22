import {
  Component,
  input,
  output,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { QuestionType } from '@prisma/client';
import { SUPPORTED_LANGUAGES, ANSWER_LIMITS } from '../../models/interview-session.model';

@Component({
  selector: 'app-answer-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <mat-card class="w-full">
      <mat-card-header>
        <mat-card-title>Your Answer</mat-card-title>
      </mat-card-header>

      <mat-divider class="my-4"></mat-divider>

      <mat-card-content class="space-y-4">
        <!-- Language Selection for Coding Questions -->
        <mat-form-field *ngIf="isCodeQuestion()" class="w-full">
          <mat-label>Language</mat-label>
          <mat-select [(ngModel)]="selectedLanguage" (selectionChange)="onLanguageChange()">
            <mat-option *ngFor="let lang of SUPPORTED_LANGUAGES" [value]="lang">
              {{ lang }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Answer Textarea -->
        <mat-form-field class="w-full">
          <mat-label>{{ isCodeQuestion() ? 'Write your code' : 'Write your answer' }}</mat-label>
          <textarea
            matInput
            [(ngModel)]="answer"
            (input)="onAnswerChange()"
            [placeholder]="getPlaceholder()"
            rows="12"
            [maxlength]="getMaxLength()"
            class="font-mono"
          ></textarea>
          <mat-hint align="end">
            {{ charCount() }} / {{ getMaxLength() }} characters
          </mat-hint>
        </mat-form-field>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ charCount() }}</div>
            <div class="text-xs text-gray-600">characters</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ wordCount() }}</div>
            <div class="text-xs text-gray-600">words</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ lineCount() }}</div>
            <div class="text-xs text-gray-600">lines</div>
          </div>
        </div>

        <!-- Auto-save indicator -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <mat-icon class="text-green-500 text-lg">cloud_done</mat-icon>
          <span>Auto-saving your answer...</span>
        </div>
      </mat-card-content>

      <mat-divider class="my-4"></mat-divider>

      <mat-card-actions class="flex gap-2">
        <button
          mat-raised-button
          [disabled]="!isValid()"
          color="primary"
          (click)="submit.emit()"
        >
          <mat-icon>check</mat-icon>
          Submit Answer
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class AnswerEditorComponent implements OnInit {
  questionType = input<QuestionType | undefined>(undefined);
  currentAnswer = input<string>('');
  answered = output<string>();
  submit = output<void>();

  answer = '';
  selectedLanguage = 'TypeScript';
  readonly SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;

  charCount = () => this.answer.length;
  wordCount = () => {
    const words = this.answer
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    return words.length;
  };
  lineCount = () => this.answer.split('\n').length;
  isValid = () => this.answer.trim().length > 0;

  constructor() {
    effect(() => {
      this.answer = this.currentAnswer();
    });
  }

  ngOnInit() {
    this.answer = this.currentAnswer();
  }

  isCodeQuestion(): boolean {
    const type = this.questionType();
    return type === 'CODING' || type === 'DEBUGGING' || type === 'SCENARIO' || type === 'ARCHITECTURE';
  }

  getMaxLength(): number {
    return this.isCodeQuestion() ? ANSWER_LIMITS.CODE : ANSWER_LIMITS.TEXT;
  }

  getPlaceholder(): string {
    if (this.isCodeQuestion()) {
      return `Write your ${this.selectedLanguage} code here...\n\n// Make sure to write clean, well-structured code`;
    }
    return 'Write your answer here. Be detailed and thorough in your response.';
  }

  onAnswerChange() {
    this.answered.emit(this.answer);
  }

  onLanguageChange() {
    // Language change notification could go to parent
  }
}
